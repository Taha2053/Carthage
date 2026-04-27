import { supabase } from '@/lib/supabase'

export const getKPIs = async (institutionId?: number, domainCode?: string) => {
  let q = supabase
    .from('fact_kpis')
    .select('*, dim_metric(code, name, domain_id, dim_domain(code, name))')
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getKPIs:', error.message)
    return []
  }
  if (domainCode) {
    return (data ?? []).filter((k: any) => k.dim_metric?.dim_domain?.code === domainCode)
  }
  return data ?? []
}

export const getNetworkRankings = async (metricCode = 'success_rate') => {
  const { data: metric } = await supabase
    .from('dim_metric')
    .select('id')
    .eq('code', metricCode)
    .maybeSingle()
  if (!metric) return []

  const { data, error } = await supabase
    .from('fact_kpis')
    .select('institution_id, value, dim_institution(id, code, short_name, name, city)')
    .eq('metric_id', metric.id)
    .order('value', { ascending: false })
  if (error) {
    console.error('[supabase] getNetworkRankings:', error.message)
    return []
  }

  const seen = new Set<number>()
  const ranked: any[] = []
  for (const row of data ?? []) {
    if (seen.has(row.institution_id)) continue
    seen.add(row.institution_id)
    ranked.push({
      institution_id: row.institution_id,
      institution: (row as any).dim_institution,
      value: row.value,
      rank: ranked.length + 1,
    })
  }
  return ranked
}

export const compareInstitutions = async (metricCode: string) =>
  getNetworkRankings(metricCode)

export const getNetworkComparison = async (metricCode = 'success_rate') =>
  getNetworkRankings(metricCode)

export const getSuccessRates = async (institutionId?: number) => {
  const all = await getKPIs(institutionId)
  return all.filter((k: any) => k.dim_metric?.code === 'success_rate')
}

export const getDropoutRates = async (institutionId?: number) => {
  const all = await getKPIs(institutionId)
  return all.filter((k: any) => k.dim_metric?.code === 'dropout_rate')
}

export const getBudgetExecution = async (institutionId?: number) => {
  let q = supabase.from('fact_budget').select('*')
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getBudgetExecution:', error.message)
    return []
  }
  return data ?? []
}

export const getHRSummary = async (institutionId?: number) => {
  let q = supabase.from('fact_hr_metrics').select('*')
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getHRSummary:', error.message)
    return []
  }
  return data ?? []
}

export const getEmployability = async (institutionId?: number) => {
  const all = await getKPIs(institutionId)
  return all.filter((k: any) => k.dim_metric?.code === 'employability_rate')
}

export const overrideKPI = async (factId: number, newValue: number) => {
  const { data, error } = await supabase
    .from('fact_kpis')
    .update({ value: newValue })
    .eq('id', factId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const refreshViews = async () => ({ ok: true })
