from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
try:
    from diffusers import ZImagePipeline
except ImportError:
    print("ZImagePipeline not found. Install diffusers from source.")
    ZImagePipeline = None

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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIG_FILE = "../config.json"
HISTORY_FILE = "generation_history.json"
PRESETS_FILE = "presets.json"

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

model_config = load_config()
if "cpu_offload" not in model_config:
    model_config["cpu_offload"] = False
if "flash_attention" not in model_config:
    model_config["flash_attention"] = False
if "compile_model" not in model_config:
    model_config["compile_model"] = False

pipe = None

def get_pipeline():
    global pipe
    if pipe is None:
        if ZImagePipeline is None:
            raise HTTPException(status_code=500, detail="ZImagePipeline not available")
            
        print(f"Loading model {model_config['model_id']}...")
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.bfloat16 if device == "cuda" else torch.float32
        
        pipe = ZImagePipeline.from_pretrained(
            model_config['model_id'],
            torch_dtype=dtype,
            low_cpu_mem_usage=False,
            cache_dir=model_config.get('cache_dir')
        )
        
        if model_config.get("cpu_offload", False) and device == "cuda":
            print("Enabling CPU Offload")
            pipe.enable_model_cpu_offload()
        else:
            pipe.to(device)
        
        if model_config.get("flash_attention", False):
            try:
                pipe.transformer.set_attention_backend("flash")
                print("Flash Attention enabled")
            except:
                print("Flash Attention not available")
        
        if model_config.get("compile_model", False):
            print("Compiling model (first run will be slow)...")
            pipe.transformer.compile()
            
        print(f"Model loaded on {device}")
    return pipe

class SettingsRequest(BaseModel):
    cache_dir: Optional[str] = None
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
        save_config(model_config)
        pipe = None
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

@app.post("/generate/stream")
async def generate_image_stream(req: GenerateRequest):
    if req.height % 16 != 0 or req.width % 16 != 0:
        raise HTTPException(status_code=400, detail="Dimensions must be divisible by 16")

    async def event_generator():
        try:
            start_time = time.time()
            yield f"data: {json.dumps({'type': 'log', 'message': '开始加载模型...'}, ensure_ascii=False)}\n\n"
            await asyncio.sleep(0)
            
            pipeline = get_pipeline()
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
                    future = executor.submit(
                        pipeline,
                        prompt=prompt,
                        negative_prompt=req.negative_prompt,
                        height=req.height,
                        width=req.width,
                        num_inference_steps=req.steps,
                        guidance_scale=req.guidance_scale,
                        generator=generator
                    )
                    
                    # Send progress updates while generating
                    step = 0
                    while not future.done():
                        await asyncio.sleep(progress_interval)
                        step += 1
                        if step <= 10:
                            step_progress = min(step * 10, 95)
                            yield f"data: {json.dumps({'type': 'log', 'message': f'推理中... {step_progress}%'}, ensure_ascii=False)}\n\n"
                            await asyncio.sleep(0)
                    
                    result = future.result().images[0]
                
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
        pipeline = get_pipeline()
        device = "cuda" if torch.cuda.is_available() else "cpu"
        
        prompt = req.prompt
        if req.enhance_prompt:
            prompt = f"masterpiece, best quality, highly detailed, {prompt}"
        
        images = []
        for i in range(req.num_images):
            seed = req.seed if req.seed != -1 else torch.randint(0, 2**32, (1,)).item()
            generator = torch.Generator(device).manual_seed(seed)
            
            result = pipeline(
                prompt=prompt,
                negative_prompt=req.negative_prompt,
                height=req.height,
                width=req.width,
                num_inference_steps=req.steps,
                guidance_scale=req.guidance_scale,
                generator=generator,
            ).images[0]
            
            buffered = io.BytesIO()
            result.save(buffered, format="PNG")
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
    return {"status": "ok", "model_loaded": pipe is not None}

# Serve frontend
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
