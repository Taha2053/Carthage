import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, MessageSquare, FileText } from 'lucide-react'
import type { Briefing } from '@/types'
import { severityToIcon, severityToColor } from '@/utils/health'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'

interface Props {
  briefing: Briefing
  onAskQuestion?: () => void
}

export default function BriefingCard({ briefing, onAskQuestion }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-white shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-blue-900">
                  Briefing hebdomadaire
                </CardTitle>
                <CardDescription className="text-blue-600 text-xs mt-0.5">
                  {briefing.weekLabel} · Généré par CarthaVillage Intelligence
                </CardDescription>
              </div>
              <span className="text-xs text-blue-400 font-mono">
                {new Date(briefing.generatedAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {briefing.findings.map((finding, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.2 }}
                className={`flex items-start gap-3 rounded-md border p-3 ${severityToColor(finding.severity)}`}
              >
                <span className="text-base leading-none mt-0.5">{severityToIcon(finding.severity)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{finding.text}</p>
                </div>
                {finding.institutionId && (
                  <button
                    onClick={() => navigate(`/institution/${finding.institutionId}`)}
                    className="shrink-0 text-xs underline underline-offset-2 opacity-60 hover:opacity-100 flex items-center gap-1"
                  >
                    Voir <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => setOpen(true)}
              >
                <FileText className="h-3 w-3 mr-1" />
                Briefing complet
              </Button>
              {onAskQuestion && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={onAskQuestion}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Poser une question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Briefing complet — {briefing.weekLabel}</DialogTitle>
            <DialogDescription>Analyse générée automatiquement par CarthaVillage Intelligence</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed mt-4">
            {briefing.fullText}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
