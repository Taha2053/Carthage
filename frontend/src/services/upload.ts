import { supabase } from '@/lib/supabase'

export interface UploadResult {
  extractedRows: { kpi: string; valeur: string; domaine: string }[]
  confidence: number
}

/**
 * Client-side parsing of CSV/Excel uploads.
 * Logs the upload event in `upload_log` so history reflects the action.
 */
export const uploadFile = async (file: File, institutionId?: number): Promise<UploadResult> => {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter(Boolean).slice(0, 50)
  const extractedRows = lines.slice(1).map((line) => {
    const [kpi = '', valeur = '', domaine = 'academique'] = line.split(/[,;\t]/)
    return { kpi: kpi.trim(), valeur: valeur.trim(), domaine: domaine.trim() }
  })

  await supabase.from('upload_log').insert({
    institution_id: institutionId ?? null,
    filename: file.name,
    file_size: file.size,
    status: 'parsed_client',
    rows_parsed: extractedRows.length,
    created_at: new Date().toISOString(),
  })

  return { extractedRows, confidence: 0.85 }
}

export const getUploadHistory = async (institutionId?: number) => {
  let q = supabase.from('upload_log').select('*').order('created_at', { ascending: false }).limit(50)
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getUploadHistory:', error.message)
    return []
  }
  return data ?? []
}
