import { useState, useEffect, useRef } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Cell,
} from 'recharts'
import { useAuthStore } from '@/store/authStore'
import { fetchDashboardSummary, fetchInstitutionDetail } from '@/services/adapters'
import { healthToColor, healthToBadgeColor, healthToLabelKey, healthToDot } from '@/utils/health'
import { cn } from '@/lib/utils'
import AlertsPanel from '@/components/alerts/AlertsPanel'
import BriefingCard from '@/components/pulse/BriefingCard'
import NLQueryBar from '@/components/query/NLQueryBar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DashboardSummary, Institution } from '@/types'
import { useTranslation } from 'react-i18next'

// ── grid colours
const HEALTH_BG: Record<string, string> = {
  critical: 'border-crit/30 bg-crit/8',
  warning:  'border-warn/30 bg-warn/8',
  good:     'border-ok/20 bg-ok/6',
  no_data:  'border-rule bg-paper2/50',
}

export default function CentralDashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [selected, setSelected] = useState<Institution | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const queryRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchDashboardSummary().then(setData) }, [])

  const openInstitution = async (id: string) => {
    const inst = await fetchInstitutionDetail(id)
    if (inst) { setSelected(inst); setDialogOpen(true) }
  }

  if (!data) {
    return (
      <div className="space-y-6 py-6 px-6 max-w-[1400px] mx-auto">
        <div className="h-8 bg-rule rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
              <div className="h-8 bg-rule rounded w-1/2 mb-2" />
              <div className="h-3 bg-rule rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { networkIndex, institutions, alertsSummary, briefing, rankings } = data

  const mockUCARBriefing = {
    weekLabel: '21–27 Avr 2025',
    generatedAt: '2025-04-27T09:15:00Z',
    findings: alertsSummary.slice(0, 4).map(a => ({
      text: a.message,
      severity: a.severity,
      institutionId: a.institutionId,
      domain: 'general',
    })),
    fullText: alertsSummary.map(a => `• ${a.message}`).join('\n'),
  }

  const countBySeverity = (h: string) => institutions.filter(i => i.health === h).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-up">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
          {t('dashboard.consolidated')}
        </p>
        <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
          {t('dashboard.operationsRoom')}
        </h1>
        <p className="text-ink3 text-sm mt-1">
          {institutions.length} {t('dashboard.establishments')}
        </p>
      </div>

      <div className="glow-line" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up-1">
        <div className="rounded-lg border p-4 bg-sea/5 border-sea/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('dashboard.networkIndex')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-sea">{networkIndex.toFixed(1)}</p>
          <p className="text-[10px] text-ink3 mt-1 num">{t('dashboard.outOf100')}</p>
        </div>
        <div className="rounded-lg border p-4 bg-warn/5 border-warn/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('dashboard.watchList')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-warn">{countBySeverity('warning') + countBySeverity('critical')}</p>
          <p className="text-[10px] text-ink3 mt-1 num">{t('dashboard.toWatch')}</p>
        </div>
        <div className="rounded-lg border p-4 bg-ok/5 border-ok/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('dashboard.healthy')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-ok">{countBySeverity('good')}</p>
          <p className="text-[10px] text-ink3 mt-1 num">{t('dashboard.noAlert')}</p>
        </div>
        <div className="rounded-lg border p-4 bg-crit/5 border-crit/20">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-2">{t('dashboard.activeAlerts')}</p>
          <p className="font-display text-3xl tracking-tighter2 text-crit">{alertsSummary.length}</p>
          <p className="text-[10px] text-ink3 mt-1 num">{t('dashboard.thisMonth')}</p>
        </div>
      </div>

      {/* Top alerts */}
      {alertsSummary.length > 0 && (
        <AlertsPanel alerts={alertsSummary} title={t('dashboard.topAlerts')} />
      )}

      {/* NL Query section */}
      <Card className="border-gold/20 shadow-sm">
        <CardHeader className="pb-3" style={{ background: 'linear-gradient(135deg, #1B4F72 0%, #0F1923 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-display text-paper">{t('dashboard.queryData')}</CardTitle>
              <CardDescription className="text-paper/50 text-xs mt-0.5">{t('dashboard.queryDescription')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4" style={{ background: 'linear-gradient(180deg, #F4EBD5 0%, #E8DFC9 100%)' }}>
          <NLQueryBar ref={queryRef} />
        </CardContent>
      </Card>

      {/* Briefing */}
      {data && <BriefingCard briefing={mockUCARBriefing} onAskQuestion={() => queryRef.current?.scrollIntoView({ behavior: 'smooth' })} />}

      {/* Network map */}
      <Tabs defaultValue="grid" className="fade-up-2">
        <TabsList className="grid grid-cols-2 w-48">
          <TabsTrigger value="grid">{t('dashboard.grid')}</TabsTrigger>
          <TabsTrigger value="ranking">{t('dashboard.ranking')}</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {institutions.map(inst => (
              <button
                key={inst.id}
                onClick={() => openInstitution(inst.id)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all hover:scale-[1.02] hover:shadow-sm lift',
                  HEALTH_BG[inst.health],
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={cn('w-2 h-2 rounded-full', healthToDot(inst.health))} />
                  <span className="text-sm font-semibold text-ink truncate">{inst.name}</span>
                </div>
                <p className="text-[10px] text-ink3 mb-2">{inst.fullName}</p>
                <div className="flex items-baseline justify-between">
                  <span className={cn('text-xs font-medium rounded-full px-1.5 py-0.5 border', healthToBadgeColor(inst.health))}>
                    {t(healthToLabelKey(inst.health))}
                  </span>
                  <span className="text-[10px] num text-ink3">#{inst.ranking}</span>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>{t('dashboard.establishment')}</TableHead>
                    <TableHead>{t('dashboard.city')}</TableHead>
                    <TableHead className="text-right">{t('dashboard.students')}</TableHead>
                    <TableHead>{t('dashboard.type')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...institutions].sort((a,b) => a.ranking - b.ranking).map(inst => (
                    <TableRow
                      key={inst.id}
                      className="cursor-pointer"
                      onClick={() => openInstitution(inst.id)}
                    >
                      <TableCell className="font-mono text-xs text-ink3">{inst.ranking}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', healthToDot(inst.health))} />
                          {inst.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-ink3">{inst.fullName?.split(',').pop()?.trim()}</TableCell>
                      <TableCell className="text-right text-xs num">{inst.current?.academique?.effectif ?? '-'}</TableCell>
                      <TableCell className="text-xs"><span className="pill">{t('dashboard.school')}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-paper border-rule">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-ink flex items-center gap-3">
                  {selected.name}
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', healthToBadgeColor(selected.health))}>
                    {t(healthToLabelKey(selected.health))}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: t('institution.successRate'), value: `${selected.current.academique?.tauxReussite}%` },
                  { label: t('institution.dropoutRate'), value: `${selected.current.academique?.tauxAbandon}%` },
                  { label: t('institution.employabilityRate'), value: `${selected.current.insertion?.tauxEmployabilite}%` },
                  { label: t('institution.budgetExecution'), value: `${selected.current.finance?.tauxExecution}%` },
                ].map(kpi => (
                  <Card key={kpi.label} className="text-center">
                    <CardContent className="pt-4 pb-3">
                      <p className="text-2xl font-bold text-ink">{kpi.value}</p>
                      <p className="text-xs text-ink3 mt-1">{kpi.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selected.history.length > 3 && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{t('institution.successRateLast12')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={selected.history.slice(-12).map(s => ({ month: s.month.slice(5), reussite: s.academique?.tauxReussite }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[50, 100]} />
                        <Tooltip formatter={(v: number) => [`${v}%`, t('institution.success')]} />
                        <Line type="monotone" dataKey="reussite" stroke="#1D4ED8" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              <div className="flex justify-end mt-2">
                <Button
                  variant="outline"
                  className="border-gold/40 text-gold hover:bg-gold/10"
                  onClick={() => { setDialogOpen(false); window.location.href = `/institution/${selected.id}` }}
                >
                  {t('dashboard.dataUpdated')} {selected.name} →
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}