import { supabase } from '@/lib/supabase'

export const getReports = async (institutionId?: number, reportType?: string) => {
  let q = supabase
    .from('reports')
    .select('*, dim_institution(code, short_name, name)')
    .order('created_at', { ascending: false })
  if (institutionId) q = q.eq('institution_id', institutionId)
  if (reportType) q = q.eq('report_type', reportType)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getReports:', error.message)
    return []
  }
  return data ?? []
}

export const getReport = async (reportId: number) => {
  const { data, error } = await supabase.from('reports').select('*').eq('id', reportId).single()
  if (error) throw error
  return data
}

export const generateAIReport = async (institutionId: number, period: string) => {
  const payload = {
    institution_id: institutionId,
    report_type: 'ai_synthesis',
    title: `Synthèse IA — ${period}`,
    period,
    status: 'generated',
    content: 'Rapport généré localement (backend IA non démarré).',
    created_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('reports').insert(payload).select().single()
  if (error) {
    console.error('[supabase] generateAIReport:', error.message)
    return payload
  }
  return data
}

export const registerDownload = async (reportId: number) => ({ id: reportId, ok: true })
