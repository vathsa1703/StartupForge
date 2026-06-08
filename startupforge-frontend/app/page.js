'use client'
import { useState, useEffect, useRef } from 'react'

const TICKER_ITEMS = [
  { label: 'FITMIND', value: '+₹2.4L MRR', change: '+12.4%', up: true },
  { label: 'LEGALAI', value: '₹8.2Cr ARR', change: '+34.1%', up: true },
  { label: 'EDTECH3', value: '-₹1.1L', change: '-8.2%', up: false },
  { label: 'AGRIBOT', value: '+₹890K MRR', change: '+6.7%', up: true },
  { label: 'MEDVAULT', value: '₹3.3Cr ARR', change: '+22.9%', up: true },
  { label: 'DRONAERO', value: '-₹220K', change: '-3.1%', up: false },
  { label: 'CLARITYX', value: '+₹1.8L MRR', change: '+9.3%', up: true },
]

const GRID_METRICS = [
  { label: 'Simulations Run', value: '12,847', mono: true },
  { label: 'Ideas Validated', value: '3,291', mono: true },
  { label: 'Avg Runway Found', value: '8.3mo', mono: true },
  { label: 'Investors Pitched', value: '41,200', mono: true },
]

const NOISE_LINES = Array.from({ length: 18 }, (_, i) => i)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [tickerPos, setTickerPos] = useState(0)
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    const ticker = setInterval(() => {
      setTickerPos(p => p - 1)
    }, 30)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232, 160, 48, ${p.o})`
        ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(232, 160, 48, ${0.04 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      clearInterval(ticker)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  const totalTickerWidth = TICKER_ITEMS.length * 260
  const wrappedPos = tickerPos % totalTickerWidth

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    setLoading(false)
    window.location.href = '/create'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', opacity: 0.6,
      }} />

      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 50%, rgba(232,160,48,0.04) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 20%, rgba(74,144,217,0.03) 0%, transparent 60%)`,
        pointerEvents: 'none',
      }} />

      {NOISE_LINES.map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: 0, right: 0,
          top: `${(i + 1) * (100 / 19)}%`,
          height: '1px',
          background: 'var(--border-subtle)',
          pointerEvents: 'none',
          opacity: 0.4,
        }} />
      ))}

      {/* Top nav */}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        borderBottom: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--amber)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#08090a" strokeWidth="1.5" fill="none"/>
              <path d="M7 5L9 6.5V9.5L7 11L5 9.5V6.5L7 5Z" fill="#08090a"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)',
          }}>StartupForge</span>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--text-muted)', letterSpacing: '0.08em',
        }}>
          SIMULATION ENGINE v1.0
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setMode('login')}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)',
              border: mode === 'login' ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
              background: mode === 'login' ? 'var(--bg-elevated)' : 'transparent',
              color: mode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            Sign in
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              padding: '7px 16px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--amber)',
              background: 'var(--amber)',
              color: '#08090a',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            Get started
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{
        position: 'relative', zIndex: 5,
        display: 'grid',
        gridTemplateColumns: '1fr 440px',
        gap: 80,
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        padding: '80px 40px',
        alignItems: 'center',
      }}>
        {/* Left — hero */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(20px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 12px',
            borderRadius: 100,
            border: '1px solid var(--amber-glow)',
            background: 'var(--amber-dim)',
            marginBottom: 28,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--amber)',
              boxShadow: '0 0 8px var(--amber)',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--amber)', letterSpacing: '0.06em', fontWeight: 500,
            }}>LIVE SIMULATION ENGINE</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 6vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
            marginBottom: 24,
          }}>
            Run your startup<br />
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontWeight: 400,
              background: 'linear-gradient(90deg, var(--amber) 0%, #f0c060 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>before you build it.</span>
          </h1>

          <p style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            maxWidth: 480,
            marginBottom: 48,
            fontWeight: 400,
          }}>
            AI-generated customers, investors, and market conditions. 
            Simulate 6 months of your startup in minutes — and learn what kills most founders before it's too late.
          </p>

          {/* Stats grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: 'var(--border-subtle)',
          }}>
            {GRID_METRICS.map((m, i) => (
              <div key={i} style={{
                padding: '16px 20px',
                background: 'var(--bg-surface)',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18,
                  fontWeight: 400, color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}>{m.value}</span>
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  fontWeight: 500, letterSpacing: '0.04em',
                }}>{m.label.toUpperCase()}</span>
              </div>
            ))}
          </div>

          {/* Persona preview strip */}
          <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex' }}>
              {['R', 'A', 'K', 'S'].map((l, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: '2px solid var(--bg-void)',
                  background: ['#e8a030', '#4a90d9', '#2dba74', '#9a6dd7'][i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#08090a',
                  marginLeft: i > 0 ? -8 : 0,
                  zIndex: 4 - i,
                  position: 'relative',
                }}>{l}</div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              AI-generated customer personas ready to interview
            </span>
          </div>
        </div>

        {/* Right — login card */}
        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Card glow */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(232,160,48,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ marginBottom: 32 }}>
              <h2 style={{
                fontSize: 22, fontWeight: 700,
                letterSpacing: '-0.03em', color: 'var(--text-primary)',
                marginBottom: 6,
              }}>
                {mode === 'login' ? 'Welcome back, founder.' : 'Launch your simulation.'}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {mode === 'login'
                  ? 'Your startup is waiting for decisions.'
                  : 'Enter your details to start simulating.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'signup' && (
                <div>
                  <label style={{
                    display: 'block', fontSize: 11, fontWeight: 600,
                    color: 'var(--text-muted)', letterSpacing: '0.08em',
                    marginBottom: 7,
                  }}>FULL NAME</label>
                  <input
                    type="text" placeholder="Rahul Sharma"
                    style={inputStyle(focused === 'name')}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              )}

              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600,
                  color: 'var(--text-muted)', letterSpacing: '0.08em',
                  marginBottom: 7,
                }}>EMAIL</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@startup.com"
                  style={inputStyle(focused === 'email')}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600,
                  color: 'var(--text-muted)', letterSpacing: '0.08em',
                  marginBottom: 7,
                }}>PASSWORD</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle(focused === 'password')}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  padding: '14px 24px',
                  background: loading ? 'rgba(232,160,48,0.6)' : 'var(--amber)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#08090a',
                  fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.01em',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  position: 'relative', overflow: 'hidden',
                }}>
                {loading ? (
                  <>
                    <LoadingSpinner />
                    Initializing engine...
                  </>
                ) : (
                  mode === 'login' ? 'Enter the simulation →' : 'Create my startup →'
                )}
              </button>
            </form>

            <div style={{
              marginTop: 24,
              paddingTop: 24,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--amber)', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', padding: 0,
                  }}>
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </span>
            </div>

            {/* Bottom feature hints */}
            <div style={{
              marginTop: 24,
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}>
              {[
                ['⬡', 'AI Customer Interviews'],
                ['◎', 'Investor Pitch Room'],
                ['▦', 'Market Simulation'],
                ['◈', 'Startup Post-Mortem'],
              ].map(([icon, label], i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <span style={{ fontSize: 13, opacity: 0.6 }}>{icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom ticker */}
      <div style={{
        position: 'relative', zIndex: 10,
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '12px 0',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', gap: 0,
          transform: `translateX(${wrappedPos}px)`,
          width: 'max-content',
        }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0 32px',
              borderRight: '1px solid var(--border-subtle)',
              minWidth: 260,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'var(--text-muted)', letterSpacing: '0.08em',
              }}>{item.label}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--text-primary)', fontWeight: 500,
              }}>{item.value}</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: item.up ? 'var(--green)' : 'var(--red)',
                fontWeight: 500,
              }}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function inputStyle(focused) {
  return {
    width: '100%',
    padding: '11px 14px',
    background: focused ? 'var(--bg-elevated)' : 'var(--bg-overlay)',
    border: focused ? '1px solid var(--amber)' : '1px solid var(--border-default)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'var(--font-display)',
  }
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none"/>
      <path d="M8 2a6 6 0 0 1 6 6" stroke="#08090a" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  )
}
