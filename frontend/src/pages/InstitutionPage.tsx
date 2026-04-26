import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { fetchInstitutionDetail } from '@/services/adapters'
import { healthToBadgeColor, healthToLabel } from '@/utils/health'
import { cn } from '@/lib/utils'
import AlertsPanel from '@/components/alerts/AlertsPanel'
import BriefingCard from '@/components/pulse/BriefingCard'
import UploadFlow from '@/components/upload/UploadFlow'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  if (!institution) return <Navigate to="/central" replace />

  const { name, fullName, health, current, history, alerts, ranking, briefing } = institution

  const chartData = history.slice(-12).map((snap) => ({
    month: snap.month.slice(5),
    reussite: snap.academique?.tauxReussite,
    abandon: snap.academique?.tauxAbandon,
    execution: snap.finance?.tauxExecution,
    employabilite: snap.insertion?.tauxEmployabilite,
  }))

  const kpiCards = [
    { label: 'Taux de réussite', value: `${current.academique?.tauxReussite}%`, domain: 'Académique' },
    { label: "Taux d'abandon", value: `${current.academique?.tauxAbandon}%`, domain: 'Académique' },
    { label: "Taux d'employabilité", value: `${current.insertion?.tauxEmployabilite}%`, domain: 'Insertion' },
    { label: 'Exécution budgétaire', value: `${current.finance?.tauxExecution}%`, domain: 'Finance' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', healthToBadgeColor(health))}>
              {healthToLabel(health)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{fullName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Classement réseau</p>
          <p className="text-2xl font-bold text-blue-800">#{ranking}</p>
          <p className="text-xs text-gray-400">sur +30 établissements suivis</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiCards.map(({ label, value, domain }) => (
          <Card key={label} className="text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
              <p className="text-[10px] text-gray-400">{domain}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {briefing && <BriefingCard briefing={briefing} />}

      <Tabs defaultValue="academique">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="academique">Académique</TabsTrigger>
          <TabsTrigger value="insertion">Insertion</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="upload">Soumettre</TabsTrigger>
        </TabsList>

        <TabsContent value="academique" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taux de réussite — 12 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[50, 100]} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Réussite']} />
                  <Line type="monotone" dataKey="reussite" stroke="#1D4ED8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taux d'abandon — 12 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Abandon']} />
                  <Bar dataKey="abandon" fill="#EF4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insertion" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Taux d'employabilité — 12 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[40, 100]} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Employabilité']} />
                  <Line type="monotone" dataKey="employabilite" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Exécution budgétaire — 12 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Exécution']} />
                  <Bar dataKey="execution" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Soumettre les données mensuelles</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadFlow />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertsPanel alerts={alerts} title={`Alertes — ${name}`} />
    </div>
  )
}
