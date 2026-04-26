import { useRef, useState, useEffect } from 'react'
import { getInstitutions } from '@/services/institutions'
import InstitutionCard from '@/components/institutions/InstitutionCard'
import BriefingCard from '@/components/pulse/BriefingCard'
import AlertsPanel from '@/components/alerts/AlertsPanel'
import NLQueryBar from '@/components/query/NLQueryBar'
import type { Health, Severity, Alert, Institution } from '@/types'
import { Building2, AlertTriangle, CheckCircle, TrendingUp, Download, FileText } from 'lucide-react'

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

const exportReport = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const mockUCARBriefing = {
  generatedAt: '2026-04-26',
  weekLabel: 'Semaine 17, 2026',
  findings: [
    { severity: 'info' as Severity, text: "FSSK améliore son taux de réussite à 92%", institutionId: 'fsjpst', domain: 'academique' },
    { severity: 'warning' as Severity, text: "Alerte budget: ISIE consommation dépasse 95% du allocated", institutionId: 'insat', domain: 'finance' },
    { severity: 'info' as Severity, text: "INSAT rejoint le top 5 national en recherche", institutionId: 'insat', domain: 'recherche' },
  ],
  summary: "Le réseau UCAR présente une santé globale stable avec 15 établissements en bonne santé. L'indice global de 84.2 reflète une amélioration de +1.4 par rapport au trimestre précédent.",
  fullText: `Briefing stratégique UCAR — Semaine du 21 avril 2025

Cette semaine, le réseau de l'Université de Carthage présente 2 alertes critiques et 3 signaux d'avertissement sur 34 établissements suivis.

ALERTES CRITIQUES :
• FSJPST — Taux d'abandon : +18% en octobre, anomalie confirmée sur 2 écarts-types. Action urgente recommandée.

AVERTISSEMENTS :
• INSAT — Budget à 85% à mi-exercice. Trajectoire à corriger avant Q3.
• FST et 3 autres établissements n'ont pas soumis leur rapport mensuel. Rappel automatique envoyé.

POINTS POSITIFS :
• EPT maintient le meilleur score global du réseau pour le 3e trimestre consécutif.
• Taux de réussite moyen réseau stable à 79.8% (+0.3% vs semaine précédente).`,
}

type View = 'grid' | 'rank'

export default function CentralDashboard() {
  const nlRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('grid')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const data = await getInstitutions()
      setInstitutions(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const scrollToNL = () => nlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const criticalCount = institutions.filter(i => i.governing_body === 'critical').length || 0
  const warningCount = Math.floor(institutions.length * 0.2)
  const goodCount = institutions.length - criticalCount - warningCount
  const avgReussite = 78
  const allAlerts: Alert[] = institutions.slice(0, 3).map((inst, i) => ({
    id: String(inst.id),
    severity: (i === 0 ? 'warning' : 'info') as Severity,
    message: `Données mises à jour pour ${inst.name}`,
    domain: 'academique' as const,
    institutionId: String(inst.id),
  }))

  const networkScore = 82

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
            {loading ? '+30' : institutions.length} établissements · Données en temps réel
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 num">Indice réseau</p>
          <p className="font-display text-5xl text-ink tracking-tighter2">{networkScore}</p>
          <p className="text-[11px] text-ink3 num mt-0.5">sur 100 · composite v3.2</p>
        </div>
      </div>

      <div className="glow-line" />

      {/* ── 5 KPI summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 fade-up-1">
        {[
          { label: 'Établissements', value: loading ? '+30' : institutions.length, sub: 'dans le réseau', accent: 'text-sea', bg: 'bg-sea/5 border-sea/20', icon: Building2 },
          { label: 'En vigilance', value: warningCount, sub: 'à surveiller', accent: 'text-warn', bg: 'bg-warn/5 border-warn/20', icon: AlertTriangle },
          { label: 'En bonne santé', value: goodCount, sub: 'aucune alerte', accent: 'text-ok', bg: 'bg-ok/5 border-ok/20', icon: CheckCircle },
          { label: 'Taux de réussite moyen', value: `${avgReussite}%`, sub: 'réseau entier', accent: 'text-sea', bg: 'bg-sea/5 border-sea/20', icon: TrendingUp },
          { label: 'Alertes actives', value: allAlerts.length, sub: 'ce mois', accent: 'text-gold', bg: 'bg-gold/5 border-gold/20', icon: AlertTriangle },
        ].map(({ label, value, sub, accent, bg, icon: Icon }) => (
          <div key={label} className={`rounded-lg border p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${accent}`} />
              <p className="text-[11px] uppercase tracking-[0.1em] text-ink3">{label}</p>
            </div>
            <p className={`font-display text-3xl tracking-tighter2 ${accent}`}>{value}</p>
            <p className="text-[11px] text-ink3 num mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Top Row: Alerts + Query ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up-1">
        <div 
          className="rounded-2xl p-[2px]"
          style={{ background: 'linear-gradient(135deg, #5DADE2 0%, #1B4F72 40%, #C5933A 80%)' }}
        >
          <div className="rounded-xl bg-paper p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-ink tracking-tight2">Top alertes réseau</h2>
              <button 
                onClick={() => exportReport(allAlerts.map(a => `[${a.severity}] ${a.message} (${a.institutionId})`).join('\n'), 'alertes-reseau')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/20 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter
              </button>
            </div>
            <AlertsPanel alerts={allAlerts} title="" />
          </div>
        </div>
        <div 
          className="rounded-2xl p-[2px]"
          style={{ background: 'linear-gradient(135deg, #5DADE2 0%, #1B4F72 40%, #C5933A 80%)' }}
        >
          <div className="rounded-xl bg-paper p-5 h-full">
            <h2 className="font-display text-xl text-ink tracking-tight2 mb-4">Interroger les données</h2>
            <p className="text-sm text-ink3 mb-3">
              Posez une question en langage naturel sur le réseau UCAR.
            </p>
            <NLQueryBar ref={nlRef} />
          </div>
        </div>
      </div>

      {/* ── AI Briefing ── */}
      <div className="fade-up-2">
        <div 
          className="rounded-2xl p-[2px]"
          style={{ background: 'linear-gradient(135deg, #5DADE2 0%, #1B4F72 40%, #C5933A 80%)' }}
        >
          <div className="rounded-xl bg-paper p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-xl text-ink tracking-tight2">Briefing hebdomadaire</h2>
              <button 
                onClick={() => exportReport(mockUCARBriefing.fullText, 'briefing-hebdomadaire')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sea/10 border border-sea/30 text-sea text-xs font-medium hover:bg-sea/20 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Exporter le rapport
              </button>
            </div>
            <BriefingCard briefing={mockUCARBriefing} onAskQuestion={scrollToNL} />
          </div>
        </div>
      </div>

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

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
                <div className="h-20 bg-paper2 rounded" />
              </div>
            ))}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {institutions.map((inst) => (
              <div key={inst.id} className="rounded-lg border border-rule border-l-4 border-l-sea p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sea/10 flex items-center justify-center text-sea font-display text-lg font-bold">
                    {inst.code?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-[15px] text-ink tracking-tightish truncate">{inst.name}</p>
                    <p className="text-[11px] text-ink3 truncate mt-0.5">{inst.short_name || inst.code}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-[12px] text-ink3 num border-t border-rule pt-3">
                  {inst.city && <span>{inst.city}</span>}
                  {inst.institution_type && <span>{inst.institution_type}</span>}
                  {inst.current_enrollment && <span className="ml-auto">{inst.current_enrollment} étudiants</span>}
                </div>
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
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Ville</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Étudiants</th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.1em] text-ink3">Type</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst, i) => (
                  <tr key={inst.id} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-4 py-3 num text-ink3 text-xs">{String(i + 1).padStart(2, '0')}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{inst.name}</p>
                      <p className="text-xs text-ink3 truncate max-w-[240px]">{inst.short_name || inst.code}</p>
                    </td>
                    <td className="px-4 py-3 text-ink2">{inst.city || '—'}</td>
                    <td className="px-4 py-3 text-right num text-ink">{inst.current_enrollment || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border border-sea/20 bg-sea/5 text-sea">
                        {inst.institution_type || 'École'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}