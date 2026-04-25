import type { Institution, NLQueryAnswer, StudentProfile, TeacherProfile } from '@/types'

const generateHistory = (
  baseReussite: number,
  baseAbandon: number,
  baseBudget: number,
  spike?: { month: string; abandonDelta: number },
) => {
  const months = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(2023, i, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  return months.map((month) => {
    const abandonDelta = spike?.month === month ? spike.abandonDelta : 0
    return {
      month,
      academique: {
        tauxReussite: Math.round(baseReussite + (Math.random() - 0.5) * 4),
        tauxPresence: Math.round(82 + (Math.random() - 0.5) * 6),
        tauxAbandon: Math.round(baseAbandon + abandonDelta + (Math.random() - 0.5) * 2),
        tauxRedoublement: Math.round(12 + (Math.random() - 0.5) * 4),
      },
      finance: {
        budgetAlloue: baseBudget,
        budgetConsomme: Math.round(baseBudget * (0.4 + Math.random() * 0.5)),
        coutParEtudiant: Math.round(2800 + Math.random() * 600),
        tauxExecution: Math.round(55 + Math.random() * 35),
      },
      insertion: {
        tauxEmployabilite: Math.round(68 + (Math.random() - 0.5) * 10),
        delaiInsertion: Math.round(5 + Math.random() * 4),
        tauxConventionNationale: Math.round(45 + Math.random() * 20),
        tauxConventionInternationale: Math.round(12 + Math.random() * 10),
      },
      esg: {
        consommationEnergetique: Math.round(180000 + Math.random() * 40000),
        empreinteCarbone: Math.round(85 + Math.random() * 20),
        tauxRecyclage: Math.round(22 + Math.random() * 15),
      },
    }
  })
}

export const mockInstitutions: Institution[] = [
  {
    id: 'fsegt',
    name: 'FSEGT',
    fullName: 'Faculté des Sciences Économiques et de Gestion de Tunis',
    health: 'critical',
    riskScore: 82,
    ranking: 5,
    history: generateHistory(71, 12, 4200000, { month: '2024-10', abandonDelta: 18 }),
    current: {
      month: '2024-12',
      academique: { tauxReussite: 71, tauxPresence: 76, tauxAbandon: 28, tauxRedoublement: 14 },
      finance: { budgetAlloue: 4200000, budgetConsomme: 2940000, coutParEtudiant: 3100, tauxExecution: 70 },
      insertion: { tauxEmployabilite: 64, delaiInsertion: 7, tauxConventionNationale: 48, tauxConventionInternationale: 11 },
      esg: { consommationEnergetique: 198000, empreinteCarbone: 94, tauxRecyclage: 19 },
    },
    alerts: [
      { id: 'a1', severity: 'critical', message: "Le taux d'abandon a augmenté de 18% en octobre 2024 — anomalie détectée vs moyenne des 6 derniers mois.", domain: 'academique', institutionId: 'fsegt' },
      { id: 'a2', severity: 'warning', message: "Le taux de présence est en baisse continue depuis 3 mois (82% → 76%).", domain: 'academique', institutionId: 'fsegt' },
      { id: 'a3', severity: 'info', message: "Taux d'employabilité inférieur à la moyenne réseau (64% vs 71%).", domain: 'insertion', institutionId: 'fsegt' },
    ],
    briefing: {
      generatedAt: '2025-04-25T07:00:00Z',
      weekLabel: 'Semaine du 21 avril 2025',
      findings: [
        { severity: 'critical', text: "Le taux d'abandon à FSEGT a bondi de 18% en octobre — risque de décrochage structurel si aucune action n'est prise.", institutionId: 'fsegt', domain: 'academique' },
        { severity: 'warning', text: "La présence est en recul depuis 3 mois consécutifs. Corrélation avec le calendrier des partiels à surveiller.", institutionId: 'fsegt', domain: 'academique' },
        { severity: 'info', text: "L'employabilité reste 7 points sous la moyenne réseau. Un partenariat entreprise est en cours de signature.", institutionId: 'fsegt', domain: 'insertion' },
      ],
      fullText: `Analyse hebdomadaire — FSEGT — Semaine du 21 avril 2025\n\nLa FSEGT présente cette semaine trois signaux d'attention prioritaires.\n\n1. ABANDON ACADÉMIQUE (CRITIQUE)\nLe taux d'abandon a enregistré un pic de +18% en octobre 2024, portant le taux mensuel à 28% contre une moyenne de 10% sur les 6 mois précédents. Cette anomalie statistique dépasse le seuil d'alerte de 2 écarts-types. Causes probables : période de réorientation post-partiels de mi-semestre, pression financière sur les étudiants de L1. Action recommandée : cellule d'écoute étudiante et audit des conditions d'enseignement.\n\n2. PRÉSENCE EN BAISSE (AVERTISSEMENT)\nLe taux de présence a reculé de 82% à 76% sur trois mois. Bien qu'encore au-dessus du seuil critique (70%), la tendance est préoccupante. Aucun événement exceptionnel dans le calendrier universitaire ne justifie cette baisse.\n\n3. EMPLOYABILITÉ (INFO)\nAvec 64% de diplômés en emploi à 6 mois, la FSEGT se situe 7 points sous la moyenne du réseau UCAR. Un accord-cadre avec deux entreprises tunisiennes est en cours de finalisation pour l'année 2025-2026.`,
    },
  },
  {
    id: 'insat',
    name: 'INSAT',
    fullName: 'Institut National des Sciences Appliquées et de Technologie',
    health: 'warning',
    riskScore: 61,
    ranking: 3,
    history: generateHistory(84, 5, 6800000),
    current: {
      month: '2024-12',
      academique: { tauxReussite: 84, tauxPresence: 88, tauxAbandon: 5, tauxRedoublement: 8 },
      finance: { budgetAlloue: 6800000, budgetConsomme: 5780000, coutParEtudiant: 4100, tauxExecution: 85 },
      insertion: { tauxEmployabilite: 79, delaiInsertion: 4, tauxConventionNationale: 62, tauxConventionInternationale: 28 },
      esg: { consommationEnergetique: 245000, empreinteCarbone: 112, tauxRecyclage: 31 },
    },
    alerts: [
      { id: 'b1', severity: 'warning', message: "Le budget atteint 85% de consommation à mi-exercice — rythme supérieur aux années précédentes.", domain: 'finance', institutionId: 'insat' },
      { id: 'b2', severity: 'info', message: "La consommation énergétique dépasse le plafond ESG fixé par UCAR pour ce trimestre.", domain: 'esg', institutionId: 'insat' },
    ],
    briefing: {
      generatedAt: '2025-04-25T07:00:00Z',
      weekLabel: 'Semaine du 21 avril 2025',
      findings: [
        { severity: 'warning', text: "Le budget de l'INSAT atteint 85% à mi-année, au-dessus de la trajectoire normale.", institutionId: 'insat', domain: 'finance' },
        { severity: 'info', text: "La consommation énergétique dépasse le plafond ESG trimestriel de 8%.", institutionId: 'insat', domain: 'esg' },
        { severity: 'info', text: "Bonne performance académique : taux de réussite stable à 84%, employabilité à 79%.", institutionId: 'insat', domain: 'academique' },
      ],
      fullText: `L'INSAT maintient d'excellents indicateurs académiques cette semaine, avec un taux de réussite de 84% et une employabilité de 79%. Le principal point de vigilance est financier : la consommation budgétaire atteint 85% à mi-exercice, contre 72% à la même période l'année dernière. Si ce rythme se maintient, un dépassement budgétaire est probable avant novembre. Action recommandée : gel préventif des dépenses discrétionnaires Q3.`,
    },
  },
  {
    id: 'enstab',
    name: 'ENSTAB',
    fullName: 'École Nationale des Sciences et Technologies Avancées de Borj Cédria',
    health: 'good',
    riskScore: 22,
    ranking: 1,
    history: generateHistory(88, 4, 3900000),
    current: {
      month: '2024-12',
      academique: { tauxReussite: 88, tauxPresence: 91, tauxAbandon: 4, tauxRedoublement: 6 },
      finance: { budgetAlloue: 3900000, budgetConsomme: 2418000, coutParEtudiant: 3800, tauxExecution: 62 },
      insertion: { tauxEmployabilite: 82, delaiInsertion: 3, tauxConventionNationale: 71, tauxConventionInternationale: 35 },
      esg: { consommationEnergetique: 155000, empreinteCarbone: 68, tauxRecyclage: 41 },
    },
    alerts: [],
    briefing: {
      generatedAt: '2025-04-25T07:00:00Z',
      weekLabel: 'Semaine du 21 avril 2025',
      findings: [
        { severity: 'info', text: "ENSTAB maintient le meilleur score ESG du réseau UCAR — 41% de recyclage, empreinte carbone en baisse.", institutionId: 'enstab', domain: 'esg' },
        { severity: 'info', text: "Taux de réussite à 88% et employabilité à 82% — meilleurs du réseau cette semaine.", institutionId: 'enstab', domain: 'academique' },
        { severity: 'info', text: "Aucune anomalie détectée. Exécution budgétaire en ligne avec la trajectoire annuelle.", institutionId: 'enstab', domain: 'finance' },
      ],
      fullText: `ENSTAB affiche cette semaine les meilleurs indicateurs du réseau UCAR sur quasiment tous les domaines. Taux de réussite à 88%, présence à 91%, employabilité à 82% en 3 mois. L'établissement est également le leader ESG du réseau avec 41% de taux de recyclage et une empreinte carbone de 68 tCO2, en baisse de 12% par rapport à l'année précédente. Aucune alerte active.`,
    },
  },
  {
    id: 'ihec',
    name: 'IHEC Carthage',
    fullName: 'Institut des Hautes Études Commerciales de Carthage',
    health: 'good',
    riskScore: 31,
    ranking: 2,
    history: generateHistory(82, 7, 5100000),
    current: {
      month: '2024-12',
      academique: { tauxReussite: 82, tauxPresence: 87, tauxAbandon: 7, tauxRedoublement: 10 },
      finance: { budgetAlloue: 5100000, budgetConsomme: 3264000, coutParEtudiant: 3400, tauxExecution: 64 },
      insertion: { tauxEmployabilite: 76, delaiInsertion: 5, tauxConventionNationale: 58, tauxConventionInternationale: 22 },
      esg: { consommationEnergetique: 192000, empreinteCarbone: 88, tauxRecyclage: 28 },
    },
    alerts: [
      { id: 'c1', severity: 'info', message: "Taux de redoublement légèrement au-dessus de la médiane réseau (10% vs 8%).", domain: 'academique', institutionId: 'ihec' },
    ],
    briefing: {
      generatedAt: '2025-04-25T07:00:00Z',
      weekLabel: 'Semaine du 21 avril 2025',
      findings: [
        { severity: 'info', text: "IHEC maintient de bons indicateurs. Légère hausse du taux de redoublement à surveiller.", institutionId: 'ihec', domain: 'academique' },
        { severity: 'info', text: "Exécution budgétaire à 64%, en ligne avec la trajectoire.", institutionId: 'ihec', domain: 'finance' },
        { severity: 'info', text: "Aucune anomalie critique détectée cette semaine.", institutionId: 'ihec', domain: 'academique' },
      ],
      fullText: `IHEC Carthage présente une semaine stable. Les indicateurs académiques sont dans la norme réseau, avec un léger signal sur le taux de redoublement (10% vs médiane de 8%). L'exécution budgétaire est maîtrisée à 64%. Aucune alerte critique.`,
    },
  },
  {
    id: 'ipeit',
    name: 'IPEIT',
    fullName: "Institut Préparatoire aux Études d'Ingénieur de Tunis",
    health: 'warning',
    riskScore: 54,
    ranking: 4,
    history: generateHistory(76, 9, 2800000),
    current: {
      month: '2024-12',
      academique: { tauxReussite: 76, tauxPresence: 83, tauxAbandon: 9, tauxRedoublement: 16 },
      finance: { budgetAlloue: 2800000, budgetConsomme: 1764000, coutParEtudiant: 2600, tauxExecution: 63 },
      insertion: { tauxEmployabilite: 55, delaiInsertion: 9, tauxConventionNationale: 32, tauxConventionInternationale: 6 },
      esg: { consommationEnergetique: 168000, empreinteCarbone: 79, tauxRecyclage: 18 },
    },
    alerts: [
      { id: 'd1', severity: 'warning', message: "Taux d'employabilité à 55% — 16 points sous la moyenne réseau. Aucun partenariat entreprise actif.", domain: 'insertion', institutionId: 'ipeit' },
      { id: 'd2', severity: 'warning', message: "Taux de redoublement à 16% — le plus élevé du réseau cette période.", domain: 'academique', institutionId: 'ipeit' },
    ],
    briefing: {
      generatedAt: '2025-04-25T07:00:00Z',
      weekLabel: 'Semaine du 21 avril 2025',
      findings: [
        { severity: 'warning', text: "L'employabilité de l'IPEIT est à 55%, soit 16 points sous la moyenne réseau UCAR.", institutionId: 'ipeit', domain: 'insertion' },
        { severity: 'warning', text: "Taux de redoublement de 16% — le plus élevé du réseau. Potentiel d'accompagnement pédagogique.", institutionId: 'ipeit', domain: 'academique' },
        { severity: 'info', text: "Exécution budgétaire stable. Aucun dépassement prévu.", institutionId: 'ipeit', domain: 'finance' },
      ],
      fullText: `L'IPEIT présente deux alertes d'avertissement cette semaine. Le taux d'employabilité à 55% est le plus bas du réseau et aucun partenariat entreprise actif n'est recensé. Par ailleurs, le taux de redoublement de 16% suggère une difficulté pédagogique structurelle, notamment en filière mathématiques-informatique. Action recommandée : plan d'accompagnement renforcé pour les étudiants en difficulté et signature prioritaire de conventions avec des entreprises du bassin technologique.`,
    },
  },
  {
    id: 'fst',
    name: 'FST',
    fullName: 'Faculté des Sciences de Tunis',
    health: 'no_data',
    riskScore: 0,
    ranking: 6,
    history: [],
    current: {
      month: '2024-11',
      academique: { tauxReussite: 79, tauxPresence: 85, tauxAbandon: 8, tauxRedoublement: 11 },
      finance: { budgetAlloue: 5800000, budgetConsomme: 3132000, coutParEtudiant: 2900, tauxExecution: 54 },
      insertion: { tauxEmployabilite: 70, delaiInsertion: 6, tauxConventionNationale: 51, tauxConventionInternationale: 14 },
      esg: { consommationEnergetique: 220000, empreinteCarbone: 101, tauxRecyclage: 23 },
    },
    alerts: [
      { id: 'e1', severity: 'warning', message: "Rapport mensuel de décembre non soumis — échéance dépassée depuis 3 jours.", domain: 'academique', institutionId: 'fst' },
    ],
  },
]

export const placeholderInstitutions = [
  'ESCT', 'ISG', 'ISAMM', 'ISAE Tunis', 'ISAM Sousse', 'ISCAE',
  'ISG Sousse', 'ISLAIB', 'ISET Tunis', 'ISET Bizerte', 'ISET Nabeul',
  'ISET Radès', 'ISET Siliana', 'ISET Zaghouan', 'ISET Charguia',
  'ISBM', 'ISB', 'ISBA', 'ISCGB', 'ISCGK', 'ISGG', 'ISAM Gafsa',
  'ISBNS', 'ISCC', 'ISG Gafsa', 'ISL', 'ISPTK', 'ISCM',
]

export const mockUCARBriefing = {
  generatedAt: '2025-04-25T07:00:00Z',
  weekLabel: 'Semaine du 21 avril 2025',
  findings: [
    {
      severity: 'critical' as const,
      text: "Le taux d'abandon à la FSEGT a augmenté de 18% en octobre — risque structurel identifié.",
      institutionId: 'fsegt',
      domain: 'academique',
    },
    {
      severity: 'warning' as const,
      text: "Le budget de l'INSAT atteint 85% à mi-exercice. Risque de dépassement en Q3.",
      institutionId: 'insat',
      domain: 'finance',
    },
    {
      severity: 'warning' as const,
      text: "4 établissements n'ont pas soumis leur rapport mensuel ESG. Échéance dépassée.",
      institutionId: 'fst',
      domain: 'esg',
    },
  ],
  fullText: `Briefing stratégique UCAR — Semaine du 21 avril 2025\n\nCette semaine, le réseau de l'Université de Carthage présente 2 alertes critiques et 3 signaux d'avertissement sur 34 établissements suivis.\n\nALERTES CRITIQUES :\n• FSEGT — Taux d'abandon : +18% en octobre, anomalie confirmée sur 2 écarts-types. Action urgente recommandée.\n\nAVERTISSEMENTS :\n• INSAT — Budget à 85% à mi-exercice. Trajectoire à corriger avant Q3.\n• FST et 3 autres établissements n'ont pas soumis leur rapport mensuel. Rappel automatique envoyé.\n• IPEIT — Employabilité à 55%, 16 points sous la médiane réseau.\n\nPOINTS POSITIFS :\n• ENSTAB maintient le meilleur score global du réseau pour le 3e trimestre consécutif.\n• Taux de réussite moyen réseau stable à 79.8% (+0.3% vs semaine précédente).`,
}

export const nlQueryCache: NLQueryAnswer[] = [
  {
    question: "Quel établissement a le taux d'abandon le plus élevé ?",
    answer: "La FSEGT présente le taux d'abandon le plus élevé du réseau cette semaine, à 28% — soit +18% par rapport à la moyenne des 6 derniers mois. Une anomalie critique a été détectée et une alerte est active.",
    hasChart: true,
    chartData: [
      { label: 'FSEGT', value: 28 },
      { label: 'IPEIT', value: 9 },
      { label: 'IHEC', value: 7 },
      { label: 'FST', value: 8 },
      { label: 'INSAT', value: 5 },
      { label: 'ENSTAB', value: 4 },
    ],
  },
  {
    question: 'Quel est le budget total consommé cette année ?',
    answer: "Le budget total consommé par les 6 établissements suivis s'élève à 19 298 000 TND, sur un budget alloué de 28 600 000 TND — soit un taux d'exécution moyen de 67%. L'INSAT présente le taux d'exécution le plus élevé (85%).",
    hasChart: true,
    chartData: [
      { label: 'FSEGT', value: 70 },
      { label: 'INSAT', value: 85 },
      { label: 'ENSTAB', value: 62 },
      { label: 'IHEC', value: 64 },
      { label: 'IPEIT', value: 63 },
      { label: 'FST', value: 54 },
    ],
  },
  {
    question: 'Quels établissements ont soumis leur rapport ce mois ?',
    answer: "5 établissements sur 6 ont soumis leur rapport de décembre 2024 : FSEGT, INSAT, ENSTAB, IHEC Carthage et IPEIT. La FST n'a pas encore soumis son rapport — échéance dépassée depuis 3 jours. Un rappel automatique a été envoyé.",
    hasChart: false,
  },
  {
    question: "Quel est le meilleur établissement en termes d'employabilité ?",
    answer: "L'ENSTAB affiche le meilleur taux d'employabilité du réseau avec 82% de ses diplômés en emploi dans les 6 mois suivant leur sortie, et un délai d'insertion moyen de 3 mois — le plus court du réseau.",
    hasChart: true,
    chartData: [
      { label: 'ENSTAB', value: 82 },
      { label: 'INSAT', value: 79 },
      { label: 'IHEC', value: 76 },
      { label: 'FST', value: 70 },
      { label: 'FSEGT', value: 64 },
      { label: 'IPEIT', value: 55 },
    ],
  },
  {
    question: 'Quelles sont les tendances ESG du réseau ?',
    answer: "Le réseau UCAR consomme en moyenne 196 333 kWh par mois. L'ENSTAB est le leader ESG avec 41% de taux de recyclage et l'empreinte carbone la plus basse (68 tCO2). L'INSAT dépasse le plafond énergétique trimestriel fixé par UCAR.",
    hasChart: true,
    chartData: [
      { label: 'ENSTAB', value: 41 },
      { label: 'INSAT', value: 31 },
      { label: 'IHEC', value: 28 },
      { label: 'FST', value: 23 },
      { label: 'FSEGT', value: 19 },
      { label: 'IPEIT', value: 18 },
    ],
  },
]

export const mockStudentProfile: StudentProfile = {
  name: 'Amira Ben Salah',
  matricule: '2023-FSEGT-1842',
  filiere: 'Licence Économie et Gestion',
  annee: 2,
  tauxPresence: 74,
  moyenne: 11.8,
  credits: 38,
  creditsTotal: 60,
  progression: 'at_risk',
  nudge: "Votre taux de présence en Mathématiques Financières est en baisse (68%). Un conseiller pédagogique est disponible pour vous aider — prenez rendez-vous via le portail.",
  courses: [
    { name: 'Mathématiques Financières', note: 9.5, presence: 68 },
    { name: 'Économie Internationale', note: 13.2, presence: 82 },
    { name: 'Comptabilité Analytique', note: 11.0, presence: 75 },
    { name: 'Droit des Affaires', note: 14.5, presence: 88 },
    { name: 'Statistiques Appliquées', note: 10.8, presence: 71 },
    { name: 'Anglais des Affaires', note: 15.0, presence: 91 },
  ],
}

export const mockTeacherProfile: TeacherProfile = {
  name: 'Dr. Karim Mansouri',
  courses: [
    {
      id: 'math-fin-l2a',
      name: 'Mathématiques Financières',
      group: 'L2-A (32 étudiants)',
      students: [
        { id: 's1', name: 'Amira Ben Salah', presence: 68, moyenne: 9.5, risk: 'at_risk' },
        { id: 's2', name: 'Yassine Trabelsi', presence: 45, moyenne: 7.2, risk: 'critical' },
        { id: 's3', name: 'Nour El Houda Karray', presence: 88, moyenne: 14.1, risk: 'none' },
        { id: 's4', name: 'Mohamed Amine Gharbi', presence: 72, moyenne: 11.3, risk: 'none' },
        { id: 's5', name: 'Lina Chaabane', presence: 58, moyenne: 8.8, risk: 'at_risk' },
        { id: 's6', name: 'Chaker Ben Romdhane', presence: 91, moyenne: 15.5, risk: 'none' },
        { id: 's7', name: 'Fatma Ezzahra Missaoui', presence: 50, moyenne: 7.9, risk: 'critical' },
        { id: 's8', name: 'Ayoub Jerbi', presence: 83, moyenne: 12.7, risk: 'none' },
      ],
    },
    {
      id: 'stat-app-l2b',
      name: 'Statistiques Appliquées',
      group: 'L2-B (28 étudiants)',
      students: [
        { id: 's9', name: 'Sonia Bouaziz', presence: 92, moyenne: 16.2, risk: 'none' },
        { id: 's10', name: 'Hamza Zouari', presence: 61, moyenne: 9.1, risk: 'at_risk' },
        { id: 's11', name: 'Ines Mnif', presence: 87, moyenne: 13.8, risk: 'none' },
        { id: 's12', name: 'Adem Sfar', presence: 43, moyenne: 6.5, risk: 'critical' },
        { id: 's13', name: 'Mariem Dridi', presence: 79, moyenne: 11.9, risk: 'none' },
        { id: 's14', name: 'Omar Belhaj', presence: 55, moyenne: 8.2, risk: 'at_risk' },
      ],
    },
  ],
}
