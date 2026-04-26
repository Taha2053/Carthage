export type OpportunityCategory = 'competition' | 'internship' | 'event' | 'partnership' | 'grant'

export interface Opportunity {
  id: string
  title: string
  category: OpportunityCategory
  institution: string
  institutionId?: string
  date: string
  deadline?: string
  location: string
  description: string
  link?: string
  tags: string[]
  isNew?: boolean
  isFeatured?: boolean
}

export const CAT_LABEL: Record<OpportunityCategory, string> = {
  competition:  'Compétition',
  internship:   'Stage',
  event:        'Événement',
  partnership:  'Partenariat',
  grant:        'Bourse',
}

export const CAT_COLOR: Record<OpportunityCategory, string> = {
  competition:  '#C5933A',
  internship:   '#1B4F72',
  event:        '#1E8449',
  partnership:  '#7B3F8E',
  grant:        '#C0392B',
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'hack4ucar-2025',
    title: 'HACK4UCAR 2025 — Hackathon National',
    category: 'competition',
    institution: 'Université de Carthage',
    date: '2025-04-26',
    deadline: '2025-04-25',
    location: 'INSAT, Tunis',
    description: "Le hackathon officiel de l'Université de Carthage. 48h pour concevoir des solutions innovantes au service de l'enseignement supérieur tunisien.",
    tags: ['Hackathon', 'IA', 'EdTech', '48h'],
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'stage-bmte-2025',
    title: 'Stage ingénierie logicielle — Banque de Tunisie',
    category: 'internship',
    institution: 'INSAT',
    institutionId: 'insat',
    date: '2025-06-01',
    deadline: '2025-05-10',
    location: 'Tunis Centre',
    description: 'Stage de fin d\'études en développement logiciel et architecture microservices. Encadrement par une équipe senior.',
    tags: ['Java', 'Spring Boot', 'Microservices', 'Bac+5'],
    isNew: true,
  },
  {
    id: 'intl-conf-med-2025',
    title: 'Conférence Méditerranéenne Sciences & Technologies',
    category: 'event',
    institution: 'EPT',
    institutionId: 'ept',
    date: '2025-05-15',
    location: 'La Marsa',
    description: 'Conférence internationale réunissant des chercheurs des deux rives de la Méditerranée. Soumissions de papers acceptées jusqu\'en mai.',
    tags: ['Recherche', 'International', 'Sciences', 'Publication'],
  },
  {
    id: 'erasmus-plus-2025',
    title: 'Programme Erasmus+ — Mobilité Étudiante 2025/26',
    category: 'grant',
    institution: 'IHEC Carthage',
    institutionId: 'ihec',
    date: '2025-07-01',
    deadline: '2025-05-30',
    location: 'Europe',
    description: 'Bourses de mobilité étudiant vers 18 universités partenaires européennes. Financement complet transport + logement.',
    tags: ['Erasmus', 'Europe', 'Bourse', 'Mobilité'],
    isFeatured: true,
  },
  {
    id: 'agri-innovation-2025',
    title: 'Challenge AgriTech Tunisie 2025',
    category: 'competition',
    institution: 'INAT',
    institutionId: 'inat',
    date: '2025-06-20',
    deadline: '2025-06-01',
    location: 'Tunis / Distanciel',
    description: 'Concours national de solutions innovantes pour l\'agriculture durable. Prix de 15 000 DT pour l\'équipe gagnante.',
    tags: ['AgriTech', 'Innovation', 'Durabilité', 'Prix'],
    isNew: true,
  },
  {
    id: 'supcom-5g-lab',
    title: 'Inauguration Lab 5G & IoT — SUP\'COM',
    category: 'event',
    institution: "SUP'COM",
    institutionId: 'supcom',
    date: '2025-05-08',
    location: 'Ariana',
    description: 'Ouverture du laboratoire 5G avancé co-financé par Tunisie Telecom et Orange Tunisie. Visites et démonstrations ouvertes aux étudiants.',
    tags: ['5G', 'IoT', 'Lab', 'Telecom'],
  },
  {
    id: 'total-energies-stage',
    title: 'Stages TotalEnergies Tunisie — 50 postes',
    category: 'internship',
    institution: 'ESTI',
    institutionId: 'esti',
    date: '2025-07-01',
    deadline: '2025-05-20',
    location: 'Tunis / Sfax',
    description: 'Programme de stages d\'été TotalEnergies avec possibilité de CDI. Profils ingénieurs et data scientists recherchés.',
    tags: ['Energie', 'Ingénierie', 'Data', 'Grand groupe'],
    isFeatured: true,
  },
  {
    id: 'accord-paris1-ucar',
    title: 'Partenariat UCAR — Université Paris 1 Sorbonne',
    category: 'partnership',
    institution: 'Université de Carthage',
    date: '2025-04-18',
    location: 'Paris / Tunis',
    description: 'Signature d\'un accord de double diplôme et d\'échanges de chercheurs entre UCAR et Paris 1. 20 places de master disponibles.',
    tags: ['France', 'Sorbonne', 'Double diplôme', 'Recherche'],
    isNew: true,
  },
  {
    id: 'film-gam-2025',
    title: 'Festival Gammarth Film School 2025',
    category: 'event',
    institution: 'ESAC Gammarth',
    institutionId: 'esac',
    date: '2025-06-10',
    location: 'Gammarth',
    description: 'Festival annuel de courts-métrages produits par les étudiants de l\'ESAC. Jury international, projections publiques et ateliers.',
    tags: ['Cinéma', 'Festival', 'Court-métrage', 'Art'],
  },
  {
    id: 'bourse-excellence-2025',
    title: 'Bourse d\'Excellence Présidence UCAR 2025',
    category: 'grant',
    institution: 'Université de Carthage',
    date: '2025-09-01',
    deadline: '2025-06-15',
    location: 'Toutes institutions',
    description: 'Programme de 50 bourses d\'excellence pour étudiants en master à UCAR. Critères : mention Très Bien + projet de recherche.',
    tags: ['Bourse', 'Excellence', 'Master', 'Recherche'],
  },
]
