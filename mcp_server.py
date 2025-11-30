#!/usr/bin/env python3
"""
Z-Image-Turbo MCP Server

Provides text-to-image generation capabilities through the Model Context Protocol.
Run with: python mcp_server.py
Access at: http://localhost:3000/mcp
"""

import asyncio
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

# Create MCP server with HTTP transport
mcp = FastMCP(
    "Z-Image-Turbo",
    instructions="Text-to-image generation using Tongyi-MAI Z-Image-Turbo model. Supports 51+ resolution presets and custom parameters.",
    json_response=True,
    stateless_http=True
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

if __name__ == "__main__":
    # Run with streamable HTTP transport on port 3000
    mcp.run(transport="streamable-http", port=3000)
