import { useState, useRef, forwardRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#1B4F72', '#C5933A', '#5DADE2', '#7B3F8E', '#1E8449', '#F7D98B']

interface QueryResult {
  query: string
  answer: string
  data?: any[]
  generated_sql?: string
  execution_ms: number
  was_successful: boolean
}

const NLQueryBar = forwardRef<HTMLDivElement>((_, ref) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<QueryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return
    
    setLoading(true)
    setError(null)
    setAnswer(null)

    try {
      const response = await fetch('/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      
      if (!response.ok) throw new Error('Erreur de connexion')
      
      const data = await response.json()
      setAnswer(data)
    } catch (err) {
      setError('Erreur lors de la requête. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const quickQuestions = [
    'Quels sont les établissements en alerte?',
    'Quel est le taux de réussite moyen?',
    'Donne-moi le top 5 des institutions',
  ]

  return (
    <div ref={ref} className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez une question sur vos données..."
          className="flex-1 bg-paper2 border-rule text-ink placeholder:text-ink3"
          disabled={loading}
        />
        <Button 
          type="submit" 
          className="bg-gold hover:bg-gold/90 text-paper shrink-0"
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 rounded-lg bg-crit/10 border border-crit/20 text-crit text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-gold/20 bg-paper2">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm text-ink leading-relaxed">{answer.answer}</p>
                
                {answer.data && answer.data.length > 0 && (
                  <div className="h-40 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={answer.data.slice(0, 6)} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#6B7A8D" />
                        <YAxis tick={{ fontSize: 10 }} stroke="#6B7A8D" />
                        <Tooltip
                          formatter={(v: number) => [`${v}`, '']}
                          contentStyle={{ fontSize: 12, background: '#F4EBD5', border: '1px solid #D6D1C7' }}
                        />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                          {answer.data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-[10px] text-ink3 pt-2 border-t border-rule">
                  <span>Réponse en {answer.execution_ms}ms</span>
                  {answer.was_successful ? (
                    <span className="text-ok">✓ Succès</span>
                  ) : (
                    <span className="text-warn">⚠ Limité</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(q)
              inputRef.current?.focus()
            }}
            className="rounded-full border border-rule bg-paper px-3 py-1 text-xs text-ink3 hover:text-gold hover:border-gold/50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
})

NLQueryBar.displayName = 'NLQueryBar'

export default NLQueryBar