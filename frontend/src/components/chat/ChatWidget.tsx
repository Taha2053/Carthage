import { useEffect, useRef, useState } from 'react'
import { Loader2, MessageSquare, Send, X } from 'lucide-react'
import { marked } from 'marked'
import { submitNLQuery } from '@/services/query'

type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
  html?: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! Ask me anything about UCAR analytics, policies, or documents.',
    },
  ])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const toggleOpen = () => setOpen((value) => !value)

  const sendMessage = async () => {
    const trimmed = query.trim()
    if (!trimmed || loading) return

    const userMessage: ChatMessage = { role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setQuery('')
    setStatus('Thinking...')
    setLoading(true)

    try {
      const response = await submitNLQuery(trimmed)
      const answer = response.answer || 'I could not find an answer to that question.'
      const htmlAnswer = marked.parse(answer)
      setMessages((prev) => [...prev, { role: 'assistant', text: answer, html: htmlAnswer }])

      setStatus(`Done in ${response.execution_ms ?? 0}ms`)
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, the chatbot is unavailable right now. Please try again later.',
        },
      ])
      setStatus('')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await sendMessage()
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 text-sm">
      {!open ? (
        <button
          type="button"
          onClick={toggleOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#1B4F72] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:bg-[#102B56]"
        >
          <MessageSquare className="h-4 w-4" />
          UCAR Chat
        </button>
      ) : (
        <div className="w-[440px] max-w-[94vw] rounded-[32px] border border-[#D6D1C7] bg-[#F4EBD5]/95 shadow-[0_30px_80px_-40px_rgba(15,25,35,0.45)] backdrop-blur-lg">
          <div className="flex items-center justify-between gap-3 rounded-[32px] bg-[#102B56] px-5 py-4 text-white shadow-inner shadow-slate-950/10">
            <div>
              <p className="text-sm font-semibold text-white">UCAR Chat</p>
              <p className="text-xs text-[#B5AFA3]">Ask questions about analytics, docs, or KPIs.</p>
            </div>
            <button
              type="button"
              onClick={toggleOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#102B56]/10 text-[#F7F5F0] transition hover:bg-[#102B56]/20"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto px-4 py-4 text-sm text-[#0F1923]">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[24px] px-4 py-3 leading-relaxed ${
                    message.role === 'assistant'
                      ? 'rounded-br-none bg-[#FEF8E9] text-[#0F1923] border border-[#E8D7B3]'
                      : 'rounded-bl-none bg-[#102B56] text-white shadow-[0_4px_16px_-8px_rgba(15,25,35,0.55)]'
                  }`}
                >
                  {message.html ? (
                    <div className="prose prose-slate text-sm" dangerouslySetInnerHTML={{ __html: message.html }} />
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSubmit} className="border-t border-[#D6D1C7] px-4 py-4">
            <label htmlFor="chat-query" className="sr-only">
              Chat message
            </label>
            <div className="flex gap-2">
              <textarea
                id="chat-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                rows={2}
                placeholder="Ask something like ‘How many departments?’"
                className="min-h-[58px] flex-1 resize-none rounded-2xl border border-[#D6D1C7] bg-[#F7F5F0] px-3 py-3 text-sm text-[#0F1923] outline-none transition focus:border-[#1B4F72] focus:ring-2 focus:ring-[#1B4F72]/10"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#1B4F72] to-[#102B56] px-4 text-sm font-semibold text-white transition hover:from-[#102B56] hover:to-[#0E254F] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            {status ? <p className="mt-3 text-xs text-[#5B6A7A]">{status}</p> : null}
          </form>
        </div>
      )}
    </div>
  )
}
