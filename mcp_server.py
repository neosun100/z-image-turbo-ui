#!/usr/bin/env python3
"""
Z-Image-Turbo MCP Server

Provides text-to-image generation capabilities through the Model Context Protocol.
"""

import asyncio
import base64
from io import BytesIO
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

# Create MCP server
mcp = FastMCP(
    "Z-Image-Turbo",
    instructions="Text-to-image generation using Tongyi-MAI Z-Image-Turbo model. Supports 51+ resolution presets and custom parameters."
)

# Backend API endpoint
API_BASE = "http://localhost:8888"

@mcp.tool()
async def generate_image(
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
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{API_BASE}/generate",
            json={
                "prompt": prompt,
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "num_inference_steps": steps,
                "guidance_scale": guidance_scale,
                "seed": seed,
                "num_images": num_images,
                "enhance_prompt": enhance_prompt
            }
        )
        
        if response.status_code != 200:
            return {"error": f"Generation failed: {response.text}"}
        
        data = response.json()
        return {
            "status": "success",
            "session_id": data.get("session_id"),
            "message": f"Generated {num_images} image(s) successfully",
            "parameters": {
                "prompt": prompt,
                "width": width,
                "height": height,
                "steps": steps,
                "seed": data.get("seed", seed)
            }
        }

@mcp.resource("preset://resolutions")
def get_resolution_presets() -> str:
    """Get available resolution presets organized by aspect ratio."""
    return """# Z-Image-Turbo Resolution Presets

## Square (1:1)
- 512×512 - Small square
- 768×768 - Medium square
- 1024×1024 - Standard square (1K)
- 1536×1536 - Large square (1.5K)
- 2048×2048 - Extra large square (2K)

## Portrait (3:4)
- 768×1024 - Small portrait
- 1152×1536 - Medium portrait
- 1536×2048 - Large portrait
- 1728×2304 - Extra large portrait

## Landscape (4:3)
- 1024×768 - Small landscape
- 1536×1152 - Medium landscape
- 2048×1536 - Large landscape
- 2304×1728 - Extra large landscape

## Widescreen Landscape (16:9)
- 1280×720 - HD 720p
- 1920×1080 - Full HD 1080p
- 2560×1440 - 2K QHD
- 3200×1800 - Extra large widescreen

## Widescreen Portrait (9:16)
- 720×1280 - Vertical HD
- 1080×1920 - Vertical Full HD
- 1440×2560 - Vertical 2K
- 1800×3200 - Vertical extra large

## Ultrawide Landscape (21:9)
- 1344×576 - Small ultrawide
- 1680×720 - Medium ultrawide
- 2352×1008 - Large ultrawide

## Ultrawide Portrait (9:21)
- 576×1344 - Vertical small ultrawide
- 720×1680 - Vertical medium ultrawide
- 1008×2352 - Vertical large ultrawide

## Extreme Wide Landscape (32:9)
- 1792×512 - Small extreme wide
- 2560×720 - Medium extreme wide
- 3200×912 - Large extreme wide

## Extreme Wide Portrait (9:32)
- 512×1792 - Vertical small extreme wide
- 720×2560 - Vertical medium extreme wide
- 912×3200 - Vertical large extreme wide

All resolutions must be multiples of 16. Range: 256-4096 pixels.
"""

@mcp.prompt()
def create_prompt_template(subject: str, style: str = "photorealistic") -> str:
    """Generate an optimized prompt template for image generation.
    
    Args:
        subject: Main subject of the image
        style: Art style (photorealistic, anime, oil painting, digital art, etc.)
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

if __name__ == "__main__":
    mcp.run(transport="stdio")
