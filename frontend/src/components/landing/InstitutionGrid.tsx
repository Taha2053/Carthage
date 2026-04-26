import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UCAR_INSTITUTIONS, TYPE_COLOR, TYPE_LABEL } from '@/data/institutions'
import type { InstitutionType, PublicInstitution } from '@/data/institutions'
import { InstitutionLogo } from '@/components/institutions/InstitutionLogo'

interface Props {
  highlightedId?: string | null
}

const HEALTH_DOT: Record<string, string> = {
  good:    'bg-ok',
  warning: 'bg-warn',
  no_data: 'bg-ink3',
}
const HEALTH_LABEL: Record<string, string> = {
  good:    'Bon',
  warning: 'Vigilance',
  no_data: 'N/D',
}

type SortKey = 'name' | 'students' | 'insertion' | 'research'

function InstitutionPublicCard({ inst, highlighted }: { inst: PublicInstitution; highlighted: boolean }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        highlighted
          ? 'border-gold shadow-lg -translate-y-0.5 ring-1 ring-gold/30'
          : 'border-rule hover:border-gold/30 hover:shadow-md hover:-translate-y-0.5'
      }`}
      style={{ background: highlighted ? 'linear-gradient(135deg,#FDF6E8,#F4EBD5)' : '#FDFAF4' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <InstitutionLogo institutionId={inst.id} size={40} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <p className="font-display font-semibold text-[14px] text-ink leading-tight truncate">{inst.acronym}</p>
              <span
                className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full`}
                style={{ background: TYPE_COLOR[inst.type] + '18', color: TYPE_COLOR[inst.type] }}
              >
                {TYPE_LABEL[inst.type]}
              </span>
            </div>
            <p className="text-[11px] text-ink3 truncate mt-0.5">{inst.name}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-3 gap-1 text-center">
          <div className="rounded-lg py-1.5" style={{ background: 'rgba(196,147,58,0.07)' }}>
            <p className="font-semibold text-[13px] text-ink num">{inst.studentCount.toLocaleString('fr')}</p>
            <p className="text-[9px] text-ink3 mt-0.5">Étudiants</p>
          </div>
          <div className="rounded-lg py-1.5" style={{ background: 'rgba(27,79,114,0.07)' }}>
            <p className="font-semibold text-[13px] text-ink num">{inst.insertionRate}%</p>
            <p className="text-[9px] text-ink3 mt-0.5">Insertion</p>
          </div>
          <div className="rounded-lg py-1.5" style={{ background: 'rgba(30,132,73,0.07)' }}>
            <p className="font-semibold text-[13px] text-ink num">{inst.researchScore}</p>
            <p className="text-[9px] text-ink3 mt-0.5">Recherche</p>
          </div>
        </div>

        {/* Status + city */}
        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-ink3">
          <span className={`w-1.5 h-1.5 rounded-full ${HEALTH_DOT[inst.healthStatus]}`}/>
          <span>{HEALTH_LABEL[inst.healthStatus]}</span>
          <span className="ml-auto">{inst.city}</span>
        </div>

        {/* Expandable */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-rule space-y-2">
            <p className="text-[11px] text-ink2 leading-relaxed">{inst.description}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {inst.specialties.slice(0, 4).map(s => (
                <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-full border border-rule text-ink3">{s}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-ink3 num mt-1">
              <span>Fondé {inst.foundedYear}</span>
              <span>{inst.internationalPartnerships} partenariats intl.</span>
              <span>{inst.programCount} programmes</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex border-t border-rule">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 py-2 text-[11px] text-ink3 hover:text-ink hover:bg-paper2/40 transition-colors"
        >
          {expanded ? 'Réduire ↑' : 'En savoir plus ↓'}
        </button>
        <div className="w-px bg-rule"/>
        <button
          onClick={() => navigate(`/institution/${inst.id}`)}
          className="px-4 py-2 text-[11px] text-gold hover:text-gold-deep hover:bg-gold/5 transition-colors font-medium"
        >
          Tableau de bord →
        </button>
      </div>
    </div>
  )
}

export default function InstitutionGrid({ highlightedId }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<InstitutionType | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    let list = UCAR_INSTITUTIONS
    if (typeFilter !== 'all') list = list.filter(i => i.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.acronym.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.specialties.some(s => s.toLowerCase().includes(q))
      )
    }
    list = [...list].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'name') return mul * a.acronym.localeCompare(b.acronym)
      if (sortKey === 'students') return mul * (a.studentCount - b.studentCount)
      if (sortKey === 'insertion') return mul * (a.insertionRate - b.insertionRate)
      if (sortKey === 'research') return mul * (a.researchScore - b.researchScore)
      return 0
    })
    return list
  }, [search, typeFilter, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <section id="institutions" className="py-20 px-6" style={{ background: '#F4EBD5' }}>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="text-center mb-10 fade-up">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-medium mb-3">Réseau académique</p>
          <h2 className="font-display text-[36px] leading-[1.15] tracking-tightish text-ink">
            Tous les établissements
          </h2>
          <p className="mt-3 text-[14px] text-ink3 max-w-md mx-auto">
            32 institutions publiques, 3 gouvernorats, une université — explorez, comparez, découvrez.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un établissement, une spécialité, une ville…"
              className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-rule bg-white/70 text-ink placeholder:text-ink3 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/10"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {([['all', 'Tous']] as [string, string][]).concat(
              (Object.entries(TYPE_LABEL) as [string, string][])
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTypeFilter(k as InstitutionType | 'all')}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border ${
                  typeFilter === k
                    ? 'border-gold bg-gold text-white'
                    : 'border-rule text-ink3 hover:border-gold/40 hover:text-gold bg-white/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] text-ink3 mr-1">Trier:</span>
            {([['name', 'Nom'], ['students', 'Étudiants'], ['insertion', 'Insertion'], ['research', 'Recherche']] as [SortKey, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => toggleSort(k)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] transition-colors ${
                  sortKey === k ? 'bg-ink text-paper' : 'text-ink3 hover:text-ink hover:bg-paper2/60'
                }`}
              >
                {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-[12px] text-ink3 mb-5 num">
          {filtered.length} établissement{filtered.length !== 1 ? 's' : ''}
          {search ? ` pour "${search}"` : ''}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-ink3">
            <p className="text-[15px]">Aucun établissement trouvé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(inst => (
              <InstitutionPublicCard
                key={inst.id}
                inst={inst}
                highlighted={highlightedId === inst.id}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
