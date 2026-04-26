import { useEffect, useRef, useState } from 'react'
import { fetchDashboardInstitutions, fetchNetworkBriefing, fetchNetworkAlerts } from '@/services/adapters'
import InstitutionCard from '@/components/institutions/InstitutionCard'
import BriefingCard from '@/components/pulse/BriefingCard'
import AlertsPanel from '@/components/alerts/AlertsPanel'
import NLQueryBar from '@/components/query/NLQueryBar'
import { healthToDot } from '@/utils/health'
import type { Health, Institution, Alert, Briefing } from '@/types'

const HEALTH_GLOW: Record<Health, string> = {
  critical: 'dot-critical',
  warning:  'dot-warning',
  good:     'dot-good',
  no_data:  'dot-nodata',
}

const HEALTH_CARD: Record<Health, string> = {
  critical: 'border-crit/30 bg-crit/5',
  warning:  'border-warn/30 bg-warn/5',
  good:     'border-ok/30 bg-ok/5',
  no_data:  'border-rule bg-paper2',
}

type View = 'grid' | 'rank'

export default function CentralDashboard() {
  const nlRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('grid')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [placeholders, setPlaceholders] = useState<string[]>([])
  const [allAlerts, setAllAlerts] = useState<Alert[]>([])
  const [briefing, setBriefing] = useState<Briefing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [dashData, alerts, brief] = await Promise.all([
        fetchDashboardInstitutions(),
        fetchNetworkAlerts(),
        fetchNetworkBriefing(),
      ])
      setInstitutions(dashData.institutions)
      setPlaceholders(dashData.placeholders)
      setAllAlerts(alerts)
      setBriefing(brief)
      setLoading(false)
    }
    load()
  }, [])

  const scrollToNL = () => nlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  // ── aggregates ──
  const withAcad = institutions.filter((i) => i.current.academique)
  const avgReussite = withAcad.length > 0
    ? Math.round(withAcad.reduce((s, i) => s + (i.current.academique?.tauxReussite ?? 0), 0) / withAcad.length)
    : 0
  const criticalCount = institutions.filter((i) => i.health === 'critical').length
  const warningCount  = institutions.filter((i) => i.health === 'warning').length
  const goodCount     = institutions.filter((i) => i.health === 'good').length
  const NETWORK_SCORE = institutions.length > 0
    ? Math.round(institutions.reduce((s, i) => s + i.riskScore, 0) / institutions.length)
    : 0
  const ranked = [...institutions].sort((a, b) => a.riskScore - b.riskScore)

  if (loading) {
    return (
      <div className="space-y-6 py-6 px-6 max-w-[1400px] mx-auto">
        <div className="fade-up">
          <div className="h-8 bg-rule rounded w-1/3 mb-4 animate-pulse" />
          <div className="h-12 bg-rule rounded w-2/3 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
              <div className="h-3 bg-rule rounded w-2/3 mb-3" />
              <div className="h-8 bg-rule rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* ── War-room header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4 fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
            Vue consolidée · Réseau UCAR · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
            Salle des opérations
          </h1>
          <p className="text-ink3 text-sm mt-1">
            {institutions.length + placeholders.length} établissements · Données en temps réel
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 num">Indice réseau</p>
          <p className="font-display text-5xl text-ink tracking-tighter2">{NETWORK_SCORE}</p>
          <p className="text-[11px] text-ink3 num mt-0.5">sur 100 · composite v3.2</p>
        </div>
      </div>

      <div className="glow-line" />

      {/* ── 5 KPI summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 fade-up-1">
        {[
          { label: 'Établissements critiques', value: criticalCount, sub: 'intervention requise', accent: 'text-crit', bg: 'bg-crit/5 border-crit/20' },
          { label: 'En vigilance',             value: warningCount,  sub: 'à surveiller',         accent: 'text-warn', bg: 'bg-warn/5 border-warn/20' },
          { label: 'En bonne santé',           value: goodCount,     sub: 'aucune alerte',        accent: 'text-ok',   bg: 'bg-ok/5 border-ok/20' },
          { label: 'Taux de réussite moyen',   value: `${avgReussite}%`, sub: 'réseau entier',   accent: 'text-sea',  bg: 'bg-sea/5 border-sea/20' },
          { label: 'Alertes actives',          value: allAlerts.length, sub: `dont ${allAlerts.filter(a=>a.severity==='critical').length} critiques`, accent: 'text-gold', bg: 'bg-gold/5 border-gold/20' },
        ].map(({ label, value, sub, accent, bg }) => (
          <div key={label} className={`rounded-lg border p-4 ${bg}`}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{label}</p>
            <p className={`font-display text-3xl tracking-tighter2 ${accent}`}>{value}</p>
            <p className="text-[11px] text-ink3 num mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── AI Briefing ── */}
      {briefing && (
        <div className="fade-up-2">
          <BriefingCard briefing={briefing} onAskQuestion={scrollToNL} />
        </div>
      )}

      {/* ── Institutions grid / ranking ── */}
      <div className="fade-up-2">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl text-ink tracking-tighter2">Carte du réseau</h2>
            <div className="flex items-center gap-4 text-xs text-ink3 mt-1">
              {(['critical','warning','good','no_data'] as Health[]).map((h) => (
                <span key={h} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${HEALTH_GLOW[h]}`} />
                  {h === 'critical' ? 'Critique' : h === 'warning' ? 'Vigilance' : h === 'good' ? 'Bon' : 'Sans données'}
                </span>
              ))}
            </div>
          </div>
          <div className="flex rounded-lg border border-rule overflow-hidden text-[12px]">
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 transition-colors ${view === 'grid' ? 'bg-ink text-paper' : 'text-ink2 hover:bg-paper2'}`}
            >
              Grille
            </button>
            <button
              onClick={() => setView('rank')}
              className={`px-4 py-2 border-l border-rule transition-colors ${view === 'rank' ? 'bg-ink text-paper' : 'text-ink2 hover:bg-paper2'}`}
            >
              Classement
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {institutions.map((inst) => (
              <InstitutionCard key={inst.id} institution={inst} />
            ))}
            {placeholders.map((name) => (
              <div
                key={name}
                className="rounded-lg border border-dashed border-rule bg-paper2/50 px-4 py-3 flex items-center gap-3"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${HEALTH_GLOW['no_data']}`} />
                <p className="text-sm text-ink3">{name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper2 border-b border-rule">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3 num">#</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Établissement</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Score risque</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Réussite</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Présence</th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.1em] text-ink3">État</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((inst, i) => (
                  <tr key={inst.id} className={`border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors ${HEALTH_CARD[inst.health]}`}>
                    <td className="px-4 py-3 num text-ink3 text-xs">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{inst.name}</p>
                      <p className="text-xs text-ink3 truncate max-w-[240px]">{inst.fullName}</p>
                    </td>
                    <td className="px-4 py-3 text-right num font-medium text-ink">{inst.riskScore}</td>
                    <td className="px-4 py-3 text-right num text-ink3">{inst.current.academique?.tauxReussite ?? '—'}%</td>
                    <td className="px-4 py-3 text-right num text-ink3">{inst.current.academique?.tauxPresence ?? '—'}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${healthToDot(inst.health)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${HEALTH_GLOW[inst.health]}`} />
                        {inst.health === 'critical' ? 'Critique' : inst.health === 'warning' ? 'Vigilance' : inst.health === 'good' ? 'Bon' : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bottom row: Top 5 alerts + NL query ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up-3">
        <div>
          <h2 className="font-display text-2xl text-ink tracking-tighter2 mb-3">Top 5 alertes réseau</h2>
          <AlertsPanel alerts={allAlerts.slice(0, 5)} title="" />
        </div>
        <div ref={nlRef}>
          <h2 className="font-display text-2xl text-ink tracking-tighter2 mb-3">Interroger les données</h2>
          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <p className="text-sm text-ink3 mb-3">
              Posez une question en langage naturel sur le réseau UCAR.
            </p>
            <NLQueryBar ref={nlRef} />
          </div>
        </div>
      </div>

    </div>
  )
}
