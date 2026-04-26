import api from './api'
import type { NLQueryResponse } from '@/types'

export const submitNLQuery = async (
  question: string,
  institutionId: number | null = null,
): Promise<NLQueryResponse> => {
  const { data } = await api.post<NLQueryResponse>('/query', {
    query: question,
    institution_id: institutionId,
  })
  return data
}