
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStartup, getSimulation, runMonth } from '../../lib/api'

const ACTION_CATEGORIES = [
  {
    id: 'marketing', label: 'Marketing', icon: '◎', color: 'var(--blue)', colorDim: 'var(--blue-dim)',
    actions: [
      { id: 'Run social media ads', title: 'Run Social Media Ads', description: 'Launch targeted Instagram & LinkedIn campaigns.', cost: '₹80K', risk: 'Medium', reward: 'High', preview: '+200–600 users, +₹30K MRR', riskDetail: 'CAC may be high if targeting is off.', icon: '📣' },
      { id: 'Launch referral program', title: 'Launch Referral Program', description: 'Let existing users bring in friends for rewards.', cost: '₹20K', risk: 'Low', reward: 'Medium', preview: '+80–200 users, organic growth', riskDetail: 'Needs existing happy users to work.', icon: '🔗' },
      { id: 'Partner with influencers', title: 'Partner with Influencers', description: 'Collaborate with fitness influencers on YouTube and Instagram.', cost: '₹60K', risk: 'High', reward: 'Very High', preview: '+500–2000 users (if viral)', riskDetail: '40% chance campaign underperforms.', icon: '⭐' },
      { id: 'SEO content push', title: 'SEO Content Push', description: 'Publish 8 long-form articles targeting high-intent keywords.', cost: '₹15K', risk: 'Low', reward: 'Low (long-term)', preview: '+20–50 users/month compounding', riskDetail: 'Takes 2–3 months to show results.', icon: '📝' },
    ],
  },
  {
    id: 'product', label: 'Product', icon: '⬡', color: 'var(--amber)', colorDim: 'var(--amber-dim)',
    actions: [
      { id: 'Build a new feature', title: 'Build a New Feature', description: 'Ship a highly-requested feature from user interviews.', cost: '₹40K', risk: 'Low', reward: 'High', preview: '-15% churn, +NPS score', riskDetail: 'Delays other roadmap items.', icon: '⚡' },
      { id: 'Fix critical bugs', title: 'Fix Critical Bugs', description: 'Address top 10 support tickets causing user drop-off.', cost: '₹20K', risk: 'None', reward: 'Medium', preview: '-8% churn, +trust score', riskDetail: 'No real downside here.', icon: '🔧' },
      { id: 'Launch mobile app', title: 'Launch Mobile App', description: 'Ship a native iOS + Android version of the product.', cost: '₹150K', risk: 'High', reward: 'Very High', preview: '+30% retention, 2x users', riskDetail: 'High cost, 6-week dev time.', icon: '📱' },
      { id: 'Redesign onboarding', title: 'Redesign Onboarding', description: 'Redesign first-run experience to reduce activation drop-off.', cost: '₹25K', risk: 'Low', reward: 'High', preview: '+40% activation rate', riskDetail: 'A/B test needed to validate.', icon: '🎨' },
    ],
  },
  {
    id: 'team', label: 'Team', icon: '◈', color: 'var(--green)', colorDim: 'var(--green-dim)',
    actions: [
      { id: 'Hire a developer', title: 'Hire a Developer', description: 'Bring on a full-stack dev to accelerate product velocity.', cost: '₹60K/mo', risk: 'Medium', reward: 'High', preview: '+40% feature velocity', riskDetail: 'Increases burn rate permanently.', icon: '👨‍💻' },
      { id: 'Hire growth marketer', title: 'Hire Growth Marketer', description: 'Bring in a performance marketer to own acquisition.', cost: '₹45K/mo', risk: 'Medium', reward: 'High', preview: '-20% CAC over 3 months', riskDetail: 'Takes 4–6 weeks to ramp up.', icon: '📈' },
      { id: 'Fire underperformer', title: 'Let Go of Underperformer', description: 'Remove a team member dragging down the team.', cost: '₹10K (severance)', risk: 'Low', reward: 'Medium', preview: '+team morale, -₹40K/mo burn', riskDetail: 'Short-term productivity dip.', icon: '✂️' },
      { id: 'Bring in co-founder', title: 'Bring in a Co-founder', description: 'Formalize equity split with a key partner.', cost: '15–25% equity', risk: 'Very High', reward: 'Very High', preview: 'Unlocks investor credibility', riskDetail: 'Equity is permanent. Choose wisely.', icon: '🤝' },
    ],
  },
  {
    id: 'finance', label: 'Finance', icon: '▦', color: '#9a6dd7', colorDim: 'rgba(154,109,215,0.12)',
    actions: [
      { id: 'Cut operational costs', title: 'Cut Operational Costs', description: 'Audit and reduce server, tool, and vendor expenses.', cost: 'Free', risk: 'Low', reward: 'Medium', preview: '-₹30K/mo burn rate', riskDetail: 'Some quality tradeoffs possible.', icon: '✂️' },
      { id: 'Increase subscription price', title: 'Increase Subscription Price', description: 'Raise monthly price from ₹499 to ₹799.', cost: 'Free', risk: 'High', reward: 'High', preview: '+₹40K MRR, -15% users', riskDetail: 'Price-sensitive users will churn.', icon: '💰' },
      { id: 'Launch free tier', title: 'Launch Free Tier', description: 'Add a freemium plan to drive top-of-funnel growth.', cost: '₹30K', risk: 'Medium', reward: 'High', preview: '+300% signups, +₹20K MRR', riskDetail: 'Conversion rate must be >5%.', icon: '🎁' },
      { id: 'Apply for startup grant', title: 'Apply for Startup Grant', description: 'Apply to Startup India or NASSCOM grant programs.', cost: 'Free', risk: 'None', reward: 'Medium', preview: '₹5L–₹25L non-dilutive capital', riskDetail: '30% approval rate. Takes 2 months.', icon: '🏛️' },
    ],
  },
]

function formatINR(n) {
  if (!n) return '₹0'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function RiskBadge({ level }) {
  const map = {
    'None': { color: 'var(--green)', bg: 'var(--green-dim)' },
    'Low': { color: 'var(--green)', bg: 'var(--green-dim)' },
    'Medium': { color: 'var(--amber)', bg: 'var(--amber-dim)' },
    'High': { color: 'var(--red)', bg: 'var(--red-dim)' },
    'Very High': { color: 'var(--red)', bg: 'var(--red-dim)' },
  }
  const s = map[level] || map['Medium']
  return (
    <span style={{ padding: '2px 7px', borderRadius: 100, background: s.bg, color: s.color, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>{level.toUpperCase()}</span>
  )
}

function ActionCard({ action, catColor, catColorDim, selected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const active = selected || hovered
  return (
    <div onClick={onSelect} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: selected ? catColorDim : hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
      border: `1px solid ${selected ? catColor : hovered ? 'var(--border-default)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)', padding: '16px', cursor: 'pointer',
      transition: 'all 0.18s ease', position: 'relative', overflow: 'hidden',
      transform: hovered && !selected ? 'translateY(-1px)' : 'none',
    }}>
      {selected && (
        <div style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: catColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#08090a', fontWeight: 800 }}>✓</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{action.icon}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{action.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{action.description}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{action.cost}</span>
          <span style={{ color: 'var(--border-default)', fontSize: 10 }}>·</span>
          <RiskBadge level={action.risk} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: active ? catColor : 'var(--text-muted)', transition: 'color 0.2s' }}>{action.preview}</span>
      </div>
      {active && (
        <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-void)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, borderLeft: `2px solid ${catColor}` }}>
          ⚠ {action.riskDetail}
        </div>
      )}
    </div>
  )
}

export default function SimulatePage() {
  const [startup, setStartup] = useState(null)
  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedActions, setSelectedActions] = useState([])
  const [activeCategory, setActiveCategory] = useState('marketing')
  const [eventOption, setEventOption] = useState(null)
  const [phase, setPhase] = useState('actions')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(3)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const startupId = localStorage.getItem('startupId')
    if (!startupId) { window.location.href = '/create'; return }
    Promise.all([getStartup(startupId), getSimulation(startupId)])
      .then(([sRes, simRes]) => {
        setStartup(sRes.data.data.startup)
        setSimulation(simRes.data.data)
        setLoading(false)
      })
      .catch(() => { window.location.href = '/create' })
  }, [])

  const MAX_ACTIONS = 2
  const currentMonth = simulation?.currentMonth || 1
  const m = simulation?.metrics || {}

  const toggleAction = (actionId) => {
    setSelectedActions(prev => {
      if (prev.includes(actionId)) return prev.filter(a => a !== actionId)
      if (prev.length >= MAX_ACTIONS) return prev
      return [...prev, actionId]
    })
  }

  const handleRunMonth = () => setPhase('event')

  const handleEventChoice = async () => {
    if (!eventOption && phase === 'event') {
      setPhase('running')
    }
    setPhase('running')
    setSubmitting(true)
    let c = 3
    setCountdown(3)
    const t = setInterval(() => {
      c -= 1
      setCountdown(c)
      if (c <= 0) clearInterval(t)
    }, 1000)

    try {
      const startupId = localStorage.getItem('startupId')
      const res = await runMonth({
        startupId,
        actionsChosen: selectedActions,
        eventOptionChosen: eventOption,
      })
      setTimeout(() => {
        setResult(res.data.data.result)
        setSimulation(res.data.data.simulation)
        setPhase('result')
        setSubmitting(false)
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      setPhase('actions')
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '2px solid var(--border-subtle)', borderTop: '2px solid var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  const activeCat = ACTION_CATEGORIES.find(c => c.id === activeCategory)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56, borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>← Back</Link>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{startup?.name}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--amber)', letterSpacing: '0.06em' }}>MONTH {currentMonth} DECISIONS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: selectedActions.length === MAX_ACTIONS ? 'var(--amber-dim)' : 'var(--bg-elevated)', border: `1px solid ${selectedActions.length === MAX_ACTIONS ? 'var(--amber-glow)' : 'var(--border-subtle)'}`, borderRadius: 100, transition: 'all 0.2s' }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Actions selected</span>
          {[0, 1].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < selectedActions.length ? 'var(--amber)' : 'var(--bg-overlay)', border: `1px solid ${i < selectedActions.length ? 'var(--amber)' : 'var(--border-default)'}`, transition: 'all 0.2s' }} />
          ))}
        </div>
        <button onClick={handleRunMonth} disabled={selectedActions.length === 0} style={{ padding: '8px 20px', background: selectedActions.length > 0 ? 'var(--amber)' : 'var(--bg-overlay)', border: 'none', borderRadius: 'var(--radius-sm)', color: selectedActions.length > 0 ? '#08090a' : 'var(--text-muted)', fontSize: 13, fontWeight: 700, cursor: selectedActions.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
          Execute Month →
        </button>
      </header>

      {phase === 'actions' && (
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 0, opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div style={{ borderRight: '1px solid var(--border-subtle)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700, padding: '0 8px', marginBottom: 10 }}>DECISION CATEGORIES</div>
            {ACTION_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', background: activeCategory === cat.id ? cat.colorDim : 'transparent', borderColor: activeCategory === cat.id ? cat.color + '40' : 'transparent', color: activeCategory === cat.id ? cat.color : 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                {cat.label}
                {selectedActions.some(id => cat.actions.find(a => a.id === id)) && (
                  <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: cat.color }} />
                )}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>CURRENT STATE</div>
              {[
                ['MRR', formatINR(m.MRR), 'var(--amber)'],
                ['USERS', (m.activeUsers || 0).toString(), 'var(--blue)'],
                ['CHURN', `${m.churn || 0}%`, 'var(--red)'],
                ['RUNWAY', `${m.runway || 0}mo`, 'var(--green)'],
              ].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>{l}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: c, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '28px' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20, color: activeCat.color }}>{activeCat.icon}</span>
                <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em' }}>{activeCat.label} Actions</h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Choose up to {MAX_ACTIONS} actions total. Each decision has consequences.</p>
            </div>
            {error && <div style={{ padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {activeCat.actions.map(action => (
                <ActionCard key={action.id} action={action} catColor={activeCat.color} catColorDim={activeCat.colorDim} selected={selectedActions.includes(action.id)} onSelect={() => toggleAction(action.id)} />
              ))}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-subtle)', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700 }}>EXECUTION PLAN — MONTH {currentMonth}</div>
            {selectedActions.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, opacity: 0.4, textAlign: 'center' }}>
                <span style={{ fontSize: 28 }}>⬡</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No actions selected yet</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedActions.map((id) => {
                  const cat = ACTION_CATEGORIES.find(c => c.actions.find(a => a.id === id))
                  const action = cat?.actions.find(a => a.id === id)
                  if (!action) return null
                  return (
                    <div key={id} style={{ padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: `1px solid ${cat.color}30`, borderLeft: `3px solid ${cat.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>{action.title}</span>
                        <button onClick={() => toggleAction(id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: cat.color }}>{action.preview}</div>
                    </div>
                  )
                })}
              </div>
            )}
            {selectedActions.length > 0 && (
              <div style={{ padding: '14px', background: 'var(--amber-dim)', borderRadius: 'var(--radius-md)', border: '1px solid var(--amber-glow)' }}>
                <div style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>⬡ AI PREDICTION</div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  AI will calculate realistic outcomes based on your current metrics and chosen actions.
                </p>
              </div>
            )}
            <button onClick={handleRunMonth} disabled={selectedActions.length === 0} style={{ marginTop: 'auto', padding: '14px', background: selectedActions.length > 0 ? 'var(--amber)' : 'var(--bg-overlay)', border: 'none', borderRadius: 'var(--radius-md)', color: selectedActions.length > 0 ? '#08090a' : 'var(--text-muted)', fontSize: 14, fontWeight: 800, cursor: selectedActions.length > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
              {selectedActions.length === 0 ? 'Select actions first' : `Execute Month ${currentMonth} →`}
            </button>
          </div>
        </div>
      )}

      {phase === 'event' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ maxWidth: 720, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--red-dim)', border: '1px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.08em', fontWeight: 700 }}>MARKET EVENT — MONTH {currentMonth}</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>Something happened this month.</h2>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28, padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--amber)' }}>
              The AI simulation engine will generate a random market event based on your startup context and current metrics. Your chosen actions combined with this event will determine this month's outcome.
            </p>
            <button onClick={handleEventChoice} style={{ width: '100%', padding: '14px', background: 'var(--amber)', border: 'none', borderRadius: 'var(--radius-md)', color: '#08090a', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Run the simulation →
            </button>
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
          <div style={{ width: 80, height: 80, border: '2px solid var(--border-subtle)', borderTop: '2px solid var(--amber)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 300, color: 'var(--amber)', marginBottom: 8 }}>{countdown}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SIMULATING MONTH {currentMonth}...</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {phase === 'result' && result && (
        <div style={{ flex: 1, padding: '40px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ maxWidth: 760, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ padding: '4px 12px', borderRadius: 100, background: 'var(--green-dim)', border: '1px solid rgba(45,186,116,0.3)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.08em' }}>MONTH {currentMonth - 1} COMPLETE</div>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20 }}>Here's what happened.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 28, padding: '16px 20px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--amber)', fontStyle: 'italic' }}>
              "{result.narrative}"
            </p>
            {result.eventFired && (
              <div style={{ padding: '14px 18px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 6 }}>⚡ EVENT FIRED</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{result.eventFired.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.eventFired.description}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 28 }}>
              {[
                ['MRR', formatINR(result.updatedMetrics?.MRR)],
                ['USERS', result.updatedMetrics?.activeUsers],
                ['CHURN', `${result.updatedMetrics?.churn}%`],
                ['RUNWAY', `${result.updatedMetrics?.runway}mo`],
                ['BURN', formatINR(result.updatedMetrics?.burnRate)],
              ].map(([key, val]) => (
                <div key={key} style={{ padding: '14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>{key}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--amber)' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/dashboard" style={{ flex: 1, padding: '13px', background: 'var(--amber)', border: 'none', borderRadius: 'var(--radius-md)', color: '#08090a', fontSize: 14, fontWeight: 800, textAlign: 'center', letterSpacing: '-0.01em' }}>
                Back to Command Center →
              </Link>
              <button onClick={() => { setPhase('actions'); setSelectedActions([]); setEventOption(null); setResult(null) }} style={{ padding: '13px 24px', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Run Month {currentMonth}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

