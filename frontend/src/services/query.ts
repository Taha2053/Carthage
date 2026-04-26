import api from './api'
import type { NLQueryAnswer } from '@/types'
import { nlQueryCache } from '@/mock/data'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const submitNLQuery = async (question: string): Promise<NLQueryAnswer> => {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1400))
    const q = question.toLowerCase()
    const found = nlQueryCache.find((item) =>
      item.question
        .toLowerCase()
        .split(' ')
        .filter((w) => w.length > 3)
        .some((w) => q.includes(w)),
    )
    return found ?? nlQueryCache[0]
  }
  const { data } = await api.post<NLQueryAnswer>('/query', { question })
  return data
}
