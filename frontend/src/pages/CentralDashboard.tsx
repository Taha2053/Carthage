import { useRef } from 'react'
import { mockInstitutions, placeholderInstitutions, mockUCARBriefing } from '@/mock/data'
import InstitutionCard from '@/components/institutions/InstitutionCard'
import BriefingCard from '@/components/pulse/BriefingCard'
import AlertsPanel from '@/components/alerts/AlertsPanel'
import NLQueryBar from '@/components/query/NLQueryBar'
import { healthToDot } from '@/utils/health'

const allAlerts = mockInstitutions.flatMap((i) => i.alerts)

export default function CentralDashboard() {
  const nlRef = useRef<HTMLDivElement>(null)

  const scrollToNL = () => {
    nlRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Vue consolidée — Réseau UCAR</h1>
        <p className="text-sm text-gray-500 mt-1">34 établissements · Données en temps réel</p>
      </div>

      <BriefingCard briefing={mockUCARBriefing} onAskQuestion={scrollToNL} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Établissements</h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${healthToDot('critical')}`} />Critique</span>
              <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${healthToDot('warning')}`} />Attention</span>
              <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${healthToDot('good')}`} />Bon</span>
              <span className="flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${healthToDot('no_data')}`} />Sans données</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mockInstitutions.map((institution) => (
              <InstitutionCard key={institution.id} institution={institution} />
            ))}
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2 font-medium">Autres établissements du réseau</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {placeholderInstitutions.map((name) => (
                <div
                  key={name}
                  className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-center"
                >
                  <p className="text-xs text-gray-400 font-medium">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AlertsPanel alerts={allAlerts} title="Alertes réseau" />

          <div className="rounded-lg border bg-white p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Vue synthétique</p>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Établissements critiques', value: mockInstitutions.filter(i => i.health === 'critical').length, color: 'text-red-600' },
                { label: 'Alertes actives', value: allAlerts.length, color: 'text-amber-600' },
                { label: 'Rapports manquants', value: mockInstitutions.filter(i => i.health === 'no_data').length, color: 'text-gray-500' },
                { label: 'Taux de réussite moyen', value: `${Math.round(mockInstitutions.filter(i => i.current.academique).reduce((acc, i) => acc + (i.current.academique?.tauxReussite ?? 0), 0) / mockInstitutions.filter(i => i.current.academique).length)}%`, color: 'text-emerald-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Interroger les données en langage naturel
        </p>
        <NLQueryBar ref={nlRef} />
      </div>
    </div>
  )
}
