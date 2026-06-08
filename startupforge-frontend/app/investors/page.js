'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import axios from 'axios'

const INVESTORS = [
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    role: 'Angel Investor',
    initials: 'AM',
    color: '#e8a030',
    cheque: '₹25L – ₹75L',
    focus: 'Founder story, early traction',
    redFlags: 'No users, vague vision',
    personality: 'Warm but probing',
    mood: 62,
    status: 'not_pitched',
    availableFrom: 1,
    bio: 'Ex-founder of 2 exits. Invests in people more than ideas. Known for asking "why you?" before anything else.',
  },
  {
    id: 'sequoia',
    name: 'Sequoia Scout',
    role: 'Early Stage VC',
    initials: 'SQ',
    color: '#4a90d9',
    cheque: '₹1Cr – ₹5Cr',
    focus: 'Growth rate, retention, TAM',
    redFlags: 'High churn, small market',
    personality: 'Cold, data-driven',
    mood: 30,
    status: 'soft_pass',
    availableFrom: 3,
    bio: 'Tier-1 fund scout. Will not invest in anything with churn above 15%. Reads cap tables before decks.',
  },
  {
    id: 'meera',
    name: 'Meera Iyer',
    role: 'Impact Investor',
    initials: 'MI',
    color: '#2dba74',
    cheque: '₹50L – ₹2Cr',
    focus: 'Social impact, underserved markets',
    redFlags: 'Pure profit play, no mission',
    personality: 'Values-first, empathetic',
    mood: 55,
    status: 'not_pitched',
    availableFrom: 1,
    bio: 'Runs a $20M social impact fund. Wants to see genuine mission alignment — not greenwashing.',
  },
  {
    id: 'raj',
    name: 'Raj Kapoor',
    role: 'Serial Entrepreneur',
    initials: 'RK',
    color: '#9a6dd7',
    cheque: '₹30L – ₹1Cr',
    focus: 'Founder-market fit, product quality',
    redFlags: 'Founder doesn\'t know numbers',
    personality: 'Blunt, respects hustle',
    mood: 70,
    status: 'not_pitched',
    availableFrom: 1,
    bio: '3x founder. Built and sold companies in edtech and fintech. Will call your bluff in 30 seconds.',
  },
  {
    id: 'tiger',
    name: 'Tiger Global',
    role: 'Growth Stage VC',
    initials: 'TG',
    color: '#e84040',
    cheque: '₹10Cr+',
    focus: 'Unit economics, scalability',
    redFlags: 'Pre-PMF, no moat',
    personality: 'Ruthless, numbers only',
    mood: 18,
    status: 'not_pitched',
    availableFrom: 4,
    bio: 'Deploying $2B this year. Will only look at you if MRR is above ₹10L and growing 15% MoM.',
  },
]

function MoodMeter({ value, color }) {
  const segments = 10
  const filled = Math.round((value / 100) * segments)
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: segments }, (_, i) => (
        <div key={i} style={{
          width: 14, height: 4, borderRadius: 2,
          background: i < filled ? color : 'var(--bg-overlay)',
          transition: 'background 0.3s',
          opacity: i < filled ? 1 : 0.4,
        }} />
      ))}
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color, marginLeft: 6, fontWeight: 600,
      }}>{value}%</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    not_pitched: { label: 'NOT PITCHED', color: 'var(--text-muted)', bg: 'var(--bg-overlay)' },
    soft_pass: { label: 'INTERESTED', color: 'var(--amber)', bg: 'var(--amber-dim)' },
    counter_offer: { label: 'COUNTER', color: 'var(--blue)', bg: 'var(--blue-dim)' },
    invested: { label: 'INVESTED', color: 'var(--green)', bg: 'var(--green-dim)' },
    rejected: { label: 'REJECTED', color: 'var(--red)', bg: 'var(--red-dim)' },
  }
  const s = map[status] || map.not_pitched
  return (
    <span style={{
      padding: '3px 8px', borderRadius: 100,
      background: s.bg, color: s.color,
      fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      fontFamily: 'var(--font-mono)',
    }}>{s.label}</span>
  )
}

export default function InvestorsPage() {
  const [selected, setSelected] = useState(null)
  const [pitch, setPitch] = useState('')
  const [pitching, setPitching] = useState(false)
  const [response, setResponse] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [followUp, setFollowUp] = useState('')
  const chatEndRef = useRef(null)
  const currentMonth = 3

  useEffect(() => { setMounted(true) }, [])
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])
  useEffect(() => {

  const loadHistory = async () => {

    if (!selected) return

    try {

      const startupId =
        localStorage.getItem('startupId')

      const res = await axios.get(
        `http://localhost:5000/api/investor/history/${startupId}/${selected}`
      )

      setChatMessages(
        res.data.data || []
      )

    } catch (err) {

      console.error(err)

      setChatMessages([])

    }

  }

  loadHistory()

}, [selected])

  const investor = INVESTORS.find(i => i.id === selected)
  const canPitch = currentMonth >= 3

  const handlePitch = async () => {
  if (!pitch.trim() || !investor) return

  setPitching(true)

  setChatMessages([
    {
      role: 'founder',
      content: pitch
    }
  ])

  try {
    const startupId =
      localStorage.getItem('startupId')

    const res = await axios.post(
      'http://localhost:5000/api/investor/chat',
      {
        startupId,
        investorId: selected,
        message: pitch
      }
    )

    setChatMessages(prev => [
      ...prev,
      {
        role: 'investor',
        content: res.data.data.reply
      }
    ])

  } catch (err) {

    console.error(err)

    setChatMessages(prev => [
      ...prev,
      {
        role: 'investor',
        content: 'Sorry, something went wrong.'
      }
    ])

  } finally {

    setPitching(false)

  }
}
const handleFollowUp = async () => {
  if (!followUp.trim()) return

  const msg = followUp

  setFollowUp('')

  setChatMessages(prev => [
    ...prev,
    {
      role: 'founder',
      content: msg
    }
  ])

  try {

    const startupId =
      localStorage.getItem('startupId')

    const res = await axios.post(
      'http://localhost:5000/api/investor/chat',
      {
        startupId,
        investorId: selected,
        message: msg
      }
    )

    setChatMessages(prev => [
      ...prev,
      {
        role: 'investor',
        content: res.data.data.reply
      }
    ])

  } catch (err) {

    console.error(err)

    setChatMessages(prev => [
      ...prev,
      {
        role: 'investor',
        content: 'Connection error.'
      }
    ])

  }
}

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--text-muted)',
            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>← Back</Link>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
            THE INVESTOR ROOM
          </span>
        </div>
        {!canPitch && (
          <div style={{
            padding: '5px 14px',
            background: 'var(--red-dim)', border: '1px solid var(--red)',
            borderRadius: 100,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--red)', letterSpacing: '0.06em', fontWeight: 700,
          }}>
            AVAILABLE FROM MONTH 3
          </div>
        )}
      </header>

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: selected ? '380px 1fr' : '1fr',
        gap: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s',
      }}>

        {/* Investor grid / list */}
        <div style={{
          padding: '28px',
          borderRight: selected ? '1px solid var(--border-subtle)' : 'none',
          overflowY: 'auto',
        }}>
          {!selected && (
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8 }}>
                The Boardroom.
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Five investors. Each with different theses, checks, and red flags.
                Pick your target. Write your pitch. See if they bite.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INVESTORS.map((inv) => {
              const locked = currentMonth < inv.availableFrom
              const isSelected = selected === inv.id

              return (
                <div
                  key={inv.id}
                  onClick={() => !locked && setSelected(isSelected ? null : inv.id)}
                  style={{
                    padding: '18px 20px',
                    background: isSelected ? `${inv.color}10` : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? inv.color + '50' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    opacity: locked ? 0.4 : 1,
                    transition: 'all 0.18s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>

                  {isSelected && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: 3, background: inv.color,
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-md)',
                      background: `${inv.color}20`,
                      border: `1px solid ${inv.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, color: inv.color,
                      flexShrink: 0,
                    }}>{inv.initials}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{inv.name}</span>
                        <StatusBadge status={inv.status} />
                        {locked && (
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9,
                            color: 'var(--text-muted)', letterSpacing: '0.06em',
                          }}>MONTH {inv.availableFrom}+</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 10 }}>
                        {inv.role} · {inv.cheque}
                      </div>
                      <MoodMeter value={inv.mood} color={inv.color} />
                    </div>
                  </div>

                  {!selected && (
                    <p style={{
                      fontSize: 11, color: 'var(--text-muted)', marginTop: 12,
                      lineHeight: 1.6,
                    }}>{inv.bio}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pitch room */}
        {selected && investor && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 56px)',
            overflow: 'hidden',
          }}>
            {/* Investor detail header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                  background: `${investor.color}20`,
                  border: `2px solid ${investor.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 800, color: investor.color,
                }}>{investor.initials}</div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{investor.name}</h2>
                    <StatusBadge status={investor.status} />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>{investor.bio}</p>

                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      ['CARES ABOUT', investor.focus, investor.color],
                      ['RED FLAGS', investor.redFlags, 'var(--red)'],
                      ['PERSONALITY', investor.personality, 'var(--text-secondary)'],
                    ].map(([l, v, c]) => (
                      <div key={l}>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 11, color: c, fontWeight: 500 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 6 }}>INVESTOR MOOD</div>
                  <MoodMeter value={investor.mood} color={investor.color} />
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 6 }}>Cheque: {investor.cheque}</div>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div style={{
              flex: 1, overflowY: 'auto',
              padding: '24px 28px',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              {chatMessages.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 16, opacity: 0.5,
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                    background: `${investor.color}15`,
                    border: `1px solid ${investor.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 800, color: investor.color,
                  }}>{investor.initials}</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                      {investor.name} is waiting.
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Write your pitch below. Be direct. They hate fluff.
                    </div>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: msg.role === 'founder' ? 'row-reverse' : 'row',
                    gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: msg.role === 'founder' ? 'var(--amber)' : `${investor.color}20`,
                      border: msg.role === 'investor' ? `1px solid ${investor.color}40` : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                      color: msg.role === 'founder' ? '#08090a' : investor.color,
                    }}>
                      {msg.role === 'founder' ? 'Y' : investor.initials[0]}
                    </div>
                    <div style={{ maxWidth: '75%' }}>
                      {msg.status && (
                        <div style={{ marginBottom: 6 }}>
                          <StatusBadge status={msg.status} />
                        </div>
                      )}
                      <div style={{
                        padding: '12px 16px',
                        background: msg.role === 'founder' ? 'var(--amber-dim)' : 'var(--bg-elevated)',
                        border: `1px solid ${msg.role === 'founder' ? 'var(--amber-glow)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: 13, lineHeight: 1.7,
                        color: 'var(--text-primary)',
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {pitching && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `${investor.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: investor.color,
                  }}>{investor.initials[0]}</div>
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex', gap: 6, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: investor.color,
                        animation: `bounce 1s ease ${i * 0.15}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: '16px 28px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
            }}>
              {chatMessages.length === 0 ? (
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
                    YOUR PITCH
                  </div>
                  <textarea
                    value={pitch}
                    onChange={e => setPitch(e.target.value)}
                    placeholder={`Write your pitch to ${investor.name}. Include your metrics, why you're different, and what you need the funding for...`}
                    rows={4}
                    style={{
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      padding: '12px 14px',
                      fontSize: 13, lineHeight: 1.6,
                      resize: 'none', outline: 'none',
                      marginBottom: 10,
                      fontFamily: 'var(--font-display)',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Tip: Mention your MRR, users, churn, and why you over competitors.
                    </span>
                    <button
                      onClick={handlePitch}
                      disabled={!pitch.trim() || pitching}
                      style={{
                        padding: '9px 20px',
                        background: pitch.trim() ? investor.color : 'var(--bg-overlay)',
                        border: 'none', borderRadius: 'var(--radius-sm)',
                        color: pitch.trim() ? '#08090a' : 'var(--text-muted)',
                        fontSize: 12, fontWeight: 700, cursor: pitch.trim() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}>
                      Pitch →
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={followUp}
                    onChange={e => setFollowUp(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
                    placeholder="Ask a follow-up or respond to their question..."
                    style={{
                      flex: 1, padding: '10px 14px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 13, outline: 'none',
                      fontFamily: 'var(--font-display)',
                    }}
                  />
                  <button
                    onClick={handleFollowUp}
                    style={{
                      padding: '10px 18px',
                      background: investor.color,
                      border: 'none', borderRadius: 'var(--radius-sm)',
                      color: '#08090a', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}>Send</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
