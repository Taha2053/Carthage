import api from './api'

export const getAlerts = async (institutionId?: number, severity?: string) => {
  const params: Record<string, string | number> = {}
  if (institutionId) params.institution_id = institutionId
  if (severity) params.severity = severity
  const { data } = await api.get('/alerts', { params })
  return data
}

export const resolveAlert = async (alertId: number) => {
  const { data } = await api.post(`/alerts/${alertId}/resolve`)
  return data
}
