import { useNavigate } from 'react-router-dom'
import type { Institution } from '@/types'
import { InstitutionLogo } from './InstitutionLogo'

const HEALTH_BORDER: Record<string, string> = {
  critical: 'border-l-crit bg-gradient-to-r from-crit/5 to-paper',
  warning:  'border-l-warn bg-gradient-to-r from-warn/5 to-paper',
  good:     'border-l-ok   bg-gradient-to-r from-ok/5   to-paper',
  no_data:  'border-l-ink3 bg-gradient-to-r from-ink3/5 to-paper',
}

const HEALTH_LABEL: Record<string, { text: string; cls: string }> = {
  critical: { text: 'Critique',     cls: 'bg-crit/10 text-crit border-crit/20' },
  warning:  { text: 'Vigilance',    cls: 'bg-warn/10 text-warn border-warn/20' },
  good:     { text: 'Bon',          cls: 'bg-ok/10   text-ok   border-ok/20' },
  no_data:  { text: 'Sans données', cls: 'bg-ink3/10 text-ink3 border-ink3/20' },
}

const DOT: Record<string, string> = {
  critical: 'dot-critical',
  warning:  'dot-warning',
  good:     'dot-good',
  no_data:  'dot-nodata',
}

interface Props { institution: Institution }

export default function InstitutionCard({ institution }: Props) {
  const navigate = useNavigate()
  const { id, name, fullName, health, riskScore, alerts, current } = institution
  const reussite = current.academique?.tauxReussite
  const presence = current.academique?.tauxPresence
  const label = HEALTH_LABEL[health] ?? HEALTH_LABEL.no_data

  return (
    <button
      onClick={() => navigate(`/institution/${id}`)}
      className={`w-full text-left rounded-xl border border-rule border-l-4 p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${HEALTH_BORDER[health]}`}
    >
      <div className="flex items-start gap-3">
        <InstitutionLogo institutionId={id} size={38} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-display font-semibold text-[15px] text-ink tracking-tightish truncate">{name}</p>
            <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${label.cls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${DOT[health]}`} />
              {label.text}
            </span>
          </div>
          <p className="text-[11px] text-ink3 truncate mt-0.5">{fullName}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] text-ink3 num border-t border-rule pt-3">
        {reussite !== undefined && (
          <span>Réussite <strong className="text-ink">{reussite}%</strong></span>
        )}
        {presence !== undefined && (
          <span>Présence <strong className="text-ink">{presence}%</strong></span>
        )}
        <span className="ml-auto">Risque <strong className="text-ink">{riskScore}</strong></span>
      </div>

      {alerts.length > 0 && (
        <p className="mt-2 text-[11px] text-warn num">
          ⚠ {alerts.length} alerte{alerts.length > 1 ? 's' : ''} active{alerts.length > 1 ? 's' : ''}
        </p>
      )}
    </button>
  )
}
