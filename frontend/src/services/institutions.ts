import api from './api'
import type { Institution } from '@/types'
import { mockInstitutions } from '@/mock/data'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const getInstitutions = async (): Promise<Institution[]> => {
  if (USE_MOCK) return Promise.resolve(mockInstitutions)
  const { data } = await api.get<Institution[]>('/institutions')
  return data
}

export const getInstitution = async (id: string): Promise<Institution | null> => {
  if (USE_MOCK) return Promise.resolve(mockInstitutions.find((i) => i.id === id) ?? null)
  const { data } = await api.get<Institution>(`/institutions/${id}`)
  return data
}
