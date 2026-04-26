import { useState } from 'react'
import { OPPORTUNITIES, CAT_LABEL, CAT_COLOR } from '@/data/opportunities'
import type { OpportunityCategory } from '@/data/opportunities'

const ALL_CATS: (OpportunityCategory | 'all')[] = ['all', 'competition', 'internship', 'event', 'partnership', 'grant']
const CAT_FILTER_LABEL: Record<OpportunityCategory | 'all', string> = {
  all: 'Tout',
  competition: 'Compétitions',
  internship: 'Stages',
  event: 'Événements',
  partnership: 'Partenariats',
  grant: 'Bourses',
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  )
}

export default function OpportunitiesFeed() {
  const [catFilter, setCatFilter] = useState<OpportunityCategory | 'all'>('all')
  const [showAll, setShowAll] = useState(false)

  const filtered = OPPORTUNITIES.filter(o => catFilter === 'all' || o.category === catFilter)
  const visible = showAll ? filtered : filtered.slice(0, 6)

  return (
    <section id="opportunities" className="py-20 px-6 border-t border-rule/60" style={{ background: 'linear-gradient(180deg, #EBE0C8 0%, #F4EBD5 100%)' }}>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
          <div className="fade-up">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-medium mb-2">Opportunités & actualités</p>
            <h2 className="font-display text-[34px] leading-[1.15] tracking-tightish text-ink">
              Compétitions, stages & événements
            </h2>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ALL_CATS.map(cat => (
              <button
                key={cat}
                onClick={() => { setCatFilter(cat); setShowAll(false) }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border ${
                  catFilter === cat
                    ? 'bg-ink text-paper border-ink'
                    : 'border-rule text-ink3 hover:text-ink bg-white/50'
                }`}
              >
                {CAT_FILTER_LABEL[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Featured */}
        {catFilter === 'all' && (
          <div className="mb-8">
            {OPPORTUNITIES.filter(o => o.isFeatured).map(opp => (
              <div
                key={opp.id}
                className="relative rounded-2xl overflow-hidden border border-gold/30 p-6 mb-3"
                style={{ background: 'linear-gradient(135deg, #0F1923 0%, #1B4F72 100%)' }}
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full" style={{ background: '#C5933A22', color: '#F7D98B' }}>
                    À la une
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full mt-0.5"
                    style={{ background: CAT_COLOR[opp.category] + '30', color: CAT_COLOR[opp.category] }}
                  >
                    {CAT_LABEL[opp.category]}
                  </span>
                  <div>
                    <p className="font-display text-[18px] font-semibold text-paper leading-tight">{opp.title}</p>
                    <p className="text-[12px] text-paper/60 mt-1">{opp.institution} · {opp.location}</p>
                    <p className="text-[13px] text-paper/80 mt-2 leading-relaxed max-w-lg">{opp.description}</p>
                    <div className="mt-3 flex items-center gap-3 flex-wrap">
                      {opp.tags.map(t => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-paper/60">{t}</span>
                      ))}
                      {opp.deadline && (
                        <span className="flex items-center gap-1 text-[11px] text-warn ml-auto">
                          <CalendarIcon/>
                          Date limite: {new Date(opp.deadline).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.filter(o => !o.isFeatured || catFilter !== 'all').map(opp => (
            <div
              key={opp.id}
              className="bg-white/70 rounded-xl border border-rule hover:border-gold/30 hover:shadow-md transition-all p-4 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                  style={{ background: CAT_COLOR[opp.category] + '18', color: CAT_COLOR[opp.category] }}
                >
                  {CAT_LABEL[opp.category]}
                </span>
                {opp.isNew && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-ok/10 text-ok border border-ok/20">
                    Nouveau
                  </span>
                )}
              </div>

              <h3 className="font-display font-semibold text-[14px] text-ink leading-snug flex-1">{opp.title}</h3>
              <p className="text-[11px] text-ink3 mt-1">{opp.institution} · {opp.location}</p>
              <p className="text-[12px] text-ink2 mt-2 leading-relaxed line-clamp-2">{opp.description}</p>

              <div className="mt-3 flex flex-wrap gap-1">
                {opp.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full border border-rule text-ink3">{t}</span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-rule flex items-center gap-2 text-[10px] num text-ink3">
                <CalendarIcon/>
                <span>{new Date(opp.date).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {opp.deadline && (
                  <span className="ml-auto text-warn font-medium">
                    Limite: {new Date(opp.deadline).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        {!showAll && filtered.length > 6 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(true)}
              className="px-6 py-2.5 rounded-full border border-rule text-[13px] text-ink3 hover:text-ink hover:border-gold/40 transition-colors bg-white/50"
            >
              Voir {filtered.length - 6} autres opportunités
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
