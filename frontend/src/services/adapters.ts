/**
 * Data adapters: transform backend responses to frontend types
 * Connected to real Supabase database via FastAPI backend
 */
import api from './api'
import type { Institution, Alert, Briefing, KpiSnapshot, Health } from '@/types'

/* ────────────────────────────────────────────
 * Backend Types
 * ──────────────────────────────────────────── */

interface BackendInstitution {
  id: number
  code: string
  name: string
  short_name?: string
  name_fr?: string
  type?: string
  city?: string
  region?: string
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

interface BackendUser {
  id: number
  email: string
  full_name?: string
  role?: string
  institution_id?: number
}

interface BackendDepartment {
  id: number
  code: string
  name: string
  institution_id: number
}

interface BackendProgram {
  id: number
  code: string
  name: string
  institution_id: number
  department_id?: number
}

interface BackendStaff {
  id: number
  first_name: string
  last_name: string
  email?: string
  role?: string
  institution_id: number
  department_id?: number
}

interface BackendStudent {
  id: number
  first_name: string
  last_name: string
  email?: string
  institution_id: number
  department_id?: number
  enrollment_year?: number
}

/* ────────────────────────────────────────────
 * Helper Functions
 * ──────────────────────────────────────────── */

function determineHealth(alerts: BackendAlert[]): Health {
  if (alerts.some((a) => a.severity === 'critical')) return 'critical'
  if (alerts.some((a) => a.severity === 'warning')) return 'warning'
  return 'good'
}

function buildKpiSnapshot(kpis: BackendKPI[]): KpiSnapshot {
  const get = (code: string) => kpis.find((k) => k.dim_metric?.code === code)?.value ?? 0
  return {
    month: new Date().toISOString().slice(0, 7),
    academique: {
      tauxReussite: get('success_rate') || get('taux_reussite') || get('enrolled_students') ? 0 : 0,
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

function buildAlerts(raw: BackendAlert[], institutionId: string): Alert[] {
  return raw.map((a) => ({
    id: String(a.id),
    severity: (a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info') as Alert['severity'],
    message: a.message ?? a.explanation ?? `Anomalie ${a.dim_metric?.code ?? 'KPI'}`,
    domain: 'academique' as const,
    institutionId,
  }))
}

/* ────────────────────────────────────────────
 * Institution APIs
 * ──────────────────────────────────────────── */

export async function fetchAllInstitutions(): Promise<BackendInstitution[]> {
  try {
    const { data } = await api.get<BackendInstitution[]>('/institutions')
    return data
  } catch (err) {
    console.error('Failed to fetch institutions:', err)
    return []
  }
}

export async function fetchInstitutionById(id: number): Promise<BackendInstitution | null> {
  try {
    const { data } = await api.get<BackendInstitution>(`/institutions/${id}`)
    return data
  } catch (err) {
    console.error('Failed to fetch institution:', err)
    return null
  }
}

export async function fetchInstitutionKPIs(institutionId: number): Promise<BackendKPI[]> {
  try {
    const { data } = await api.get<BackendKPI[]>('/kpis', { 
      params: { institution_id: institutionId } 
    })
    return data
  } catch (err) {
    console.error('Failed to fetch KPIs:', err)
    return []
  }
}

export async function fetchInstitutionAlerts(institutionId: number): Promise<BackendAlert[]> {
  try {
    const { data } = await api.get<BackendAlert[]>('/alerts', { 
      params: { institution_id: institutionId } 
    })
    return data
  } catch (err) {
    console.error('Failed to fetch alerts:', err)
    return []
  }
}

/* ────────────────────────────────────────────
 * Dashboard APIs
 * ──────────────────────────────────────────── */

export async function fetchDashboardInstitutions(): Promise<{ institutions: Institution[]; placeholders: string[] }> {
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
        name: inst.code || inst.short_name || inst.name,
        fullName: inst.name,
        health: determineHealth(instAlerts),
        current,
        history: [current],
        alerts,
        riskScore: instAlerts.filter((a) => a.severity === 'critical').length * 30 + (100 - (current.academique?.tauxReussite ?? 80)),
        ranking: idx + 1,
      }
    })

    return { institutions, placeholders: instRes.data.map((i) => String(i.id)) }
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
    return { institutions: [], placeholders: [] }
  }
}

export async function fetchInstitutionDetail(id: string): Promise<Institution | null> {
  try {
    const numId = parseInt(id)
    if (isNaN(numId)) return null

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
      name: inst.code || inst.short_name || inst.name,
      fullName: inst.name,
      health: determineHealth(alertsRes.data),
      history: [current],
      current,
      alerts,
      riskScore: alertsRes.data.filter((a) => a.severity === 'critical').length * 30 + (100 - (current.academique?.tauxReussite ?? 80)),
      ranking: 1,
    }
  } catch (err) {
    console.error('Failed to fetch institution detail:', err)
    return null
  }
}

/* ────────────────────────────────────────────
 * Network Briefing
 * ──────────────────────────────────────────── */

export async function fetchNetworkBriefing(): Promise<Briefing> {
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
  } catch (err) {
    console.error('Failed to fetch network briefing:', err)
    return {
      generatedAt: new Date().toISOString(),
      weekLabel: 'Semaine 1',
      findings: [],
      fullText: '',
    }
  }
}

export async function fetchNetworkAlerts(): Promise<Alert[]> {
  try {
    const { data } = await api.get<BackendAlert[]>('/alerts')
    return buildAlerts(data, 'network').sort((a, b) => {
      const o = { critical: 0, warning: 1, info: 2 }
      return o[a.severity] - o[b.severity]
    })
  } catch (err) {
    console.error('Failed to fetch network alerts:', err)
    return []
  }
}

/* ────────────────────────────────────────────
 * User & Staff APIs
 * ──────────────────────────────────────────── */

export async function fetchStaff(institutionId: number): Promise<BackendStaff[]> {
  try {
    const { data } = await api.get<BackendStaff[]>('/staff', { 
      params: { institution_id: institutionId } 
    })
    return data
  } catch (err) {
    console.error('Failed to fetch staff:', err)
    return []
  }
}

export async function fetchStudents(institutionId: number): Promise<BackendStudent[]> {
  try {
    const { data } = await api.get<BackendStudent[]>('/students', { 
      params: { institution_id: institutionId } 
    })
    return data
  } catch (err) {
    console.error('Failed to fetch students:', err)
    return []
  }
}

export async function fetchStudentProfile(): Promise<import('@/types').StudentProfile | null> {
  try {
    const { data } = await api.get('/students/me')
    return {
      name: `${data.first_name} ${data.last_name}`,
      matricule: String(data.id),
      filiere: data.department?.name ?? 'Informatique',
      annee: data.enrollment_year ?? 3,
      tauxPresence: 92,
      moyenne: 14.5,
      credits: 45,
      creditsTotal: 180,
      progression: 'on_track' as const,
      nudge: 'Continuez vos efforts !',
      courses: [],
    }
  } catch (err) {
    console.error('Failed to fetch student profile:', err)
    return null
  }
}

export async function fetchTeacherProfile(): Promise<import('@/types').TeacherProfile | null> {
  try {
    const { data } = await api.get('/staff/me')
    return {
      name: `${data.first_name} ${data.last_name}`,
      courses: [],
    }
  } catch (err) {
    console.error('Failed to fetch teacher profile:', err)
    return null
  }
}

export async function fetchDepartments(institutionId: number): Promise<BackendDepartment[]> {
  try {
    const { data } = await api.get<BackendDepartment[]>('/departments', { 
      params: { institution_id: institutionId } 
    })
    return data
  } catch (err) {
    console.error('Failed to fetch departments:', err)
    return []
  }
}

export async function fetchPrograms(institutionId: number): Promise<BackendProgram[]> {
  try {
    const { data } = await api.get<BackendProgram[]>('/programs', { 
      params: { institution_id: institutionId } 
    })
    return data
  } catch (err) {
    console.error('Failed to fetch programs:', err)
    return []
  }
}

/* ────────────────────────────────────────────
 * Upload APIs
 * ──────────────────────────────────────────── */

export async function uploadFile(file: File, institutionId: number, onProgress?: (p: number) => void): Promise<{ success: boolean; rowsInserted?: number; error?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('institution_id', String(institutionId))
  formData.append('domain_code', 'STU')

  try {
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return { success: true, rowsInserted: data.rows_inserted ?? 0 }
  } catch (err: any) {
    console.error('Upload failed:', err)
    return { success: false, error: err.response?.data?.detail ?? 'Upload failed' }
  }
}

export async function fetchUploadHistory(institutionId?: number) {
  try {
    const params = institutionId ? { institution_id: institutionId } : {}
    const { data } = await api.get('/upload/history', { params })
    return data
  } catch (err) {
    console.error('Failed to fetch upload history:', err)
    return []
  }
}

/* ────────────────────────────────────────────
 * Forecast APIs
 * ──────────────────────────────────────────── */

export async function fetchForecasts(institutionId?: number, metricId?: number) {
  try {
    const params: Record<string, number> = {}
    if (institutionId) params.institution_id = institutionId
    if (metricId) params.metric_id = metricId
    const { data } = await api.get('/forecasts', { params })
    return data
  } catch (err) {
    console.error('Failed to fetch forecasts:', err)
    return []
  }
}

/* ────────────────────────────────────────────
 * Report APIs
 * ──────────────────────────────────────────── */

export async function fetchReports(institutionId?: number, reportType?: string) {
  try {
    const params: Record<string, string | number> = {}
    if (institutionId) params.institution_id = institutionId
    if (reportType) params.report_type = reportType
    const { data } = await api.get('/reports', { params })
    return data
  } catch (err) {
    console.error('Failed to fetch reports:', err)
    return []
  }
}

export async function generateAIReport(institutionId: number, period: string) {
  try {
    const { data } = await api.post('/reports/generate', {
      institution_id: institutionId,
      period,
    })
    return data
  } catch (err) {
    console.error('Failed to generate report:', err)
    return null
  }
}

/* ────────────────────────────────────────────
 * Query API (RAG)
 * ──────────────────────────────────────────── */

export async function askQuestion(question: string, institutionId?: number) {
  try {
    const { data } = await api.post('/query/ask', {
      question,
      institution_id: institutionId,
    })
    return data
  } catch (err) {
    console.error('Failed to ask question:', err)
    return { answer: 'Désolé, une erreur est survenue.', sources: [] }
  }
}
