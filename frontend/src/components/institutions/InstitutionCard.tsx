import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import type { Institution } from '@/types'
import { healthToColor, healthToBadgeColor, healthToLabel } from '@/utils/health'
import { cn } from '@/lib/utils'

interface Props {
  institution: Institution
  compact?: boolean
}

export default function InstitutionCard({ institution, compact }: Props) {
  const navigate = useNavigate()
  const { id, name, fullName, health, current, alerts, riskScore } = institution

  return (
    <button
      onClick={() => navigate(`/institution/${id}`)}
      className={cn(
        'w-full text-left rounded-lg border-l-4 bg-white shadow-sm transition-shadow hover:shadow-md',
        healthToColor(health),
        compact ? 'p-3' : 'p-4',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          {!compact && (
            <p className="text-xs text-gray-400 truncate mt-0.5">{fullName}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border', healthToBadgeColor(health))}>
            {healthToLabel(health)}
          </span>
          {alerts.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle className="h-3 w-3" />
              {alerts.length}
            </span>
          )}
        </div>
      </div>

      {health !== 'no_data' && current.academique && !compact && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded bg-gray-50 px-2 py-1">
            <p className="text-[10px] text-gray-400">Réussite</p>
            <p className="text-sm font-semibold text-gray-800">{current.academique.tauxReussite}%</p>
          </div>
          <div className="rounded bg-gray-50 px-2 py-1">
            <p className="text-[10px] text-gray-400">Budget exécuté</p>
            <p className="text-sm font-semibold text-gray-800">{current.finance?.tauxExecution ?? '—'}%</p>
          </div>
        </div>
      )}

      {health !== 'no_data' && !compact && (
        <div className="mt-2 flex items-center gap-1">
          <div className="h-1.5 flex-1 rounded-full bg-gray-100">
            <div
              className={cn('h-1.5 rounded-full', health === 'critical' ? 'bg-red-400' : health === 'warning' ? 'bg-amber-400' : 'bg-emerald-400')}
              style={{ width: `${riskScore}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">Score risque: {riskScore}</span>
        </div>
      )}

      {health === 'no_data' && !compact && (
        <p className="mt-2 text-xs text-gray-400">Rapport non soumis ce mois-ci</p>
      )}
    </button>
  )
}
