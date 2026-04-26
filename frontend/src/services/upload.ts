import axios from 'axios'

const USE_MOCK = true
const API_BASE = '/api'

export interface UploadResult {
  extractedRows: { kpi: string; valeur: string; domaine: string }[]
  confidence: number
}

export const uploadFile = async (file: File): Promise<UploadResult> => {
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
  return axios.post<UploadResult>(`${API_BASE}/ingest/upload`, form).then((r) => r.data)
}
