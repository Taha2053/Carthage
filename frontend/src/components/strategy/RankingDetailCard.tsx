import { useState } from 'react'

interface RankingSystem {
  name: string
  shortName: string
  criteria: { name: string; weight: string; description: string }[]
  weaknesses: string[]
  actions: string[]
  dataLeverage: string[]
}

export default function RankingDetailCard({ ranking }: { ranking: RankingSystem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-rule bg-paper p-5 lift">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <span className="pill pill-accent text-[10px] mb-2 inline-block">{ranking.shortName}</span>
          <h4 className="font-display text-lg text-ink tracking-tighter2">{ranking.name}</h4>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-ink3 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4 fade-up">
          {/* Criteria */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 num mb-2">Critères & pondérations</p>
            <div className="space-y-1.5">
              {ranking.criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-ink2">{c.name}</span>
                      <span className="num text-xs text-gold-deep">{c.weight}</span>
                    </div>
                    <div className="h-1.5 bg-paper2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: c.weight,
                          background: 'linear-gradient(90deg, #C5933A, #1B4F72)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="rounded-lg bg-crit/5 border border-crit/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.1em] text-crit num mb-2">
              Points faibles typiques (université tunisienne)
            </p>
            <ul className="space-y-1.5">
              {ranking.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-ink2 flex items-start gap-2">
                  <span className="text-crit mt-0.5">⚠</span> {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="rounded-lg bg-ok/5 border border-ok/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.1em] text-ok num mb-2">
              Actions concrètes (12 mois)
            </p>
            <ul className="space-y-1.5">
              {ranking.actions.map((a, i) => (
                <li key={i} className="text-sm text-ink2 flex items-start gap-2">
                  <span className="text-ok num text-xs mt-0.5">{String(i+1).padStart(2,'0')}</span> {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Data */}
          <div className="rounded-lg bg-sea/5 border border-sea/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.1em] text-sea num mb-2">
              Données exploitables (plateforme CarthaVillage)
            </p>
            <ul className="space-y-1.5">
              {ranking.dataLeverage.map((d, i) => (
                <li key={i} className="text-sm text-ink2 flex items-start gap-2">
                  <span className="text-sea">→</span> {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
