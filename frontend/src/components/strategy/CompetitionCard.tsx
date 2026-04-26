import { useState } from 'react'

interface Competition {
  name: string
  organizer: string
  website: string
  eligibility: string
  category: string
  cycle: string
  tips: string[]
  dossierSupport: string[]
}

export default function CompetitionCard({ competition }: { competition: Competition }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-rule bg-paper p-5 lift">
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-display text-base text-ink tracking-tighter2">{competition.name}</h4>
            <p className="text-xs text-ink3 mt-0.5">{competition.organizer}</p>
          </div>
          <span className="pill text-[10px] flex-shrink-0">{competition.category}</span>
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3 fade-up border-t border-rule pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-ink3 num mb-1">Éligibilité</p>
              <p className="text-ink2">{competition.eligibility}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-ink3 num mb-1">Cycle</p>
              <p className="text-ink2">{competition.cycle}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-ink3 num mb-1">Site web</p>
              <a href={competition.website} target="_blank" rel="noopener noreferrer" className="text-sea hover:underline text-xs break-all">{competition.website}</a>
            </div>
          </div>

          <div className="rounded-lg bg-gold/5 border border-gold/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-gold-deep num mb-2">Conseils stratégiques</p>
            <ul className="space-y-1">
              {competition.tips.map((t, i) => (
                <li key={i} className="text-sm text-ink2 flex items-start gap-2">
                  <span className="text-gold">★</span> {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-sea/5 border border-sea/20 p-3">
            <p className="text-[10px] uppercase tracking-[0.1em] text-sea num mb-2">Support dossier (plateforme)</p>
            <ul className="space-y-1">
              {competition.dossierSupport.map((d, i) => (
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
