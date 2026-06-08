'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStartup } from '../../lib/api'

const RECENT_EVENTS = [
  { type: 'warning', text: 'Competitor launched similar feature', time: '2d ago' },
  { type: 'success', text: 'Crossed 800 active users', time: '5d ago' },
  { type: 'info', text: 'Social media campaign ended', time: '1w ago' },
]

function formatINR(n) {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function MiniChart({ data, color = '#e8a030', height = 48 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 120, h = height
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 8) - 4
    return `${x},${y}`
  }).join(' ')
  const last = points.split(' ').pop().split(',')
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  )
}

function SentimentBar({ value, color, label }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>{value}%</span>
      </div>
      <div style={{ height: 3, background: 'var(--bg-overlay)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function RunwayGauge({ months }) {
  const pct = Math.min(((months || 0) / 18) * 100, 100)
  const color = months <= 3 ? 'var(--red)' : months <= 6 ? 'var(--amber)' : 'var(--green)'
  const r = 36
  const circumference = Math.PI * r
  const strokeDash = (pct / 100) * circumference
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="88" height="52" viewBox="0 0 88 52">
        <path d={`M 8 44 A ${r} ${r} 0 0 1 80 44`} fill="none" stroke="var(--bg-overlay)" strokeWidth="6" strokeLinecap="round" />
        <path d={`M 8 44 A ${r} ${r} 0 0 1 80 44`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`} style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="44" y="38" textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500, fill: color }}>
          {months || 0}mo
        </text>
      </svg>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600 }}>RUNWAY</span>
    </div>
  )
}

export default function Dashboard() {
  const [startup, setStartup] = useState(null)
  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const startupId = localStorage.getItem('startupId')
    if (!startupId) { window.location.href = '/create'; return }
    getStartup(startupId)
      .then(res => {
        setStartup(res.data.data.startup)
        setSimulation(res.data.data.simulation)
        setLoading(false)
      })
      .catch(() => { window.location.href = '/create' })
  }, [])

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40,
        border: '2px solid var(--border-subtle)',
        borderTop: '2px solid var(--amber)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        LOADING SIMULATION...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const s = startup
  const m = simulation?.metrics || {}
  const currentMonth = simulation?.currentMonth || 1
  const monthlyHistory = simulation?.monthlyHistory || []
  const investors = simulation?.investors || []
  const mrrHistory = monthlyHistory.map(h => h.metricsSnapshot?.MRR || 0)
  const userHistory = monthlyHistory.map(h => h.metricsSnapshot?.activeUsers || 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>

      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: 'var(--amber)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#08090a" strokeWidth="1.5" fill="none"/>
                <path d="M7 5L9 6.5V9.5L7 11L5 9.5V6.5L7 5Z" fill="#08090a"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em' }}>StartupForge</span>
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
              SIMULATION ACTIVE — MONTH {currentMonth}
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 4 }}>
          {[
            ['/dashboard', 'Command'],
            ['/simulate', 'Simulate'],
            ['/investors', 'Investors'],
            ['/personas', 'Personas'],
          ].map(([href, label]) => (
            <Link key={href} href={href} style={{
              padding: '5px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 12, fontWeight: 500,
              color: href === '/dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: href === '/dashboard' ? 'var(--bg-elevated)' : 'transparent',
              border: href === '/dashboard' ? '1px solid var(--border-default)' : '1px solid transparent',
              transition: 'all 0.15s',
            }}>{label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#08090a' }}>S</div>
        </div>
      </header>

      <div style={{ flex: 1, padding: '28px 32px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: 28,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(12px)',
          transition: 'all 0.5s ease',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>{s.name}</h1>
              <div style={{
                padding: '3px 10px', borderRadius: 100,
                background: 'var(--green-dim)', border: '1px solid rgba(45,186,116,0.3)',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: 'var(--green)', fontWeight: 600, letterSpacing: '0.08em',
              }}>ACTIVE</div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{s.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/simulate" style={{
              padding: '9px 18px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--amber)', background: 'var(--amber)',
              color: '#08090a', fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>▶ Run Month {currentMonth}</Link>
            <Link href="/investors" style={{
              padding: '9px 18px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)', background: 'transparent',
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
            }}>Pitch Investors</Link>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 12, marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(16px)',
          transition: 'all 0.6s ease 0.1s',
        }}>
          {[
            { label: 'MRR', value: formatINR(m.MRR), sub: 'Monthly revenue', color: 'var(--amber)', chart: mrrHistory.length > 1 ? mrrHistory : null },
            { label: 'ARR', value: formatINR(m.ARR), sub: 'Annualized', color: 'var(--amber)', chart: null },
            { label: 'ACTIVE USERS', value: (m.activeUsers || 0).toLocaleString(), sub: 'Total users', color: 'var(--green)', chart: userHistory.length > 1 ? userHistory : null },
            { label: 'BURN RATE', value: formatINR(m.burnRate) + '/mo', sub: 'Monthly spend', color: 'var(--red)', chart: null },
            { label: 'TOTAL FUNDING', value: formatINR(m.totalFunding), sub: 'Raised so far', color: 'var(--blue)', chart: null },
            { label: 'CHURN', value: `${m.churn || 0}%`, sub: 'Monthly churn', color: (m.churn || 0) > 20 ? 'var(--red)' : (m.churn || 0) > 10 ? 'var(--amber)' : 'var(--green)', chart: null },
          ].map((card, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '16px 18px',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 500, color: card.color, letterSpacing: '-0.02em', marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{card.sub}</div>
              {card.chart && (
                <div style={{ position: 'absolute', bottom: 8, right: 12, opacity: 0.5 }}>
                  <MiniChart data={card.chart} color={card.color} height={32} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 300px',
          gap: 16,
          opacity: mounted ? 1 : 0,
          transition: 'all 0.7s ease 0.2s',
        }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>Monthly History</h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{currentMonth}/12 MONTHS</span>
            </div>
            <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const done = i < currentMonth
                const current = i === currentMonth - 1
                return (
                  <div key={i} style={{ flex: 1, position: 'relative' }}>
                    <div style={{ height: 3, background: done ? 'var(--amber)' : 'var(--bg-overlay)', transition: 'background 0.3s' }} />
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: done ? 'var(--amber)' : 'var(--bg-overlay)',
                      border: current ? '2px solid var(--bg-void)' : 'none',
                      boxShadow: current ? '0 0 0 3px var(--amber-glow)' : 'none',
                      position: 'absolute', top: -3.5, left: '50%', transform: 'translateX(-50%)',
                    }} />
                    <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 9, color: done ? 'var(--text-secondary)' : 'var(--text-muted)', letterSpacing: '0.06em' }}>M{i + 1}</div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {monthlyHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 12 }}>
                  No months simulated yet. Hit Run Month 1!
                </div>
              ) : (
                monthlyHistory.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    background: i === monthlyHistory.length - 1 ? 'var(--amber-dim)' : 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    border: i === monthlyHistory.length - 1 ? '1px solid var(--amber-glow)' : '1px solid transparent',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>Month {h.month}</span>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <span style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{formatINR(h.metricsSnapshot?.MRR || 0)} MRR</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{h.metricsSnapshot?.activeUsers || 0} users</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '22px', flex: 1 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>Recent Events</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RECENT_EVENTS.map((e, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: `2px solid ${e.type === 'warning' ? 'var(--amber)' : e.type === 'success' ? 'var(--green)' : 'var(--blue)'}`,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 4, flexShrink: 0, background: e.type === 'warning' ? 'var(--amber)' : e.type === 'success' ? 'var(--green)' : 'var(--blue)' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{e.text}</p>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{e.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--amber-glow)', borderRadius: 'var(--radius-lg)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(232,160,48,0.08) 0%, transparent 70%)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⬡</div>
                <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.04em' }}>AI CO-FOUNDER</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {(m.churn || 0) > 15
                  ? `"Your churn rate of ${m.churn}% is dangerous. Fix retention before spending on growth."`
                  : (m.activeUsers || 0) < 100
                  ? '"You need more users before worrying about revenue. Focus on acquisition this month."'
                  : '"Looking decent. Keep churn below 10% and focus on getting your first paying users."'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <RunwayGauge months={m.runway} />
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SentimentBar value={72} color="var(--blue)" label="MARKET SENTIMENT" />
                <SentimentBar value={45} color="var(--amber)" label="INVESTOR INTEREST" />
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', flex: 1 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 14, letterSpacing: '0.04em', color: 'var(--text-muted)' }}>INVESTORS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {investors.map((inv, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{inv.type?.toUpperCase()}</div>
                    </div>
                    <div style={{
                      padding: '2px 8px', borderRadius: 100, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                      background: inv.status === 'not_pitched' ? 'var(--bg-overlay)' : inv.status === 'soft_pass' ? 'var(--amber-dim)' : inv.status === 'invested' ? 'var(--green-dim)' : 'var(--red-dim)',
                      color: inv.status === 'not_pitched' ? 'var(--text-muted)' : inv.status === 'soft_pass' ? 'var(--amber)' : inv.status === 'invested' ? 'var(--green)' : 'var(--red)',
                      border: `1px solid ${inv.status === 'soft_pass' ? 'var(--amber-glow)' : 'transparent'}`,
                    }}>
                      {inv.status === 'not_pitched' ? 'WAITING' : inv.status === 'soft_pass' ? 'INTERESTED' : inv.status?.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}