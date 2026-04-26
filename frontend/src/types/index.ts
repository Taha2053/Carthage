export type Role = 'ucar_central' | 'institution_admin' | 'enseignant' | 'etudiant'
export type Health = 'critical' | 'warning' | 'good' | 'no_data'
export type Severity = 'critical' | 'warning' | 'info'

export interface KpiAcademique {
  tauxReussite: number
  tauxPresence: number
  tauxAbandon: number
  tauxRedoublement: number
}

export interface KpiInsertion {
  tauxEmployabilite: number
  delaiInsertion: number
  tauxConventionNationale: number
  tauxConventionInternationale: number
}

export interface KpiFinance {
  budgetAlloue: number
  budgetConsomme: number
  coutParEtudiant: number
  tauxExecution: number
}

export interface KpiESG {
  consommationEnergetique: number
  empreinteCarbone: number
  tauxRecyclage: number
}

export interface KpiSnapshot {
  month: string
  academique?: KpiAcademique
  insertion?: KpiInsertion
  finance?: KpiFinance
  esg?: KpiESG
}

export interface Alert {
  id: string
  severity: Severity
  message: string
  domain: 'academique' | 'insertion' | 'finance' | 'esg'
  institutionId: string
}

export interface BriefingFinding {
  severity: Severity
  text: string
  institutionId: string
  domain: string
}

export interface Briefing {
  generatedAt: string
  weekLabel: string
  findings: BriefingFinding[]
  fullText: string
}

export interface Institution {
  id: string
  name: string
  fullName: string
  health: Health
  history: KpiSnapshot[]
  current: KpiSnapshot
  alerts: Alert[]
  riskScore: number
  ranking: number
  briefing?: Briefing
  // Extended fields from DB schema
  code?: string
  short_name?: string
  city?: string
  institution_type?: string
  governing_body?: string
  current_enrollment?: number
}

export interface NLQueryAnswer {
  question: string
  answer: string
  hasChart: boolean
  chartData?: { label: string; value: number }[]
}

export interface StudentProfile {
  name: string
  matricule: string
  filiere: string
  annee: number
  tauxPresence: number
  moyenne: number
  credits: number
  creditsTotal: number
  progression: 'on_track' | 'at_risk' | 'critical'
  nudge: string
  courses: { name: string; note: number; presence: number }[]
}

export interface TeacherProfile {
  name: string
  courses: TeacherCourse[]
}

export interface TeacherCourse {
  id: string
  name: string
  group: string
  students: TeacherStudent[]
}

export interface TeacherStudent {
  id: string
  name: string
  presence: number
  moyenne: number
  risk: 'none' | 'at_risk' | 'critical'
}
