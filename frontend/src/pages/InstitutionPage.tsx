<<<<<<< HEAD
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { getInstitution } from '@/services/institutions'
=======
import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { fetchInstitutionDetail } from '@/services/adapters'
import { healthToBadgeColor, healthToLabel } from '@/utils/health'
>>>>>>> 7304b0bdbaa5d5bd10bd2f7b6fd43cf60a000fe4
import { cn } from '@/lib/utils'
import AlertsPanel from '@/components/alerts/AlertsPanel'
import BriefingCard from '@/components/pulse/BriefingCard'
import UploadFlow from '@/components/upload/UploadFlow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
<<<<<<< HEAD
import type { Institution } from '@/services/institutions'
import type { Severity } from '@/types'
import { ArrowLeft, MapPin, Users, Calendar, ExternalLink } from 'lucide-react'

const mockBriefing = {
  generatedAt: '2026-04-26',
  weekLabel: 'Semaine 17, 2026',
  findings: [
    { severity: 'info' as const, text: "Taux de réussite en amélioration", institutionId: '', domain: 'academique' },
    { severity: 'info' as const, text: "Partenariats internationaux actifs", institutionId: '', domain: 'insertion' },
  ],
  summary: "Cette établissement montre une performance stable avec des indicateurs positifs dans l'ensemble. Des améliorations sont possibles dans certains domaines.",
  fullText: "Analyse hebdomadaire — Institution — Semaine du 21 avril 2025\n\nCette établissement montre une performance stable avec des indicateurs positifs. Le taux de réussite est en amélioration et les partenariats internationaux sont actifs.",
}

const mockChartData = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  reussite: 70 + Math.random() * 25,
  abandon: 2 + Math.random() * 5,
  execution: 60 + Math.random() * 35,
  employabilite: 65 + Math.random() * 30,
}))

export default function InstitutionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
=======
import type { Institution } from '@/types'

export default function InstitutionPage() {
  const { id } = useParams<{ id: string }>()
  const [institution, setInstitution] = useState<Institution | null | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    fetchInstitutionDetail(id).then(setInstitution)
  }, [id])

  // Loading
  if (institution === undefined) {
    return (
      <div className="space-y-6 py-6 px-6 max-w-[1400px] mx-auto">
        <div className="h-8 bg-rule rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
              <div className="h-8 bg-rule rounded w-1/2 mb-2" />
              <div className="h-3 bg-rule rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }
>>>>>>> 7304b0bdbaa5d5bd10bd2f7b6fd43cf60a000fe4

  useEffect(() => {
    async function fetchData() {
      if (id) {
        const data = await getInstitution(parseInt(id))
        setInstitution(data)
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (!loading && !institution) {
    return <Navigate to="/central" replace />
  }

  const chartData = mockChartData

  const kpiCards = [
    { label: 'Étudiants', value: institution?.current_enrollment || '—', domain: 'Enrollment' },
    { label: 'Capacité', value: institution?.student_capacity || '—', domain: 'Capacité max' },
    { label: 'Année fond.', value: institution?.founding_year || '—', domain: 'Historique' },
    { label: 'Partenariats', value: '+12', domain: 'International' },
  ]

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto px-6 py-6">
      {/* ── Back button ── */}
      <button 
        onClick={() => navigate('/central')}
        className="flex items-center gap-2 text-ink3 hover:text-ink transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au réseau
      </button>

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sea flex items-center justify-center text-paper font-display text-xl font-bold">
              {institution?.code?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ink tracking-tight">{institution?.name}</h1>
              <p className="text-sm text-ink3">{institution?.short_name || institution?.name_fr || institution?.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-ink2">
            {institution?.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {institution.city}
              </span>
            )}
            {institution?.institution_type && (
              <span className="px-2 py-0.5 rounded-full bg-sea/10 text-sea text-xs border border-sea/20">
                {institution.institution_type}
              </span>
            )}
            {institution?.website && (
              <a 
                href={institution.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-sea transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Site web
              </a>
            )}
          </div>
        </div>
        <div className="text-right bg-paper2/50 rounded-lg p-4 border border-rule">
          <p className="text-xs text-ink3 uppercase tracking-wider">Étudiants</p>
          <p className="text-3xl font-bold text-ink tracking-tighter">{institution?.current_enrollment || '—'}</p>
          <p className="text-xs text-ink3">/ {institution?.student_capacity || '—'} capacité</p>
        </div>
      </div>

      {/* ── Info cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiCards.map(({ label, value, domain }) => (
          <div key={label} className="bg-paper2/50 rounded-lg border border-rule p-4">
            <p className="text-2xl font-bold text-ink tracking-tighter">{loading ? '...' : value}</p>
            <p className="text-xs text-ink2 mt-1">{label}</p>
            <p className="text-[10px] text-ink3">{domain}</p>
          </div>
        ))}
      </div>

      {/* ── Briefing ── */}
      <BriefingCard briefing={mockBriefing} />

      {/* ── Tabs ── */}
      <Tabs defaultValue="academique">
        <TabsList className="grid w-full grid-cols-4 bg-paper2">
          <TabsTrigger value="academique">Académique</TabsTrigger>
          <TabsTrigger value="insertion">Insertion</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="upload">Soumettre</TabsTrigger>
        </TabsList>

        <TabsContent value="academique" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-ink">Indicateurs académiques</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6D1C7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7A8D" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7A8D" domain={[50, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#F4EBD5', border: '1px solid #D6D1C7', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Réussite']}
                  />
                  <Line type="monotone" dataKey="reussite" stroke="#1B4F72" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-ink">Taux d'abandon</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6D1C7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7A8D" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7A8D" />
                  <Tooltip 
                    contentStyle={{ background: '#F4EBD5', border: '1px solid #D6D1C7', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Abandon']}
                  />
                  <Bar dataKey="abandon" fill="#C0392B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insertion" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-ink">Employabilité des diplômés</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6D1C7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7A8D" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7A8D" domain={[40, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#F4EBD5', border: '1px solid #D6D1C7', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Employabilité']}
                  />
                  <Line type="monotone" dataKey="employabilite" stroke="#1E8449" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-ink">Exécution budgétaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6D1C7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7A8D" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#6B7A8D" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: '#F4EBD5', border: '1px solid #D6D1C7', borderRadius: '8px' }}
                    formatter={(v: number) => [`${v.toFixed(1)}%`, 'Exécution']}
                  />
                  <Bar dataKey="execution" fill="#C5933A" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-ink">Soumettre les données</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadFlow />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Alerts ── */}
      <AlertsPanel 
        alerts={[
          { id: '1', severity: 'info', message: 'Dernières données mises à jour', domain: 'academique', institutionId: String(institution?.id || '') },
        ]} 
        title={`Alertes — ${institution?.name || ''}`} 
      />
    </div>
  )
}