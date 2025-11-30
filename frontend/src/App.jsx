import { useState, useEffect } from 'react'
import Help from './Help'
import { Zap, Download, Loader2, RefreshCw, Sparkles, History, Trash2, HelpCircle, Image as ImageIcon, Star, Github } from 'lucide-react'
import './index.css'

const translations = {
  'zh-CN': {
    title: 'Z-Image-Turbo', subtitle: '6B参数', prompt: '输入提示词...', negativePrompt: '负面提示词（可选）',
    generate: '生成', generating: '生成中...', parameters: '参数', steps: '推理步数', guidance: '引导强度',
    dimensions: '尺寸', seed: '随机种子', numImages: '生成数量', enhancePrompt: '增强提示词',
    history: '历史', clearHistory: '清空历史', download: '下载', downloadAll: '下载全部', regenerate: '重新生成',
    square: '方形', portrait: '竖屏', landscape: '横屏', wide: '宽屏', random: '随机', help: '帮助',
    progress: '进度', of: '/', resolutionNote: '分辨率必须是16的倍数',
    squareRatio: '方形 (1:1)', portraitRatio: '{t.portraitRatio}', landscapeRatio: '{t.landscapeRatio}',
    widescreenLandscape: '{t.widescreenLandscape}', widescreenPortrait: '{t.widescreenPortrait}',
    ultrawideLandscape: '{t.ultrawideLandscape}', ultrawidePortrait: '{t.ultrawidePortrait}',
    extremeWideLandscape: '{t.extremeWideLandscape}', extremeWidePortrait: '{t.extremeWidePortrait}',
    modelInfo: '模型信息', modelName: '模型名称', architecture: '架构', paramCount: '参数量',
    vramUsage: '显存占用', recommendedSteps: '推荐步数', maxResolution: '最大分辨率',
    mcpSupport: 'MCP 协议支持', mcpEnabled: '已启用 MCP 服务器'
  },
  'zh-TW': {
    title: 'Z-Image-Turbo', subtitle: '6B參數', prompt: '輸入提示詞...', negativePrompt: '負面提示詞（可選）',
    generate: '生成', generating: '生成中...', parameters: '參數', steps: '推理步數', guidance: '引導強度',
    dimensions: '尺寸', seed: '隨機種子', numImages: '生成數量', enhancePrompt: '增強提示詞',
    history: '歷史', clearHistory: '清空歷史', download: '下載', downloadAll: '下載全部', regenerate: '重新生成',
    square: '方形', portrait: '豎屏', landscape: '橫屏', wide: '寬屏', random: '隨機', help: '幫助',
    progress: '進度', of: '/', resolutionNote: '分辨率必須是16的倍數',
    squareRatio: '方形 (1:1)', portraitRatio: '豎屏 (3:4)', landscapeRatio: '橫屏 (4:3)',
    widescreenLandscape: '寬屏橫向 (16:9)', widescreenPortrait: '寬屏豎向 (9:16)',
    ultrawideLandscape: '超寬橫向 (21:9)', ultrawidePortrait: '超寬豎向 (9:21)',
    extremeWideLandscape: '極寬橫向 (32:9)', extremeWidePortrait: '極寬豎向 (9:32)',
    modelInfo: '模型資訊', modelName: '模型名稱', architecture: '架構', paramCount: '參數量',
    vramUsage: '顯存佔用', recommendedSteps: '推薦步數', maxResolution: '最大解析度',
    mcpSupport: 'MCP 協議支援', mcpEnabled: '已啟用 MCP 伺服器'
  },
  'en': {
    title: 'Z-Image-Turbo', subtitle: '6B Parameters', prompt: 'Enter your prompt...', negativePrompt: 'Negative prompt (optional)',
    generate: 'Generate', generating: 'Generating...', parameters: 'Parameters', steps: 'Inference Steps', guidance: 'Guidance Scale',
    dimensions: 'Dimensions', seed: 'Seed', numImages: 'Batch Size', enhancePrompt: 'Enhance Prompt',
    history: 'History', clearHistory: 'Clear History', download: 'Download', downloadAll: 'Download All', regenerate: 'Regenerate',
    square: 'Square', portrait: 'Portrait', landscape: 'Landscape', wide: 'Wide', random: 'Random', help: 'Help',
    progress: 'Progress', of: '/', resolutionNote: 'Resolution must be multiple of 16',
    squareRatio: 'Square (1:1)', portraitRatio: 'Portrait (3:4)', landscapeRatio: 'Landscape (4:3)',
    widescreenLandscape: 'Widescreen Landscape (16:9)', widescreenPortrait: 'Widescreen Portrait (9:16)',
    ultrawideLandscape: 'Ultrawide Landscape (21:9)', ultrawidePortrait: 'Ultrawide Portrait (9:21)',
    extremeWideLandscape: 'Extreme Wide Landscape (32:9)', extremeWidePortrait: 'Extreme Wide Portrait (9:32)',
    modelInfo: 'Model Info', modelName: 'Model Name', architecture: 'Architecture', paramCount: 'Parameters',
    vramUsage: 'VRAM Usage', recommendedSteps: 'Recommended Steps', maxResolution: 'Max Resolution',
    mcpSupport: 'MCP Protocol Support', mcpEnabled: 'MCP Server Enabled'
  },
  'ja': {
    title: 'Z-Image-Turbo', subtitle: '6Bパラメータ', prompt: 'プロンプトを入力...', negativePrompt: 'ネガティブプロンプト（オプション）',
    generate: '生成', generating: '生成中...', parameters: 'パラメータ', steps: '推論ステップ', guidance: 'ガイダンススケール',
    dimensions: 'サイズ', seed: 'シード', numImages: 'バッチサイズ', enhancePrompt: 'プロンプト強化',
    history: '履歴', clearHistory: '履歴をクリア', download: 'ダウンロード', downloadAll: '全てダウンロード', regenerate: '再生成',
    square: '正方形', portrait: '縦', landscape: '横', wide: 'ワイド', random: 'ランダム', help: 'ヘルプ',
    progress: '進捗', of: '/', resolutionNote: '解像度は16の倍数である必要があります',
    squareRatio: '正方形 (1:1)', portraitRatio: '縦画面 (3:4)', landscapeRatio: '横画面 (4:3)',
    widescreenLandscape: 'ワイドスクリーン横 (16:9)', widescreenPortrait: 'ワイドスクリーン縦 (9:16)',
    ultrawideLandscape: 'ウルトラワイド横 (21:9)', ultrawidePortrait: 'ウルトラワイド縦 (9:21)',
    extremeWideLandscape: '超ワイド横 (32:9)', extremeWidePortrait: '超ワイド縦 (9:32)',
    modelInfo: 'モデル情報', modelName: 'モデル名', architecture: 'アーキテクチャ', paramCount: 'パラメータ数',
    vramUsage: 'VRAM使用量', recommendedSteps: '推奨ステップ数', maxResolution: '最大解像度',
    mcpSupport: 'MCPプロトコル対応', mcpEnabled: 'MCPサーバー有効'
  }
}

function App() {
  // 自动检测浏览器语言
  const detectLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage
    if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-Hans')) return 'zh-CN'
    if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-Hant') || browserLang.startsWith('zh-HK')) return 'zh-TW'
    if (browserLang.startsWith('ja')) return 'ja'
    return 'en' // 默认英文
  }

  const [lang, setLang] = useState(detectLanguage())
  const [showHelp, setShowHelp] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [settings, setSettings] = useState({
    steps: 8, guidance_scale: 0.0, width: 1024, height: 1024,
    seed: -1, num_images: 1, enhance_prompt: false
  })
  const [logs, setLogs] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [darkMode, setDarkMode] = useState(true)

  const t = translations[lang]

  const theme = darkMode ? {
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    sidebarBg: 'rgba(0,0,0,0.3)',
    cardBg: 'rgba(255,255,255,0.1)',
    cardBorder: 'rgba(255,255,255,0.2)',
    text: '#fff',
    textSecondary: '#aaa',
    inputBg: 'rgba(255,255,255,0.1)',
    inputBorder: 'rgba(255,255,255,0.2)',
    buttonBg: 'rgba(255,255,255,0.08)',
    buttonBorder: 'rgba(255,255,255,0.15)',
    buttonText: '#fff'
  } : {
    bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    sidebarBg: 'rgba(255,255,255,0.9)',
    cardBg: 'rgba(255,255,255,0.8)',
    cardBorder: 'rgba(0,0,0,0.1)',
    text: '#1a1a2e',
    textSecondary: '#666',
    inputBg: 'rgba(255,255,255,0.9)',
    inputBorder: 'rgba(0,0,0,0.15)',
    buttonBg: 'rgba(0,0,0,0.05)',
    buttonBorder: 'rgba(0,0,0,0.15)',
    buttonText: '#1a1a2e'
  }

  useEffect(() => { fetchHistory() }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex !== null) {
        if (e.key === 'ArrowLeft') {
          setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length)
        } else if (e.key === 'ArrowRight') {
          setSelectedImageIndex((selectedImageIndex + 1) % images.length)
        } else if (e.key === 'Escape') {
          setSelectedImageIndex(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageIndex, images.length])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/history')
      const data = await res.json()
      setHistory(data.slice(-10).reverse())
    } catch (e) { console.error(e) }
  }

  const generate = async () => {
    if (!prompt) return
    setLoading(true)
    setImages([])
    setLogs([])
    
    try {
      const response = await fetch('/generate/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          negative_prompt: negativePrompt || null, 
          ...settings 
        })
      })
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'log') {
                setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: data.message }])
              } else if (data.type === 'progress') {
                // Just log progress, no UI update needed
              } else if (data.type === 'complete') {
                // Fetch images separately
                const imgRes = await fetch(`/get_images/${data.session_id}`)
                const imgData = await imgRes.json()
                setImages(imgData.images)
                fetchHistory()
                setLoading(false)
              } else if (data.type === 'error') {
                alert('Generation failed: ' + data.message)
                setLoading(false)
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
      
    } catch (e) {
      alert('Generation failed: ' + e.message)
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    if (!confirm('Clear all history?')) return
    try {
      await fetch('/history', { method: 'DELETE' })
      setHistory([])
    } catch (e) { console.error(e) }
  }

  const downloadAll = () => {
    images.forEach((img, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = img.image
        a.download = `z-image-${img.seed}.png`
        a.click()
      }, i * 100)
    })
  }

  const getGridCols = (count) => {
    if (count === 1) return 'cols-1'
    if (count <= 3) return 'cols-3'
    if (count <= 6) return 'cols-6'
    return 'cols-6'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: theme.bg, color: theme.text, fontSize: '15px' }}>
      
      {/* GitHub Star 角标 */}
      <a 
        href="https://github.com/neosun100/z-image-turbo-ui" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: '#fff',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(102,126,234,0.4)',
          transition: 'all 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(102,126,234,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(102,126,234,0.4)';
        }}
      >
        <Star size={16} fill="#fff" />
        <span>Star on GitHub</span>
      </a>

      <div style={{ width: '520px', borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, display: 'flex', flexDirection: 'column', background: theme.sidebarBg, backdropFilter: 'blur(20px)' }}>
        
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(102,126,234,0.4)' }}>
                <Zap size={24} color="#fff" fill="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, background: 'linear-gradient(135deg, #667eea, #f093fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.title}</h1>
                <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{t.subtitle}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDarkMode(!darkMode)} style={{ padding: '10px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.text, cursor: 'pointer', transition: 'all 0.3s' }}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={() => setShowHelp(true)} style={{ padding: '10px', background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.text, cursor: 'pointer', transition: 'all 0.3s' }}>
                <HelpCircle size={18} />
              </button>
              <select value={lang} onChange={e => setLang(e.target.value)} style={{ padding: '10px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '8px', color: theme.text, fontSize: '13px', cursor: 'pointer' }}>
                <option value="zh-CN">简体中文</option>
                <option value="zh-TW">繁體中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ fontSize: '13px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={14} /> {t.parameters}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px' }}>{t.steps}</label>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', background: 'rgba(102,126,234,0.2)', padding: '4px 10px', borderRadius: '6px', color: '#667eea' }}>{settings.steps}</span>
              </div>
              <input type="range" min="1" max="50" value={settings.steps} onChange={e => setSettings({...settings, steps: parseInt(e.target.value)})} style={{ width: '100%' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px' }}>{t.guidance}</label>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', background: 'rgba(102,126,234,0.2)', padding: '4px 10px', borderRadius: '6px', color: '#667eea' }}>{settings.guidance_scale.toFixed(1)}</span>
              </div>
              <input type="range" min="0" max="10" step="0.1" value={settings.guidance_scale} onChange={e => setSettings({...settings, guidance_scale: parseFloat(e.target.value)})} style={{ width: '100%' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px' }}>{t.dimensions}</label>
                <span style={{ fontSize: '12px', color: '#aaa' }}>{settings.width} x {settings.height}</span>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.squareRatio}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '512', w: 512, h: 512 },
                    { label: '768', w: 768, h: 768 },
                    { label: '1024', w: 1024, h: 1024 },
                    { label: '1536', w: 1536, h: 1536 },
                    { label: '2048', w: 2048, h: 2048 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.portraitRatio}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '768×1024', w: 768, h: 1024 },
                    { label: '864×1152', w: 864, h: 1152 },
                    { label: '960×1280', w: 960, h: 1280 },
                    { label: '1024×1365', w: 1024, h: 1365 },
                    { label: '1152×1536', w: 1152, h: 1536 },
                    { label: '1344×1792', w: 1344, h: 1792 },
                    { label: '1536×2048', w: 1536, h: 2048 },
                    { label: '1728×2304', w: 1728, h: 2304 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.landscapeRatio}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '1024×768', w: 1024, h: 768 },
                    { label: '1152×864', w: 1152, h: 864 },
                    { label: '1280×960', w: 1280, h: 960 },
                    { label: '1365×1024', w: 1365, h: 1024 },
                    { label: '1536×1152', w: 1536, h: 1152 },
                    { label: '1792×1344', w: 1792, h: 1344 },
                    { label: '2048×1536', w: 2048, h: 1536 },
                    { label: '2304×1728', w: 2304, h: 1728 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.widescreenLandscape}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '1280×720', w: 1280, h: 720 },
                    { label: '1440×810', w: 1440, h: 810 },
                    { label: '1600×900', w: 1600, h: 900 },
                    { label: '1920×1080', w: 1920, h: 1080 },
                    { label: '2560×1440', w: 2560, h: 1440 },
                    { label: '3200×1800', w: 3200, h: 1800 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.widescreenPortrait}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '720×1280', w: 720, h: 1280 },
                    { label: '810×1440', w: 810, h: 1440 },
                    { label: '900×1600', w: 900, h: 1600 },
                    { label: '1080×1920', w: 1080, h: 1920 },
                    { label: '1440×2560', w: 1440, h: 2560 },
                    { label: '1800×3200', w: 1800, h: 3200 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.ultrawideLandscape}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '1344×576', w: 1344, h: 576 },
                    { label: '1680×720', w: 1680, h: 720 },
                    { label: '1792×768', w: 1792, h: 768 },
                    { label: '2016×864', w: 2016, h: 864 },
                    { label: '2240×960', w: 2240, h: 960 },
                    { label: '2352×1008', w: 2352, h: 1008 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.ultrawidePortrait}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '576×1344', w: 576, h: 1344 },
                    { label: '720×1680', w: 720, h: 1680 },
                    { label: '768×1792', w: 768, h: 1792 },
                    { label: '864×2016', w: 864, h: 2016 },
                    { label: '960×2240', w: 960, h: 2240 },
                    { label: '1008×2352', w: 1008, h: 2352 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.extremeWideLandscape}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '1792×512', w: 1792, h: 512 },
                    { label: '2048×576', w: 2048, h: 576 },
                    { label: '2304×656', w: 2304, h: 656 },
                    { label: '2560×720', w: 2560, h: 720 },
                    { label: '2816×800', w: 2816, h: 800 },
                    { label: '3200×912', w: 3200, h: 912 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', fontWeight: 600 }}>{t.extremeWidePortrait}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { label: '512×1792', w: 512, h: 1792 },
                    { label: '576×2048', w: 576, h: 2048 },
                    { label: '656×2304', w: 656, h: 2304 },
                    { label: '720×2560', w: 720, h: 2560 },
                    { label: '800×2816', w: 800, h: 2816 },
                    { label: '912×3200', w: 912, h: 3200 }
                  ].map(p => (
                    <button key={p.label} onClick={() => setSettings({...settings, width: p.w, height: p.h})} style={{ padding: '8px 4px', background: settings.width === p.w && settings.height === p.h ? 'linear-gradient(135deg, #667eea, #764ba2)' : theme.buttonBg, color: settings.width === p.w && settings.height === p.h ? '#fff' : theme.buttonText, border: `1px solid ${theme.buttonBorder}`, borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>Width</label>
                  <input type="number" min="256" max="4096" step="16" value={settings.width} onChange={e => setSettings({...settings, width: Math.round(parseInt(e.target.value)/16)*16})} style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '8px', color: theme.text, fontSize: '14px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: theme.textSecondary, display: 'block', marginBottom: '6px' }}>Height</label>
                  <input type="number" min="256" max="4096" step="16" value={settings.height} onChange={e => setSettings({...settings, height: Math.round(parseInt(e.target.value)/16)*16})} style={{ width: '100%', padding: '10px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '8px', color: theme.text, fontSize: '14px' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>💡 {t.resolutionNote}</p>
            </div>

            <div>
              <label style={{ fontSize: '14px', display: 'block', marginBottom: '12px' }}>{t.seed}</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" value={settings.seed} onChange={e => setSettings({...settings, seed: parseInt(e.target.value)})} style={{ flex: 1, padding: '10px', background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: '8px', color: theme.text, fontSize: '14px', fontFamily: 'monospace' }} />
                <button onClick={() => setSettings({...settings, seed: -1})} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  {t.random}
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px' }}>{t.numImages}</label>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', background: 'rgba(102,126,234,0.2)', padding: '4px 10px', borderRadius: '6px', color: '#667eea' }}>{settings.num_images}</span>
              </div>
              <input type="range" min="1" max="12" value={settings.num_images} onChange={e => setSettings({...settings, num_images: parseInt(e.target.value)})} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(102,126,234,0.1)', borderRadius: '10px', border: '1px solid rgba(102,126,234,0.3)' }}>
              <input type="checkbox" checked={settings.enhance_prompt} onChange={e => setSettings({...settings, enhance_prompt: e.target.checked})} style={{ width: '18px', height: '18px' }} />
              <label style={{ fontSize: '14px', flex: 1 }}>{t.enhancePrompt}</label>
            </div>

            <div style={{ marginTop: '16px', padding: '16px', background: theme.inputBg, borderRadius: '10px', border: `1px solid ${theme.inputBorder}` }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#667eea', marginBottom: '12px' }}>📊 {t.modelInfo}</div>
              <div style={{ fontSize: '12px', color: theme.textSecondary, lineHeight: '1.8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t.modelName}:</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>Z-Image-Turbo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t.paramCount}:</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>6B</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t.vramUsage}:</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>~12-16 GB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t.recommendedSteps}:</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>8</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t.maxResolution}:</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>2048×2048</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{t.architecture}:</span>
                  <span style={{ color: theme.text, fontWeight: 500 }}>S3-DiT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${theme.inputBorder}` }}>
                  <span>{t.mcpSupport}:</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                    ✓ {t.mcpEnabled}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setShowHistory(!showHistory)} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.3))', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s' }}>
            <History size={16} /> {t.history}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {loading && (
          <div style={{ padding: '20px 32px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Loader2 className="animate-spin" size={20} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '14px', color: '#aaa' }}>正在拼命生成中，请耐心等待...</span>
          </div>
        )}
        
        <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          {images.length > 0 ? (
            <>
              <div className={`image-grid ${getGridCols(images.length)}`} style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setSelectedImageIndex(i)} className="hover-scale" style={{ position: 'relative', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: 'rgba(0,0,0,0.2)' }}>
                  <img src={img.image} alt="" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block', borderRadius: '12px' }} />
                  <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                    <button onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = img.image; a.download = `z-image-${img.seed}.png`; a.click() }} style={{ padding: '10px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: '#fff', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                      <Download size={18} />
                    </button>
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '12px', padding: '8px 12px', background: 'rgba(0,0,0,0.8)', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace', color: '#aaa', backdropFilter: 'blur(10px)' }}>
                    Seed: {img.seed}
                  </div>
                </div>
              ))}
            </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <div style={{ width: '120px', height: '120px', margin: '0 auto 24px', background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.2))', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.2)' }}>
                <ImageIcon size={60} strokeWidth={1} />
              </div>
              <p style={{ fontSize: '18px', color: '#888' }}>{t.prompt}</p>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', padding: '24px', backdropFilter: 'blur(20px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={t.prompt} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '15px', resize: 'none', height: '90px', fontFamily: 'inherit' }} />
            <textarea value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder={t.negativePrompt} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '16px', color: '#fff', fontSize: '15px', resize: 'none', height: '70px', fontFamily: 'inherit' }} />
            
            {logs.length > 0 && (
              <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>实时日志</div>
                {logs.map((log, i) => (
                  <div key={i} style={{ fontSize: '13px', color: '#aaa', marginBottom: '6px', fontFamily: 'monospace', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#667eea' }}>[{log.time}]</span>
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {images.length > 0 && (
                <>
                  <button onClick={downloadAll} style={{ padding: '16px 28px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 600, borderRadius: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                    <Download size={18} /> {t.downloadAll}
                  </button>
                  <button onClick={generate} disabled={loading} style={{ padding: '16px 28px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, borderRadius: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <RefreshCw size={18} /> {t.regenerate}
                  </button>
                </>
              )}
              <button onClick={generate} disabled={loading || !prompt} style={{ padding: '16px 36px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, borderRadius: '12px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(102,126,234,0.4)', transition: 'all 0.3s' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="#fff" />}
                {loading ? t.generating : t.generate}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <div style={{ width: '340px', borderLeft: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(20px)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{t.history}</h3>
            <button onClick={clearHistory} style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>
              <Trash2 size={16} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {history.map((item, i) => (
              <div key={i} onClick={() => { setPrompt(item.prompt); setNegativePrompt(item.negative_prompt || ''); setSettings({...settings, ...item.params}) }} style={{ padding: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                <p style={{ fontSize: '13px', margin: '0 0 8px 0', color: '#fff', lineHeight: 1.5 }}>{item.prompt.slice(0, 80)}...</p>
                <div style={{ fontSize: '11px', color: '#888' }}>{item.params.width}x{item.params.height} • {item.params.steps} steps</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showHelp && <Help lang={lang} onClose={() => setShowHelp(false)} />}
      
      {selectedImageIndex !== null && (
        <div onClick={() => setSelectedImageIndex(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '40px' }}>
          {/* 左箭头 */}
          {images.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length) }} 
              style={{ position: 'absolute', left: '40px', padding: '16px 20px', background: 'rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', color: '#fff', fontSize: '24px', cursor: 'pointer', backdropFilter: 'blur(10px)', zIndex: 10000 }}
            >
              ‹
            </button>
          )}
          
          {/* 图片 */}
          <div style={{ maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <img src={images[selectedImageIndex].image} alt="" style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 80px)', objectFit: 'contain', borderRadius: '8px', cursor: 'default' }} onClick={(e) => e.stopPropagation()} />
            <div style={{ color: '#aaa', fontSize: '14px', fontFamily: 'monospace' }}>
              {selectedImageIndex + 1} / {images.length} • Seed: {images[selectedImageIndex].seed}
            </div>
          </div>
          
          {/* 右箭头 */}
          {images.length > 1 && (
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImageIndex((selectedImageIndex + 1) % images.length) }} 
              style={{ position: 'absolute', right: '40px', padding: '16px 20px', background: 'rgba(0,0,0,0.8)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', color: '#fff', fontSize: '24px', cursor: 'pointer', backdropFilter: 'blur(10px)', zIndex: 10000 }}
            >
              ›
            </button>
          )}
        </div>
      )}

    </div>
  )
}

export default App
