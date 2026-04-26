import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from './useStrategyAgent'

const DEFAULT_ACTIONS = [
  '🌍 Quelles compétitions sont ouvertes maintenant ?',
  '🏆 Quelles universités africaines ont gagné le GreenMetric ?',
  '📋 Quels classements acceptent des soumissions en 2026 ?',
  '🤝 Quels programmes AUF sont accessibles à Carthage ?',
]

const DETAIL_ACTIONS: Record<string, string[]> = {
  'classements': [
    'Quelles catégories correspondent à Carthage ?',
    'Exemples de dossiers africains gagnants ?',
    'Comment maximiser notre score sur ce classement ?'
  ],
  'rse': [
    'Quels campus africains ont été certifiés récemment ?',
    'Comment calculer notre score initial ?',
    'Quel est le coût estimé de cette démarche ?'
  ],
  'iso': [
    'Quels sont les auditeurs certifiés en Tunisie ?',
    'Coût estimé de la certification pour un institut ?',
    'Quelle est la durée moyenne d\'un audit de certification ?'
  ],
  'competitions': [
    'Quelles catégories de ce prix correspondent à Carthage ?',
    'Exemples de dossiers de candidature gagnants ?',
    'Quelles pièces justificatives posent souvent problème ?'
  ],
  'partenariats': [
    'Quelles universités du top 500 ont des accords avec le Maghreb ?',
    'Modèle d\'email pour un vice-président aux relations internationales ?',
    'Comment financer la mobilité étudiante via ce partenaire ?'
  ],
  'default': [
    'Comment adapter cette procédure à notre budget ?',
    'Quels sont les pièges à éviter ?',
    'Exemples de réussite en Afrique du Nord ?'
  ]
}

interface Props {
  messages: ChatMessage[]
  loading: boolean
  onSendMessage: (msg: string) => void
  dashboardMode: 'list' | 'detail'
  selectedCategory: string
}

export default function StrategyChat({ messages, loading, onSendMessage, dashboardMode, selectedCategory }: Props) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return
    onSendMessage(input.trim())
    setInput('')
  }

  const activeActions = dashboardMode === 'list' ? DEFAULT_ACTIONS : (DETAIL_ACTIONS[selectedCategory] || DETAIL_ACTIONS['default'])
  const inputPlaceholder = dashboardMode === 'list' ? "Posez une question à l'agent..." : "Posez une question sur cette procédure..."

  return (
    <div className="flex flex-col h-full border-l border-rule pl-5">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-6" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div
                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md"
                style={{ background: 'linear-gradient(135deg, #C5933A, #9E7520)' }}
              >
                ⚜
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-paper2 border border-rule flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-ink">
                VOUS
              </div>
            )}

            {/* Message Bubble */}
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'assistant' && i === 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-ink">Agent Carthage</span>
                  <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-ok num">
                    <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
                    En ligne
                  </span>
                </div>
              )}

              <div
                className={`p-3.5 text-[13px] leading-relaxed rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-ink text-paper rounded-tr-sm'
                    : 'bg-paper border border-rule rounded-tl-sm text-ink2 shadow-sm'
                }`}
                style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #0F1923, #1B4F72)' } : {}}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-[10px] text-ink3 mt-1">
                <span className="num">{msg.timestamp}</span>
                {msg.sources && msg.sources.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                      Recherche web
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-md"
              style={{ background: 'linear-gradient(135deg, #C5933A, #9E7520)' }}
            >
              ⚜
            </div>
            <div className="flex flex-col gap-1 max-w-[85%] items-start">
              <div className="p-3.5 bg-paper border border-rule rounded-2xl rounded-tl-sm shadow-sm flex flex-col gap-2 min-w-[120px]">
                <div className="flex gap-1.5 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="pt-4 border-t border-rule mt-4">
        {/* Quick Actions */}
        <div className="mb-3">
          <p className="text-[9px] uppercase tracking-[0.15em] text-ink3 mb-2 font-medium">Questions ciblées</p>
          <div className="flex flex-wrap gap-2">
            {activeActions.map(action => (
              <button
                key={action}
                onClick={() => onSendMessage(action)}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] rounded border border-rule text-ink2 hover:border-gold hover:text-gold transition-colors disabled:opacity-50 bg-paper2/30 text-left"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            placeholder={inputPlaceholder}
            className="w-full bg-paper2 border border-rule rounded-lg pl-4 pr-12 py-3 text-[13px] text-ink focus:outline-none focus:border-gold transition-colors placeholder:text-ink3 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded flex items-center justify-center transition-colors disabled:opacity-50"
            style={{ background: input.trim() && !loading ? 'linear-gradient(135deg, #0F1923, #1B4F72)' : 'transparent' }}
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={input.trim() && !loading ? '#F4EBD5' : '#6B7A8D'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
