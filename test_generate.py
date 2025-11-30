#!/usr/bin/env python3
import requests
import json
import base64
from datetime import datetime

API_URL = "http://localhost:8888"

def test_generate():
    print("🎨 Testing Z-Image-Turbo Generation...")
    
    payload = {
        "prompt": "A cute cat wearing sunglasses, photorealistic, 4k",
        "height": 512,
        "width": 512,
        "steps": 8,
        "guidance_scale": 0.0,
        "seed": 42,
        "num_images": 1,
        "enhance_prompt": False
    }
    
    print(f"📝 Prompt: {payload['prompt']}")
    print(f"📐 Size: {payload['width']}x{payload['height']}")
    print(f"⚙️  Steps: {payload['steps']}")
    print("\n⏳ Generating (this will download the model on first run)...")
    
    response = requests.post(f"{API_URL}/generate", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        print(f"\n✅ Success! Generated {len(result['images'])} image(s)")
        
        for i, img_data in enumerate(result['images']):
            # Save image
            img_base64 = img_data['image'].split(',')[1]
            img_bytes = base64.b64decode(img_base64)
            
            filename = f"test_output_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{i}.png"
            with open(filename, 'wb') as f:
                f.write(img_bytes)
            
            print(f"💾 Saved: {filename}")
            print(f"🎲 Seed: {img_data['seed']}")
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_generate()
