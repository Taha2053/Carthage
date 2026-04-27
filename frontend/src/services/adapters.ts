/**
 * Data adapters: query Supabase DIRECTLY from the browser.
 * No backend dependency — uses the anon key + RLS-readable tables.
 */
import { supabase } from '@/lib/supabase'
import type { Institution, Alert, Briefing, KpiSnapshot, Health, DashboardSummary } from '@/types'

/* ────────────────────────────────────────────
 * Row Types (matching Supabase schema)
 * ──────────────────────────────────────────── */

interface InstitutionRow {
  id: number
  code: string
  name: string
  short_name?: string
  name_fr?: string
  city?: string
  region?: string
  institution_type?: string
  governing_body?: string
  current_enrollment?: number
  is_active?: boolean
}

interface KPIRow {
  id: number
  institution_id: number
  metric_id: number
  value: number
  dim_metric?: { code: string; name: string; domain_id?: number } | null
  dim_time?: { academic_year?: string; semester?: number; month?: number } | null
}

interface AlertRow {
  id: number
  institution_id: number
  metric_id: number
  severity: 'critical' | 'warning' | 'info'
  message?: string | null
  explanation?: string | null
  recommended_action?: string | null
  resolved?: boolean
  created_at?: string
  dim_metric?: { code: string; name?: string } | null
}

/* ────────────────────────────────────────────
 * KPI snapshot builder
 * ──────────────────────────────────────────── */

function get(kpis: KPIRow[], ...codes: string[]): number {
  for (const code of codes) {
    const row = kpis.find((k) => k.dim_metric?.code === code)
    if (row && row.value != null) return Number(row.value)
  }
  return 0
}

function buildKpiSnapshot(kpis: KPIRow[]): KpiSnapshot {
  return {
    month: new Date().toISOString().slice(0, 7),
    academique: {
      tauxReussite: get(kpis, 'success_rate', 'taux_reussite'),
      tauxPresence: get(kpis, 'attendance_rate', 'taux_presence'),
      tauxAbandon: get(kpis, 'dropout_rate', 'taux_abandon'),
      tauxRedoublement: get(kpis, 'repetition_rate', 'taux_redoublement'),
      effectif: get(kpis, 'enrolled_students', 'effectif'),
    },
    insertion: {
      tauxEmployabilite: get(kpis, 'employability_rate', 'employabilite'),
      delaiInsertion: get(kpis, 'insertion_delay', 'delai_insertion'),
      tauxConventionNationale: get(kpis, 'national_conv_rate'),
      tauxConventionInternationale: get(kpis, 'international_conv_rate'),
    },
    finance: {
      budgetAlloue: get(kpis, 'budget_allocated', 'budget_alloue'),
      budgetConsomme: get(kpis, 'budget_consumed', 'budget_consomme'),
      coutParEtudiant: get(kpis, 'cost_per_student', 'cout_etudiant'),
      tauxExecution: get(kpis, 'budget_execution_rate', 'taux_execution'),
    },
    esg: {
      consommationEnergetique: get(kpis, 'energy_consumption'),
      empreinteCarbone: get(kpis, 'carbon_footprint'),
      tauxRecyclage: get(kpis, 'recycling_rate'),
    },
  }
}

function determineHealth(alerts: AlertRow[]): Health {
  if (alerts.some((a) => a.severity === 'critical')) return 'critical'
  if (alerts.some((a) => a.severity === 'warning')) return 'warning'
  return 'good'
}

function mapAlerts(rows: AlertRow[], institutionId: string): Alert[] {
  return rows.map((a) => ({
    id: String(a.id),
    severity: a.severity,
    message: a.message ?? a.explanation ?? `Anomalie ${a.dim_metric?.code ?? 'KPI'}`,
    domain: 'academique' as const,
    institutionId,
  }))
}

/* ────────────────────────────────────────────
 * Institution APIs
 * ──────────────────────────────────────────── */

export async function fetchAllInstitutions(): Promise<InstitutionRow[]> {
  const { data, error } = await supabase
    .from('dim_institution')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) {
    console.error('[supabase] fetchAllInstitutions:', error.message)
    return []
  }
  return data ?? []
}

export async function fetchInstitutionById(id: number): Promise<InstitutionRow | null> {
  const { data, error } = await supabase
    .from('dim_institution')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    console.error('[supabase] fetchInstitutionById:', error.message)
    return null
  }
  return data
}

export async function fetchInstitutionKPIs(institutionId: number): Promise<KPIRow[]> {
  const { data, error } = await supabase
    .from('fact_kpis')
    .select('id, institution_id, metric_id, value, dim_metric(code, name, domain_id)')
    .eq('institution_id', institutionId)
  if (error) {
    console.error('[supabase] fetchInstitutionKPIs:', error.message)
    return []
  }
  return (data as any) ?? []
}

export async function fetchInstitutionAlerts(institutionId: number): Promise<AlertRow[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('id, institution_id, metric_id, severity, message, explanation, recommended_action, resolved, created_at, dim_metric(code, name)')
    .eq('institution_id', institutionId)
    .eq('resolved', false)
  if (error) {
    console.error('[supabase] fetchInstitutionAlerts:', error.message)
    return []
  }
  return (data as any) ?? []
}

/* ────────────────────────────────────────────
 * Dashboard APIs
 * ──────────────────────────────────────────── */

export async function fetchDashboardInstitutions(): Promise<{ institutions: Institution[]; placeholders: string[] }> {
  const [instRows, alertRows, kpiRows] = await Promise.all([
    fetchAllInstitutions(),
    (async (): Promise<AlertRow[]> => {
      const { data, error } = await supabase
        .from('alerts')
        .select('id, institution_id, metric_id, severity, message, explanation, dim_metric(code, name)')
        .eq('resolved', false)
      if (error) console.error('[supabase] alerts:', error.message)
      return (data as any) ?? []
    })(),
    (async (): Promise<KPIRow[]> => {
      const { data, error } = await supabase
        .from('fact_kpis')
        .select('id, institution_id, metric_id, value, dim_metric(code, name, domain_id)')
      if (error) console.error('[supabase] kpis:', error.message)
      return (data as any) ?? []
    })(),
  ])

  const institutions: Institution[] = instRows.map((inst, idx) => {
    const instAlerts = alertRows.filter((a) => a.institution_id === inst.id)
    const instKpis = kpiRows.filter((k) => k.institution_id === inst.id)
    const current = buildKpiSnapshot(instKpis)
    const alerts = mapAlerts(instAlerts, String(inst.id))

    return {
      id: String(inst.id),
      name: inst.short_name || inst.code || inst.name,
      fullName: inst.name,
      health: determineHealth(instAlerts),
      current,
      history: [current],
      alerts,
      riskScore:
        instAlerts.filter((a) => a.severity === 'critical').length * 30 +
        (100 - (current.academique?.tauxReussite ?? 80)),
      ranking: idx + 1,
      code: inst.code,
      short_name: inst.short_name,
      city: inst.city,
      institution_type: inst.institution_type,
      current_enrollment: inst.current_enrollment,
      governing_body: inst.governing_body,
    }
  })

  return { institutions, placeholders: instRows.map((i) => String(i.id)) }
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [{ institutions }, alertsSummary, briefing] = await Promise.all([
    fetchDashboardInstitutions(),
    fetchNetworkAlerts(),
    fetchNetworkBriefing(),
  ])
  const networkIndex =
    institutions.length === 0
      ? 0
      : Math.round(
          (institutions.reduce(
            (s, i) => s + (i.current.academique?.tauxReussite ?? 0),
            0,
          ) /
            institutions.length) *
            10,
        ) / 10
  return { networkIndex, institutions, alertsSummary, briefing, rankings: [] }
}

export async function fetchInstitutionDetail(id: string): Promise<Institution | null> {
  const numId = parseInt(id)
  if (isNaN(numId)) return null

  const [inst, kpis, alertRows] = await Promise.all([
    fetchInstitutionById(numId),
    fetchInstitutionKPIs(numId),
    fetchInstitutionAlerts(numId),
  ])
  if (!inst) return null

  const current = buildKpiSnapshot(kpis)
  const alerts = mapAlerts(alertRows, id)

  return {
    id: String(inst.id),
    name: inst.short_name || inst.code || inst.name,
    fullName: inst.name,
    health: determineHealth(alertRows),
    current,
    history: [current],
    alerts,
    riskScore:
      alertRows.filter((a) => a.severity === 'critical').length * 30 +
      (100 - (current.academique?.tauxReussite ?? 80)),
    ranking: 1,
    code: inst.code,
    short_name: inst.short_name,
    city: inst.city,
    institution_type: inst.institution_type,
    current_enrollment: inst.current_enrollment,
    governing_body: inst.governing_body,
  }
}

/* ────────────────────────────────────────────
 * Network Briefing (no LLM call — synthesized from data)
 * ──────────────────────────────────────────── */

export async function fetchNetworkBriefing(): Promise<Briefing> {
  const { data: alertRows } = await supabase
    .from('alerts')
    .select('id, institution_id, severity, message, explanation, dim_institution(code, short_name, name)')
    .eq('resolved', false)
    .order('severity')
    .limit(20)

  const findings = (alertRows ?? []).map((a: any) => ({
    severity: (a.severity ?? 'info') as Alert['severity'],
    text: a.message ?? a.explanation ?? 'Alerte détectée',
    institutionId: a.dim_institution?.code ?? String(a.institution_id),
    domain: 'academique',
  }))

  const week = Math.ceil(new Date().getDate() / 7)
  return {
    generatedAt: new Date().toISOString(),
    weekLabel: `Semaine ${week}`,
    findings,
    fullText: findings.length
      ? `${findings.length} alertes actives nécessitent attention.`
      : 'Aucune alerte critique cette semaine.',
  }
}

export async function fetchNetworkAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('id, institution_id, metric_id, severity, message, explanation, dim_metric(code, name)')
    .eq('resolved', false)
  if (error) {
    console.error('[supabase] fetchNetworkAlerts:', error.message)
    return []
  }
  const order = { critical: 0, warning: 1, info: 2 } as const
  return mapAlerts((data as any) ?? [], 'network').sort(
    (a, b) => order[a.severity] - order[b.severity],
  )
}

/* ────────────────────────────────────────────
 * Staff / Students / Departments / Programs
 * ──────────────────────────────────────────── */

export async function fetchStaff(institutionId: number) {
  const { data, error } = await supabase
    .from('dim_staff')
    .select('*')
    .eq('institution_id', institutionId)
  if (error) console.error('[supabase] fetchStaff:', error.message)
  return data ?? []
}

export async function fetchStudents(institutionId: number) {
  const { data, error } = await supabase
    .from('dim_student')
    .select('*')
    .eq('institution_id', institutionId)
  if (error) console.error('[supabase] fetchStudents:', error.message)
  return data ?? []
}

export async function fetchDepartments(institutionId?: number) {
  let q = supabase.from('dim_department').select('*').order('name')
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) console.error('[supabase] fetchDepartments:', error.message)
  return data ?? []
}

export async function fetchPrograms(institutionId: number) {
  const { data, error } = await supabase
    .from('dim_program')
    .select('*')
    .eq('institution_id', institutionId)
  if (error) console.error('[supabase] fetchPrograms:', error.message)
  return data ?? []
}

export async function fetchStudentProfile(): Promise<import('@/types').StudentProfile | null> {
  const { data, error } = await supabase.from('dim_student').select('*').limit(1).maybeSingle()
  if (error || !data) return null
  return {
    name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
    matricule: String(data.id),
    filiere: 'Informatique',
    annee: data.enrollment_year ?? 1,
    tauxPresence: 92,
    moyenne: 14.5,
    credits: 45,
    creditsTotal: 180,
    progression: 'on_track',
    nudge: 'Continuez vos efforts !',
    courses: [],
  }
}

export async function fetchTeacherProfile(): Promise<import('@/types').TeacherProfile | null> {
  const { data, error } = await supabase.from('dim_staff').select('*').limit(1).maybeSingle()
  if (error || !data) return null
  return {
    name: `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim(),
    courses: [],
  }
}

/* ────────────────────────────────────────────
 * Reports / Forecasts / Upload — stubbed (backend not running)
 * ──────────────────────────────────────────── */

export async function fetchForecasts(institutionId?: number, metricId?: number) {
  let q = supabase.from('kpi_forecasts').select('*')
  if (institutionId) q = q.eq('institution_id', institutionId)
  if (metricId) q = q.eq('metric_id', metricId)
  const { data, error } = await q
  if (error) console.error('[supabase] fetchForecasts:', error.message)
  return data ?? []
}

export async function fetchReports(institutionId?: number, reportType?: string) {
  let q = supabase.from('reports').select('*').order('created_at', { ascending: false })
  if (institutionId) q = q.eq('institution_id', institutionId)
  if (reportType) q = q.eq('report_type', reportType)
  const { data, error } = await q
  if (error) console.error('[supabase] fetchReports:', error.message)
  return data ?? []
}

export async function generateAIReport(_institutionId: number, _period: string) {
  return { id: Date.now(), status: 'pending', message: 'Génération en cours…' }
}

export async function uploadFile() {
  return { success: false, error: 'Upload nécessite le backend (non démarré).' }
}

export async function fetchUploadHistory(institutionId?: number) {
  let q = supabase.from('upload_log').select('*').order('created_at', { ascending: false }).limit(50)
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) console.error('[supabase] fetchUploadHistory:', error.message)
  return data ?? []
}

export async function askQuestion(question: string) {
  return { answer: `Question reçue : "${question}". Le module RAG nécessite le backend.`, sources: [] }
}
