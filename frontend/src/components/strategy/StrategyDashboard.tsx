import { FileText, Map, Users, RefreshCw, Trophy, Target, Globe, Calendar, CheckCircle, ArrowLeft, Mail } from 'lucide-react'
import type { DashboardState, Opportunity } from './useStrategyAgent'

const KPI_CONFIG = [
  { key: 'rankings' as const, label: 'Classements ciblés', accent: 'text-gold', border: 'border-gold/20', bg: 'bg-gold/5' },
  { key: 'iso' as const, label: 'Certifications ISO', accent: 'text-sea', border: 'border-sea/20', bg: 'bg-sea/5' },
  { key: 'competitions' as const, label: 'Compétitions identifiées', accent: 'text-ok', border: 'border-ok/20', bg: 'bg-ok/5' },
  { key: 'partners' as const, label: 'Partenaires potentiels', accent: 'text-gold', border: 'border-gold/20', bg: 'bg-gold/5' },
  { key: 'rse' as const, label: 'Labels RSE ciblés', accent: 'text-warn', border: 'border-warn/20', bg: 'bg-warn/5' },
  { key: 'actions' as const, label: 'Actions prioritaires', accent: 'text-crit', border: 'border-crit/20', bg: 'bg-crit/5' },
]

const PROCEDURE_CONFIG = [
  { key: 'resume' as const, Icon: Target, color: 'border-l-gold', textAccent: 'text-gold' },
  { key: 'documents' as const, Icon: FileText, color: 'border-l-warn', textAccent: 'text-warn' },
  { key: 'roadmap' as const, Icon: Map, color: 'border-l-sea', textAccent: 'text-sea' },
  { key: 'contacts' as const, Icon: Users, color: 'border-l-ok', textAccent: 'text-ok' },
  { key: 'lettre' as const, Icon: Mail, color: 'border-l-gold', textAccent: 'text-gold' },
  { key: 'strategie' as const, Icon: Trophy, color: 'border-l-crit', textAccent: 'text-crit' },
]

interface Props {
  dashboard: DashboardState
  activeView: string
  onViewChange: (v: string) => void
  loadingDashboard: boolean
  onSelectOpportunity: (opp: Opportunity) => void
  onBackToList: () => void
}

const VIEWS = [
  { id: 'classements', label: 'Classements' },
  { id: 'rse', label: 'RSE' },
  { id: 'iso', label: 'ISO' },
  { id: 'competitions', label: 'Compétitions' },
  { id: 'partenariats', label: 'Partenariats' },
]

export default function StrategyDashboard({ dashboard, activeView, onViewChange, loadingDashboard, onSelectOpportunity, onBackToList }: Props) {
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto no-scrollbar pr-1 relative">
      {/* View pills */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => onViewChange(v.id)}
            disabled={loadingDashboard}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all border disabled:opacity-50 ${
              activeView === v.id
                ? 'bg-ink text-paper border-ink'
                : 'border-rule text-ink2 hover:bg-paper2 hover:border-gold/30'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-ink3 num mb-0.5">
            Module stratégique · {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h2 className="font-display text-2xl gold-shimmer tracking-tighter2">
            {dashboard.mode === 'list' ? 'Opportunités Actives' : dashboard.selectedOpportunity?.name}
          </h2>
          <p className="text-ink3 text-xs mt-0.5 max-w-[90%]">
            {dashboard.mode === 'list' 
              ? 'Opportunités identifiées sur le web. Cliquez sur une carte pour générer la procédure de candidature.'
              : 'Procédure détaillée spécifique à cette opportunité.'}
          </p>
        </div>
        {loadingDashboard && (
          <RefreshCw className="w-5 h-5 text-gold animate-spin mt-1" />
        )}
      </div>

      {dashboard.mode === 'detail' && (
        <button 
          onClick={onBackToList}
          className="flex items-center gap-1 text-xs text-ink3 hover:text-ink transition-colors w-fit -mt-2 mb-2"
        >
          <ArrowLeft size={14} /> Retour à la liste
        </button>
      )}

      {/* KPI grid (only show in list mode to save space) */}
      {dashboard.mode === 'list' && (
        <>
          <div className="grid grid-cols-3 gap-2.5 opacity-80">
            {KPI_CONFIG.map(({ key, label, accent, border, bg }) => (
              <div key={key} className={`rounded-lg border p-3 ${border} ${bg} transition-all`}>
                <p className="text-[9px] uppercase tracking-[0.1em] text-ink3 mb-1">{label}</p>
                <p className={`font-display text-2xl tracking-tighter2 ${accent} transition-all`}>
                  {dashboard.kpis[key]}{key === 'actions' ? '+' : ''}
                </p>
              </div>
            ))}
          </div>
          <div className="glow-line" />
        </>
      )}

      {/* LIST MODE: Opportunities */}
      {dashboard.mode === 'list' && (
        <div className="space-y-3 pb-4">
          {loadingDashboard ? (
            <>
              <div className="flex flex-col items-center gap-1.5 py-3">
                <p className="text-sm text-ink2 text-center animate-pulse">
                  🔍 Recherche des opportunités {VIEWS.find(v => v.id === activeView)?.label ?? activeView} en cours...
                </p>
                <p className="text-xs text-ink3 text-center">L'agent consulte le web...</p>
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-rule bg-paper p-4 animate-pulse opacity-40">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="h-4 bg-ink3/30 rounded w-3/4" />
                    <div className="h-5 w-16 bg-ink3/20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="h-3 bg-ink3/20 rounded w-full" />
                    <div className="h-3 bg-ink3/20 rounded w-full" />
                    <div className="h-3 bg-ink3/20 rounded col-span-2 w-full" />
                    <div className="h-3 bg-ink3/20 rounded col-span-2 w-2/3" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {dashboard.opportunities.map((opp) => (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity(opp)}
                  className="rounded-xl border border-rule bg-paper p-4 transition-all hover:shadow-md cursor-pointer hover:border-gold/50"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-display font-semibold text-[15px] tracking-tightish text-ink leading-tight">
                      {opp.name}
                    </h4>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="pill pill-accent text-[9px] font-bold">Score: {opp.score}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-ink2">
                      <Users size={12} className="text-ink3" />
                      <span className="truncate">{opp.organizer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-crit font-medium">
                      <Calendar size={12} />
                      <span>{opp.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink2 col-span-2">
                      <Globe size={12} className="text-sea flex-shrink-0" />
                      <span className="truncate">Concurrents : {opp.participants}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] text-ink2 col-span-2">
                      <CheckCircle size={12} className="text-ok flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{opp.eligibility}</span>
                    </div>
                  </div>
                </div>
              ))}
              {dashboard.opportunities.length === 0 && (
                <p className="text-sm text-ink3 italic text-center py-8">Aucune opportunité trouvée. Veuillez sélectionner une catégorie.</p>
              )}
            </>
          )}
        </div>
      )}

      {/* DETAIL MODE: Specific Procedure */}
      {dashboard.mode === 'detail' && (
        <div className="space-y-4 pb-4">
          {PROCEDURE_CONFIG.map(({ key, Icon, color, textAccent }) => {
            const card = dashboard.procedure[key]
            return (
              <div key={key} className={`rounded-xl border border-rule border-l-4 ${color} bg-paper p-5 transition-all hover:shadow-md ${loadingDashboard ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between gap-3 mb-3 border-b border-rule pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-md bg-paper2 ${textAccent}`}>
                      <Icon size={18} />
                    </div>
                    <h4 className="font-display font-semibold text-[15px] tracking-tightish text-ink">
                      {card.title}
                    </h4>
                  </div>
                  <span className="pill pill-accent text-[9px] max-w-[150px] truncate">{card.badge}</span>
                </div>
                
                <div className="text-[13px] text-ink2 leading-relaxed whitespace-pre-wrap pl-1">
                  {card.body}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Status bar */}
      {dashboard.lastUpdated && (
        <div className="flex items-center gap-2 text-[10px] text-ink3 num mt-auto pt-2 border-t border-rule bg-paper sticky bottom-0">
          <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
          Dernière synchronisation web : {dashboard.lastUpdated}
        </div>
      )}
    </div>
  )
}
