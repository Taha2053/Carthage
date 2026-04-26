/**
 * Data adapters: transform flat backend responses into the rich
 * TypeScript types that existing components expect.
 */
import api from './api'
import type { Institution, Alert, Briefing, KpiSnapshot, Health } from '@/types'
import { mockInstitutions, placeholderInstitutions, mockUCARBriefing, mockStudentProfile, mockTeacherProfile } from '@/mock/data'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/* ────────────────────────────────────────────
 *  Institutions — full dashboard shape
 * ──────────────────────────────────────────── */

interface BackendInstitution {
  id: number
  code: string
  name: string
  short_name?: string
  type?: string
  city?: string
  is_active?: boolean
}

interface BackendKPI {
  id: number
  institution_id: number
  metric_id: number
  value: number
  dim_metric?: { code: string; name: string }
  dim_time?: { academic_year: string; semester: number }
}

interface BackendAlert {
  id: number
  institution_id: number
  severity: string
  message?: string
  explanation?: string
  recommended_action?: string
  resolved?: boolean
  created_at?: string
  dim_metric?: { code: string }
}

function determineHealth(alerts: BackendAlert[]): Health {
  if (alerts.some((a) => a.severity === 'critical')) return 'critical'
  if (alerts.some((a) => a.severity === 'warning')) return 'warning'
  return 'good'
}

function buildKpiSnapshot(kpis: BackendKPI[]): KpiSnapshot {
  const get = (code: string) => kpis.find((k) => k.dim_metric?.code === code)?.value
  return {
    month: new Date().toISOString().slice(0, 7),
    academique: {
      tauxReussite: get('SUCCESS_RATE') ?? 0,
      tauxPresence: get('ATTENDANCE_RATE') ?? 0,
      tauxAbandon: get('DROPOUT_RATE') ?? 0,
      tauxRedoublement: 0,
    },
    insertion: {
      tauxEmployabilite: get('EMPLOYABILITY') ?? 0,
      delaiInsertion: 0,
      tauxConventionNationale: 0,
      tauxConventionInternationale: 0,
    },
    finance: {
      budgetAlloue: 0,
      budgetConsomme: 0,
      coutParEtudiant: 0,
      tauxExecution: get('BUDGET_EXEC') ?? 0,
    },
  }
}

function buildAlerts(raw: BackendAlert[], institutionId: string): Alert[] {
  return raw.map((a) => ({
    id: String(a.id),
    severity: (a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info') as Alert['severity'],
    message: a.message ?? a.explanation ?? `Anomalie ${a.dim_metric?.code ?? 'KPI'}`,
    domain: 'academique' as const,
    institutionId,
  }))
}

export async function fetchDashboardInstitutions(): Promise<{ institutions: Institution[]; placeholders: string[] }> {
  if (USE_MOCK) return { institutions: mockInstitutions, placeholders: placeholderInstitutions }

  try {
    const [instRes, alertsRes, kpisRes] = await Promise.all([
      api.get<BackendInstitution[]>('/institutions'),
      api.get<BackendAlert[]>('/alerts'),
      api.get<BackendKPI[]>('/kpis'),
    ])

    const institutions: Institution[] = instRes.data.map((inst, idx) => {
      const instAlerts = alertsRes.data.filter((a) => a.institution_id === inst.id)
      const instKpis = kpisRes.data.filter((k) => k.institution_id === inst.id)
      const current = buildKpiSnapshot(instKpis)
      const alerts = buildAlerts(instAlerts, String(inst.id))

      return {
        id: String(inst.id),
        name: inst.code ?? inst.short_name ?? inst.name,
        fullName: inst.name,
        health: determineHealth(instAlerts),
        history: [current],
        current,
        alerts,
        riskScore: Math.min(100, instAlerts.filter((a) => a.severity === 'critical').length * 30 +
          instAlerts.filter((a) => a.severity === 'warning').length * 10 +
          (100 - (current.academique?.tauxReussite ?? 80))),
        ranking: idx + 1,
      }
    })

    // Sort by riskScore and assign rankings
    institutions.sort((a, b) => a.riskScore - b.riskScore)
    institutions.forEach((inst, i) => { inst.ranking = i + 1 })

    return { institutions, placeholders: [] }
  } catch (err) {
    console.error('Backend unavailable, falling back to mock:', err)
    return { institutions: mockInstitutions, placeholders: placeholderInstitutions }
  }
}

/* ────────────────────────────────────────────
 *  Single institution detail
 * ──────────────────────────────────────────── */

export async function fetchInstitutionDetail(id: string): Promise<Institution | null> {
  if (USE_MOCK) return mockInstitutions.find((i) => i.id === id) ?? null

  try {
    const numId = parseInt(id)
    if (isNaN(numId)) {
      // Try matching by code in mock data as fallback
      return mockInstitutions.find((i) => i.id === id) ?? null
    }

    const [instRes, kpisRes, alertsRes] = await Promise.all([
      api.get<BackendInstitution>(`/institutions/${numId}`),
      api.get<BackendKPI[]>('/kpis', { params: { institution_id: numId } }),
      api.get<BackendAlert[]>('/alerts', { params: { institution_id: numId } }),
    ])

    const inst = instRes.data
    const current = buildKpiSnapshot(kpisRes.data)
    const alerts = buildAlerts(alertsRes.data, id)

    return {
      id: String(inst.id),
      name: inst.code ?? inst.short_name ?? inst.name,
      fullName: inst.name,
      health: determineHealth(alertsRes.data),
      history: [current],
      current,
      alerts,
      riskScore: alerts.filter((a) => a.severity === 'critical').length * 30 + (100 - (current.academique?.tauxReussite ?? 80)),
      ranking: 1,
    }
  } catch (err) {
    console.error('Failed to fetch institution, falling back to mock:', err)
    return mockInstitutions.find((i) => i.id === id) ?? null
  }
}

/* ────────────────────────────────────────────
 *  UCAR Network briefing
 * ──────────────────────────────────────────── */

export async function fetchNetworkBriefing(): Promise<Briefing> {
  if (USE_MOCK) return mockUCARBriefing

  try {
    const { data } = await api.post('/orchestrator/network-brief')
    return {
      generatedAt: new Date().toISOString(),
      weekLabel: `Semaine ${Math.ceil(new Date().getDate() / 7)}`,
      findings: (data.institutions ?? []).map((inst: any) => ({
        severity: 'info' as const,
        text: inst.pulse?.substring(0, 200) ?? '',
        institutionId: inst.code,
        domain: 'general',
      })),
      fullText: data.network_summary ?? '',
    }
  } catch {
    return mockUCARBriefing
  }
}

/* ────────────────────────────────────────────
 *  Dashboard alerts (top N across network)
 * ──────────────────────────────────────────── */

export async function fetchNetworkAlerts(): Promise<Alert[]> {
  if (USE_MOCK) return mockInstitutions.flatMap((i) => i.alerts)

  try {
    const { data } = await api.get<BackendAlert[]>('/alerts')
    return buildAlerts(data, 'network').sort((a, b) => {
      const o = { critical: 0, warning: 1, info: 2 }
      return o[a.severity] - o[b.severity]
    })
  } catch {
    return mockInstitutions.flatMap((i) => i.alerts)
  }
}

/* ────────────────────────────────────────────
 *  Student profile
 * ──────────────────────────────────────────── */

export async function fetchStudentProfile(studentId?: number) {
  if (USE_MOCK) return mockStudentProfile

  try {
    const { data } = await api.get(`/students/${studentId ?? 1}`)
    return {
      name: data.full_name ?? data.name ?? 'Étudiant',
      matricule: data.student_id_number ?? '',
      filiere: data.program_name ?? data.department_name ?? '',
      annee: data.year ?? 1,
      tauxPresence: data.attendance_rate ?? 0,
      moyenne: data.average_grade ?? 0,
      credits: data.credits_earned ?? 0,
      creditsTotal: data.credits_total ?? 60,
      progression: (data.average_grade ?? 0) < 8 ? 'critical' as const : (data.average_grade ?? 0) < 10 ? 'at_risk' as const : 'on_track' as const,
      nudge: data.ai_nudge ?? 'Continuez vos efforts, vous êtes sur la bonne voie.',
      courses: (data.courses ?? []).map((c: any) => ({
        name: c.name ?? c.course_name ?? '',
        note: c.grade ?? c.note ?? 0,
        presence: c.attendance ?? c.presence ?? 0,
      })),
    }
  } catch {
    return mockStudentProfile
  }
}

/* ────────────────────────────────────────────
 *  Teacher profile
 * ──────────────────────────────────────────── */

export async function fetchTeacherProfile(staffId?: number) {
  if (USE_MOCK) return mockTeacherProfile

  try {
    const { data } = await api.get(`/staff/${staffId ?? 1}`)
    return {
      name: data.full_name ?? data.name ?? 'Enseignant',
      courses: (data.courses ?? []).map((c: any) => ({
        id: String(c.id ?? c.course_id ?? Math.random()),
        name: c.name ?? c.course_name ?? '',
        group: c.group ?? c.section ?? 'Groupe 1',
        students: (c.students ?? []).map((s: any) => ({
          id: String(s.id ?? s.student_id ?? Math.random()),
          name: s.full_name ?? s.name ?? '',
          presence: s.attendance_rate ?? s.presence ?? 0,
          moyenne: s.average_grade ?? s.moyenne ?? 0,
          risk: (s.average_grade ?? s.moyenne ?? 10) < 8 ? 'critical' as const :
            (s.attendance_rate ?? s.presence ?? 100) < 60 ? 'at_risk' as const : 'none' as const,
        })),
      })),
    }
  } catch {
    return mockTeacherProfile
  }
}
