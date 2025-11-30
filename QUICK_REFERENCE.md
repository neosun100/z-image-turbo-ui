# Z-Image-Turbo 快速参考 🚀

## 一键命令

```bash
# 🚀 启动服务
./start.sh

# 📊 查看状态
./monitor.sh

# 🧪 快速测试
python3 test_generate.py

# 🎯 完整演示
python3 demo_all_features.py

# 🛑 停止服务
docker-compose down
```

## 访问地址

- 🌐 Web界面: http://localhost:8888
- 📖 API文档: http://localhost:8888/docs
- 💚 健康检查: http://localhost:8888/health

## 常用API

### 生成图像
```bash
curl -X POST http://localhost:8888/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "width": 1024,
    "height": 1024,
    "steps": 8,
    "seed": 42
  }'
```

### 批量生成
```bash
curl -X POST http://localhost:8888/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Various landscapes",
    "num_images": 5,
    "seed": -1
  }'
```

### 负面提示词
```bash
curl -X POST http://localhost:8888/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A portrait",
    "negative_prompt": "blurry, low quality",
    "steps": 8
  }'
```

### GPU信息
```bash
curl http://localhost:8888/gpu-info | jq
```

### 生成历史
```bash
curl http://localhost:8888/history | jq
```

## Docker命令

```bash
# 查看日志
docker logs -f z-image-turbo

# 进入容器
docker exec -it z-image-turbo bash

# 重启容器
docker-compose restart

# 查看GPU
docker exec z-image-turbo nvidia-smi

# 查看资源
docker stats z-image-turbo
```

## 推荐参数

### 快速生成（<1秒）
```json
{
  "width": 512,
  "height": 512,
  "steps": 8,
  "guidance_scale": 0.0
}
```

### 高质量（2-3秒）
```json
{
  "width": 1024,
  "height": 1024,
  "steps": 8,
  "guidance_scale": 0.0,
  "enhance_prompt": true
}
```

### 宽屏（3-4秒）
```json
{
  "width": 1920,
  "height": 1088,
  "steps": 8,
  "guidance_scale": 0.0
}
```

## 分辨率预设

| 名称 | 尺寸 | 用途 | 速度 |
|------|------|------|------|
| 标准 | 512x512 | 快速预览 | ~0.9s |
| 高清 | 1024x1024 | 通用 | ~1.2s |
| 肖像 | 768x1024 | 竖屏 | ~2.8s |
| 风景 | 1024x768 | 横屏 | ~2.8s |
| 宽屏 | 1920x1088 | 16:9 | ~3.5s |

## 故障排查

### 容器未运行
```bash
docker ps -a | grep z-image-turbo
docker logs z-image-turbo
```

### GPU不可用
```bash
nvidia-smi
docker exec z-image-turbo nvidia-smi
```

### 端口被占用
```bash
# 修改docker-compose.yml中的端口
ports:
  - "9999:8000"
```

### 显存不足
- 启用CPU Offload（UI设置）
- 降低分辨率
- 减少批量数量

## 性能优化

### 启用Flash Attention
1. 访问 http://localhost:8888
2. 点击设置图标
3. 勾选"Flash Attention"
4. 保存

### 启用模型编译
1. 访问设置
2. 勾选"Model Compilation"
3. 保存（首次生成会慢，后续快）

## 文件位置

```
z-image-turbo/
├── models/          # 模型缓存（~12GB）
├── outputs/         # 生成输出
├── start.sh         # 启动脚本
├── monitor.sh       # 监控脚本
├── test_generate.py # 测试脚本
└── docker-compose.yml # 容器配置
```

## 环境变量

```bash
# 指定GPU
GPU_ID=2 docker-compose up -d

# 模型缓存
HF_HOME=/path/to/cache

# CUDA设备
CUDA_VISIBLE_DEVICES=0
```

## Python示例

```python
import requests

# 生成图像
response = requests.post(
    "http://localhost:8888/generate",
    json={
        "prompt": "A cute cat",
        "width": 512,
        "height": 512,
        "steps": 8,
        "seed": 42
    }
)

result = response.json()
image_base64 = result['images'][0]['image']
seed = result['images'][0]['seed']

# 保存图像
import base64
img_data = base64.b64decode(image_base64.split(',')[1])
with open('output.png', 'wb') as f:
    f.write(img_data)
```

## 监控指标

```bash
# GPU使用率
docker exec z-image-turbo nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader

# 显存使用
docker exec z-image-turbo nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader

# 容器资源
docker stats z-image-turbo --no-stream
```

## 支持的功能

✅ 文本生成图像
✅ 批量生成
✅ 负面提示词
✅ 提示词增强
✅ 自定义尺寸
✅ 种子控制
✅ 生成历史
✅ 参数预设
✅ GPU监控
✅ 性能优化

## 获取帮助

- 📖 完整文档: README_ENHANCED.md
- 📋 部署总结: DEPLOYMENT_SUMMARY.md
- 🐛 问题反馈: GitHub Issues
- 💬 讨论: GitHub Discussions

---

**快速开始**: `./start.sh` → 访问 http://localhost:8888 🚀
