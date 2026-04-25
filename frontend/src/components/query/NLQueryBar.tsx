import { useState, useRef, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { nlQueryCache } from '@/mock/data'
import type { NLQueryAnswer } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#1D4ED8', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE']

function findAnswer(query: string): NLQueryAnswer | null {
  const q = query.toLowerCase()
  return (
    nlQueryCache.find((item) =>
      item.question
        .toLowerCase()
        .split(' ')
        .filter((w) => w.length > 3)
        .some((w) => q.includes(w)),
    ) ?? nlQueryCache[0]
  )
}

const NLQueryBar = forwardRef<HTMLDivElement>((_, ref) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<NLQueryAnswer | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setAnswer(null)
    await new Promise((r) => setTimeout(r, 1400))
    setAnswer(findAnswer(query))
    setLoading(false)
  }

  return (
    <div ref={ref} className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Posez une question sur vos établissements..."
          className="flex-1 bg-white"
        />
        <Button type="submit" className="bg-blue-800 hover:bg-blue-900 shrink-0" disabled={loading}>
          {loading ? (
            <span className="flex gap-1 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce [animation-delay:300ms]" />
            </span>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      <AnimatePresence>
        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-blue-100 bg-blue-50/50">
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm text-gray-800 leading-relaxed">{answer.answer}</p>
                {answer.hasChart && answer.chartData && (
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={answer.chartData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, '']}
                          contentStyle={{ fontSize: 12 }}
                        />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                          {answer.chartData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        {nlQueryCache.slice(0, 3).map((item, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(item.question)
              inputRef.current?.focus()
            }}
            className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs text-blue-700 hover:bg-blue-50 transition-colors"
          >
            {item.question}
          </button>
        ))}
      </div>
    </div>
  )
})
NLQueryBar.displayName = 'NLQueryBar'

export default NLQueryBar
