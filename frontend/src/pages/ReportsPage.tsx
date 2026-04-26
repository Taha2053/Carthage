import { useState, useEffect } from 'react'
import { getReports, generateAIReport } from '@/services/reports'
import { useTranslation } from 'react-i18next'

export default function ReportsPage() {
  const { t, i18n } = useTranslation()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  useEffect(() => {
    getReports().then((data) => { setReports(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateAIReport(1, '2024-2025')
      setSelectedReport(result)
      const updated = await getReports()
      setReports(updated)
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
            {t('reports.subtitle')}
          </p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
            {t('reports.title')}
          </h1>
          <p className="text-ink3 text-sm mt-1">
            {t('reports.description')}
          </p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="btn-primary px-6 py-3 rounded-lg text-sm font-medium">
          {generating ? t('reports.generating') : t('reports.generateAI')}
        </button>
      </div>

      <div className="glow-line" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Report list */}
        <div className="lg:col-span-1 fade-up-1">
          <h2 className="font-display text-xl text-ink tracking-tighter2 mb-3">{t('reports.history')}</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
                  <div className="h-4 bg-rule rounded w-3/4 mb-2" />
                  <div className="h-3 bg-rule rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-2">
              {reports.map((report: any) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`
                    w-full text-left rounded-lg border p-4 transition-all lift
                    ${selectedReport?.id === report.id
                      ? 'border-gold/40 bg-gold/5'
                      : 'border-rule bg-paper hover:border-gold/20'}
                  `}
                >
                  <p className="font-medium text-ink text-sm truncate">{report.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="pill">{report.report_type ?? 'IA'}</span>
                    <span className="text-[11px] num text-ink3">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString(locale) : '—'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-8 text-center">
              <p className="text-ink3 text-sm">{t('reports.noReports')}</p>
            </div>
          )}
        </div>

        {/* Report viewer */}
        <div className="lg:col-span-2 fade-up-2">
          {selectedReport ? (
            <div className="rounded-xl border border-rule bg-paper p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl text-ink tracking-tighter2">
                  {selectedReport.title ?? selectedReport.report?.title ?? t('reports.report')}
                </h3>
                <span className="pill pill-accent">
                  {selectedReport.status ?? selectedReport.report?.status ?? 'published'}
                </span>
              </div>
              <div className="glow-line mb-4" />
              <div className="prose prose-sm max-w-none text-ink2 leading-relaxed whitespace-pre-wrap">
                {selectedReport.markdown_content ?? selectedReport.description ?? t('reports.contentUnavailable')}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-16 text-center">
              <div className="text-5xl mb-4">📋</div>
              <p className="font-display text-xl text-ink mb-2">{t('reports.selectReport')}</p>
              <p className="text-sm text-ink3">{t('reports.orGenerate')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
