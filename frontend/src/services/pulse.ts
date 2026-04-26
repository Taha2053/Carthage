import axios from 'axios'
import type { Briefing } from '@/types'
import { mockUCARBriefing, mockInstitutions } from '@/mock/data'

const USE_MOCK = true
const API_BASE = '/api'

export const getUCARBriefing = async (): Promise<Briefing> => {
  if (USE_MOCK) return Promise.resolve(mockUCARBriefing)
  return axios.get<Briefing>(`${API_BASE}/pulse/briefing`).then((r) => r.data)
}

export const getInstitutionBriefing = async (id: string): Promise<Briefing | null> => {
  if (USE_MOCK) {
    const inst = mockInstitutions.find((i) => i.id === id)
    return Promise.resolve(inst?.briefing ?? null)
  }
  return axios.get<Briefing>(`${API_BASE}/pulse/briefing/${id}`).then((r) => r.data)
}
