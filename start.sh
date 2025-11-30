#!/bin/bash

echo "🚀 Z-Image-Turbo Docker Launcher"
echo "================================"

# 检测最空闲的GPU
echo "🔍 Detecting best GPU..."
GPU_ID=$(python3 select_gpu.py)
echo "✅ Selected GPU: $GPU_ID"

# 导出GPU ID
export GPU_ID=$GPU_ID

# 构建并启动容器
echo "🏗️  Building Docker image..."
docker-compose build

echo "🚀 Starting container on GPU $GPU_ID..."
docker-compose up -d

echo ""
echo "✅ Z-Image-Turbo is running!"
echo "📊 GPU: $GPU_ID"
echo "🌐 Access: http://localhost:8000"
echo ""
echo "📝 Useful commands:"
echo "  docker-compose logs -f    # View logs"
echo "  docker-compose down       # Stop container"
echo "  docker-compose restart    # Restart container"
