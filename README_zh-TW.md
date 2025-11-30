# Z-Image-Turbo Web UI

<div align="center">

![Z-Image-Turbo 介面](https://img.aws.xin/uPic/J23yjV.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-green)](LICENSE)
[![Model](https://img.shields.io/badge/Model-Z--Image--Turbo-blue)](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
[![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/Node-16+-green)](https://nodejs.org/)

### 🌍 Language / 語言

**[English](README.md)** | **[简体中文](README_zh-CN.md)** | **繁體中文** | **[日本語](README_ja.md)**

---

### 🚀 通義萬相 Z-Image-Turbo 專業 Web 介面
閃電般快速的文生圖，51+ 種解析度預設

</div>

---

## ✨ 主要特性

### 🎨 介面功能
- **🌓 雙主題模式** - 黑暗/明亮模式自由切換，適應不同使用場景
- **🌍 多語言支援** - 簡體中文、繁體中文、英文、日文，自動檢測瀏覽器語言
- **📐 豐富的解析度預設** - 51+ 種預設解析度，覆蓋所有常用比例
  - 方形 (1:1): 512×512 → 2048×2048
  - 豎屏 (3:4): 768×1024 → 1728×2304
  - 橫屏 (4:3): 1024×768 → 2304×1728
  - 寬屏橫向 (16:9): 1280×720 → 3200×1800
  - 寬屏豎向 (9:16): 720×1280 → 1800×3200
  - 超寬橫向 (21:9): 1344×576 → 2352×1008
  - 超寬豎向 (9:21): 576×1344 → 1008×2352
  - 極寬橫向 (32:9): 1792×512 → 3200×912
  - 極寬豎向 (9:32): 512×1792 → 912×3200
- **🎯 自訂解析度** - 支援 256-4096 範圍內任意 16 倍數解析度
- **🖼️ 進階圖片瀏覽器** - 點擊放大、左右切換、鍵盤快捷鍵（←/→/Esc）
- **📥 批次下載** - 一鍵下載所有生成的圖片
- **⚡ 即時進度** - 即時日誌流、進度條、已用時間顯示
- **📊 模型資訊面板** - 顯示模型參數、顯存佔用、推薦設定等詳細資訊
- **📜 歷史記錄** - 自動儲存生成歷史，快速重用參數

### 🤖 模型能力
- **⚡ 超快速度** - 8 步推理，企業級 GPU 上可達亞秒級延遲
- **🏗️ S3-DiT 架構** - 基於可擴展單流擴散 Transformer
- **🧠 先進編碼器** - Qwen 4B 文字編碼 + Flux VAE 圖像解碼
- **🎓 DMDR 訓練** - 融合 DMD 與強化學習的訓練方法
- **🌐 雙語精通** - 出色的中英文文字渲染能力
- **🎨 風格多樣** - 從寫實到動漫，無審查限制
- **📐 高保真度** - 原生支援最高 2MP 解析度
- **💾 高效率** - 6B 參數，16GB 顯存即可執行

## 🚀 快速開始

### 前置要求
- Python 3.8+
- Node.js 16+
- 8GB+ 顯存推薦（或使用 CPU offload）
- Docker（可選，推薦用於生產環境）

### 方式一：Docker 部署（推薦）

```bash
# 1. 克隆儲存庫
git clone https://github.com/neosun100/z-image-turbo-ui.git
cd z-image-turbo-ui

# 2. 構建 Docker 映像
docker build -t z-image-turbo .

# 3. 執行容器（使用所有 GPU）
docker run -d --name z-image-turbo \
  --gpus all \
  -p 8888:8000 \
  -v ~/.cache/huggingface:/models \
  z-image-turbo

# 4. 執行容器（指定 GPU，例如 GPU 2）
docker run -d --name z-image-turbo \
  --gpus '"device=2"' \
  -p 8888:8000 \
  -v ~/.cache/huggingface:/models \
  z-image-turbo
```

訪問 `http://localhost:8888` 開始使用！

### 方式二：本地開發

```bash
# 1. 克隆儲存庫
git clone https://github.com/neosun100/z-image-turbo-ui.git
cd z-image-turbo-ui

# 2. 後端設定
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# 3. 前端設定
cd frontend
npm install
npm run build
cd ..

# 4. 啟動後端
cd backend
python main.py
```

訪問 `http://localhost:8000` 開始使用！

## 📖 使用指南

### 基礎操作
1. **輸入提示詞** - 在底部文字框輸入你的創意描述
2. **選擇解析度** - 從 51+ 種預設中選擇，或自訂尺寸
3. **調整參數** - 推理步數（推薦 8）、引導強度、隨機種子
4. **批次生成** - 一次生成最多 12 張圖片
5. **點擊生成** - 即時查看生成進度和日誌

### 進階功能
- **增強提示詞** - 自動添加質量提升關鍵詞
- **負面提示詞** - 指定要避免的元素
- **固定種子** - 使用特定種子值復現結果
- **圖片瀏覽** - 點擊圖片進入全螢幕模式，使用 ←/→ 鍵切換
- **批次下載** - 點擊「下載全部」按鈕一次性下載所有圖片
- **歷史記錄** - 點擊歷史記錄快速重用之前的參數

### 快捷鍵
- **←** - 上一張圖片（全螢幕模式）
- **→** - 下一張圖片（全螢幕模式）
- **Esc** - 退出全螢幕模式

## ⚙️ 配置說明

### 顯存優化
如果遇到 CUDA OOM 錯誤：
1. 減少批次生成數量
2. 降低解析度
3. 指定使用顯存較多的 GPU
4. 啟用 CPU offload（透過設定面板）

### 模型快取
預設模型快取位置：`~/.cache/huggingface`

可透過環境變數修改：
```bash
export HF_HOME=/path/to/your/cache
```

## 🛠️ 技術棧

### 後端
- **FastAPI** - 高效能非同步 Web 框架
- **PyTorch** - 深度學習框架
- **Diffusers** - Hugging Face 擴散模型庫
- **Transformers** - 預訓練模型庫

### 前端
- **React** - 使用者介面庫
- **Vite** - 現代前端建置工具
- **Lucide React** - 精美圖示庫

### 模型
- **Z-Image-Turbo** - Tongyi-MAI 6B 參數文生圖模型
- **架構** - S3-DiT (Scalable Single-Stream DiT)
- **文字編碼器** - Qwen 4B
- **VAE** - Flux Autoencoder

## 📊 效能指標

| 指標 | 數值 |
|------|------|
| 模型參數 | 6B |
| 推薦步數 | 8 NFEs |
| 顯存佔用 | 12-16 GB |
| 最大解析度 | 2MP (如 2048×2048) |
| 支援解析度 | 256-4096 (16 倍數) |
| 生成速度 | <1s (企業級 GPU) |

## 🎯 最佳實踐

### 提示詞建議
- **具體描述** - 詳細描述場景、風格、細節
- **使用關鍵詞** - 如 "masterpiece", "highly detailed", "8k"
- **指定風格** - 如 "photorealistic", "anime style", "oil painting"
- **中英文混用** - 模型支援雙語，可混合使用

### 參數調優
- **推理步數** - 8 步為最佳平衡點，更多步數不一定更好
- **引導強度** - 0.0 為推薦值，過高可能導致過飽和
- **隨機種子** - -1 為隨機，固定值可復現結果
- **解析度** - 從小尺寸開始測試，滿意後再提高解析度

## 🐛 故障排除

### 常見問題

**Q: CUDA out of memory 錯誤**
```
A: 1. 使用 nvidia-smi 查看 GPU 使用情況
   2. 指定使用空閒的 GPU: --gpus '"device=X"'
   3. 減少批次生成數量或降低解析度
```

**Q: 生成速度很慢**
```
A: 1. 確認使用 GPU 而非 CPU
   2. 檢查 GPU 驅動和 CUDA 版本
   3. 減少推理步數（8 步已足夠）
```

**Q: 圖片質量不理想**
```
A: 1. 優化提示詞，添加更多細節描述
   2. 啟用「增強提示詞」選項
   3. 嘗試不同的隨機種子
   4. 使用負面提示詞排除不想要的元素
```

**Q: 介面顯示異常**
```
A: 1. 清除瀏覽器快取
   2. 嘗試切換主題模式
   3. 檢查瀏覽器控制台錯誤資訊
```

## 📝 更新日誌

### v2.0.0 (2025-11-30)
- ✨ 新增黑暗/明亮雙主題模式
- 🌍 自動檢測瀏覽器語言
- 📐 擴展至 51+ 種解析度預設
- 🖼️ 進階圖片瀏覽器（左右切換、鍵盤快捷鍵）
- 📥 批次下載功能
- ⚡ 即時進度和日誌流
- 📊 模型資訊面板
- 🎨 UI 全面優化和響應式改進
- 🐛 修復多項顯示和效能問題

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權條款

本專案採用 Apache 2.0 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- **模型** - [Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo) by Alibaba Group
- **UI 框架** - React + Vite
- **後端框架** - FastAPI + Diffusers

---

<div align="center">

**⭐ 如果這個專案對你有幫助，請給個 Star！**

### 📱 關注公眾號獲取更多 AI 工具和更新

<img src="https://img.aws.xin/uPic/扫码_搜索联合传播样式-标准色版.png" alt="微信公眾號" />

</div>
