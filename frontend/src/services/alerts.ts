import { supabase } from '@/lib/supabase'

export const getAlerts = async (institutionId?: number, severity?: string) => {
  let q = supabase
    .from('alerts')
    .select('*, dim_metric(code, name), dim_institution(code, short_name, name)')
    .order('created_at', { ascending: false })
  if (institutionId) q = q.eq('institution_id', institutionId)
  if (severity) q = q.eq('severity', severity)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getAlerts:', error.message)
    return []
  }
  return data ?? []
}

export const resolveAlert = async (alertId: number) => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', alertId)
    .select()
    .single()
  if (error) {
    console.error('[supabase] resolveAlert:', error.message)
    throw error
  }
  return data
}
