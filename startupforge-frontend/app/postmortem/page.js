'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStartup, getSimulation, getPostMortem } from '../../lib/api'

function formatINR(n) {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color, fontWeight: 700 }}>{value}/10</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-overlay)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(value / 10) * 100}%`,
          background: value >= 7 ? 'var(--green)' : value >= 4 ? 'var(--amber)' : 'var(--red)',
          borderRadius: 3,
          transition: 'width 1.2s ease',
        }} />
      </div>
    </div>
  )
}

function ProbabilityRing({ value }) {
  const r = 54
  const circumference = 2 * Math.PI * r
  const color = value >= 60 ? 'var(--green)' : value >= 35 ? 'var(--amber)' : 'var(--red)'
  const stroke = (value / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-overlay)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${stroke} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: 'stroke-dasharray 1.5s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, fill: color }}>{value}%</text>
        <text x="70" y="85" textAnchor="middle" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fill: 'var(--text-muted)', letterSpacing: '0.06em' }}>SURVIVAL ODDS</text>
      </svg>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 200 }}>
        {value >= 60 ? 'Strong foundation. This could work.' : value >= 35 ? 'Viable but needs serious work.' : 'High risk. Major pivots needed.'}
      </span>
    </div>
  )
}

export default function PostMortemPage() {
  const [startup, setStartup] = useState(null)
  const [simulation, setSimulation] = useState(null)
  const [postMortem, setPostMortem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setMounted(true)
    const startupId = localStorage.getItem('startupId')
    if (!startupId) { window.location.href = '/create'; return }

    Promise.all([getStartup(startupId), getSimulation(startupId)])
      .then(async ([sRes, simRes]) => {
        const s = sRes.data.data.startup
        const sim = simRes.data.data
        setStartup(s)
        setSimulation(sim)

        if (sim.status === 'active') {
          window.location.href = '/dashboard'
          return
        }

        if (sim.postMortem?.verdict) {
          setPostMortem(sim.postMortem)
          setLoading(false)
          return
        }

        setGenerating(true)
        setLoading(false)
        try {
          const pmRes = await getPostMortem(startupId)
          setPostMortem(pmRes.data.data)
        } catch (err) {
          setError('Failed to generate post-mortem. Please try again.')
        }
        setGenerating(false)
      })
      .catch(() => { window.location.href = '/create' })
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid var(--border-subtle)', borderTop: '2px solid var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (generating) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
      <div style={{ width: 60, height: 60, border: '2px solid var(--border-subtle)', borderTop: '2px solid var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Generating your post-mortem...</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>AI is analyzing every decision you made across {simulation?.monthlyHistory?.length} months.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {['Reviewing monthly decisions', 'Calculating founder score', 'Estimating real-world probability', 'Writing verdict'].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)', animation: `pulse ${0.8 + i * 0.2}s ease infinite` }} />
            {s.toUpperCase()}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )

  if (!startup || !simulation) return null

  const m = simulation.metrics || {}
  const status = simulation.status
  const months = simulation.monthlyHistory?.length || 0
  const investors = simulation.investors || []
  const investedCount = investors.filter(i => i.status === 'invested').length
  const totalFundingRaised = investors.filter(i => i.status === 'invested').reduce((sum, i) => sum + (i.amountOffered || 0), 0)

  const scores = postMortem?.founderScore || {}
  const avgScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : 5

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56, borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: 'var(--amber)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#08090a" strokeWidth="1.5" fill="none"/>
              <path d="M7 5L9 6.5V9.5L7 11L5 9.5V6.5L7 5Z" fill="#08090a"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em' }}>StartupForge</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 8px' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: status === 'failed' ? 'var(--red)' : 'var(--green)', letterSpacing: '0.06em' }}>
            {status === 'failed' ? 'SIMULATION FAILED' : 'SIMULATION COMPLETE'}
          </span>
        </div>
        <Link href="/create" style={{ padding: '7px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--amber)', background: 'var(--amber)', color: '#08090a', fontSize: 12, fontWeight: 700 }}>
          Start New Startup →
        </Link>
      </header>

      <div style={{ flex: 1, maxWidth: 1100, width: '100%', margin: '0 auto', padding: '40px 32px', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>

        {/* Hero verdict */}
        <div style={{ marginBottom: 40, padding: '32px', background: status === 'failed' ? 'var(--red-dim)' : 'var(--green-dim)', border: `1px solid ${status === 'failed' ? 'var(--red)' : 'var(--green)'}`, borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${status === 'failed' ? 'rgba(232,64,64,0.1)' : 'rgba(45,186,116,0.1)'} 0%, transparent 70%)` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>{status === 'failed' ? '💀' : '🏆'}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: status === 'failed' ? 'var(--red)' : 'var(--green)', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>
                {status === 'failed' ? 'STARTUP FAILED' : 'SIMULATION COMPLETE'} — {startup.name} — {months} MONTHS
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.3, maxWidth: 700 }}>
                {postMortem?.verdict || (status === 'failed' ? 'Your startup ran out of runway before finding product-market fit.' : 'You survived 12 months. Now the real work begins.')}
              </h1>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'MONTHS SURVIVED', value: `${months}/12`, color: 'var(--text-primary)' },
            { label: 'FINAL MRR', value: formatINR(m.MRR), color: 'var(--amber)' },
            { label: 'ACTIVE USERS', value: (m.activeUsers || 0).toLocaleString(), color: 'var(--blue)' },
            { label: 'INVESTORS WON', value: `${investedCount}/5`, color: investedCount > 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'TOTAL RAISED', value: formatINR(totalFundingRaised || m.totalFunding), color: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '16px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Founder scorecard */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>Founder Scorecard</h2>
                <div style={{ padding: '4px 14px', borderRadius: 100, background: avgScore >= 7 ? 'var(--green-dim)' : avgScore >= 4 ? 'var(--amber-dim)' : 'var(--red-dim)', border: `1px solid ${avgScore >= 7 ? 'rgba(45,186,116,0.3)' : avgScore >= 4 ? 'var(--amber-glow)' : 'rgba(232,64,64,0.3)'}` }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: avgScore >= 7 ? 'var(--green)' : avgScore >= 4 ? 'var(--amber)' : 'var(--red)' }}>
                    AVG {avgScore}/10
                  </span>
                </div>
              </div>
              {[
                ['Product Instinct', scores.productInstinct],
                ['Financial Discipline', scores.financialDiscipline],
                ['Market Awareness', scores.marketAwareness],
                ['Resilience', scores.resilience],
                ['Pitch Quality', scores.pitchQuality],
              ].map(([label, val]) => (
                <ScoreBar key={label} label={label} value={val || 5} />
              ))}
            </div>

            {/* Month by month */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 20 }}>Month by Month</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {simulation.monthlyHistory?.map((h, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: h.narrative ? 8 : 0 }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.06em' }}>M{h.month}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.actionsChosen?.join(', ')}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)' }}>{formatINR(h.metricsSnapshot?.MRR || 0)}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{h.metricsSnapshot?.activeUsers || 0} users</span>
                      </div>
                    </div>
                    {h.narrative && (
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>{h.narrative}</p>
                    )}
                    {h.eventFired?.title && (
                      <div style={{ marginTop: 6, padding: '5px 10px', background: 'var(--red-dim)', borderRadius: 'var(--radius-sm)', fontSize: 10, color: 'var(--red)', fontWeight: 600 }}>
                        ⚡ {h.eventFired.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI summary */}
            {postMortem?.summary && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--amber-glow)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 150, height: 150, background: 'radial-gradient(circle, rgba(232,160,48,0.08) 0%, transparent 70%)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⬡</div>
                  <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.04em' }}>WHAT A TOP FOUNDER WOULD HAVE DONE</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{postMortem.summary}"</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Probability ring */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', justifyContent: 'center' }}>
              <ProbabilityRing value={postMortem?.realWorldProbability || 30} />
            </div>

            {/* Investor results */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>Investor Results</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {investors.map((inv, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{inv.name}</div>
                      {inv.amountOffered && inv.status === 'invested' && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>{formatINR(inv.amountOffered)} @ {inv.equity}%</div>
                      )}
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 100, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                      background: inv.status === 'invested' ? 'var(--green-dim)' : inv.status === 'not_pitched' ? 'var(--bg-overlay)' : inv.status === 'soft_pass' ? 'var(--amber-dim)' : 'var(--red-dim)',
                      color: inv.status === 'invested' ? 'var(--green)' : inv.status === 'not_pitched' ? 'var(--text-muted)' : inv.status === 'soft_pass' ? 'var(--amber)' : 'var(--red)',
                    }}>
                      {inv.status === 'not_pitched' ? 'SKIPPED' : inv.status === 'soft_pass' ? 'INTERESTED' : inv.status?.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* What to fix */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>If You Ran Again</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  m.churn > 15 && { issue: 'High churn', fix: 'Fix retention in month 1-2 before any marketing spend' },
                  m.activeUsers < 200 && { issue: 'Low users', fix: 'Prioritize referral + SEO over paid ads early on' },
                  investedCount === 0 && { issue: 'No funding raised', fix: 'Pitch Arjun Mehta by month 3 — he invests early' },
                  m.runway <= 0 && { issue: 'Ran out of runway', fix: 'Cut costs in month 4-5 before runway hits critical' },
                  (m.MRR || 0) < 50000 && { issue: 'Low revenue', fix: 'Charge earlier — even ₹99/month from day one' },
                ].filter(Boolean).slice(0, 4).map((item, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--amber)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginBottom: 3 }}>{item.issue}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.fix}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link href="/create" style={{
              display: 'block', padding: '16px',
              background: 'var(--amber)', border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#08090a', fontSize: 14, fontWeight: 800,
              textAlign: 'center', letterSpacing: '-0.01em',
            }}>
              Run a New Simulation →
            </Link>
            <Link href="/dashboard" style={{
              display: 'block', padding: '12px',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              textAlign: 'center',
            }}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )
}
