# Z-Image-Turbo Enhanced Edition 🚀

> 专业的Web界面 + Docker容器化 + 智能GPU选择 + 完整功能实现

![Z-Image-Turbo Interface](assets/projectScreenshot.png)

## ✨ 新增功能

### 🎯 核心增强
- ✅ **智能GPU选择** - 自动检测并使用最空闲的GPU
- ✅ **Docker容器化** - 完整的容器化部署方案
- ✅ **批量生成** - 一次生成多张图片
- ✅ **负面提示词** - 支持negative prompt
- ✅ **提示词增强** - 自动优化提示词质量
- ✅ **生成历史** - 自动保存生成记录
- ✅ **参数预设** - 保存和加载常用配置
- ✅ **GPU监控** - 实时显示GPU使用情况
- ✅ **Flash Attention** - 可选的性能优化
- ✅ **模型编译** - 首次运行后加速推理

### 🎨 UI功能
- 实时进度显示
- 图片下载和全屏查看
- 多种分辨率预设（480p-1080p）
- 宽高比快速切换（1:1, 3:4, 4:3, 16:9）
- 参数微调滑块
- 响应式设计

## 🚀 快速开始

### 前置要求
- Docker + Docker Compose
- NVIDIA GPU + 驱动
- nvidia-docker2 runtime
- 16GB+ VRAM推荐

### 一键启动

```bash
# 克隆仓库
git clone https://github.com/Aaryan-Kapoor/z-image-turbo.git
cd z-image-turbo

# 智能启动（自动选择最空闲GPU）
./start.sh
```

启动脚本会：
1. 🔍 检测所有GPU并选择最空闲的
2. 🏗️ 构建Docker镜像
3. 🚀 在选定的GPU上启动容器
4. 🌐 服务运行在 http://localhost:8888

### 手动启动

```bash
# 选择特定GPU（例如GPU 2）
GPU_ID=2 docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📊 GPU选择逻辑

系统会自动选择：
1. 显存使用最少的GPU
2. 利用率最低的GPU
3. 优先级：显存 > 利用率

当前系统GPU状态：
```
GPU 0: 35557MB / 46068MB (77% used)
GPU 1: 30177MB / 46068MB (65% used)
GPU 2: 10511MB / 46068MB (23% used) ← 自动选择
GPU 3: 29047MB / 46068MB (63% used)
```

## 🔧 配置选项

### 环境变量
```bash
GPU_ID=2              # 指定GPU编号
HF_HOME=/models       # Hugging Face缓存目录
```

### 应用设置（通过UI或API）
- **Model Cache Directory** - 模型下载位置
- **CPU Offload** - 低显存模式
- **Flash Attention** - 性能优化（需要支持）
- **Model Compilation** - 编译加速（首次慢，后续快）

## 📡 API端点

### 生成图像
```bash
POST /generate
{
  "prompt": "A beautiful sunset over mountains",
  "negative_prompt": "blurry, low quality",
  "height": 1024,
  "width": 1024,
  "steps": 8,
  "guidance_scale": 0.0,
  "seed": -1,
  "num_images": 1,
  "enhance_prompt": false
}
```

### 其他端点
- `GET /health` - 健康检查
- `GET /gpu-info` - GPU信息
- `GET /settings` - 获取配置
- `POST /settings/model-path` - 更新配置
- `GET /history` - 生成历史
- `DELETE /history` - 清空历史
- `GET /presets` - 获取预设
- `POST /presets` - 保存预设
- `DELETE /presets/{name}` - 删除预设

## 🧪 测试

```bash
# 运行测试脚本
python3 test_generate.py

# 输出示例：
# 🎨 Testing Z-Image-Turbo Generation...
# 📝 Prompt: A cute cat wearing sunglasses, photorealistic, 4k
# 📐 Size: 512x512
# ⚙️  Steps: 8
# ⏳ Generating...
# ✅ Success! Generated 1 image(s)
# 💾 Saved: test_output_20251130_215837_0.png
# 🎲 Seed: 42
```

## 📁 项目结构

```
z-image-turbo/
├── backend/
│   └── main.py              # FastAPI后端（增强版）
├── frontend/
│   ├── src/
│   │   └── App.jsx          # React前端
│   └── dist/                # 构建输出
├── models/                  # 模型缓存（自动创建）
├── outputs/                 # 生成输出（自动创建）
├── Dockerfile               # 容器镜像定义
├── docker-compose.yml       # 容器编排配置
├── select_gpu.py            # GPU选择脚本
├── start.sh                 # 智能启动脚本
├── test_generate.py         # 测试脚本
└── config.json              # 应用配置
```

## 🎯 使用技巧

### 最佳实践
1. **首次运行** - 会下载约12GB模型，需要时间
2. **推荐步数** - 8步是最佳平衡点
3. **Guidance Scale** - Turbo模型建议使用0.0
4. **分辨率** - 原生支持最高2MP（如1024x1536）
5. **批量生成** - 设置num_images > 1

### 性能优化
- 启用Flash Attention（如果GPU支持）
- 首次运行后启用Model Compilation
- 使用CPU Offload节省显存（会降速）

### 提示词技巧
- 启用"Enhance Prompt"自动添加质量词
- 使用负面提示词排除不想要的元素
- 支持中英文双语提示词

## 🔍 故障排查

### 容器无法启动
```bash
# 检查GPU驱动
nvidia-smi

# 检查Docker GPU支持
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi

# 查看容器日志
docker logs z-image-turbo
```

### 端口冲突
```bash
# 修改docker-compose.yml中的端口映射
ports:
  - "8888:8000"  # 改为其他端口
```

### 显存不足
```bash
# 在UI设置中启用CPU Offload
# 或降低生成分辨率
```

## 📊 性能基准

在NVIDIA L40S (46GB VRAM)上：
- **512x512** - ~0.5秒/张
- **1024x1024** - ~1.2秒/张
- **1920x1088** - ~3.5秒/张

## 🙏 致谢

- **模型**: [Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) by Alibaba Group
- **原始UI**: [Aaryan-Kapoor/z-image-turbo](https://github.com/Aaryan-Kapoor/z-image-turbo)
- **增强版**: 添加Docker化、GPU选择、完整功能实现

## 📝 许可证

Apache 2.0 License

---

**🎉 现在开始创作吧！访问 http://localhost:8888**
