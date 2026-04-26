import api from './api'

export const getKPIs = async (institutionId?: number, domainCode?: string) => {
  const params: Record<string, string | number> = {}
  if (institutionId) params.institution_id = institutionId
  if (domainCode) params.domain_code = domainCode
  const { data } = await api.get('/kpis', { params })
  return data
}

export const getNetworkRankings = async (metricCode?: string, academicYear?: string) => {
  const params: Record<string, string> = {}
  if (metricCode) params.metric_code = metricCode
  if (academicYear) params.academic_year = academicYear
  const { data } = await api.get('/kpis/rankings', { params })
  return data
}

export const compareInstitutions = async (metricCode: string) => {
  const { data } = await api.get('/kpis/compare', { params: { metric_code: metricCode } })
  return data
}

export const getNetworkComparison = async (metricCode?: string, academicYear?: string) => {
  const params: Record<string, string> = {}
  if (metricCode) params.metric_code = metricCode
  if (academicYear) params.academic_year = academicYear
  const { data } = await api.get('/kpis/network-comparison', { params })
  return data
}

export const getSuccessRates = async (institutionId?: number, academicYear?: string) => {
  const params: Record<string, string | number> = {}
  if (institutionId) params.institution_id = institutionId
  if (academicYear) params.academic_year = academicYear
  const { data } = await api.get('/kpis/success-rate', { params })
  return data
}

export const getDropoutRates = async (institutionId?: number, academicYear?: string) => {
  const params: Record<string, string | number> = {}
  if (institutionId) params.institution_id = institutionId
  if (academicYear) params.academic_year = academicYear
  const { data } = await api.get('/kpis/dropout-rate', { params })
  return data
}

export const getBudgetExecution = async (institutionId?: number) => {
  const params: Record<string, number> = {}
  if (institutionId) params.institution_id = institutionId
  const { data } = await api.get('/kpis/budget-execution', { params })
  return data
}

export const getHRSummary = async (institutionId?: number) => {
  const params: Record<string, number> = {}
  if (institutionId) params.institution_id = institutionId
  const { data } = await api.get('/kpis/hr-summary', { params })
  return data
}

export const getEmployability = async (institutionId?: number) => {
  const params: Record<string, number> = {}
  if (institutionId) params.institution_id = institutionId
  const { data } = await api.get('/kpis/employability', { params })
  return data
}

export const overrideKPI = async (factId: number, newValue: number, reason: string, userId: number) => {
  const { data } = await api.put(`/kpis/${factId}/override`, {
    new_value: newValue,
    reason,
    user_id: userId,
  })
  return data
}

export const refreshViews = async () => {
  const { data } = await api.post('/kpis/refresh')
  return data
}
