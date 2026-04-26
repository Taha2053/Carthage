import api from './api'
import type { Briefing } from '@/types'

export const getUCARBriefing = async (): Promise<Briefing> => {
  const { data } = await api.post('/orchestrator/network-brief')
  return {
    generatedAt: new Date().toISOString(),
    weekLabel: `Semaine ${Math.ceil(new Date().getDate() / 7)}`,
    findings: (data.institutions ?? []).map((inst: { institution: string; pulse: string; code: string }) => ({
      severity: 'info' as const,
      text: inst.pulse,
      institutionId: inst.code,
      domain: 'general',
    })),
    fullText: data.network_summary ?? '',
  }
}

export const getInstitutionBriefing = async (id: string): Promise<Briefing | null> => {
  const numId = parseInt(id)
  if (isNaN(numId)) return null
  const { data } = await api.post(`/orchestrator/analyse?institution_id=${numId}`)
  return {
    generatedAt: new Date().toISOString(),
    weekLabel: `Semaine ${Math.ceil(new Date().getDate() / 7)}`,
    findings: (data.anomalies ?? []).map((a: { metric_code: string; title: string; severity: string }) => ({
      severity: a.severity === 'critical' ? 'critical' : 'warning',
      text: a.title,
      institutionId: id,
      domain: a.metric_code,
    })),
    fullText: data.pulse ?? '',
  }
}