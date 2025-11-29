import { useState, useEffect } from 'react'
import {
  Zap,
  Image as ImageIcon,
  Download,
  Loader2,
  Settings,
  RefreshCw,
  Maximize2,
  FolderOpen,
  X,
  Sparkles,
  Save,
  Github
} from 'lucide-react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [modelPath, setModelPath] = useState('')
  const [settings, setSettings] = useState({
    steps: 8,
    guidance_scale: 0.0,
    width: 1024,
    height: 1024,
    seed: -1
  })

  // Fetch initial settings
  useEffect(() => {
    fetch('http://localhost:8000/settings')
      .then(res => res.json())
      .then(data => {
        if (data.cache_dir) setModelPath(data.cache_dir)
      })
      .catch(err => console.error("Failed to fetch settings", err))
  }, [])

  const generate = async () => {
    if (!prompt) return
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...settings })
      })
      if (!res.ok) {
        throw new Error('Generation failed')
      }
      const data = await res.json()
      if (data.image) {
        setImage(data.image)
      }
    } catch (e) {
      console.error(e)
      alert('Error generating image. Check backend console.')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      const res = await fetch('http://localhost:8000/settings/model-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cache_dir: modelPath })
      })
      if (res.ok) {
        setShowSettings(false)
        alert('Settings saved. Model will reload on next generation.')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (e) {
      alert('Error saving settings: ' + e.message)
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)'
    }}>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '500px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-tertiary)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} /> Application Settings
              </h2>
              <button onClick={() => setShowSettings(false)} style={{
                padding: '8px',
                borderRadius: '9999px',
                transition: 'background 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Model Cache Directory
                </label>
                <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <FolderOpen style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }} size={16} />
                    <input
                      type="text"
                      value={modelPath}
                      onChange={(e) => setModelPath(e.target.value)}
                      placeholder="/path/to/custom/cache"
                      style={{ width: '100%', paddingLeft: '40px' }}
                    />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Leave empty to use default Hugging Face cache. Changing this will trigger a model reload.
                </p>
              </div>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: 'white',
                  color: 'black',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{
        width: '360px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-secondary)',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap style={{ width: '20px', height: '20px', color: 'black' }} fill="black" />
              </div>
              <div>
                <h1 style={{ fontWeight: 700, fontSize: '18px', lineHeight: 1 }}>Z-Image-Turbo</h1>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px'
                }}>6B parameters</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a
                href="https://github.com/Aaryan-Kapoor/z-image-turbo"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                title="View on GitHub"
              >
                <Github size={18} />
              </a>
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <Sparkles size={14} />
              <h2 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Parameters
              </h2>
            </div>

            {/* Inference Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Inference Steps</label>
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}>{settings.steps}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={settings.steps}
                onChange={e => setSettings({ ...settings, steps: parseInt(e.target.value) })}
              />
            </div>

            {/* Guidance Scale */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Guidance Scale</label>
                <span style={{
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}>{settings.guidance_scale.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={settings.guidance_scale}
                onChange={e => setSettings({ ...settings, guidance_scale: parseFloat(e.target.value) })}
              />
            </div>

            {/* Dimensions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '14px', fontWeight: 500 }}>Dimensions</label>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {settings.width} x {settings.height}
                </span>
              </div>

              {/* Aspect Ratio Presets */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { label: 'Square', ratio: '1:1', w: 1024, h: 1024 },
                  { label: 'Portrait', ratio: '3:4', w: 896, h: 1152 },
                  { label: 'Land.', ratio: '4:3', w: 1152, h: 896 },
                  { label: 'Wide', ratio: '16:9', w: 1344, h: 768 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setSettings({ ...settings, width: preset.w, height: preset.h })}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 4px',
                      backgroundColor: (settings.width === preset.w && settings.height === preset.h) ? 'white' : 'var(--bg-tertiary)',
                      color: (settings.width === preset.w && settings.height === preset.h) ? 'black' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>{preset.ratio}</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>{preset.label}</span>
                  </button>
                ))}
              </div>

              {/* Resolution Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <select
                  value={[
                    "256x256", "512x288", "640x352",
                    "512x512", "768x768", "1024x1024",
                    "848x480", "1280x720", "1920x1088"
                  ].includes(`${settings.width}x${settings.height}`) ? `${settings.width}x${settings.height}` : "custom"}
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      const [w, h] = e.target.value.split('x').map(Number);
                      setSettings({ ...settings, width: w, height: h });
                    }
                  }}
                  style={{
                    fontSize: '12px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'white',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="custom" disabled>Select Resolution...</option>
                  <optgroup label="Tiny / Low Res">
                    <option value="256x256">256 x 256 (Tiny)</option>
                    <option value="512x288">512 x 288 (288p)</option>
                    <option value="640x352">640 x 352 (360p approx)</option>
                  </optgroup>
                  <optgroup label="Standard">
                    <option value="512x512">512 x 512 (SD)</option>
                    <option value="768x768">768 x 768 (SD+)</option>
                    <option value="1024x1024">1024 x 1024 (XL)</option>
                  </optgroup>
                  <optgroup label="Widescreen (16:9)">
                    <option value="848x480">848 x 480 (480p)</option>
                    <option value="1280x720">1280 x 720 (720p)</option>
                    <option value="1920x1088">1920 x 1088 (1080p)</option>
                  </optgroup>
                </select>
              </div>

              {/* Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Width Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Width</span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{settings.width}px</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="2048"
                    step="16"
                    value={settings.width}
                    onChange={e => setSettings({ ...settings, width: parseInt(e.target.value) })}
                  />
                </div>

                {/* Height Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Height</span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{settings.height}px</span>
                  </div>
                  <input
                    type="range"
                    min="256"
                    max="2048"
                    step="16"
                    value={settings.height}
                    onChange={e => setSettings({ ...settings, height: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Seed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }}>Seed</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number"
                  placeholder="Random (-1)"
                  value={settings.seed}
                  onChange={e => setSettings({ ...settings, seed: parseInt(e.target.value) })}
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '14px', width: '100%' }}
                />
                <button
                  onClick={() => setSettings({ ...settings, seed: -1 })}
                  style={{
                    padding: '0 12px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  title="Reset to Random"
                >
                  <span style={{ color: 'white' }}>RND</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: loading ? '#eab308' : '#22c55e',
              boxShadow: loading ? '0 0 8px rgba(234, 179, 8, 0.5)' : '0 0 8px rgba(34, 197, 94, 0.5)'
            }}></div>
            <span>{loading ? 'Generating...' : 'System Ready'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-primary)'
      }}>

        {/* Top Bar */}
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Workspace / <span style={{ color: 'white' }}>New Generation</span>
          </div>
        </div>

        {/* Image Display Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'var(--bg-primary)'
        }}>
          {image ? (
            <div style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)'
            }} className="animate-fade-in image-container">
              <img
                src={image}
                alt="Generated"
                style={{
                  maxHeight: 'calc(100vh - 300px)',
                  objectFit: 'contain',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'block'
                }}
              />

              <div className="image-overlay" style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                opacity: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                backdropFilter: 'blur(2px)',
                transition: 'opacity 0.2s'
              }}>
                <button
                  style={{
                    padding: '12px',
                    backgroundColor: 'white',
                    color: 'black',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-lg)',
                    transition: 'transform 0.2s'
                  }}
                  title="Download"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = image
                    link.download = `z-image-${Date.now()}.png`
                    link.click()
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Download size={24} />
                </button>
                <button
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s'
                  }}
                  title="View Fullscreen"
                  onClick={() => window.open(image, '_blank')}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Maximize2 size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              color: 'var(--text-secondary)',
              opacity: 0.5,
              userSelect: 'none'
            }}>
              <div style={{
                width: '192px',
                height: '192px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-secondary)',
                border: '2px dashed var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ImageIcon size={64} strokeWidth={1} />
              </div>
              <p style={{ fontSize: '18px', fontWeight: 300, letterSpacing: '0.5px' }}>
                Enter a prompt to begin creation
              </p>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          padding: '24px'
        }}>
          <div style={{ maxWidth: '1024px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <textarea
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  paddingRight: image ? '180px' : '140px',
                  resize: 'none',
                  height: '128px',
                  fontSize: '16px',
                  lineHeight: 1.5,
                  transition: 'all 0.2s'
                }}
                placeholder="Describe your imagination..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--border-light)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px'
              }}>
                {image && (
                  <button
                    onClick={generate}
                    disabled={loading || !prompt}
                    style={{
                      height: '40px',
                      padding: '0 16px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'white',
                      fontWeight: 500,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--border)')}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                    title="Regenerate with same settings"
                  >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  </button>
                )}
                <button
                  onClick={generate}
                  disabled={loading || !prompt}
                  style={{
                    height: '40px',
                    padding: '0 24px',
                    backgroundColor: 'white',
                    color: 'black',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={e => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#e5e5e5'
                      e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.2)'
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'white'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="black" />}
                  <span>{loading ? 'Generating...' : 'Generate'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .image-container:hover .image-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}

export default App
