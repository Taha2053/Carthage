import api from './api'

export interface UploadResult {
  extractedRows: { kpi: string; valeur: string; domaine: string }[]
  confidence: number
}

export const uploadFile = async (file: File, institutionId?: number): Promise<UploadResult> => {
  const form = new FormData()
  form.append('file', file)
  if (institutionId) form.append('institution_id', String(institutionId))
  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getUploadHistory = async (institutionId?: number) => {
  const params = institutionId ? { institution_id: institutionId } : {}
  const { data } = await api.get('/upload/history', { params })
  return data
}