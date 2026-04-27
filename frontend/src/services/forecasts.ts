import { supabase } from '@/lib/supabase'

export const getForecasts = async (institutionId?: number, metricId?: number) => {
  let q = supabase.from('kpi_forecasts').select('*, dim_metric(code, name)')
  if (institutionId) q = q.eq('institution_id', institutionId)
  if (metricId) q = q.eq('metric_id', metricId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getForecasts:', error.message)
    return []
  }
  return data ?? []
}

export const getForecast = async (forecastId: number) => {
  const { data, error } = await supabase
    .from('kpi_forecasts')
    .select('*')
    .eq('id', forecastId)
    .single()
  if (error) throw error
  return data
}

/**
 * Local linear-trend forecast based on the last 6 fact_kpis values.
 * Backend IA endpoint is bypassed — we compute deterministic projections here.
 */
export const generateForecast = async (institutionId: number, metricId: number) => {
  const { data: history } = await supabase
    .from('fact_kpis')
    .select('value, time_id')
    .eq('institution_id', institutionId)
    .eq('metric_id', metricId)
    .order('time_id', { ascending: true })
    .limit(12)

  const values = (history ?? []).map((h: any) => Number(h.value)).filter((v) => !isNaN(v))
  if (values.length < 2) {
    return { institution_id: institutionId, metric_id: metricId, points: [], note: 'Données insuffisantes' }
  }
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = values.reduce((s, v) => s + v, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean)
    den += (i - xMean) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = yMean - slope * xMean

  const points = Array.from({ length: 6 }, (_, i) => ({
    period: i + 1,
    predicted: Math.round((intercept + slope * (n + i)) * 100) / 100,
  }))
  return {
    institution_id: institutionId,
    metric_id: metricId,
    points,
    historical: values,
  }
}
