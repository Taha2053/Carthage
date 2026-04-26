import { useState } from 'react'

interface StrategicAreaProps {
  title?: string
  icon?: string
  objective: string
  currentGap: string
  quickWins: string[]
  mediumTerm: string[]
  metrics: string[]
  platformData: string[]
  children?: React.ReactNode
}

export default function StrategicAreaCard({
  title, icon, objective, currentGap, quickWins, mediumTerm, metrics, platformData, children
}: StrategicAreaProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-5 fade-up-1">
      {/* Objective */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-gold-deep num mb-2">Objectif stratégique</p>
        <p className="text-ink font-medium">{objective}</p>
      </div>

      {/* Current Gap */}
      <div className="rounded-xl border border-crit/20 bg-crit/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-crit num mb-2">Écart actuel</p>
        <p className="text-ink2 text-sm leading-relaxed">{currentGap}</p>
      </div>

      {/* Quick Wins */}
      <div className="rounded-xl border border-ok/20 bg-ok/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-ok num mb-3">
          Gains rapides · 0–6 mois
        </p>
        <ul className="space-y-2">
          {quickWins.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ok flex-shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      </div>

      {/* Medium-term */}
      <div className="rounded-xl border border-sea/20 bg-sea/5 p-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-sea num mb-3">
          Actions moyen terme · 6–18 mois
        </p>
        <ul className="space-y-2">
          {mediumTerm.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sea flex-shrink-0" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[12px] text-gold hover:text-gold-deep transition-colors"
      >
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        {expanded ? 'Masquer les détails' : 'Métriques & données plateforme'}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 fade-up">
          <div className="rounded-xl border border-rule bg-paper2/50 p-5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-ink3 num mb-3">
              Métriques clés à suivre
            </p>
            <ul className="space-y-2">
              {metrics.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink2">
                  <span className="text-gold num text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-rule bg-paper2/50 p-5">
            <p className="text-[11px] uppercase tracking-[0.15em] text-ink3 num mb-3">
              Données CarthaVillage exploitables
            </p>
            <ul className="space-y-2">
              {platformData.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink2">
                  <span className="text-sea num text-xs mt-0.5">→</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Children for area-specific detail content */}
      {children}
    </div>
  )
}
