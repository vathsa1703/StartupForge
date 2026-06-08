'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const PERSONAS = [
  {
    id: '6a2199f3ab6007fc5155e07c',
    name: 'Rohan Sharma',
    age: 22,
    occupation: 'Engineering Student',
    income: '₹15K–25K/month',
    initials: 'RS',
    color: '#e8a030',
    willingnessToPay: '₹500–700/month',
    painPoints: ['Lack of time for exercise', 'Limited fitness resources', 'Struggling to maintain diet'],
    personality: 'Tech-savvy, budget-conscious, open to AI solutions but price-sensitive.',
    mood: 'neutral',
    tags: ['Student', 'Budget', 'Tier-1 City'],
  },
  {
    id: '6a2199f3ab6007fc5155e07d',
    name: 'Aisha Khan',
    age: 20,
    occupation: 'Commerce Student',
    income: '₹10K–20K/month',
    initials: 'AK',
    color: '#4a90d9',
    willingnessToPay: '₹300–800/month',
    painPoints: ['Body image issues', 'Lack of confidence exercising', 'Unhealthy campus food'],
    personality: 'Hesitant, needs empathy, values personalized support over generic advice.',
    mood: 'warm',
    tags: ['Student', 'Hesitant', 'Needs Trust'],
  },
  {
    id: '6a2199f3ab6007fc5155e07e',
    name: 'Karan Singh',
    age: 24,
    occupation: 'MBA Student',
    income: '₹25K–40K/month',
    initials: 'KS',
    color: '#2dba74',
    willingnessToPay: '₹1000–2000/month',
    painPoints: ['High stress levels', 'No time for self-care', 'Work-life balance'],
    personality: 'Driven, results-oriented, willing to pay for premium if it saves time.',
    mood: 'busy',
    tags: ['Premium', 'MBA', 'Time-poor'],
  },
]

const SUGGESTED_QUESTIONS = [
  'Would you pay ₹999/month for this app?',
  'What would make you stop using this?',
  'How do you currently manage your fitness?',
  'Would you recommend this to a friend?',
  "What's the first feature you'd want?",
  'What would make you trust this app?',
]

const MOCK_RESPONSES = {
  'rohan': {
    'would you pay ₹999': 'Honestly, that\'s way too much for me. I\'m surviving on pocket money here. I\'d maybe do ₹499 if the app actually worked — but even then I\'d try a free trial first. My friends and I share Netflix for ₹50 each, so ₹999 for a fitness app feels insane.',
    'stop using': 'If it starts giving me generic advice. I hate when apps just tell me to "drink more water" and "sleep 8 hours." If the AI can\'t actually understand my schedule and my hostel food limitations, I\'m out.',
    'default': 'That\'s actually a good question. Let me think about it from my perspective as someone who barely has time between assignments and lab work...',
  },
  'aisha': {
    'would you pay': 'I\'d need to see it work first honestly. Maybe a 2-week free trial? My issue isn\'t really about price, it\'s about whether the AI will actually understand what I\'m going through. I don\'t want something that makes me feel worse about myself.',
    'default': 'Hmm, that\'s something I think about a lot. On campus it\'s really hard to stay consistent without someone actually checking in on you...',
  },
  'karan': {
    'would you pay': '₹999 is fine if it actually integrates with my calendar and stops me from skipping workouts during exam season. I\'d honestly pay ₹1500 if it gave me weekly analytics. I use Notion, Todoist, and Superhuman — I\'m used to paying for tools that work.',
    'default': 'From an MBA perspective, the real value prop here is time-saving. I don\'t need motivation, I need optimization. If your AI can do that, I\'m in.',
  },
}

function getMockResponse(personaId, message) {
  const persona = PERSONAS.find(p => p.id === personaId)
  if (!persona) return 'Interesting question...'
  const key = persona.name.split(' ')[0].toLowerCase()
  const responses = MOCK_RESPONSES[key] || {}
  const msgLower = message.toLowerCase()
  for (const [trigger, response] of Object.entries(responses)) {
    if (trigger !== 'default' && msgLower.includes(trigger)) return response
  }
  return responses.default || 'That\'s something worth thinking about from my perspective...'
}

function PersonaCard({ persona, selected, onSelect }) {
  const moodColors = { neutral: 'var(--amber)', warm: 'var(--green)', busy: 'var(--blue)' }
  const moodLabels = { neutral: 'Neutral', warm: 'Receptive', busy: 'Distracted' }

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '18px 20px',
        background: selected ? `${persona.color}0f` : 'var(--bg-surface)',
        border: `1px solid ${selected ? persona.color + '50' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all 0.18s',
        position: 'relative',
        overflow: 'hidden',
      }}>
      {selected && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 3, background: persona.color,
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: `${persona.color}20`,
          border: `2px solid ${persona.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: persona.color,
        }}>{persona.initials}</div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{persona.name}</span>
            <span style={{
              padding: '2px 7px', borderRadius: 100,
              background: `${moodColors[persona.mood]}20`,
              color: moodColors[persona.mood],
              fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}>{moodLabels[persona.mood].toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {persona.age} · {persona.occupation}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {persona.tags.map(tag => (
          <span key={tag} style={{
            padding: '2px 8px', borderRadius: 100,
            background: 'var(--bg-overlay)',
            fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em',
          }}>{tag}</span>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8, paddingTop: 10,
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>INCOME</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{persona.income}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 2 }}>MAX SPEND</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: persona.color }}>{persona.willingnessToPay}</div>
        </div>
      </div>
    </div>
  )
}

export default function PersonasPage() {
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const persona = PERSONAS.find(p => p.id === selected)

  const handleSelectPersona = (id) => {
    setSelected(id)
    setMessages([])
    setInput('')
  }

  const handleSend = async (msg) => {
    const text = msg || input
    if (!text.trim() || !selected) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setTyping(true)

    const delay = 1000 + Math.random() * 1200
    await new Promise(r => setTimeout(r, delay))

    const response = getMockResponse(selected, text)
    setTyping(false)
    setMessages(prev => [...prev, { role: 'assistant', content: response }])
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
            CUSTOMER INTERVIEWS
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {messages.length > 0 && `${messages.filter(m => m.role === 'user').length} questions asked`}
        </div>
      </header>

      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 0,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.4s',
        height: 'calc(100vh - 56px)',
      }}>

        {/* Left: persona list */}
        <div style={{
          borderRight: '1px solid var(--border-subtle)',
          padding: '24px 16px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 700, padding: '0 4px', marginBottom: 4 }}>
            YOUR CUSTOMERS
          </div>
          {PERSONAS.map(p => (
            <PersonaCard
              key={p.id}
              persona={p}
              selected={selected === p.id}
              onSelect={() => handleSelectPersona(p.id)}
            />
          ))}

          {/* Research insight box */}
          <div style={{
            marginTop: 8, padding: '14px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>
              INTERVIEW TIPS
            </div>
            {[
              'Ask about current behavior, not future intent',
              'Probe pricing indirectly first',
              'Listen for emotional language',
              'Ask "why" 3 times deep',
            ].map((tip, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '5px 0',
                borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <span style={{ fontSize: 10, color: 'var(--amber)', marginTop: 1 }}>→</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: chat */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 16, opacity: 0.4,
            }}>
              <div style={{ fontSize: 40 }}>◎</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Pick a persona to interview</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Talk to your AI-generated customers.<br />Ask real questions. Get real pushback.
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Persona context bar */}
              <div style={{
                padding: '14px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${persona.color}20`,
                  border: `2px solid ${persona.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: persona.color,
                }}>{persona.initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{persona.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {persona.occupation} · Will pay up to {persona.willingnessToPay}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  {persona.painPoints.slice(0, 2).map((p, i) => (
                    <span key={i} style={{
                      padding: '3px 9px', borderRadius: 100,
                      background: 'var(--bg-overlay)',
                      fontSize: 10, color: 'var(--text-muted)',
                    }}>{p}</span>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', opacity: 0.5, padding: '40px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                      Start the interview. Ask anything.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                      {SUGGESTED_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(q)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 100,
                            color: 'var(--text-secondary)',
                            fontSize: 11, cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: 'var(--font-display)',
                          }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: 10, alignItems: 'flex-end',
                  }}>
                    {msg.role === 'assistant' && (
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: `${persona.color}20`,
                        border: `1px solid ${persona.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, color: persona.color,
                        marginBottom: 2,
                      }}>{persona.initials[0]}</div>
                    )}
                    <div style={{
                      maxWidth: '72%',
                      padding: '11px 15px',
                      background: msg.role === 'user' ? 'var(--amber-dim)' : 'var(--bg-elevated)',
                      border: `1px solid ${msg.role === 'user' ? 'var(--amber-glow)' : 'var(--border-subtle)'}`,
                      borderRadius: msg.role === 'user'
                        ? 'var(--radius-md) var(--radius-sm) var(--radius-sm) var(--radius-md)'
                        : 'var(--radius-sm) var(--radius-md) var(--radius-md) var(--radius-sm)',
                      fontSize: 13, lineHeight: 1.7,
                      color: 'var(--text-primary)',
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${persona.color}20`,
                      border: `1px solid ${persona.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: persona.color,
                    }}>{persona.initials[0]}</div>
                    <div style={{
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', gap: 5, alignItems: 'center',
                    }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: persona.color,
                          animation: `typingDot 1.2s ease ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
              }}>
                {/* Quick question chips */}
                {messages.length > 0 && messages.length < 6 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 100,
                          color: 'var(--text-muted)',
                          fontSize: 10, cursor: 'pointer',
                          fontFamily: 'var(--font-display)',
                          transition: 'all 0.15s',
                        }}>
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={`Ask ${persona.name} anything about your product...`}
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
                    onClick={() => handleSend()}
                    disabled={!input.trim() || typing}
                    style={{
                      padding: '10px 18px',
                      background: input.trim() ? persona.color : 'var(--bg-overlay)',
                      border: 'none', borderRadius: 'var(--radius-sm)',
                      color: '#08090a', fontSize: 12, fontWeight: 700,
                      cursor: input.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s',
                    }}>Ask</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
