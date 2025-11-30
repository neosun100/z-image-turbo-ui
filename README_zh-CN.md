# Z-Image-Turbo Web UI

<div align="center">

![Z-Image-Turbo 界面](https://img.aws.xin/uPic/J23yjV.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)
[![Model](https://img.shields.io/badge/Model-Z--Image--Turbo-blue)](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-16+-green)](https://nodejs.org/)

### 🌍 Language / 语言

**[English](README.md)** | **简体中文** | **[繁體中文](README_zh-TW.md)** | **[日本語](README_ja.md)**

---

### 🚀 通义万相 Z-Image-Turbo 专业 Web 界面
闪电般快速的文生图，51+ 种分辨率预设

</div>

---

## ✨ 主要特性

### 🎨 界面功能
- **🌓 双主题模式** - 黑暗/明亮模式自由切换，适应不同使用场景
- **🌍 多语言支持** - 简体中文、繁体中文、英文、日文，自动检测浏览器语言
- **📐 丰富的分辨率预设** - 51+ 种预设分辨率，覆盖所有常用比例
  - 方形 (1:1): 512×512 → 2048×2048
  - 竖屏 (3:4): 768×1024 → 1728×2304
  - 横屏 (4:3): 1024×768 → 2304×1728
  - 宽屏横向 (16:9): 1280×720 → 3200×1800
  - 宽屏竖向 (9:16): 720×1280 → 1800×3200
  - 超宽横向 (21:9): 1344×576 → 2352×1008
  - 超宽竖向 (9:21): 576×1344 → 1008×2352
  - 极宽横向 (32:9): 1792×512 → 3200×912
  - 极宽竖向 (9:32): 512×1792 → 912×3200
- **🎯 自定义分辨率** - 支持 256-4096 范围内任意 16 倍数分辨率
- **🖼️ 高级图片浏览器** - 点击放大、左右切换、键盘快捷键（←/→/Esc）
- **📥 批量下载** - 一键下载所有生成的图片
- **⚡ 实时进度** - 实时日志流、进度条、已用时间显示
- **📊 模型信息面板** - 显示模型参数、显存占用、推荐设置等详细信息
- **📜 历史记录** - 自动保存生成历史，快速重用参数

### 🤖 模型能力
- **⚡ 超快速度** - 8 步推理，企业级 GPU 上可达亚秒级延迟
- **🏗️ S3-DiT 架构** - 基于可扩展单流扩散 Transformer
- **🧠 先进编码器** - Qwen 4B 文本编码 + Flux VAE 图像解码
- **🎓 DMDR 训练** - 融合 DMD 与强化学习的训练方法
- **🌐 双语精通** - 出色的中英文文本渲染能力
- **🎨 风格多样** - 从写实到动漫，无审查限制
- **📐 高保真度** - 原生支持最高 2MP 分辨率
- **💾 高效率** - 6B 参数，16GB 显存即可运行

## 🚀 快速开始

### 前置要求
- Python 3.8+
- Node.js 16+
- 8GB+ 显存推荐（或使用 CPU offload）
- Docker（可选，推荐用于生产环境）

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/neosun100/z-image-turbo-ui.git
cd z-image-turbo-ui

# 2. 构建 Docker 镜像
docker build -t z-image-turbo .

# 3. 运行容器（使用所有 GPU）
docker run -d --name z-image-turbo \
  --gpus all \
  -p 8888:8000 \
  -v ~/.cache/huggingface:/models \
  z-image-turbo

# 4. 运行容器（指定 GPU，例如 GPU 2）
docker run -d --name z-image-turbo \
  --gpus '"device=2"' \
  -p 8888:8000 \
  -v ~/.cache/huggingface:/models \
  z-image-turbo
```

访问 `http://localhost:8888` 开始使用！

### 方式二：本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/neosun100/z-image-turbo-ui.git
cd z-image-turbo-ui

# 2. 后端设置
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# 3. 前端设置
cd frontend
npm install
npm run build
cd ..

# 4. 启动后端
cd backend
python main.py
```

访问 `http://localhost:8000` 开始使用！

## 🔌 MCP 集成

Z-Image-Turbo 提供了模型上下文协议（MCP）服务器，允许 AI 助手和其他工具以编程方式生成图片。

### MCP 快速开始

1. **启动 Z-Image-Turbo 后端：**
```bash
cd backend
python main.py
```

2. **启动 MCP 服务器：**
```bash
# 先安装依赖
pip install mcp httpx

# 运行 MCP 服务器
python mcp_server.py
```

MCP 服务器将在 `http://localhost:3000/mcp` 启动

3. **从 Claude Desktop 连接：**

添加到 Claude Desktop 配置文件：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "z-image-turbo": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

4. **在 Claude 中使用：**
```
生成一张山脉日落的图片，分辨率 1920x1080
```

### 可用的 MCP 工具

#### `generate_image`
从文本提示词生成图片，完全控制所有参数。

**参数：**
- `prompt`（必需）：图片的文本描述
- `negative_prompt`：要避免的元素（可选）
- `width`：图片宽度，256-4096，必须是 16 的倍数（默认：1024）
- `height`：图片高度，256-4096，必须是 16 的倍数（默认：1024）
- `steps`：推理步数，推荐 8（默认：8）
- `guidance_scale`：引导强度（默认：0.0）
- `seed`：随机种子，用于复现结果，-1 表示随机（默认：-1）
- `num_images`：生成图片数量，1-12（默认：1）
- `enhance_prompt`：自动增强提示词（默认：false）

**示例：**
```python
generate_image(
    prompt="宁静的湖泊日落，背景是山脉",
    width=1920,
    height=1080,
    steps=8,
    num_images=2
)
```

### MCP 资源

#### `preset://resolutions`
获取 51+ 种分辨率预设的完整列表，包含精确尺寸，按宽高比组织：
- 方形 (1:1): 512×512, 768×768, 1024×1024, 1536×1536, 2048×2048
- 竖屏 (3:4): 768×1024, 1152×1536, 1536×2048, 1728×2304
- 横屏 (4:3): 1024×768, 1536×1152, 2048×1536, 2304×1728
- 宽屏 (16:9 & 9:16): 1280×720, 1920×1080, 2560×1440 等
- 超宽 (21:9 & 9:21): 1344×576, 1680×720, 2352×1008 等
- 极宽 (32:9 & 9:32): 1792×512, 2560×720, 3200×912 等

### MCP 提示词模板

#### `create_prompt_template`
为不同艺术风格生成优化的提示词模板。

**参数：**
- `subject`：图片的主要主题
- `style`：艺术风格（photorealistic, anime, oil painting, digital art, watercolor, sketch）

**示例：**
```python
create_prompt_template(
    subject="一只猫坐在窗台上",
    style="anime"
)
# 返回："一只猫坐在窗台上, anime style, highly detailed, vibrant colors, studio quality"
```

### 测试 MCP 服务器

使用 MCP Inspector 测试服务器：
```bash
# 安装 MCP inspector
npm install -g @modelcontextprotocol/inspector

# 运行 inspector
npx @modelcontextprotocol/inspector

# 连接到：http://localhost:3000/mcp
```

或使用 curl 测试：
```bash
curl http://localhost:3000/mcp
```

## 📖 使用指南

### 基础操作
1. **输入提示词** - 在底部文本框输入你的创意描述
2. **选择分辨率** - 从 51+ 种预设中选择，或自定义尺寸
3. **调整参数** - 推理步数（推荐 8）、引导强度、随机种子
4. **批量生成** - 一次生成最多 12 张图片
5. **点击生成** - 实时查看生成进度和日志

### 高级功能
- **增强提示词** - 自动添加质量提升关键词
- **负面提示词** - 指定要避免的元素
- **固定种子** - 使用特定种子值复现结果
- **图片浏览** - 点击图片进入全屏模式，使用 ←/→ 键切换
- **批量下载** - 点击"下载全部"按钮一次性下载所有图片
- **历史记录** - 点击历史记录快速重用之前的参数

### 快捷键
- **←** - 上一张图片（全屏模式）
- **→** - 下一张图片（全屏模式）
- **Esc** - 退出全屏模式

## ⚙️ 配置说明

### 显存优化
如果遇到 CUDA OOM 错误：
1. 减少批量生成数量
2. 降低分辨率
3. 指定使用显存较多的 GPU
4. 启用 CPU offload（通过设置面板）

### 模型缓存
默认模型缓存位置：`~/.cache/huggingface`

可通过环境变量修改：
```bash
export HF_HOME=/path/to/your/cache
```

## 🛠️ 技术栈

### 后端
- **FastAPI** - 高性能异步 Web 框架
- **PyTorch** - 深度学习框架
- **Diffusers** - Hugging Face 扩散模型库
- **Transformers** - 预训练模型库

### 前端
- **React** - 用户界面库
- **Vite** - 现代前端构建工具
- **Lucide React** - 精美图标库

### 模型
- **Z-Image-Turbo** - Tongyi-MAI 6B 参数文生图模型
- **架构** - S3-DiT (Scalable Single-Stream DiT)
- **文本编码器** - Qwen 4B
- **VAE** - Flux Autoencoder

## 📊 性能指标

| 指标 | 数值 |
|------|------|
| 模型参数 | 6B |
| 推荐步数 | 8 NFEs |
| 显存占用 | 12-16 GB |
| 最大分辨率 | 2MP (如 2048×2048) |
| 支持分辨率 | 256-4096 (16 倍数) |
| 生成速度 | <1s (企业级 GPU) |

## 🎯 最佳实践

### 提示词建议
- **具体描述** - 详细描述场景、风格、细节
- **使用关键词** - 如 "masterpiece", "highly detailed", "8k"
- **指定风格** - 如 "photorealistic", "anime style", "oil painting"
- **中英文混用** - 模型支持双语，可混合使用

### 参数调优
- **推理步数** - 8 步为最佳平衡点，更多步数不一定更好
- **引导强度** - 0.0 为推荐值，过高可能导致过饱和
- **随机种子** - -1 为随机，固定值可复现结果
- **分辨率** - 从小尺寸开始测试，满意后再提高分辨率

## 🐛 故障排除

### 常见问题

**Q: CUDA out of memory 错误**
```
A: 1. 使用 nvidia-smi 查看 GPU 使用情况
   2. 指定使用空闲的 GPU: --gpus '"device=X"'
   3. 减少批量生成数量或降低分辨率
```

**Q: 生成速度很慢**
```
A: 1. 确认使用 GPU 而非 CPU
   2. 检查 GPU 驱动和 CUDA 版本
   3. 减少推理步数（8 步已足够）
```

**Q: 图片质量不理想**
```
A: 1. 优化提示词，添加更多细节描述
   2. 启用"增强提示词"选项
   3. 尝试不同的随机种子
   4. 使用负面提示词排除不想要的元素
```

**Q: 界面显示异常**
```
A: 1. 清除浏览器缓存
   2. 尝试切换主题模式
   3. 检查浏览器控制台错误信息
```

## 📝 更新日志

### v2.0.0 (2025-11-30)
- ✨ 新增黑暗/明亮双主题模式
- 🌍 自动检测浏览器语言
- 📐 扩展至 51+ 种分辨率预设
- 🖼️ 高级图片浏览器（左右切换、键盘快捷键）
- 📥 批量下载功能
- ⚡ 实时进度和日志流
- 📊 模型信息面板
- 🎨 UI 全面优化和响应式改进
- 🐛 修复多项显示和性能问题

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 Apache 2.0 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- **模型** - [Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) by Alibaba Group
- **UI 框架** - React + Vite
- **后端框架** - FastAPI + Diffusers

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

### 📱 关注公众号获取更多 AI 工具和更新

<img src="https://img.aws.xin/uPic/扫码_搜索联合传播样式-标准色版.png" alt="微信公众号" />

</div>
