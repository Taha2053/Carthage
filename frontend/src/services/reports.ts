import api from './api'

export const getReports = async (institutionId?: number, reportType?: string) => {
  const params: Record<string, string | number> = {}
  if (institutionId) params.institution_id = institutionId
  if (reportType) params.report_type = reportType
  const { data } = await api.get('/reports', { params })
  return data
}

export const getReport = async (reportId: number) => {
  const { data } = await api.get(`/reports/${reportId}`)
  return data
}

export const generateAIReport = async (institutionId: number, period: string) => {
  const { data } = await api.post('/reports/generate/ai', null, {
    params: { institution_id: institutionId, period },
  })
  return data
}

export const registerDownload = async (reportId: number) => {
  const { data } = await api.post(`/reports/${reportId}/download`)
  return data
}
