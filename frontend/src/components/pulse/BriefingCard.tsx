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
import { useTranslation } from 'react-i18next'

interface Props {
  briefing: Briefing
  onAskQuestion?: () => void
}

export default function BriefingCard({ briefing, onAskQuestion }: Props) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-gold/20 shadow-lg overflow-hidden">
          <div 
            className="h-1.5 w-full"
            style={{ background: 'linear-gradient(90deg, #1B4F72 0%, #0F1923 50%, #C5933A 100%)' }}
          />
          <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #0F1923 100%)' }}>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-display font-semibold text-paper">
                  {t('briefing.weeklyBriefing')}
                </CardTitle>
                <CardDescription className="text-paper/50 text-xs mt-0.5">
                  {briefing.weekLabel} · {t('briefing.generatedBy')}
                </CardDescription>
              </div>
              <span className="text-xs text-gold/60 font-mono num">
                {new Date(briefing.generatedAt).toLocaleDateString(locale, {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4" style={{ background: 'linear-gradient(180deg, #F4EBD5 0%, #E8DFC9 100%)' }}>
            {briefing.findings.map((finding, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i + 0.2 }}
                className="flex items-start gap-3 rounded-lg border p-3"
                style={{ 
                  background: finding.severity === 'info' ? '#1B4F7210' : finding.severity === 'warning' ? '#C5933A10' : '#1E844910',
                  borderColor: finding.severity === 'info' ? '#1B4F72' : finding.severity === 'warning' ? '#C5933A' : '#1E8449'
                }}
              >
                <span className="text-lg leading-none mt-0.5" style={{ color: finding.severity === 'info' ? '#1B4F72' : finding.severity === 'warning' ? '#C5933A' : '#1E8449' }}>
                  {severityToIcon(finding.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-snug">{finding.text}</p>
                </div>
                {finding.institutionId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/institution/${finding.institutionId}`)
                    }}
                    className="shrink-0 text-xs underline underline-offset-2 flex items-center gap-1 hover:opacity-80"
                    style={{ color: '#1B4F72' }}
                  >
                    {t('briefing.view')} <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </motion.div>
            ))}

            <div className="flex gap-2 pt-3 border-t border-gold/20">
              <Button
                variant="outline"
                size="sm"
                className="border-gold/40 text-gold hover:bg-gold/10"
                onClick={() => setOpen(true)}
              >
                <FileText className="h-3 w-3 mr-1" />
                {t('briefing.fullBriefing')}
              </Button>
              {onAskQuestion && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sea/40 text-sea hover:bg-sea/10"
                  onClick={onAskQuestion}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {t('briefing.askQuestion')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-paper border-rule">
          <DialogHeader>
            <DialogTitle className="font-display text-ink">{t('briefing.fullBriefingTitle')} — {briefing.weekLabel}</DialogTitle>
            <DialogDescription className="text-ink3">{t('briefing.autoGenerated')}</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-ink2 leading-relaxed mt-4 p-4 bg-paper2 rounded-lg border border-rule">
            {briefing.fullText}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}