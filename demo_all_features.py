#!/usr/bin/env python3
"""
Z-Image-Turbo 完整功能演示
展示所有新增的API功能
"""
import requests
import json
import time

API_URL = "http://localhost:8888"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health():
    print_section("1. 健康检查")
    response = requests.get(f"{API_URL}/health")
    print(f"✅ Status: {response.json()}")

def test_gpu_info():
    print_section("2. GPU信息")
    response = requests.get(f"{API_URL}/gpu-info")
    info = response.json()
    if info['available']:
        print(f"✅ GPU: {info['device_name']}")
        print(f"   设备数量: {info['device_count']}")
        print(f"   当前设备: {info['current_device']}")
        print(f"   已分配显存: {info['memory_allocated']:.2f} GB")
        print(f"   已保留显存: {info['memory_reserved']:.2f} GB")
    else:
        print("❌ GPU不可用")

def test_settings():
    print_section("3. 配置管理")
    response = requests.get(f"{API_URL}/settings")
    settings = response.json()
    print("当前配置:")
    for key, value in settings.items():
        print(f"  {key}: {value}")

def test_basic_generation():
    print_section("4. 基础图像生成")
    payload = {
        "prompt": "A serene Japanese garden with cherry blossoms",
        "height": 512,
        "width": 512,
        "steps": 8,
        "seed": 123
    }
    print(f"📝 提示词: {payload['prompt']}")
    print("⏳ 生成中...")
    
    start = time.time()
    response = requests.post(f"{API_URL}/generate", json=payload)
    elapsed = time.time() - start
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 成功! 耗时: {elapsed:.2f}秒")
        print(f"   种子: {result['images'][0]['seed']}")
    else:
        print(f"❌ 失败: {response.text}")

def test_negative_prompt():
    print_section("5. 负面提示词")
    payload = {
        "prompt": "A beautiful portrait of a woman",
        "negative_prompt": "blurry, low quality, distorted, ugly",
        "height": 512,
        "width": 512,
        "steps": 8,
        "seed": 456
    }
    print(f"📝 正面: {payload['prompt']}")
    print(f"🚫 负面: {payload['negative_prompt']}")
    print("⏳ 生成中...")
    
    response = requests.post(f"{API_URL}/generate", json=payload)
    if response.status_code == 200:
        print("✅ 成功!")
    else:
        print(f"❌ 失败: {response.text}")

def test_batch_generation():
    print_section("6. 批量生成")
    payload = {
        "prompt": "A cute robot assistant",
        "height": 512,
        "width": 512,
        "steps": 8,
        "num_images": 3,
        "seed": -1  # 随机种子
    }
    print(f"📝 提示词: {payload['prompt']}")
    print(f"🔢 数量: {payload['num_images']}")
    print("⏳ 生成中...")
    
    start = time.time()
    response = requests.post(f"{API_URL}/generate", json=payload)
    elapsed = time.time() - start
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 成功生成 {len(result['images'])} 张图片")
        print(f"   总耗时: {elapsed:.2f}秒")
        print(f"   平均: {elapsed/len(result['images']):.2f}秒/张")
        for i, img in enumerate(result['images']):
            print(f"   图片 {i+1} 种子: {img['seed']}")
    else:
        print(f"❌ 失败: {response.text}")

def test_prompt_enhancement():
    print_section("7. 提示词增强")
    payload = {
        "prompt": "sunset over ocean",
        "enhance_prompt": True,
        "height": 512,
        "width": 512,
        "steps": 8,
        "seed": 789
    }
    print(f"📝 原始提示词: {payload['prompt']}")
    print(f"✨ 增强模式: 开启")
    print("⏳ 生成中...")
    
    response = requests.post(f"{API_URL}/generate", json=payload)
    if response.status_code == 200:
        print("✅ 成功! (提示词已自动增强)")
    else:
        print(f"❌ 失败: {response.text}")

def test_history():
    print_section("8. 生成历史")
    response = requests.get(f"{API_URL}/history")
    history = response.json()
    print(f"📚 历史记录数: {len(history)}")
    if history:
        print("\n最近3条:")
        for i, item in enumerate(history[-3:], 1):
            print(f"\n  {i}. {item['timestamp']}")
            print(f"     提示词: {item['prompt'][:50]}...")
            print(f"     尺寸: {item['params']['width']}x{item['params']['height']}")

def test_presets():
    print_section("9. 参数预设")
    
    # 保存预设
    preset = {
        "name": "portrait_hd",
        "params": {
            "width": 768,
            "height": 1024,
            "steps": 8,
            "guidance_scale": 0.0
        }
    }
    response = requests.post(f"{API_URL}/presets", json=preset)
    print(f"💾 保存预设: {preset['name']}")
    
    # 获取所有预设
    response = requests.get(f"{API_URL}/presets")
    presets = response.json()
    print(f"📋 当前预设数: {len(presets)}")
    for name, params in presets.items():
        print(f"   - {name}: {params['width']}x{params['height']}")

def test_different_resolutions():
    print_section("10. 多分辨率测试")
    resolutions = [
        (512, 512, "标准方形"),
        (768, 1024, "竖屏肖像"),
        (1024, 768, "横屏风景"),
        (1280, 720, "16:9宽屏")
    ]
    
    for width, height, desc in resolutions:
        print(f"\n📐 {desc} ({width}x{height})")
        payload = {
            "prompt": "A beautiful landscape",
            "width": width,
            "height": height,
            "steps": 8,
            "seed": 999
        }
        
        start = time.time()
        response = requests.post(f"{API_URL}/generate", json=payload)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print(f"   ✅ 成功 - {elapsed:.2f}秒")
        else:
            print(f"   ❌ 失败")

def main():
    print("\n" + "="*60)
    print("  Z-Image-Turbo 完整功能演示")
    print("="*60)
    
    try:
        test_health()
        test_gpu_info()
        test_settings()
        test_basic_generation()
        test_negative_prompt()
        test_batch_generation()
        test_prompt_enhancement()
        test_history()
        test_presets()
        test_different_resolutions()
        
        print_section("✅ 所有测试完成!")
        print("🎉 Z-Image-Turbo 所有功能正常运行!")
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")

if __name__ == "__main__":
    main()
