import { useState } from 'react'
import { deepAnalysis, networkBrief } from '@/services/orchestrator'
import { useTranslation } from 'react-i18next'

export default function OrchestratorPage() {
  const { t } = useTranslation()
  const [institutionId, setInstitutionId] = useState(1)
  const [includeReport, setIncludeReport] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [networkResult, setNetworkResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'analyse' | 'network'>('analyse')

  const handleDeepAnalysis = async () => {
    setLoading(true)
    setResult(null)
    try {
      const data = await deepAnalysis(institutionId, includeReport)
      setResult(data)
    } catch (err) {
      console.error('Deep analysis failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNetworkBrief = async () => {
    setLoading(true)
    setNetworkResult(null)
    try {
      const data = await networkBrief()
      setNetworkResult(data)
    } catch (err) {
      console.error('Network brief failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="fade-up">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
          {t('orchestrator.subtitle')}
        </p>
        <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
          {t('orchestrator.title')}
        </h1>
        <p className="text-ink3 text-sm mt-1">
          {t('orchestrator.description')}
        </p>
      </div>

      <div className="glow-line" />

      {/* Tab toggle */}
      <div className="flex rounded-lg border border-rule overflow-hidden text-[12px] w-fit fade-up-1">
        <button
          onClick={() => setTab('analyse')}
          className={`px-5 py-2.5 transition-colors ${tab === 'analyse' ? 'bg-ink text-paper' : 'text-ink2 hover:bg-paper2'}`}
        >
          {t('orchestrator.deepAnalysis')}
        </button>
        <button
          onClick={() => setTab('network')}
          className={`px-5 py-2.5 border-l border-rule transition-colors ${tab === 'network' ? 'bg-ink text-paper' : 'text-ink2 hover:bg-paper2'}`}
        >
          {t('orchestrator.networkBriefing')}
        </button>
      </div>

      {tab === 'analyse' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up-2">
          {/* Controls */}
          <div className="rounded-xl border border-rule bg-paper p-6 shadow-sm">
            <h3 className="font-display text-xl text-ink mb-4">{t('orchestrator.analysisParams')}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1.5">{t('orchestrator.institutionId')}</label>
                <input
                  type="number"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(Number(e.target.value))}
                  className="w-full rounded-lg border border-rule bg-paper2/50 px-4 py-2.5 text-sm text-ink num focus:border-gold focus:outline-none transition-colors"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeReport}
                  onChange={(e) => setIncludeReport(e.target.checked)}
                  className="rounded border-rule accent-gold"
                />
                <span className="text-sm text-ink2">{t('orchestrator.includeReport')}</span>
              </label>
              <button
                onClick={handleDeepAnalysis}
                disabled={loading}
                className="w-full btn-primary py-3 rounded-lg text-sm font-medium"
              >
                {loading ? t('orchestrator.analyzing') : t('orchestrator.launchAnalysis')}
              </button>
            </div>

            {/* Agents run */}
            {result && (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('orchestrator.agentsRun')}</p>
                <div className="flex flex-wrap gap-2">
                  {(result.agents_run ?? []).map((agent: string) => (
                    <span key={agent} className="pill pill-accent">{agent}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            {result ? (
              <div className="space-y-4">
                {/* Pulse */}
                {result.pulse && (
                  <div className="rounded-xl border border-gold/20 bg-gold/5 p-5">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-gold-deep mb-2">{t('orchestrator.aiPulse')}</p>
                    <p className="text-sm text-ink2 leading-relaxed whitespace-pre-wrap">{result.pulse}</p>
                  </div>
                )}

                {/* Anomalies */}
                {result.anomalies?.length > 0 && (
                  <div className="rounded-xl border border-crit/20 bg-crit/5 p-5">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-crit mb-2">
                      {t('orchestrator.anomaliesDetected')} ({result.anomalies.length})
                    </p>
                    <div className="space-y-2">
                      {result.anomalies.map((a: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-crit mt-2 flex-shrink-0" />
                          <p className="text-sm text-ink2">{a.title}: {a.explanation?.substring(0, 120)}...</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forecasts */}
                {result.forecasts?.length > 0 && (
                  <div className="rounded-xl border border-sea/20 bg-sea/5 p-5">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-sea mb-2">
                      {t('orchestrator.forecastsLabel')} ({result.forecasts.length})
                    </p>
                    <div className="space-y-2">
                      {result.forecasts.map((f: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-ink2">{f.metric_code}</span>
                          <span className="num text-ink3">{t('orchestrator.confidence')}: {(f.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report markdown */}
                {result.report_markdown && (
                  <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm max-h-96 overflow-y-auto">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-gold-deep mb-2">{t('orchestrator.aiReport')}</p>
                    <div className="prose prose-sm max-w-none text-ink2 leading-relaxed whitespace-pre-wrap">
                      {result.report_markdown}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-16 text-center">
                <div className="text-5xl mb-4">🧠</div>
                <p className="font-display text-xl text-ink mb-2">{t('orchestrator.readyToAnalyze')}</p>
                <p className="text-sm text-ink3">{t('orchestrator.configureAndLaunch')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Network Brief tab */
        <div className="fade-up-2">
          <button
            onClick={handleNetworkBrief}
            disabled={loading}
            className="btn-primary px-6 py-3 rounded-lg text-sm font-medium mb-6"
          >
            {loading ? t('orchestrator.generatingBrief') : t('orchestrator.generateNetworkBrief')}
          </button>

          {networkResult ? (
            <div className="space-y-6">
              {/* Network summary */}
              <div className="rounded-xl border border-gold/20 bg-gold/5 p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] uppercase tracking-[0.1em] text-gold-deep">{t('orchestrator.executiveSummary')}</p>
                  <span className="pill pill-accent">{networkResult.institution_count} {t('common.establishments')}</span>
                </div>
                <p className="text-sm text-ink2 leading-relaxed whitespace-pre-wrap">{networkResult.network_summary}</p>
              </div>

              {/* Per-institution pulses */}
              <h3 className="font-display text-xl text-ink tracking-tighter2">{t('orchestrator.individualBriefings')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(networkResult.institutions ?? []).map((inst: any, i: number) => (
                  <div key={i} className="rounded-xl border border-rule bg-paper p-5 lift">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="pill pill-ink">{inst.code}</span>
                      <p className="font-medium text-ink text-sm">{inst.institution}</p>
                    </div>
                    <p className="text-sm text-ink2 leading-relaxed whitespace-pre-wrap">{inst.pulse}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-10 text-center">
              <div className="text-5xl mb-4">🌐</div>
              <p className="font-display text-xl text-ink mb-2">{t('orchestrator.networkBriefTitle')}</p>
              <p className="text-sm text-ink3">
                {t('orchestrator.networkBriefDesc')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
