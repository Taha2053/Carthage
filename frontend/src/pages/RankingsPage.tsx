import { useState, useEffect } from 'react'
import { getNetworkRankings } from '@/services/kpis'

const METRIC_OPTIONS = [
  { code: '', label: 'Tous les KPIs' },
  { code: 'SUCCESS_RATE', label: 'Taux de réussite' },
  { code: 'DROPOUT_RATE', label: "Taux d'abandon" },
  { code: 'ATTENDANCE_RATE', label: 'Taux de présence' },
  { code: 'BUDGET_EXEC', label: 'Exécution budgétaire' },
  { code: 'EMPLOYABILITY', label: 'Employabilité' },
  { code: 'ABSENTEEISM', label: 'Absentéisme RH' },
]

export default function RankingsPage() {
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [metricFilter, setMetricFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    getNetworkRankings(metricFilter || undefined, yearFilter || undefined)
      .then((data) => { setRankings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [metricFilter, yearFilter])

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="fade-up">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
          Classement réseau · mv_network_comparison
        </p>
        <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
          Classement des établissements
        </h1>
        <p className="text-ink3 text-sm mt-1">
          Comparaison en temps réel de toutes les institutions du réseau UCAR.
        </p>
      </div>

      <div className="glow-line" />

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap fade-up-1">
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1.5">Indicateur</label>
          <select
            value={metricFilter}
            onChange={(e) => setMetricFilter(e.target.value)}
            className="rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none transition-colors"
          >
            {METRIC_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1.5">Année académique</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-lg border border-rule bg-paper px-4 py-2.5 text-sm text-ink focus:border-gold focus:outline-none transition-colors"
          >
            <option value="">Toutes</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-1">Résultats</p>
          <p className="font-display text-3xl tracking-tighter2 text-ink">{rankings.length}</p>
        </div>
      </div>

      {/* Rankings table */}
      <div className="fade-up-2">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
                <div className="h-4 bg-rule rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : rankings.length > 0 ? (
          <div className="rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper2 border-b border-rule">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3 num w-14">#</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Établissement</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Indicateur</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Valeur</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Moy. réseau</th>
                  <th className="px-4 py-3 text-center text-[11px] uppercase tracking-[0.1em] text-ink3">Performance</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((row: any, i: number) => {
                  const diff = row.value - (row.network_avg ?? 0)
                  const isAbove = diff >= 0
                  return (
                    <tr key={i} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`
                          inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium num
                          ${row.network_rank === 1 ? 'bg-gold/20 text-gold-deep' :
                            row.network_rank === 2 ? 'bg-sea/10 text-sea' :
                            row.network_rank === 3 ? 'bg-ok/10 text-ok' : 'bg-paper2 text-ink3'}
                        `}>
                          {row.network_rank ?? i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">{row.institution_name ?? `Institution ${row.institution_id}`}</td>
                      <td className="px-4 py-3"><span className="pill">{row.metric_code ?? row.metric_name}</span></td>
                      <td className="px-4 py-3 text-right num font-medium text-ink">{row.value?.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right num text-ink3">{row.network_avg?.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`
                          inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium border
                          ${isAbove ? 'border-ok/30 bg-ok/5 text-ok' : 'border-crit/30 bg-crit/5 text-crit'}
                        `}>
                          {isAbove ? '▲' : '▼'} {Math.abs(diff).toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-8 text-center">
            <p className="text-ink3 text-sm">Aucune donnée de classement disponible.</p>
          </div>
        )}
      </div>
    </div>
  )
}
