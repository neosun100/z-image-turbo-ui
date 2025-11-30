# Z-Image-Turbo Web UI

<div align="center">

![Z-Image-Turbo Interface](https://img.aws.xin/uPic/J23yjV.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)
[![Model](https://img.shields.io/badge/Model-Z--Image--Turbo-blue)](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-16+-green)](https://nodejs.org/)

### 🌍 Language / 语言

**English** | **[简体中文](README_zh-CN.md)** | **[繁體中文](README_zh-TW.md)** | **[日本語](README_ja.md)**

---

### 🚀 Professional Web UI for Tongyi-MAI Z-Image-Turbo
Lightning-fast text-to-image generation with 51+ resolution presets

</div>

---

## ✨ Key Features

### 🎨 Interface Features
- **🌓 Dual Theme Mode** - Switch between dark/light themes for different scenarios
- **🌍 Multi-language Support** - Simplified Chinese, Traditional Chinese, English, Japanese with auto-detection
- **📐 Rich Resolution Presets** - 51+ preset resolutions covering all common aspect ratios
  - Square (1:1): 512×512 → 2048×2048
  - Portrait (3:4): 768×1024 → 1728×2304
  - Landscape (4:3): 1024×768 → 2304×1728
  - Widescreen Landscape (16:9): 1280×720 → 3200×1800
  - Widescreen Portrait (9:16): 720×1280 → 1800×3200
  - Ultrawide Landscape (21:9): 1344×576 → 2352×1008
  - Ultrawide Portrait (9:21): 576×1344 → 1008×2352
  - Extreme Wide Landscape (32:9): 1792×512 → 3200×912
  - Extreme Wide Portrait (9:32): 512×1792 → 912×3200
- **🎯 Custom Resolution** - Support any 16-multiple resolution from 256-4096
- **🖼️ Advanced Image Viewer** - Click to zoom, navigate with arrows, keyboard shortcuts (←/→/Esc)
- **📥 Batch Download** - Download all generated images with one click
- **⚡ Real-time Progress** - Live log streaming, progress bar, elapsed time display
- **📊 Model Info Panel** - Display model parameters, VRAM usage, recommended settings
- **📜 History** - Auto-save generation history for quick parameter reuse

### 🤖 Model Capabilities
- **⚡ Lightning Fast** - 8-step inference, sub-second latency on enterprise GPUs
- **🏗️ S3-DiT Architecture** - Scalable Single-Stream Diffusion Transformer
- **🧠 Advanced Encoders** - Qwen 4B text encoder + Flux VAE decoder
- **🎓 DMDR Training** - Fusing DMD with Reinforcement Learning
- **🌐 Bilingual Mastery** - Excellent Chinese and English text rendering
- **🎨 Versatile Styles** - From photorealism to anime, uncensored
- **📐 High Fidelity** - Native support up to 2MP resolution
- **💾 Efficient** - 6B parameters, runs on 16GB VRAM

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- 8GB+ VRAM recommended (or use CPU offload)
- Docker (optional, recommended for production)

### Method 1: Docker Deployment (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/neosun100/z-image-turbo-ui.git
cd z-image-turbo-ui

# 2. Build Docker image
docker build -t z-image-turbo .

# 3. Run container (all GPUs)
docker run -d --name z-image-turbo \
  --gpus all \
  -p 8888:8000 \
  -v ~/.cache/huggingface:/models \
  z-image-turbo

# 4. Run container (specific GPU, e.g., GPU 2)
docker run -d --name z-image-turbo \
  --gpus '"device=2"' \
  -p 8888:8000 \
  -v ~/.cache/huggingface:/models \
  z-image-turbo
```

Visit `http://localhost:8888` to start!

### Method 2: Local Development

```bash
# 1. Clone repository
git clone https://github.com/neosun100/z-image-turbo-ui.git
cd z-image-turbo-ui

# 2. Backend setup
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# 3. Frontend setup
cd frontend
npm install
npm run build
cd ..

# 4. Start backend
cd backend
python main.py
```

Visit `http://localhost:8000` to start!

## 🔌 MCP Integration

Z-Image-Turbo provides a Model Context Protocol (MCP) server that allows AI assistants and other tools to generate images programmatically.

### Quick Start with MCP

1. **Start the Z-Image-Turbo backend:**
```bash
cd backend
python main.py
```

2. **Install the MCP server in Claude Desktop:**
```bash
# Install dependencies
pip install mcp httpx

# Add to Claude Desktop configuration
# On macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
# On Windows: %APPDATA%\Claude\claude_desktop_config.json
```

Add this configuration:
```json
{
  "mcpServers": {
    "z-image-turbo": {
      "command": "python",
      "args": ["/path/to/z-image-turbo/mcp_server.py"]
    }
  }
}
```

3. **Use in Claude or other MCP clients:**
```
Generate an image of a sunset over mountains, 1920x1080 resolution
```

### MCP Tools Available

#### `generate_image`
Generate images from text prompts with full control over parameters.

**Parameters:**
- `prompt` (required): Text description of the image
- `negative_prompt`: Elements to avoid (optional)
- `width`: Image width, 256-4096, multiple of 16 (default: 1024)
- `height`: Image height, 256-4096, multiple of 16 (default: 1024)
- `steps`: Inference steps, recommended 8 (default: 8)
- `guidance_scale`: Guidance scale (default: 0.0)
- `seed`: Random seed for reproducibility, -1 for random (default: -1)
- `num_images`: Number of images to generate, 1-12 (default: 1)
- `enhance_prompt`: Auto-enhance prompt with quality keywords (default: false)

**Example:**
```python
generate_image(
    prompt="a serene lake at sunset with mountains in the background",
    width=1920,
    height=1080,
    steps=8,
    num_images=2
)
```

### MCP Resources

#### `preset://resolutions`
Get a comprehensive list of 51+ resolution presets organized by aspect ratio (1:1, 3:4, 4:3, 16:9, 9:16, 21:9, 9:21, 32:9, 9:32).

### MCP Prompts

#### `create_prompt_template`
Generate optimized prompt templates for different art styles.

**Parameters:**
- `subject`: Main subject of the image
- `style`: Art style (photorealistic, anime, oil painting, digital art, watercolor, sketch)

**Example:**
```python
create_prompt_template(
    subject="a cat sitting on a windowsill",
    style="anime"
)
# Returns: "a cat sitting on a windowsill, anime style, highly detailed, vibrant colors, studio quality"
```

### Testing the MCP Server

Test the MCP server directly:
```bash
# Install MCP inspector
npm install -g @modelcontextprotocol/inspector

# Run the inspector
npx @modelcontextprotocol/inspector python mcp_server.py
```

## 📖 Usage Guide

### Basic Operations
1. **Enter Prompt** - Describe your creative vision in the bottom text box
2. **Select Resolution** - Choose from 51+ presets or customize
3. **Adjust Parameters** - Inference steps (8 recommended), guidance scale, seed
4. **Batch Generation** - Generate up to 12 images at once
5. **Click Generate** - Watch real-time progress and logs

### Advanced Features
- **Enhance Prompt** - Auto-add quality-boosting keywords
- **Negative Prompt** - Specify elements to avoid
- **Fixed Seed** - Use specific seed for reproducible results
- **Image Viewer** - Click image for fullscreen, use ←/→ to navigate
- **Batch Download** - Click "Download All" to save all images
- **History** - Click history entries to quickly reuse parameters

### Keyboard Shortcuts
- **←** - Previous image (fullscreen mode)
- **→** - Next image (fullscreen mode)
- **Esc** - Exit fullscreen mode

## ⚙️ Configuration

### VRAM Optimization
If you encounter CUDA OOM errors:
1. Reduce batch size
2. Lower resolution
3. Specify GPU with more free VRAM
4. Enable CPU offload (via settings panel)

### Model Cache
Default cache location: `~/.cache/huggingface`

Modify via environment variable:
```bash
export HF_HOME=/path/to/your/cache
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - High-performance async web framework
- **PyTorch** - Deep learning framework
- **Diffusers** - Hugging Face diffusion models library
- **Transformers** - Pre-trained models library

### Frontend
- **React** - UI library
- **Vite** - Modern frontend build tool
- **Lucide React** - Beautiful icon library

### Model
- **Z-Image-Turbo** - Tongyi-MAI 6B parameter text-to-image model
- **Architecture** - S3-DiT (Scalable Single-Stream DiT)
- **Text Encoder** - Qwen 4B
- **VAE** - Flux Autoencoder

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Model Parameters | 6B |
| Recommended Steps | 8 NFEs |
| VRAM Usage | 12-16 GB |
| Max Resolution | 2MP (e.g., 2048×2048) |
| Supported Resolution | 256-4096 (16 multiples) |
| Generation Speed | <1s (enterprise GPU) |

## 🎯 Best Practices

### Prompt Tips
- **Be Specific** - Detailed scene, style, and detail descriptions
- **Use Keywords** - Like "masterpiece", "highly detailed", "8k"
- **Specify Style** - Such as "photorealistic", "anime style", "oil painting"
- **Bilingual** - Model supports both Chinese and English

### Parameter Tuning
- **Inference Steps** - 8 steps is optimal, more isn't always better
- **Guidance Scale** - 0.0 recommended, too high may oversaturate
- **Random Seed** - -1 for random, fixed value for reproducibility
- **Resolution** - Start small for testing, increase when satisfied

## 🐛 Troubleshooting

### Common Issues

**Q: CUDA out of memory error**
```
A: 1. Check GPU usage with nvidia-smi
   2. Specify free GPU: --gpus '"device=X"'
   3. Reduce batch size or resolution
```

**Q: Slow generation speed**
```
A: 1. Confirm GPU (not CPU) is being used
   2. Check GPU driver and CUDA version
   3. Reduce inference steps (8 is sufficient)
```

**Q: Poor image quality**
```
A: 1. Optimize prompt with more details
   2. Enable "Enhance Prompt" option
   3. Try different random seeds
   4. Use negative prompts to exclude unwanted elements
```

**Q: UI display issues**
```
A: 1. Clear browser cache
   2. Try switching theme mode
   3. Check browser console for errors
```

## 📝 Changelog

### v2.0.0 (2025-11-30)
- ✨ Added dark/light dual theme mode
- 🌍 Auto-detect browser language
- 📐 Extended to 51+ resolution presets
- 🖼️ Advanced image viewer (navigation, keyboard shortcuts)
- 📥 Batch download feature
- ⚡ Real-time progress and log streaming
- 📊 Model information panel
- 🎨 Comprehensive UI optimization and responsive improvements
- 🐛 Fixed multiple display and performance issues

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

This project is licensed under Apache 2.0 - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

- **Model** - [Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) by Alibaba Group
- **UI Framework** - React + Vite
- **Backend Framework** - FastAPI + Diffusers

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

### 📱 Follow for More AI Tools & Updates

<img src="https://img.aws.xin/uPic/扫码_搜索联合传播样式-标准色版.png" alt="WeChat Official Account" />

</div>
