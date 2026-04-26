import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Info, XCircle } from 'lucide-react'
import type { Alert } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

interface Props {
  alerts: Alert[]
  title?: string
}

const SeverityIcon = ({ severity }: { severity: Alert['severity'] }) => {
  if (severity === 'critical') return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
  if (severity === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
  return <Info className="h-4 w-4 text-gray-400 shrink-0" />
}

const severityBg = (severity: Alert['severity']) => {
  if (severity === 'critical') return 'border-l-2 border-red-400 bg-red-50'
  if (severity === 'warning') return 'border-l-2 border-amber-400 bg-amber-50'
  return 'border-l-2 border-gray-200 bg-gray-50'
}

export default function AlertsPanel({ alerts, title }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const displayTitle = title ?? t('alerts.activeAlerts')

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{displayTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-4">{t('alerts.noActiveAlertsShort')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {displayTitle}
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600 font-semibold">
            {alerts.filter((a) => a.severity === 'critical').length} {t('alerts.criticalCount')}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts
          .sort((a, b) => {
            const order = { critical: 0, warning: 1, info: 2 }
            return order[a.severity] - order[b.severity]
          })
          .map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-2 rounded-md p-2.5 cursor-pointer hover:opacity-80 transition-opacity ${severityBg(alert.severity)}`}
              onClick={() => navigate(`/institution/${alert.institutionId}`)}
            >
              <SeverityIcon severity={alert.severity} />
              <p className="text-xs text-gray-700 leading-snug">{alert.message}</p>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
