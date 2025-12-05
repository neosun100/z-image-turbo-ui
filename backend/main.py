from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Any
try:
    from diffusers import ZImagePipeline, OvisImagePipeline, Flux2Pipeline
except ImportError:
    print("Some pipelines not found. Installing diffusers from source may be required.")
    ZImagePipeline = None
    OvisImagePipeline = None
    Flux2Pipeline = None

import torch
import io
import base64
from fastapi.middleware.cors import CORSMiddleware
import os
from PIL import Image
import json
from datetime import datetime
import time
import asyncio

# Import MCP
from mcp.server.fastmcp import FastMCP

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create MCP server
mcp = FastMCP(
    "Z-Image-Turbo",
    instructions="Text-to-image generation using multiple diffusion models. Supports 51+ resolution presets and custom parameters.",
    json_response=True,
    stateless_http=True
)

CONFIG_FILE = "../config.json"
HISTORY_FILE = "generation_history.json"
PRESETS_FILE = "presets.json"
MODELS_CONFIG_FILE = "models_config.json"

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {"cache_dir": None, "model_id": "Tongyi-MAI/Z-Image-Turbo"}

def save_config(config):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        print(f"Error saving config: {e}")

def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return []

def save_history(history):
    try:
        with open(HISTORY_FILE, "w") as f:
            json.dump(history[-100:], f, indent=2)  # Keep last 100
    except Exception as e:
        print(f"Error saving history: {e}")

def load_presets():
    if os.path.exists(PRESETS_FILE):
        try:
            with open(PRESETS_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {}

def save_presets(presets):
    try:
        with open(PRESETS_FILE, "w") as f:
            json.dump(presets, f, indent=2)
    except Exception as e:
        print(f"Error saving presets: {e}")

def load_models_config():
    """加载模型配置"""
    if os.path.exists(MODELS_CONFIG_FILE):
        try:
            with open(MODELS_CONFIG_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {"models": [], "current_model": "Tongyi-MAI/Z-Image-Turbo"}

def save_models_config(config):
    """保存模型配置"""
    try:
        with open(MODELS_CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        print(f"Error saving models config: {e}")

def get_model_info(model_id):
    """获取模型信息"""
    models_cfg = load_models_config()
    for model in models_cfg.get("models", []):
        if model["id"] == model_id:
            return model
    return None

model_config = load_config()
if "cpu_offload" not in model_config:
    model_config["cpu_offload"] = False
if "flash_attention" not in model_config:
    model_config["flash_attention"] = False
if "compile_model" not in model_config:
    model_config["compile_model"] = False
if "keep_in_memory" not in model_config:
    model_config["keep_in_memory"] = False  # 新增：内存常驻模式

pipe = None
pipe_on_gpu = False  # 跟踪模型是否在GPU上
last_used_time = None  # 跟踪最后使用时间
current_model_id = None  # 当前加载的模型ID
IDLE_TIMEOUT = 30  # 5分钟空闲超时

async def auto_unload_monitor():
    """后台任务：监控并自动卸载空闲模型"""
    global last_used_time
    while True:
        await asyncio.sleep(10)  # 每分钟检查一次
        if last_used_time and pipe is not None:
            idle_time = time.time() - last_used_time
            if idle_time >= IDLE_TIMEOUT:
                if model_config.get("keep_in_memory", False):
                    # 内存常驻模式：只从GPU移到CPU
                    unload_from_gpu()
                    print(f"Auto-unloaded from GPU after {idle_time:.0f}s idle")
                else:
                    # 普通模式：完全卸载
                    unload_model()
                    print(f"Auto-unloaded model after {idle_time:.0f}s idle")
                last_used_time = None

def get_pipeline(requested_model_id=None):
    global pipe, pipe_on_gpu, last_used_time, current_model_id
    
    # 更新最后使用时间
    last_used_time = time.time()
    
    # 确定要使用的模型ID
    target_model_id = requested_model_id or model_config.get('model_id', 'Tongyi-MAI/Z-Image-Turbo')
    
    # 如果请求的模型与当前加载的模型不同，先卸载当前模型
    if pipe is not None and current_model_id != target_model_id:
        print(f"Switching from {current_model_id} to {target_model_id}")
        unload_model()
    
    if pipe is None:
        # 获取模型信息
        model_info = get_model_info(target_model_id)
        if not model_info:
            raise HTTPException(status_code=404, detail=f"Model {target_model_id} not found in config")
        
        # 根据模型类型选择Pipeline类
        pipeline_class = None
        if model_info["type"] == "zimage":
            if ZImagePipeline is None:
                raise HTTPException(status_code=500, detail="ZImagePipeline not available")
            pipeline_class = ZImagePipeline
        elif model_info["type"] == "ovis":
            if OvisImagePipeline is None:
                raise HTTPException(status_code=500, detail="OvisImagePipeline not available. Install: pip install git+https://github.com/huggingface/diffusers")
            pipeline_class = OvisImagePipeline
        elif model_info["type"] == "flux2":
            if Flux2Pipeline is None:
                raise HTTPException(status_code=500, detail="Flux2Pipeline not available")
            pipeline_class = Flux2Pipeline
        else:
            raise HTTPException(status_code=500, detail=f"Unknown model type: {model_info['type']}")
        
        print(f"Loading model {target_model_id} ({model_info['name']})...")
        
        dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
        
        # FLUX.2-dev 使用 GPU 1 (空闲 44GB)
        if model_info["type"] == "flux2" and torch.cuda.is_available():
            print("Loading FLUX.2-dev on GPU 1 with CPU offload...")
            pipe = pipeline_class.from_pretrained(
                target_model_id,
                torch_dtype=dtype,
                cache_dir=model_config.get('cache_dir')
            )
            current_model_id = target_model_id
            # 使用 sequential CPU offload 并指定 GPU 1
            print("Enabling sequential CPU offload on GPU 1...")
            pipe.enable_sequential_cpu_offload(gpu_id=1)
            pipe_on_gpu = True
            print("FLUX.2-dev loaded on GPU 1 with CPU offload")
        else:
            # 其他模型使用原有逻辑
            device = "cpu" if model_config.get("keep_in_memory", False) else ("cuda" if torch.cuda.is_available() else "cpu")
            
            pipe = pipeline_class.from_pretrained(
                target_model_id,
                torch_dtype=dtype,
                low_cpu_mem_usage=False,
                cache_dir=model_config.get('cache_dir')
            )
            
            current_model_id = target_model_id
            
            if model_config.get("keep_in_memory", False):
                print("Model loaded to CPU memory (keep_in_memory mode)")
                pipe.to("cpu")
                pipe_on_gpu = False
            elif model_config.get("cpu_offload", False) and torch.cuda.is_available():
                print("Enabling CPU Offload")
                pipe.enable_model_cpu_offload()
                pipe_on_gpu = True
            else:
                device = "cuda" if torch.cuda.is_available() else "cpu"
                pipe.to(device)
                pipe_on_gpu = (device == "cuda")
        
        if model_config.get("flash_attention", False) and pipe_on_gpu:
            try:
                pipe.transformer.set_attention_backend("flash")
                print("Flash Attention enabled")
            except:
                print("Flash Attention not available")
        
        if model_config.get("compile_model", False):
            print("Compiling model (first run will be slow)...")
            try:
                pipe.transformer.compile()
            except:
                print("Model compilation not supported for this model type")
            
        print(f"Model loaded (GPU: {pipe_on_gpu})")
    
    # 如果是内存常驻模式且模型不在GPU上，快速转移到GPU
    if model_config.get("keep_in_memory", False) and not pipe_on_gpu and torch.cuda.is_available():
        print("Moving model from CPU to GPU...")
        start = time.time()
        pipe.to("cuda")
        pipe_on_gpu = True
        print(f"Model moved to GPU in {time.time()-start:.2f}s")
    
    return pipe

def unload_from_gpu():
    """将模型从GPU移回CPU（内存常驻模式）"""
    global pipe, pipe_on_gpu
    if pipe is not None and pipe_on_gpu and model_config.get("keep_in_memory", False):
        print("Moving model from GPU to CPU...")
        pipe.to("cpu")
        pipe_on_gpu = False
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print("Model moved to CPU (kept in memory)")

def unload_model():
    """完全卸载模型"""
    global pipe, pipe_on_gpu, current_model_id
    if pipe is not None:
        # 先移到CPU释放GPU显存
        if pipe_on_gpu and torch.cuda.is_available():
            pipe.to("cpu")
            torch.cuda.empty_cache()
        del pipe
        pipe = None
        pipe_on_gpu = False
        current_model_id = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
        print("Model unloaded from memory")

class SettingsRequest(BaseModel):
    cache_dir: Optional[str] = None
    cpu_offload: bool = False
    flash_attention: bool = False
    compile_model: bool = False
    keep_in_memory: bool = False  # 新增
    cpu_offload: bool = False
    flash_attention: bool = False
    compile_model: bool = False

@app.post("/settings/model-path")
async def set_model_path(req: SettingsRequest):
    global pipe
    try:
        if req.cache_dir and not os.path.exists(req.cache_dir):
            os.makedirs(req.cache_dir, exist_ok=True)
        
        model_config["cache_dir"] = req.cache_dir
        model_config["cpu_offload"] = req.cpu_offload
        model_config["flash_attention"] = req.flash_attention
        model_config["compile_model"] = req.compile_model
        model_config["keep_in_memory"] = req.keep_in_memory
        save_config(model_config)
        
        # 如果改变了内存常驻模式，需要重新加载
        if pipe is not None:
            unload_model()
        
        return {"status": "success", "message": "Settings saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/settings")
async def get_settings():
    return model_config

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    height: int = 1024
    width: int = 1024
    steps: int = 8
    guidance_scale: float = 0.0
    seed: int = -1
    num_images: int = 1  # Max 8
    enhance_prompt: bool = False
    model_id: Optional[str] = None  # 可选：指定使用的模型

@app.post("/generate/stream")
async def generate_image_stream(req: GenerateRequest):
    if req.height % 16 != 0 or req.width % 16 != 0:
        raise HTTPException(status_code=400, detail="Dimensions must be divisible by 16")

    async def event_generator():
        try:
            start_time = time.time()
            yield f"data: {json.dumps({'type': 'log', 'message': '开始加载模型...'}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0)
            
            pipeline = get_pipeline(req.model_id)
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            yield f"data: {json.dumps({'type': 'log', 'message': f'模型已加载到 {device}'}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0)
            
            prompt = req.prompt
            if req.enhance_prompt:
                prompt = f"masterpiece, best quality, highly detailed, {prompt}"
                yield f"data: {json.dumps({'type': 'log', 'message': f'增强提示词: {prompt[:50]}...'}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)
            
            images = []
            seeds = []
            
            for i in range(req.num_images):
                yield f"data: {json.dumps({'type': 'log', 'message': f'生成第 {i+1}/{req.num_images} 张图片...'}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)
                
                seed = req.seed if req.seed != -1 else torch.randint(0, 2**32, (1,)).item()
                generator = torch.Generator(device).manual_seed(seed)
                
                img_start = time.time()
                
                # Simulate progress during generation
                estimated_time = req.steps * 0.15  # Rough estimate
                progress_interval = estimated_time / 10
                
                # Start generation in background
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as executor:
                    # 根据模型类型构建参数
                    model_info = get_model_info(current_model_id)
                    params = {
                        'prompt': prompt,
                        'height': req.height,
                        'width': req.width,
                        'num_inference_steps': req.steps,
                        'guidance_scale': req.guidance_scale,
                        'generator': generator
                    }
                    
                    # Flux2Pipeline不支持negative_prompt
                    if model_info and model_info.get('type') != 'flux2':
                        params['negative_prompt'] = req.negative_prompt or ""
                    
                    future = executor.submit(pipeline, **params)
                    
                    # Send progress updates while generating
                    step = 0
                    while not future.done():
                        await asyncio.sleep(progress_interval)
                        step += 1
                        if step <= 10:
                            step_progress = min(step * 10, 95)
                            yield f"data: {json.dumps({'type': 'log', 'message': f'推理中... {step_progress}%'}, ensure_ascii=False)}\n\n"
                            await asyncio.sleep(0)
                    
                    result_obj = future.result()
                    
                    # 处理不同Pipeline的返回值
                    if hasattr(result_obj, 'images') and result_obj.images:
                        result = result_obj.images[0]
                    elif isinstance(result_obj, list) and len(result_obj) > 0:
                        result = result_obj[0]
                    else:
                        raise Exception("Pipeline returned unexpected format")
                
                img_time = time.time() - img_start
                yield f"data: {json.dumps({'type': 'log', 'message': f'图片 {i+1} 生成完成 (耗时: {img_time:.2f}秒, seed: {seed})'}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)
                
                buffered = io.BytesIO()
                result.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
                images.append(f"data:image/png;base64,{img_str}")
                seeds.append(seed)
                
                progress = int(((i+1)/req.num_images)*100)
                elapsed = round(time.time()-start_time, 2)
                yield f"data: {json.dumps({'type': 'progress', 'progress': progress, 'current': i+1, 'total': req.num_images, 'elapsed': elapsed}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)
            
            total_time = time.time() - start_time
            yield f"data: {json.dumps({'type': 'log', 'message': f'全部完成！总耗时: {total_time:.2f}秒'}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0)
            
            # Save to history
            history = load_history()
            history.append({
                "timestamp": datetime.now().isoformat(),
                "prompt": req.prompt,
                "negative_prompt": req.negative_prompt,
                "params": {
                    "width": req.width,
                    "height": req.height,
                    "steps": req.steps,
                    "guidance_scale": req.guidance_scale,
                    "seed": req.seed
                }
            })
            save_history(history)
            
            # Store images temporarily
            import uuid
            session_id = str(uuid.uuid4())
            temp_data[session_id] = {'images': [{'image': img, 'seed': s} for img, s in zip(images, seeds)], 'time': time.time()}
            
            yield f"data: {json.dumps({'type': 'complete', 'session_id': session_id, 'elapsed': round(total_time, 2)}, ensure_ascii=False)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

# Temporary storage for generated images
temp_data = {}

@app.get("/get_images/{session_id}")
async def get_images(session_id: str):
    if session_id in temp_data:
        data = temp_data[session_id]
        del temp_data[session_id]  # Clean up
        return {"images": data['images']}
    raise HTTPException(status_code=404, detail="Session not found")

@app.post("/generate")
def generate_image(req: GenerateRequest):
    if req.height % 16 != 0 or req.width % 16 != 0:
        raise HTTPException(status_code=400, detail="Dimensions must be divisible by 16")

    try:
        pipeline = get_pipeline(req.model_id)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        prompt = req.prompt
        if req.enhance_prompt:
            prompt = f"masterpiece, best quality, highly detailed, {prompt}"
        
        images = []
        for i in range(req.num_images):
            seed = req.seed if req.seed != -1 else torch.randint(0, 2**32, (1,)).item()
            generator = torch.Generator(device).manual_seed(seed)
            
            # 根据模型类型构建参数
            model_info = get_model_info(current_model_id)
            params = {
                'prompt': prompt,
                'height': req.height,
                'width': req.width,
                'num_inference_steps': req.steps,
                'guidance_scale': req.guidance_scale,
                'generator': generator,
            }
            
            # Flux2Pipeline不支持negative_prompt
            if model_info and model_info.get('type') != 'flux2':
                params['negative_prompt'] = req.negative_prompt or ""
            
            result = pipeline(**params)
            
            # 处理不同Pipeline的返回值
            if hasattr(result, 'images') and result.images:
                image = result.images[0]
            elif isinstance(result, list) and len(result) > 0:
                image = result[0]
            else:
                raise Exception("Pipeline returned unexpected format")
            
            buffered = io.BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            images.append({
                "image": f"data:image/png;base64,{img_str}",
                "seed": seed
            })
        
        # Save to history
        history = load_history()
        history.append({
            "timestamp": datetime.now().isoformat(),
            "prompt": req.prompt,
            "negative_prompt": req.negative_prompt,
            "params": {
                "width": req.width,
                "height": req.height,
                "steps": req.steps,
                "guidance_scale": req.guidance_scale,
                "seed": req.seed
            }
        })
        save_history(history)
        
        return {"images": images}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class Img2ImgRequest(BaseModel):
    image: str  # base64
    prompt: str
    strength: float = 0.8
    steps: int = 8
    guidance_scale: float = 7.5
    seed: int = -1

@app.post("/img2img")
def img2img(req: Img2ImgRequest):
    try:
        # Decode base64 image
        img_data = base64.b64decode(req.image.split(',')[1])
        init_image = Image.open(io.BytesIO(img_data)).convert("RGB")
        
        pipeline = get_pipeline()
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        seed = req.seed if req.seed != -1 else torch.randint(0, 2**32, (1,)).item()
        generator = torch.Generator(device).manual_seed(seed)
        
        # Note: Z-Image may not support img2img directly, this is a placeholder
        result = pipeline(
            prompt=req.prompt,
            image=init_image,
            strength=req.strength,
            num_inference_steps=req.steps,
            guidance_scale=req.guidance_scale,
            generator=generator,
        ).images[0]
        
        buffered = io.BytesIO()
        result.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"image": f"data:image/png;base64,{img_str}", "seed": seed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history():
    return load_history()

@app.delete("/history")
def clear_history():
    save_history([])
    return {"status": "success"}

class PresetRequest(BaseModel):
    name: str
    params: dict

@app.post("/presets")
def save_preset(req: PresetRequest):
    presets = load_presets()
    presets[req.name] = req.params
    save_presets(presets)
    return {"status": "success"}

@app.get("/presets")
def get_presets():
    return load_presets()

@app.delete("/presets/{name}")
def delete_preset(name: str):
    presets = load_presets()
    if name in presets:
        del presets[name]
        save_presets(presets)
    return {"status": "success"}

@app.get("/gpu-info")
def gpu_info():
    if not torch.cuda.is_available():
        return {"available": False}
    
    return {
        "available": True,
        "device_name": torch.cuda.get_device_name(0),
        "device_count": torch.cuda.device_count(),
        "current_device": torch.cuda.current_device(),
        "memory_allocated": torch.cuda.memory_allocated(0) / 1024**3,
        "memory_reserved": torch.cuda.memory_reserved(0) / 1024**3,
    }

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "model_loaded": pipe is not None,
        "model_on_gpu": pipe_on_gpu if pipe is not None else False,
        "keep_in_memory": model_config.get("keep_in_memory", False),
        "current_model": current_model_id
    }

@app.get("/api/models")
def get_models():
    """获取所有可用模型列表"""
    return {
        "models": [{
            "id": "Tongyi-MAI/Z-Image-Turbo",
            "name": "Z-Image-Turbo",
            "type": "text2img"
        }],
        "current_model": current_model_id or "Tongyi-MAI/Z-Image-Turbo"
    }

@app.post("/api/switch-model")
def switch_model(request: dict):
    """切换模型"""
    model_id = request.get("model_id")
    if not model_id:
        raise HTTPException(status_code=400, detail="model_id is required")
    
    # 验证模型是否存在
    model_info = get_model_info(model_id)
    if not model_info:
        raise HTTPException(status_code=404, detail=f"Model {model_id} not found")
    
    # 更新配置
    model_config['model_id'] = model_id
    save_config(model_config)
    
    # 更新models_config中的current_model
    models_cfg = load_models_config()
    models_cfg['current_model'] = model_id
    save_models_config(models_cfg)
    
    # 卸载当前模型（下次generate时会自动加载新模型）
    if pipe is not None:
        unload_model()
    
    return {
        "status": "success",
        "message": f"Switched to {model_info['name']}",
        "model": model_info
    }

@app.post("/api/move-to-gpu")
def move_to_gpu():
    """手动将模型从CPU移到GPU"""
    global pipe, pipe_on_gpu
    if pipe is None:
        raise HTTPException(status_code=400, detail="Model not loaded")
    if pipe_on_gpu:
        return {"status": "success", "message": "Model already on GPU"}
    
    print("Manually moving model to GPU...")
    start = time.time()
    pipe.to("cuda")
    pipe_on_gpu = True
    elapsed = time.time() - start
    return {"status": "success", "message": f"Model moved to GPU in {elapsed:.2f}s"}

@app.post("/api/move-to-cpu")
def move_to_cpu():
    """手动将模型从GPU移到CPU"""
    unload_from_gpu()
    return {"status": "success", "message": "Model moved to CPU"}

@app.post("/api/unload")
def api_unload():
    """完全卸载模型"""
    unload_model()
    return {"status": "success", "message": "Model unloaded"}

@app.post("/api/preload")
def preload_model():
    """预加载模型到内存"""
    try:
        get_pipeline()
        return {
            "status": "success", 
            "message": "Model preloaded",
            "on_gpu": pipe_on_gpu
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ MCP Integration ============

@mcp.tool()
async def generate_image_mcp(
    prompt: str,
    negative_prompt: str = "",
    width: int = 1024,
    height: int = 1024,
    steps: int = 8,
    guidance_scale: float = 0.0,
    seed: int = -1,
    num_images: int = 1,
    enhance_prompt: bool = False
) -> dict[str, Any]:
    """Generate images from text prompts using Z-Image-Turbo.
    
    Args:
        prompt: Text description of the image to generate
        negative_prompt: Elements to avoid in the image (optional)
        width: Image width (must be multiple of 16, range: 256-4096)
        height: Image height (must be multiple of 16, range: 256-4096)
        steps: Number of inference steps (recommended: 8)
        guidance_scale: Guidance scale (recommended: 0.0)
        seed: Random seed for reproducibility (-1 for random)
        num_images: Number of images to generate (1-12)
        enhance_prompt: Auto-enhance prompt with quality keywords
    
    Returns:
        Dictionary with generated image data and metadata
    """
    try:
        req = GenerateRequest(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=steps,
            guidance_scale=guidance_scale,
            seed=seed,
            num_images=num_images,
            enhance_prompt=enhance_prompt
        )
        result = generate_image(req)
        return {
            "status": "success",
            "message": f"Generated {num_images} image(s) successfully",
            "num_images": len(result["images"]),
            "parameters": {
                "prompt": prompt,
                "width": width,
                "height": height,
                "steps": steps,
                "seed": seed
            }
        }
    except Exception as e:
        return {"error": str(e)}

@mcp.resource("preset://resolutions")
def get_resolution_presets() -> str:
    """Get available resolution presets with exact dimensions."""
    return """# Z-Image-Turbo Resolution Presets

## Square (1:1)
512×512, 768×768, 1024×1024, 1536×1536, 2048×2048

## Portrait (3:4)
768×1024, 1152×1536, 1536×2048, 1728×2304

## Landscape (4:3)
1024×768, 1536×1152, 2048×1536, 2304×1728

## Widescreen Landscape (16:9)
1280×720, 1920×1080, 2560×1440, 3200×1800

## Widescreen Portrait (9:16)
720×1280, 1080×1920, 1440×2560, 1800×3200

## Ultrawide Landscape (21:9)
1344×576, 1680×720, 1792×768, 2016×864, 2352×1008

## Ultrawide Portrait (9:21)
576×1344, 720×1680, 768×1792, 864×2016, 1008×2352

## Extreme Wide Landscape (32:9)
1792×512, 2048×576, 2304×656, 2560×720, 2816×800, 3200×912

## Extreme Wide Portrait (9:32)
512×1792, 576×2048, 656×2304, 720×2560, 800×2816, 912×3200

All resolutions must be multiples of 16. Range: 256-4096 pixels.
Use these exact dimensions with the generate_image tool.
"""

@mcp.prompt()
def create_prompt_template(subject: str, style: str = "photorealistic") -> str:
    """Generate an optimized prompt template for image generation.
    
    Args:
        subject: Main subject of the image
        style: Art style (photorealistic, anime, oil painting, digital art, watercolor, sketch)
    """
    styles = {
        "photorealistic": "masterpiece, highly detailed, 8k, photorealistic, professional photography",
        "anime": "anime style, highly detailed, vibrant colors, studio quality",
        "oil painting": "oil painting, classical art style, rich colors, textured brushstrokes",
        "digital art": "digital art, concept art, highly detailed, trending on artstation",
        "watercolor": "watercolor painting, soft colors, artistic, delicate brushwork",
        "sketch": "pencil sketch, detailed linework, artistic drawing"
    }
    
    style_keywords = styles.get(style.lower(), styles["photorealistic"])
    return f"{subject}, {style_keywords}"

# 启动事件：启动自动监控任务
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(auto_unload_monitor())
    print("Auto-unload monitor started")

# Mount MCP server at /mcp
app.mount("/mcp", mcp.streamable_http_app())

# Serve frontend
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
