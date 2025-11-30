#!/bin/bash

echo "🔍 Z-Image-Turbo 系统监控"
echo "================================"
echo ""

# 容器状态
echo "📦 容器状态:"
docker ps --filter name=z-image-turbo --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# GPU使用情况
echo "🎮 GPU使用情况:"
docker exec z-image-turbo nvidia-smi --query-gpu=index,name,memory.used,memory.total,utilization.gpu,temperature.gpu --format=csv,noheader,nounits 2>/dev/null | \
  awk -F', ' '{printf "  GPU %s: %s\n    显存: %sMB / %sMB (%.1f%%)\n    利用率: %s%%\n    温度: %s°C\n\n", $1, $2, $3, $4, ($3/$4)*100, $5, $6}'

# API健康检查
echo "🏥 API健康状态:"
HEALTH=$(curl -s http://localhost:8888/health)
if [ $? -eq 0 ]; then
    echo "  ✅ API正常运行"
    echo "  $HEALTH" | python3 -m json.tool 2>/dev/null | sed 's/^/  /'
else
    echo "  ❌ API无响应"
fi
echo ""

# GPU详细信息
echo "📊 GPU详细信息:"
GPU_INFO=$(curl -s http://localhost:8888/gpu-info)
if [ $? -eq 0 ]; then
    echo "$GPU_INFO" | python3 -m json.tool 2>/dev/null | sed 's/^/  /'
else
    echo "  ❌ 无法获取GPU信息"
fi
echo ""

# 生成历史统计
echo "📈 生成统计:"
HISTORY=$(curl -s http://localhost:8888/history)
if [ $? -eq 0 ]; then
    COUNT=$(echo "$HISTORY" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
    echo "  总生成次数: $COUNT"
else
    echo "  ❌ 无法获取历史"
fi
echo ""

echo "💡 提示: 使用 'docker logs -f z-image-turbo' 查看实时日志"
