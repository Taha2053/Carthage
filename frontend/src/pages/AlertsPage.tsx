import { useState, useEffect } from 'react'
import { getAlerts, resolveAlert } from '@/services/alerts'
import { useTranslation } from 'react-i18next'

export default function AlertsPage() {
  const { t, i18n } = useTranslation()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('')
  const [resolving, setResolving] = useState<number | null>(null)

  const SEVERITY_STYLE: Record<string, { labelKey: string; dot: string; card: string }> = {
    critical: { labelKey: 'alerts.criticalBadge', dot: 'dot-critical', card: 'border-crit/30 bg-crit/5' },
    warning:  { labelKey: 'alerts.vigilanceBadge', dot: 'dot-warning', card: 'border-warn/30 bg-warn/5' },
    info:     { labelKey: 'alerts.infoBadge', dot: 'dot-nodata', card: 'border-rule bg-paper2/50' },
  }

  useEffect(() => {
    setLoading(true)
    getAlerts(undefined, filter || undefined)
      .then((data) => { setAlerts(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  const handleResolve = async (alertId: number) => {
    setResolving(alertId)
    try {
      await resolveAlert(alertId)
      setAlerts((prev) => prev.filter((a) => a.id !== alertId))
    } catch (err) {
      console.error('Failed to resolve alert:', err)
    } finally {
      setResolving(null)
    }
  }

  const critCount = alerts.filter((a) => a.severity === 'critical').length
  const warnCount = alerts.filter((a) => a.severity === 'warning').length
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
            {t('alerts.subtitle')}
          </p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
            {t('alerts.title')}
          </h1>
          <p className="text-ink3 text-sm mt-1">
            {t('alerts.description')}
          </p>
        </div>
      </div>

      <div className="glow-line" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up-1">
        <div className="rounded-lg border p-4 bg-crit/5 border-crit/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('alerts.criticalLabel')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-crit">{critCount}</p>
        </div>
        <div className="rounded-lg border p-4 bg-warn/5 border-warn/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('alerts.vigilanceLabel')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-warn">{warnCount}</p>
        </div>
        <div className="rounded-lg border p-4 bg-ok/5 border-ok/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('alerts.totalActive')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-ok">{alerts.length}</p>
        </div>
        <div className="rounded-lg border p-4 bg-sea/5 border-sea/20 flex items-end">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-1.5">{t('alerts.filter')}</p>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded border border-rule bg-paper px-3 py-1.5 text-xs text-ink focus:border-gold focus:outline-none"
            >
              <option value="">{t('alerts.all')}</option>
              <option value="critical">{t('alerts.critical')}</option>
              <option value="warning">{t('alerts.vigilance')}</option>
              <option value="info">{t('alerts.info')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="fade-up-2 space-y-3">
        {loading ? (
          [1,2,3].map((i) => (
            <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-5 animate-pulse">
              <div className="h-4 bg-rule rounded w-2/3 mb-3" />
              <div className="h-3 bg-rule rounded w-1/2" />
            </div>
          ))
        ) : alerts.length > 0 ? (
          alerts.map((alert: any) => {
            const style = SEVERITY_STYLE[alert.severity] ?? SEVERITY_STYLE.info
            return (
              <div key={alert.id} className={`rounded-xl border p-5 transition-all ${style.card}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${style.dot}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="pill">{t(style.labelKey)}</span>
                        <span className="text-[11px] num text-ink3">
                          {alert.created_at ? new Date(alert.created_at).toLocaleString(locale) : '—'}
                        </span>
                      </div>
                      <p className="text-ink font-medium">{alert.message ?? `${t('alerts.anomalyDetected')} (ID: ${alert.id})`}</p>
                      {alert.explanation && (
                        <div className="mt-2 p-3 rounded-lg bg-paper/80 border border-rule">
                          <p className="text-[11px] uppercase tracking-[0.1em] text-gold-deep mb-1">{t('alerts.aiExplanation')}</p>
                          <p className="text-sm text-ink2 leading-relaxed">{alert.explanation}</p>
                        </div>
                      )}
                      {alert.recommended_action && (
                        <p className="mt-2 text-sm text-sea">
                          <span className="font-medium">{t('alerts.recommendedAction')}</span> {alert.recommended_action}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={resolving === alert.id}
                    className="px-3 py-1.5 rounded-lg border border-ok/30 text-ok text-xs font-medium hover:bg-ok/10 transition-colors flex-shrink-0"
                  >
                    {resolving === alert.id ? '...' : t('alerts.resolve')}
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <p className="font-display text-xl text-ink mb-2">{t('alerts.noActiveAlerts')}</p>
            <p className="text-sm text-ink3">{t('alerts.allNormal')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
