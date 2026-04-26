import axios from 'axios'
import type { Institution } from '@/types'
import { mockInstitutions } from '@/mock/data'

const USE_MOCK = true
const API_BASE = '/api'

export const getInstitutions = async (): Promise<Institution[]> => {
  if (USE_MOCK) return Promise.resolve(mockInstitutions)
  return axios.get<Institution[]>(`${API_BASE}/institutions`).then((r) => r.data)
}

export const getInstitution = async (id: string): Promise<Institution | null> => {
  if (USE_MOCK) return Promise.resolve(mockInstitutions.find((i) => i.id === id) ?? null)
  return axios.get<Institution>(`${API_BASE}/institutions/${id}`).then((r) => r.data)
}
