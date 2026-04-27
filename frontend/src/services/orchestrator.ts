import { fetchInstitutionDetail, fetchNetworkBriefing } from './adapters'

export const deepAnalysis = async (institutionId: number) => {
  const inst = await fetchInstitutionDetail(String(institutionId))
  if (!inst) return { anomalies: [], pulse: 'Institution introuvable.' }
  return {
    anomalies: inst.alerts.map((a) => ({
      metric_code: 'general',
      title: a.message,
      severity: a.severity,
    })),
    pulse: `${inst.name} — score risque ${inst.riskScore}, ${inst.alerts.length} alerte(s) active(s).`,
  }
}

export const networkBrief = async () => {
  const briefing = await fetchNetworkBriefing()
  return {
    network_summary: briefing.fullText,
    institutions: briefing.findings.map((f) => ({ code: f.institutionId, pulse: f.text })),
  }
}

export const triggerUploadPipeline = async () => ({ ok: true, status: 'queued_local' })
