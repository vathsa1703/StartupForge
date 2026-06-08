'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStartup } from '../../lib/api'

const INDUSTRIES = [
  'Health & Fitness', 'EdTech', 'FinTech', 'LegalTech', 'AgriTech',
  'E-commerce', 'SaaS', 'Gaming', 'Mental Health', 'Logistics',
  'FoodTech', 'CleanTech', 'HR Tech', 'Real Estate', 'Other',
]

export default function CreateStartupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    industry: '',
    targetAudience: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await createStartup(form)
      const startupId = res.data.data._id
      localStorage.setItem('startupId', startupId)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* Header */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '4px 12px', borderRadius: 100,
            background: 'var(--amber-dim)',
            border: '1px solid var(--amber-glow)',
            marginBottom: 20,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--amber)', letterSpacing: '0.06em',
            }}>STEP {step} OF 2</span>
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 800,
            letterSpacing: '-0.04em', marginBottom: 8,
          }}>
            {step === 1 ? 'Name your startup.' : 'Define your market.'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 1
              ? 'Give it an identity. What are you building?'
              : 'Who are you building for? Be specific.'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
        }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>STARTUP NAME</label>
                <input
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  placeholder="e.g. FitMind, LegalAI, AgriBot"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>ONE-LINE DESCRIPTION</label>
                <textarea
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="e.g. AI-powered fitness coach for college students"
                  rows={3}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Be specific. "AI for fitness" is weak. "AI coach for hostel students with no gym access" is strong.
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.name.trim() || !form.description.trim()}
                style={btnStyle(!form.name.trim() || !form.description.trim())}
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={labelStyle}>INDUSTRY</label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}>
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind}
                      onClick={() => update('industry', ind)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${form.industry === ind ? 'var(--amber)' : 'var(--border-subtle)'}`,
                        background: form.industry === ind ? 'var(--amber-dim)' : 'var(--bg-elevated)',
                        color: form.industry === ind ? 'var(--amber)' : 'var(--text-secondary)',
                        fontSize: 11, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.15s',
                        fontFamily: 'var(--font-display)',
                        textAlign: 'center',
                      }}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>TARGET AUDIENCE</label>
                <input
                  value={form.targetAudience}
                  onChange={e => update('targetAudience', e.target.value)}
                  placeholder="e.g. College students aged 18-25 in Tier 1 cities"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--red-dim)',
                  border: '1px solid var(--red)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12, color: 'var(--red)',
                }}>{error}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    padding: '13px 20px',
                    background: 'transparent',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}>← Back</button>

                <button
                  onClick={handleSubmit}
                  disabled={!form.industry || !form.targetAudience.trim() || loading}
                  style={{
                    ...btnStyle(!form.industry || !form.targetAudience.trim() || loading),
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  }}>
                  {loading ? (
                    <>
                      <span style={{
                        width: 14, height: 14,
                        border: '2px solid rgba(0,0,0,0.3)',
                        borderTop: '2px solid #08090a',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                      }} />
                      AI is building your world...
                    </>
                  ) : 'Launch Simulation →'}
                </button>
              </div>

              {loading && (
                <div style={{
                  textAlign: 'center', padding: '12px',
                  background: 'var(--amber-dim)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--amber-glow)',
                }}>
                  <p style={{ fontSize: 12, color: 'var(--amber)', lineHeight: 1.6 }}>
                    Generating market analysis, competitors, risks,<br />
                    and 3 customer personas using AI...<br />
                    <span style={{ color: 'var(--text-muted)' }}>This takes about 10 seconds.</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', letterSpacing: '0.08em',
  marginBottom: 8,
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'var(--bg-overlay)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)', fontSize: 14,
  outline: 'none', fontFamily: 'var(--font-display)',
}

const btnStyle = (disabled) => ({
  width: '100%', padding: '13px',
  background: disabled ? 'var(--bg-overlay)' : 'var(--amber)',
  border: 'none', borderRadius: 'var(--radius-md)',
  color: disabled ? 'var(--text-muted)' : '#08090a',
  fontSize: 14, fontWeight: 800,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s', letterSpacing: '-0.01em',
})
