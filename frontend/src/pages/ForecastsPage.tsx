import { useState, useEffect } from 'react'
import { getForecasts, generateForecast } from '@/services/forecasts'

export default function ForecastsPage() {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    getForecasts().then((data) => { setForecasts(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      await generateForecast(1, 1) // default institution + metric
      const updated = await getForecasts()
      setForecasts(updated)
    } catch (err) {
      console.error('Forecast generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
            Prédictions · Risk Forecaster IA
          </p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
            Prévisions KPI
          </h1>
          <p className="text-ink3 text-sm mt-1">
            Projections générées par l'IA basées sur les tendances historiques.
          </p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary px-6 py-3 rounded-lg text-sm font-medium">
          {generating ? 'Analyse en cours...' : '✦ Nouvelle prévision IA'}
        </button>
      </div>

      <div className="glow-line" />

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up-1">
        {[
          { label: 'Prévisions totales', value: forecasts.length, accent: 'text-sea', bg: 'bg-sea/5 border-sea/20' },
          { label: 'Confiance haute', value: forecasts.filter((f: any) => f.confidence_upper > 80).length, accent: 'text-ok', bg: 'bg-ok/5 border-ok/20' },
          { label: 'Confiance moyenne', value: forecasts.filter((f: any) => f.confidence_upper <= 80 && f.confidence_upper > 50).length, accent: 'text-warn', bg: 'bg-warn/5 border-warn/20' },
          { label: 'Risque élevé', value: forecasts.filter((f: any) => f.confidence_upper <= 50).length, accent: 'text-crit', bg: 'bg-crit/5 border-crit/20' },
        ].map(({ label, value, accent, bg }) => (
          <div key={label} className={`rounded-lg border p-4 ${bg}`}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{label}</p>
            <p className={`font-display text-3xl tracking-tighter2 ${accent}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Forecasts table */}
      <div className="fade-up-2">
        <h2 className="font-display text-2xl text-ink tracking-tighter2 mb-3">Toutes les prévisions</h2>
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map((i) => (
              <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
                <div className="h-4 bg-rule rounded w-3/4 mb-2" />
                <div className="h-3 bg-rule rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : forecasts.length > 0 ? (
          <div className="rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper2 border-b border-rule">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Institution</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Métrique</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Année cible</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Valeur prédite</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">Intervalle</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Modèle</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((fc: any, i: number) => (
                  <tr key={i} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-4 py-3 text-ink font-medium">{fc.institution_id}</td>
                    <td className="px-4 py-3 text-ink">{fc.metric_id}</td>
                    <td className="px-4 py-3 text-right num text-ink">{fc.target_year}</td>
                    <td className="px-4 py-3 text-right num font-medium text-ink">{fc.predicted_value?.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right num text-ink3">
                      [{fc.confidence_lower?.toFixed(1)} – {fc.confidence_upper?.toFixed(1)}]
                    </td>
                    <td className="px-4 py-3"><span className="pill">{fc.model_used ?? 'Mistral'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-8 text-center">
            <p className="text-ink3 text-sm">Aucune prévision disponible. Cliquez sur "Nouvelle prévision IA" pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  )
}
