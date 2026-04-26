import { supabase } from '@/lib/supabase'
import type { NLQueryResponse } from '@/types'

/**
 * Lightweight NL → KPI lookup driven by Mistral.
 * Falls back to a deterministic message when the API key is missing.
 */
export const submitNLQuery = async (
  question: string,
  institutionId: number | null = null,
): Promise<NLQueryResponse> => {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
  let kpiContext = ''
  try {
    let q = supabase
      .from('fact_kpis')
      .select('value, dim_metric(code, name), dim_institution(code, short_name, name)')
      .limit(40)
    if (institutionId) q = q.eq('institution_id', institutionId)
    const { data } = await q
    kpiContext = (data ?? [])
      .map((r: any) => `${r.dim_institution?.short_name ?? '?'} | ${r.dim_metric?.code ?? '?'} = ${r.value}`)
      .join('\n')
  } catch (e) {
    /* ignore */
  }

  if (!apiKey) {
    return {
      query: question,
      answer: `Configurez VITE_MISTRAL_API_KEY pour obtenir une réponse IA. Données disponibles :\n${kpiContext.slice(0, 500)}`,
      was_successful: false,
    }
  }

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content:
              'Tu es un analyste KPI universitaire. Réponds en français, court et chiffré, en utilisant uniquement le contexte fourni.',
          },
          { role: 'user', content: `Question : ${question}\n\nContexte KPI :\n${kpiContext}` },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    })
    const json = await res.json()
    const answer = json.choices?.[0]?.message?.content ?? 'Pas de réponse.'
    return { query: question, answer, was_successful: true }
  } catch (err: any) {
    return { query: question, answer: `Erreur IA : ${err.message ?? err}`, was_successful: false }
  }
}
