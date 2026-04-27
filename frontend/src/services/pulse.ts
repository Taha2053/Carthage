import type { Briefing } from '@/types'
import { fetchNetworkBriefing, fetchInstitutionAlerts, fetchInstitutionById } from './adapters'

export const getUCARBriefing = async (): Promise<Briefing> => fetchNetworkBriefing()

export const getInstitutionBriefing = async (id: string): Promise<Briefing | null> => {
  const numId = parseInt(id)
  if (isNaN(numId)) return null
  const [inst, alerts] = await Promise.all([
    fetchInstitutionById(numId),
    fetchInstitutionAlerts(numId),
  ])
  if (!inst) return null
  return {
    generatedAt: new Date().toISOString(),
    weekLabel: `Semaine ${Math.ceil(new Date().getDate() / 7)}`,
    findings: alerts.map((a) => ({
      severity: a.severity,
      text: a.message ?? a.explanation ?? `Alerte ${a.dim_metric?.code ?? ''}`,
      institutionId: id,
      domain: a.dim_metric?.code ?? 'general',
    })),
    fullText: alerts.length
      ? `${alerts.length} alertes actives pour ${inst.name}.`
      : `Aucune alerte active pour ${inst.name}.`,
  }
}
