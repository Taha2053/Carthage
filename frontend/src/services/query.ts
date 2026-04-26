import api from './api'
import type { NLQueryAnswer } from '@/types'

export const submitNLQuery = async (question: string): Promise<NLQueryAnswer> => {
  const { data } = await api.post<NLQueryAnswer>('/query', { question })
  return data
}