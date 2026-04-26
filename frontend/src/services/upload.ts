import api from './api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface UploadResult {
  extractedRows: { kpi: string; valeur: string; domaine: string }[]
  confidence: number
}

export const uploadFile = async (file: File, institutionId?: number): Promise<UploadResult> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 2000))
    return {
      extractedRows: [
        { kpi: 'Taux de réussite', valeur: '78%', domaine: 'Académique' },
        { kpi: "Taux d'abandon", valeur: '12%', domaine: 'Académique' },
        { kpi: 'Budget consommé', valeur: '2 940 000 TND', domaine: 'Finance' },
      ],
      confidence: 0.94,
    }
  }
  const form = new FormData()
  form.append('file', file)
  if (institutionId) form.append('institution_id', String(institutionId))
  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getUploadHistory = async (institutionId?: number) => {
  if (USE_MOCK) return []
  const params = institutionId ? { institution_id: institutionId } : {}
  const { data } = await api.get('/upload/history', { params })
  return data
}
