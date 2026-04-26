import api from './api'
import type { Institution, KpiSnapshot, Alert, Health } from '@/types'
export type { Institution }
import { mockInstitutions } from '@/mock/data'
import { fetchInstitutionKPIs, fetchInstitutionAlerts } from './adapters'

async function getInstitutionKPIs(institutionId: number) {
  try {
    const { data } = await api.get('/kpis', { params: { institution_id: institutionId } })
    return data
  } catch { return [] }
}

async function getInstitutionAlerts(institutionId: number) {
  try {
    const { data } = await api.get('/alerts', { params: { institution_id: institutionId } })
    return data
  } catch { return [] }
}

function determineHealth(alerts: any[]): Health {
  if (alerts.some((a) => a.severity === 'critical')) return 'critical'
  if (alerts.some((a) => a.severity === 'warning')) return 'warning'
  return 'good'
}

function buildKpiSnapshot(kpis: any[]): KpiSnapshot {
  const get = (code: string) => kpis.find((k) => k.dim_metric?.code === code)?.value ?? 0
  return {
    month: new Date().toISOString().slice(0, 7),
    academique: {
      tauxReussite: get('success_rate') || get('taux_reussite') || 0,
      tauxPresence: get('attendance_rate') || get('taux_presence') || 0,
      tauxAbandon: get('dropout_rate') || get('taux_abandon') || 0,
      tauxRedoublement: get('repetition_rate') || get('taux_redoublement') || 0,
    },
    insertion: {
      tauxEmployabilite: get('employability_rate') || get('employabilite') || 0,
      delaiInsertion: 0,
      tauxConventionNationale: get('national_conv_rate') || 0,
      tauxConventionInternationale: get('international_conv_rate') || 0,
    },
    finance: {
      budgetAlloue: get('budget_allocated') || get('budget_alloue') || 0,
      budgetConsomme: get('budget_consumed') || get('budget_consomme') || 0,
      coutParEtudiant: get('cost_per_student') || get('cout_etudiant') || 0,
      tauxExecution: get('budget_execution_rate') || get('taux_execution') || 0,
    },
  }
}

export const getInstitutions = async (): Promise<Institution[]> => {
  try {
    const { data } = await api.get('/institutions')
    const institutions = await Promise.all(
      data.map(async (inst: any) => {
        const kpis = await getInstitutionKPIs(inst.id)
        const alerts = await getInstitutionAlerts(inst.id)
        const current = buildKpiSnapshot(kpis)
        const health = determineHealth(alerts)
        
        return {
          id: String(inst.id),
          name: inst.code || inst.short_name || inst.name,
          fullName: inst.name,
          health,
          current,
          history: [current],
          alerts: alerts.map((a: any) => ({
            id: String(a.id),
            severity: (a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info') as Alert['severity'],
            message: a.message ?? a.explanation ?? `Anomalie ${a.dim_metric?.code ?? 'KPI'}`,
            domain: 'academique' as const,
            institutionId: String(inst.id),
          })),
          riskScore: alerts.filter((a: any) => a.severity === 'critical').length * 30 + (100 - (current.academique?.tauxReussite ?? 80)),
          ranking: 1,
        }
      })
    )
    return institutions
  } catch (err) {
    console.error('Failed to fetch institutions:', err)
    return []
  }
}

export const getInstitution = async (id: string): Promise<Institution | null> => {
  try {
    const numId = parseInt(id)
    if (isNaN(numId)) return null
    const { data } = await api.get(`/institutions/${numId}`)
    const kpis = await getInstitutionKPIs(numId)
    const alerts = await getInstitutionAlerts(numId)
    const current = buildKpiSnapshot(kpis)
    const health = determineHealth(alerts)

    return {
      id: String(data.id),
      name: data.code || data.short_name || data.name,
      fullName: data.name,
      health,
      current,
      history: [current],
      alerts: alerts.map((a: any) => ({
        id: String(a.id),
        severity: (a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info') as Alert['severity'],
        message: a.message ?? a.explanation ?? `Anomalie ${a.dim_metric?.code ?? 'KPI'}`,
        domain: 'academique' as const,
        institutionId: id,
      })),
      riskScore: alerts.filter((a: any) => a.severity === 'critical').length * 30 + (100 - (current.academique?.tauxReussite ?? 80)),
      ranking: 1,
    }
  } catch (err) {
    console.error('Failed to fetch institution:', err)
    return null
  }
}