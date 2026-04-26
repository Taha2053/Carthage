import api from './api'

export const getForecasts = async (institutionId?: number, metricId?: number) => {
  const params: Record<string, number> = {}
  if (institutionId) params.institution_id = institutionId
  if (metricId) params.metric_id = metricId
  const { data } = await api.get('/forecasts', { params })
  return data
}

export const getForecast = async (forecastId: number) => {
  const { data } = await api.get(`/forecasts/${forecastId}`)
  return data
}

export const generateForecast = async (institutionId: number, metricId: number) => {
  const { data } = await api.post('/forecasts/generate/ai', null, {
    params: { institution_id: institutionId, metric_id: metricId },
  })
  return data
}
