import api from './api'
import type { Briefing } from '@/types'
import { mockUCARBriefing, mockInstitutions } from '@/mock/data'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const getUCARBriefing = async (): Promise<Briefing> => {
  if (USE_MOCK) return Promise.resolve(mockUCARBriefing)
  const { data } = await api.post('/orchestrator/network-brief')
  // Transform backend response to Briefing type
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
  if (USE_MOCK) {
    const inst = mockInstitutions.find((i) => i.id === id)
    return Promise.resolve(inst?.briefing ?? null)
  }
  const { data } = await api.post(`/orchestrator/analyse?institution_id=${id}`)
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
