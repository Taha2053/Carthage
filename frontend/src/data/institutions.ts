export type InstitutionType = 'faculte' | 'ecole' | 'institut' | 'ecole_agro' | 'recherche'

export interface PublicInstitution {
  id: string
  acronym: string
  name: string
  fullName: string
  city: string
  type: InstitutionType
  pin: { x: number; y: number }
  studentCount: number
  staffCount: number
  programCount: number
  foundedYear: number
  insertionRate: number
  internationalPartnerships: number
  researchScore: number
  description: string
  specialties: string[]
  healthStatus: 'good' | 'warning' | 'no_data'
}

export const TYPE_COLOR: Record<InstitutionType, string> = {
  faculte:    '#1B4F72',
  ecole:      '#C5933A',
  institut:   '#0F1923',
  ecole_agro: '#1E8449',
  recherche:  '#7B3F8E',
}

export const TYPE_LABEL: Record<InstitutionType, string> = {
  faculte:    'Faculté',
  ecole:      'École',
  institut:   'Institut',
  ecole_agro: 'Agro/Alimentaire',
  recherche:  'Recherche',
}

export const UCAR_INSTITUTIONS: PublicInstitution[] = [
  // ── Facultés ────────────────────────────────────────────────────────
  {
    id: 'fsjpst', acronym: 'FSJPST', name: 'Sciences Juridiques Tunis',
    fullName: 'Faculté des Sciences Juridiques, Politiques et Sociales de Tunis',
    city: 'Tunis', type: 'faculte', pin: { x: 148, y: 95 },
    studentCount: 8400, staffCount: 210, programCount: 12, foundedYear: 1969,
    insertionRate: 68, internationalPartnerships: 14, researchScore: 62,
    description: 'Pôle de référence en droit, sciences politiques et sciences sociales.',
    specialties: ['Droit public', 'Droit privé', 'Sciences politiques', 'Sociologie'],
    healthStatus: 'good',
  },
  {
    id: 'fsb', acronym: 'FSB', name: 'Sciences de Bizerte',
    fullName: 'Faculté des Sciences de Bizerte',
    city: 'Bizerte', type: 'faculte', pin: { x: 128, y: 40 },
    studentCount: 4200, staffCount: 185, programCount: 11, foundedYear: 1995,
    insertionRate: 64, internationalPartnerships: 13, researchScore: 66,
    description: 'Faculté des sciences fondamentales à Bizerte.',
    specialties: ['Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique'],
    healthStatus: 'good',
  },
  {
    id: 'fsegn', acronym: 'FSEGN', name: 'Sciences Économiques Nabeul',
    fullName: 'Faculté des Sciences Économiques et de Gestion de Nabeul',
    city: 'Nabeul', type: 'faculte', pin: { x: 208, y: 138 },
    studentCount: 3600, staffCount: 142, programCount: 9, foundedYear: 2001,
    insertionRate: 65, internationalPartnerships: 10, researchScore: 55,
    description: 'Faculté de gestion desservant le Cap Bon.',
    specialties: ['Économie', 'Gestion', 'Finance', 'Commerce'],
    healthStatus: 'good',
  },
  // ── Ecoles ──────────────────────────────────────────────────────────
  {
    id: 'enau', acronym: 'ENAU', name: 'Architecture et Urbanisme',
    fullName: "École Nationale d'Architecture et d'Urbanisme de Tunis",
    city: 'Tunis', type: 'ecole', pin: { x: 150, y: 103 },
    studentCount: 1200, staffCount: 98, programCount: 5, foundedYear: 1975,
    insertionRate: 79, internationalPartnerships: 22, researchScore: 71,
    description: "Seule école nationale d'architecture en Tunisie.",
    specialties: ['Architecture', 'Urbanisme', 'Design', 'Patrimoine'],
    healthStatus: 'good',
  },
  {
    id: 'ept', acronym: 'EPT', name: 'Polytechnique de Tunisie',
    fullName: 'École Polytechnique de Tunisie',
    city: 'La Marsa', type: 'ecole', pin: { x: 165, y: 78 },
    studentCount: 1100, staffCount: 95, programCount: 6, foundedYear: 1992,
    insertionRate: 94, internationalPartnerships: 48, researchScore: 93,
    description: 'Grande école d\'ingénieurs, référence nationale.',
    specialties: ['Mathématiques appliquées', 'Génie industriel', 'Informatique', 'Finance quantitative'],
    healthStatus: 'good',
  },
  {
    id: 'estic', acronym: 'ESTIC', name: 'Technologie & Informatique Carthage',
    fullName: 'École Supérieure de Technologie et d\'Informatique à Carthage',
    city: 'Carthage', type: 'ecole', pin: { x: 171, y: 84 },
    studentCount: 1380, staffCount: 104, programCount: 8, foundedYear: 1998,
    insertionRate: 87, internationalPartnerships: 21, researchScore: 79,
    description: 'Formation en informatique appliquée et nouvelles technologies.',
    specialties: ['Développement logiciel', 'IA', 'Réseaux', 'Cloud computing'],
    healthStatus: 'good',
  },
  {
    id: 'essai', acronym: 'ESSAI', name: 'Statistiques & Analyse',
    fullName: "École Supérieure des Statistiques et d'Analyse de l'Information",
    city: 'Tunis', type: 'ecole', pin: { x: 155, y: 98 },
    studentCount: 680, staffCount: 62, programCount: 4, foundedYear: 1993,
    insertionRate: 84, internationalPartnerships: 11, researchScore: 78,
    description: "Formation d'élite en statistiques, data science et analyse d'information.",
    specialties: ['Statistiques', 'Data Science', 'Actuariat', 'Big Data'],
    healthStatus: 'good',
  },
  {
    id: 'esac', acronym: 'ESAC', name: 'Audiovisuel et Cinéma Gammarth',
    fullName: "École Supérieure de l'Audiovisuel et du Cinéma de Gammarth",
    city: 'Gammarth', type: 'ecole', pin: { x: 169, y: 73 },
    studentCount: 340, staffCount: 52, programCount: 5, foundedYear: 2004,
    insertionRate: 72, internationalPartnerships: 19, researchScore: 58,
    description: 'Seule école dédiée au cinéma et à l\'audiovisuel en Tunisie.',
    specialties: ['Réalisation', 'Montage', 'Production', 'Photographie', 'Animation'],
    healthStatus: 'good',
  },
  {
    id: 'supcom', acronym: "SUP'COM", name: 'Supérieure des Communications',
    fullName: "École Supérieure des Communications de Tunis",
    city: 'Ariana', type: 'ecole', pin: { x: 157, y: 91 },
    studentCount: 1420, staffCount: 112, programCount: 7, foundedYear: 2000,
    insertionRate: 92, internationalPartnerships: 36, researchScore: 89,
    description: 'École d\'élite en télécommunications et technologies numériques.',
    specialties: ['Télécommunications', 'Réseaux 5G', 'IoT', 'Cybersécurité'],
    healthStatus: 'good',
  },
  {
    id: 'esam_mograne', acronym: 'ESAM Mograne', name: 'Agriculture Mograne',
    fullName: "École Supérieure d'Agriculture de Mograne",
    city: 'Mograne', type: 'ecole_agro', pin: { x: 187, y: 147 },
    studentCount: 360, staffCount: 44, programCount: 4, foundedYear: 1900,
    insertionRate: 79, internationalPartnerships: 12, researchScore: 68,
    description: 'Doyenne des écoles d\'agronomie tunisiennes.',
    specialties: ['Viticulture', 'Arboriculture', 'Productions animales', 'Agro-éco'],
    healthStatus: 'good',
  },
  {
    id: 'esam_mateur', acronym: 'ESAM Mateur', name: 'Agriculture Mateur',
    fullName: "École Supérieure d'Agriculture de Mateur",
    city: 'Mateur', type: 'ecole_agro', pin: { x: 116, y: 62 },
    studentCount: 420, staffCount: 48, programCount: 4, foundedYear: 1982,
    insertionRate: 76, internationalPartnerships: 8, researchScore: 65,
    description: 'École d\'agronomie dans le nord-ouest tunisien.',
    specialties: ['Productions végétales', 'Agro-pédologie', 'Machinisme agricole', 'Élevage'],
    healthStatus: 'good',
  },
  {
    id: 'esiat', acronym: 'ESIAT', name: 'Industries Alimentaires',
    fullName: 'École Supérieure des Industries Alimentaires de Tunis',
    city: 'Tunis', type: 'ecole_agro', pin: { x: 161, y: 114 },
    studentCount: 540, staffCount: 58, programCount: 4, foundedYear: 1985,
    insertionRate: 81, internationalPartnerships: 12, researchScore: 69,
    description: 'Formation et recherche en industries agroalimentaires.',
    specialties: ['Industries alimentaires', 'Qualité', 'Biotechnologie', 'Sécurité alimentaire'],
    healthStatus: 'good',
  },
  // ── Instituts ───────────────────────────────────────────────────────
  {
    id: 'ipeib', acronym: 'IPEIB', name: "Études d'Ingénieur Bizerte",
    fullName: "Institut Préparatoire aux Études d'Ingénieur de Bizerte",
    city: 'Bizerte', type: 'institut', pin: { x: 133, y: 46 },
    studentCount: 640, staffCount: 55, programCount: 2, foundedYear: 1996,
    insertionRate: 82, internationalPartnerships: 5, researchScore: 58,
    description: 'Classe préparatoire en ingénierie à Bizerte.',
    specialties: ['Mathématiques', 'Physique', 'Sciences de l\'ingénieur'],
    healthStatus: 'good',
  },
  {
    id: 'ihec', acronym: 'IHEC Carthage', name: 'Hautes Études Commerciales',
    fullName: 'Institut des Hautes Études Commerciales de Carthage',
    city: 'Carthage', type: 'institut', pin: { x: 172, y: 87 },
    studentCount: 2100, staffCount: 130, programCount: 10, foundedYear: 1992,
    insertionRate: 82, internationalPartnerships: 29, researchScore: 74,
    description: 'Grande école de management et commerce international.',
    specialties: ['Management', 'Finance', 'Marketing', 'Commerce international'],
    healthStatus: 'good',
  },
  {
    id: 'insat', acronym: 'INSAT', name: 'Sciences Appliquées et Technologie',
    fullName: 'Institut National des Sciences Appliquées et de Technologie',
    city: 'Tunis', type: 'institut', pin: { x: 152, y: 109 },
    studentCount: 3800, staffCount: 180, programCount: 14, foundedYear: 1992,
    insertionRate: 88, internationalPartnerships: 41, researchScore: 91,
    description: "Institut d'excellence en ingénierie et technologies appliquées.",
    specialties: ['Génie logiciel', 'Réseaux', 'Automatique', 'Mécanique'],
    healthStatus: 'good',
  },
  {
    id: 'issat_mateur', acronym: 'ISSAT Mateur', name: 'Sciences Appliquées Mateur',
    fullName: "Institut Supérieur des Sciences Appliquées et de la Technologie de Mateur",
    city: 'Mateur', type: 'institut', pin: { x: 118, y: 65 },
    studentCount: 780, staffCount: 62, programCount: 5, foundedYear: 2002,
    insertionRate: 71, internationalPartnerships: 4, researchScore: 52,
    description: 'Formation technologique polyvalente à Mateur.',
    specialties: ['Génie électrique', 'Mécanique', 'Informatique industrielle', 'Maintenance'],
    healthStatus: 'good',
  },
  {
    id: 'ipein', acronym: 'IPEIN', name: "Études d'Ingénieur Nabeul",
    fullName: "Institut Préparatoire aux Études d'Ingénieur Nabeul",
    city: 'Nabeul', type: 'institut', pin: { x: 212, y: 143 },
    studentCount: 560, staffCount: 52, programCount: 2, foundedYear: 1997,
    insertionRate: 80, internationalPartnerships: 4, researchScore: 55,
    description: 'Classe préparatoire ingénierie dans le Cap Bon.',
    specialties: ['Mathématiques', 'Physique', 'Chimie', 'Sciences de l\'ingénieur'],
    healthStatus: 'good',
  },
  {
    id: 'ipest', acronym: 'IPEST', name: 'Études Scientifiques La Marsa',
    fullName: 'Institut Préparatoire aux Études Scientifiques et Techniques de la Marsa',
    city: 'La Marsa', type: 'institut', pin: { x: 166, y: 76 },
    studentCount: 720, staffCount: 60, programCount: 2, foundedYear: 1994,
    insertionRate: 88, internationalPartnerships: 6, researchScore: 65,
    description: 'Classe préparatoire d\'excellence scientifique.',
    specialties: ['Mathématiques', 'Physique', 'Informatique', 'MPSI/PCSI'],
    healthStatus: 'good',
  },
  {
    id: 'isban', acronym: 'ISBAN', name: 'Beaux Arts Nabeul',
    fullName: 'Institut Supérieur des Beaux Arts de Nabeul',
    city: 'Nabeul', type: 'institut', pin: { x: 215, y: 148 },
    studentCount: 380, staffCount: 46, programCount: 4, foundedYear: 1995,
    insertionRate: 58, internationalPartnerships: 15, researchScore: 42,
    description: 'Espace de création et d\'expression artistique.',
    specialties: ['Peinture', 'Sculpture', 'Céramique', 'Arts numériques'],
    healthStatus: 'good',
  },
  {
    id: 'isteub', acronym: 'ISTEUB', name: 'Technologies Environnement Bâtiment',
    fullName: "Institut Supérieur des Technologies de l'Environnement, de l'Urbanisme et du Bâtiment",
    city: 'Tunis', type: 'institut', pin: { x: 158, y: 107 },
    studentCount: 920, staffCount: 74, programCount: 6, foundedYear: 1997,
    insertionRate: 73, internationalPartnerships: 8, researchScore: 60,
    description: 'Formation en génie civil, bâtiment et développement durable.',
    specialties: ['Génie civil', 'Bâtiment', 'Environnement', 'Urbanisme'],
    healthStatus: 'good',
  },
  {
    id: 'islt', acronym: 'ISLT', name: 'Langues de Tunis',
    fullName: 'Institut Supérieur des Langues de Tunis',
    city: 'Tunis', type: 'institut', pin: { x: 145, y: 109 },
    studentCount: 1840, staffCount: 120, programCount: 8, foundedYear: 1988,
    insertionRate: 71, internationalPartnerships: 18, researchScore: 55,
    description: 'Pôle de formation linguistique et traduction.',
    specialties: ['Anglais', 'Français', 'Arabe', 'Allemand', 'Espagnol', 'Traduction'],
    healthStatus: 'good',
  },
  {
    id: 'islain', acronym: 'ISLAIB', name: 'Langues et Informatique Nabeul',
    fullName: "Institut Supérieur des Langues Appliquées et d'Informatique de Nabeul",
    city: 'Nabeul', type: 'institut', pin: { x: 210, y: 153 },
    studentCount: 980, staffCount: 78, programCount: 6, foundedYear: 2000,
    insertionRate: 67, internationalPartnerships: 9, researchScore: 49,
    description: 'Double compétence langues et informatique.',
    specialties: ['Anglais', 'Informatique', 'Traduction technique', 'Commerce électronique'],
    healthStatus: 'good',
  },
  {
    id: 'isste', acronym: 'ISSTE Borj Cédria', name: 'Sciences & Technologies Environnement',
    fullName: "Institut Supérieur des Sciences et Technologies de l'Environnement de Borj Cédria",
    city: 'Borj Cédria', type: 'institut', pin: { x: 176, y: 120 },
    studentCount: 620, staffCount: 55, programCount: 4, foundedYear: 2000,
    insertionRate: 70, internationalPartnerships: 9, researchScore: 65,
    description: 'Recherche et enseignement en sciences environnementales.',
    specialties: ['Environnement', 'Énergie renouvelable', 'Écologie', 'Chimie verte'],
    healthStatus: 'good',
  },
  {
    id: 'iscc_bizerte', acronym: 'ISCC Bizerte', name: 'Commerce et Comptabilité Bizerte',
    fullName: 'Institut Supérieur de Commerce et de Comptabilité de Bizerte',
    city: 'Bizerte', type: 'institut', pin: { x: 126, y: 47 },
    studentCount: 1240, staffCount: 82, programCount: 6, foundedYear: 1998,
    insertionRate: 69, internationalPartnerships: 6, researchScore: 48,
    description: 'Formation en sciences comptables, audit et gestion.',
    specialties: ['Comptabilité', 'Audit', 'Gestion', 'Finance d\'entreprise'],
    healthStatus: 'good',
  },
  {
    id: 'isepbg', acronym: 'ISEPBG', name: 'Biologie Géologie Soukra',
    fullName: "Institut Supérieur des Études Préparatoires en Biologie et Géologie à Soukra",
    city: 'Soukra', type: 'institut', pin: { x: 153, y: 94 },
    studentCount: 880, staffCount: 68, programCount: 2, foundedYear: 1994,
    insertionRate: 65, internationalPartnerships: 4, researchScore: 48,
    description: 'Classe préparatoire en biologie et géologie.',
    specialties: ['Biologie', 'Géologie', 'Chimie', 'Physique'],
    healthStatus: 'good',
  },
  {
    id: 'intes', acronym: 'INTES', name: 'Travail et Études Sociales',
    fullName: "Institut National du Travail et des Études Sociales de Tunis",
    city: 'Tunis', type: 'institut', pin: { x: 143, y: 104 },
    studentCount: 760, staffCount: 65, programCount: 5, foundedYear: 1990,
    insertionRate: 66, internationalPartnerships: 7, researchScore: 52,
    description: 'Formation en ressources humaines et relations du travail.',
    specialties: ['RH', 'Droit du travail', 'Protection sociale', 'Développement social'],
    healthStatus: 'good',
  },
  {
    id: 'isce', acronym: 'ISCE', name: "Cadres de l'Enfance",
    fullName: "Institut Supérieur des Cadres de l'Enfance",
    city: 'Tunis', type: 'institut', pin: { x: 147, y: 114 },
    studentCount: 480, staffCount: 42, programCount: 3, foundedYear: 1999,
    insertionRate: 78, internationalPartnerships: 5, researchScore: 44,
    description: 'Formation des professionnels de l\'enfance.',
    specialties: ["Éducation préscolaire", "Psychologie enfant", "Animation", "Protection enfance"],
    healthStatus: 'good',
  },
  {
    id: 'inat', acronym: 'INAT', name: 'Agronomie',
    fullName: 'Institut National Agronomique de Tunisie',
    city: 'Tunis', type: 'institut', pin: { x: 163, y: 104 },
    studentCount: 1680, staffCount: 148, programCount: 9, foundedYear: 1898,
    insertionRate: 74, internationalPartnerships: 28, researchScore: 82,
    description: 'Le plus ancien établissement d\'seignement supérieur agronomique de Tunisie.',
    specialties: ['Agronomie', 'Eaux et forêts', 'Économie rurale', 'Biotechnologie végétale'],
    healthStatus: 'good',
  },
  {
    id: 'ihet', acronym: 'IHET Sidi Dhrif', name: 'Hautes Études Touristiques',
    fullName: "Institut des Hautes Études Touristiques de Sidi Dhrif",
    city: 'Sidi Dhrif', type: 'institut', pin: { x: 181, y: 124 },
    studentCount: 480, staffCount: 44, programCount: 5, foundedYear: 1968,
    insertionRate: 76, internationalPartnerships: 16, researchScore: 50,
    description: 'Formation en tourisme, hôtellerie et patrimoine culturel.',
    specialties: ['Tourisme', 'Hôtellerie', 'Patrimoine', 'Management culturel'],
    healthStatus: 'good',
  },
  {
    id: 'ispa_bizerte', acronym: 'ISPA Bizerte', name: 'Pêche et Aquaculture',
    fullName: "Institut Supérieur de Pêche et d'Aquaculture de Bizerte",
    city: 'Bizerte', type: 'institut', pin: { x: 131, y: 53 },
    studentCount: 280, staffCount: 38, programCount: 3, foundedYear: 1999,
    insertionRate: 78, internationalPartnerships: 11, researchScore: 62,
    description: 'Unique établissement tunisien dédié à la pêche et l\'aquaculture.',
    specialties: ['Aquaculture', 'Pêche maritime', 'Sciences halieutiques', 'Environnement marin'],
    healthStatus: 'good',
  },
  // ── Recherche ───────────────────────────────────────────────────────
  {
    id: 'inrgref', acronym: 'INRGREF', name: 'Génie Rural Eau Forêt',
    fullName: "Institut National de Recherche en Génie Rural, Eau et Forêt",
    city: 'Tunis', type: 'recherche', pin: { x: 156, y: 117 },
    studentCount: 140, staffCount: 210, programCount: 0, foundedYear: 1962,
    insertionRate: 92, internationalPartnerships: 34, researchScore: 88,
    description: 'Institut de recherche en gestion de l\'eau, des forêts et du génie rural.',
    specialties: ['Hydraulique', 'Foresterie', 'Pédologie', 'Gestion de l\'eau'],
    healthStatus: 'good',
  },
  {
    id: 'inrat', acronym: 'INRAT', name: 'Recherche Agronomique',
    fullName: "Institut National de Recherche Agronomique de Tunis",
    city: 'Tunis', type: 'recherche', pin: { x: 161, y: 119 },
    studentCount: 160, staffCount: 190, programCount: 0, foundedYear: 1914,
    insertionRate: 95, internationalPartnerships: 41, researchScore: 91,
    description: 'Centre de recherche phare en Afrique du Nord pour les sciences agronomiques.',
    specialties: ['Génétique végétale', 'Phytopathologie', 'Zootechnie', 'Économie agricole'],
    healthStatus: 'good',
  },
]

export const TOTAL_STUDENTS = UCAR_INSTITUTIONS.reduce((s, i) => s + i.studentCount, 0)
export const TOTAL_STAFF = UCAR_INSTITUTIONS.reduce((s, i) => s + i.staffCount, 0)
export const AVG_INSERTION = Math.round(UCAR_INSTITUTIONS.reduce((s, i) => s + i.insertionRate, 0) / UCAR_INSTITUTIONS.length)
export const TOTAL_PARTNERSHIPS = UCAR_INSTITUTIONS.reduce((s, i) => s + i.internationalPartnerships, 0)

export const TOTAL_STUDENTS_DISPLAY = '+120K'
export const TOTAL_STAFF_DISPLAY = '+8K'