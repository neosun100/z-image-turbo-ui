from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
try:
    from diffusers import ZImagePipeline
except ImportError:
    # Fallback or mock for development if diffusers is not updated yet
    print("ZImagePipeline not found in diffusers. Please install from source.")
    ZImagePipeline = None

import torch
import io
import base64
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json

CONFIG_FILE = "config.json"

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
    return {
        "cache_dir": None,
        "model_id": "Tongyi-MAI/Z-Image-Turbo"
    }

def save_config(config):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=4)
    except Exception as e:
        print(f"Error saving config: {e}")

import psutil
import time

# Global configuration
model_config = load_config()
if "cpu_offload" not in model_config:
    model_config["cpu_offload"] = False

# Global variable for the pipeline
pipe = None

def get_pipeline():
    global pipe
    if pipe is None:
        if ZImagePipeline is None:
            raise HTTPException(status_code=500, detail="ZImagePipeline class not available. Install diffusers from source.")
            
        print(f"Loading model {model_config['model_id']}...")
        
        if model_config['cache_dir']:
            print(f"Using cache directory: {model_config['cache_dir']}")

        try:
            # Check for CUDA
            device = "cuda" if torch.cuda.is_available() else "cpu"
            dtype = torch.bfloat16 if device == "cuda" else torch.float32
            
            pipe = ZImagePipeline.from_pretrained(
                model_config['model_id'],
                torch_dtype=dtype,
                low_cpu_mem_usage=False,
                cache_dir=model_config['cache_dir']
            )
            
            if model_config.get("cpu_offload", False) and device == "cuda":
                print("Enabling CPU Offload")
                pipe.enable_model_cpu_offload()
            else:
                pipe.to(device)
                
            print(f"Model loaded on {device}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise e
    return pipe

class SettingsRequest(BaseModel):
    cache_dir: str
    cpu_offload: bool = False

@app.post("/settings/model-path")
async def set_model_path(req: SettingsRequest):
    global pipe
    try:
        if req.cache_dir and not os.path.exists(req.cache_dir):
            os.makedirs(req.cache_dir, exist_ok=True)
        
        model_config["cache_dir"] = req.cache_dir
        model_config["cpu_offload"] = req.cpu_offload
        save_config(model_config)
        # Force reload of the pipeline
        pipe = None
        return {"status": "success", "message": "Settings saved. Model will reload on next generation."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/settings")
async def get_settings():
    return model_config

class GenerateRequest(BaseModel):
    prompt: str
    height: int = 1024
    width: int = 1024
    steps: int = 8
    guidance_scale: float = 0.0
    seed: int = -1

@app.post("/generate")
def generate_image(req: GenerateRequest):
    # Validate dimensions
    if req.height % 16 != 0 or req.width % 16 != 0:
        raise HTTPException(status_code=400, detail="Height and Width must be divisible by 16.")

    try:
        pipeline = get_pipeline()
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        generator = None
        if req.seed != -1:
            generator = torch.Generator(device).manual_seed(req.seed)
        
        # Run inference
        print(f"Generating with prompt: {req.prompt}")
        
        image = pipeline(
            prompt=req.prompt,
            height=req.height,
            width=req.width,
            num_inference_steps=req.steps,
            guidance_scale=req.guidance_scale,
            generator=generator,
        ).images[0]
        
        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        return {"image": f"data:image/png;base64,{img_str}"}
    except Exception as e:
        print(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
