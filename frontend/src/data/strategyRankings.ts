export const RANKINGS = [
  {
    name: 'QS World University Rankings',
    shortName: 'QS',
    criteria: [
      { name: 'Réputation académique', weight: '40%', description: 'Enquête mondiale auprès des universitaires' },
      { name: 'Réputation employeurs', weight: '10%', description: 'Enquête auprès des employeurs' },
      { name: 'Ratio enseignants/étudiants', weight: '20%', description: 'Taille des classes' },
      { name: 'Citations par enseignant', weight: '20%', description: 'Impact de la recherche (Scopus)' },
      { name: 'Internationalisation', weight: '10%', description: 'Personnel et étudiants internationaux' },
    ],
    weaknesses: [
      'Faible visibilité dans les enquêtes de réputation internationales',
      'Ratio citations/enseignant bas — publications en français peu citées',
      'Très faible proportion d\'étudiants et enseignants internationaux',
      'Pas de stratégie de réponse aux enquêtes QS (survey lobbying)',
    ],
    actions: [
      'Lancer une campagne de réponse aux enquêtes QS auprès des alumni et partenaires internationaux',
      'Imposer la publication en anglais dans des revues Scopus Q1-Q2 pour les promotions MCF/PR',
      'Créer 5 bourses d\'accueil pour doctorants africains et méditerranéens',
      'Signer 10 accords Erasmus+ KA171 pour la mobilité entrante',
      'Normaliser les profils Scopus de tous les enseignants-chercheurs (ORCID obligatoire)',
    ],
    dataLeverage: [
      'Ratio enseignants/étudiants calculable depuis les KPIs RH et académiques',
      'Nombre de publications Scopus par institution via le module recherche',
      'Taux de mobilité internationale depuis les conventions actives',
    ],
  },
  {
    name: 'Times Higher Education (THE)',
    shortName: 'THE',
    criteria: [
      { name: 'Enseignement', weight: '30%', description: 'Environnement d\'apprentissage' },
      { name: 'Recherche (volume/réputation/revenu)', weight: '30%', description: 'Volume et réputation' },
      { name: 'Citations', weight: '30%', description: 'Influence de la recherche' },
      { name: 'Perspective internationale', weight: '7.5%', description: 'Personnel, étudiants, co-publications' },
      { name: 'Revenus industriels', weight: '2.5%', description: 'Transfert de technologie' },
    ],
    weaknesses: [
      'Revenus de recherche très faibles (financement public limité)',
      'Citations concentrées sur peu de chercheurs actifs',
      'Quasi-absence de revenus industriels et brevets',
      'Pas de participation au THE Data Collection',
    ],
    actions: [
      'Soumettre les données institutionnelles au THE via leur portail de collecte',
      'Créer une cellule de valorisation recherche avec 3 brevets/an comme objectif',
      'Développer 5 chaires de recherche co-financées avec l\'industrie tunisienne',
      'Mandater la co-publication internationale (min. 30% des publications)',
    ],
    dataLeverage: [
      'Budget recherche et taux d\'exécution via KPIs financiers',
      'Nombre de thèses soutenues et publications par an',
      'Conventions industrielles actives depuis le module partenariats',
    ],
  },
  {
    name: 'Shanghai Ranking (ARWU)',
    shortName: 'ARWU',
    criteria: [
      { name: 'Alumni Nobel/Fields', weight: '10%', description: 'Prix Nobel ou médailles Fields des alumni' },
      { name: 'Staff Nobel/Fields', weight: '20%', description: 'Prix prestigieux du personnel' },
      { name: 'Chercheurs hautement cités', weight: '20%', description: 'Highly Cited Researchers (Clarivate)' },
      { name: 'Publications Nature/Science', weight: '20%', description: 'Articles dans N&S' },
      { name: 'Publications indexées (SCIE/SSCI)', weight: '20%', description: 'Volume total Web of Science' },
      { name: 'Performance per capita', weight: '10%', description: 'Pondération par taille' },
    ],
    weaknesses: [
      'Aucun lauréat Nobel/Fields — critère structurellement inaccessible',
      'Zéro publication dans Nature/Science',
      'Très peu de Highly Cited Researchers',
    ],
    actions: [
      'Cibler le classement ARWU par sujet (Subject Rankings) en ingénierie et sciences',
      'Recruter ou affilier 2-3 chercheurs Highly Cited comme professeurs invités',
      'Augmenter le volume Web of Science de 20% via politique de publication',
    ],
    dataLeverage: [
      'Suivi du volume de publications WoS/Scopus par établissement',
      'Profils chercheurs avec h-index depuis ORCID',
    ],
  },
  {
    name: 'Webometrics Ranking',
    shortName: 'Webometrics',
    criteria: [
      { name: 'Visibilité (impact)', weight: '50%', description: 'Liens externes vers le site web' },
      { name: 'Transparence (citations)', weight: '10%', description: 'Profils Google Scholar' },
      { name: 'Excellence (publications)', weight: '40%', description: 'Top 10% publications citées (Scimago)' },
    ],
    weaknesses: [
      'Site web institutionnel peu mis à jour, contenu pauvre',
      'Profils Google Scholar des chercheurs non créés ou incomplets',
      'Très peu de contenu académique en accès libre',
    ],
    actions: [
      'Refonte SEO du site web avec pages chercheurs individuelles',
      'Créer et compléter le profil Google Scholar de chaque enseignant-chercheur',
      'Publier les mémoires et thèses en Open Access sur un dépôt institutionnel',
      'Créer un blog recherche institutionnel avec actualités scientifiques hebdomadaires',
    ],
    dataLeverage: [
      'Annuaire des chercheurs avec liens Google Scholar/ORCID',
      'Statistiques de trafic web et backlinks',
    ],
  },
  {
    name: 'UI GreenMetric World University Rankings',
    shortName: 'GreenMetric',
    criteria: [
      { name: 'Infrastructure', weight: '15%', description: 'Espaces verts, bâtiments durables' },
      { name: 'Énergie & changement climatique', weight: '21%', description: 'Consommation, renouvelables' },
      { name: 'Déchets', weight: '18%', description: 'Recyclage, réduction' },
      { name: 'Eau', weight: '10%', description: 'Conservation, traitement' },
      { name: 'Transport', weight: '18%', description: 'Mobilité durable' },
      { name: 'Éducation & recherche', weight: '18%', description: 'Cours et recherche sur le DD' },
    ],
    weaknesses: [
      'Pas de système de gestion environnementale formalisé',
      'Aucune donnée de consommation énergétique centralisée',
      'Peu de cours dédiés au développement durable',
    ],
    actions: [
      'Soumettre la candidature GreenMetric (gratuit) avec les données ESG existantes',
      'Installer des compteurs intelligents dans 5 établissements pilotes',
      'Lancer un programme de tri sélectif dans toutes les facultés',
      'Intégrer un module DD obligatoire dans toutes les licences',
      'Planter 500 arbres sur les campus (programme ANPE Tunisie)',
    ],
    dataLeverage: [
      'KPIs ESG : consommation énergétique, empreinte carbone, taux de recyclage',
      'Surface espaces verts par campus depuis les données patrimoine',
    ],
  },
  {
    name: 'SCImago Institutions Rankings',
    shortName: 'SCImago',
    criteria: [
      { name: 'Recherche', weight: '50%', description: 'Publications, citations, leadership' },
      { name: 'Innovation', weight: '30%', description: 'Brevets, spin-offs' },
      { name: 'Impact sociétal', weight: '20%', description: 'Présence web, Altmetrics' },
    ],
    weaknesses: [
      'Innovation quasi inexistante (brevets, spin-offs)',
      'Altmetrics et présence web académique très faibles',
    ],
    actions: [
      'Créer un bureau de transfert technologique (OTT)',
      'Former les chercheurs à la communication scientifique sur les réseaux',
      'Développer les profils institutionnels sur ResearchGate et Academia',
    ],
    dataLeverage: [
      'Nombre de brevets et spin-offs via le module recherche/innovation',
      'Présence web et mentions sur les réseaux académiques',
    ],
  },
  {
    name: 'Classements africains (URAP Africa, AfriRank)',
    shortName: 'AfriRank',
    criteria: [
      { name: 'Publications', weight: '30%', description: 'Volume de publications indexées' },
      { name: 'Citations', weight: '30%', description: 'Impact des publications' },
      { name: 'Collaboration internationale', weight: '20%', description: 'Co-publications' },
      { name: 'Productivité', weight: '20%', description: 'Publications par chercheur' },
    ],
    weaknesses: [
      'Carthage apparaît souvent derrière l\'Université de Tunis El Manar',
      'Collaboration internationale concentrée sur la France uniquement',
    ],
    actions: [
      'Diversifier les co-publications vers l\'Afrique subsaharienne et le Moyen-Orient',
      'Rejoindre les réseaux AAU et RUFORUM pour la visibilité panafricaine',
      'Candidater aux prix de l\'Union Africaine pour l\'enseignement supérieur',
    ],
    dataLeverage: [
      'Cartographie des co-publications par pays partenaire',
      'Classement interne des institutions par productivité scientifique',
    ],
  },
]

export const RSE_DATA = {
  frameworks: [
    { name: 'ISO 26000', type: 'Norme internationale', certifiable: false, description: 'Lignes directrices sur la responsabilité sociétale — non certifiable mais référence mondiale' },
    { name: 'Label LUCIE', type: 'Label français', certifiable: true, description: 'Label RSE basé sur ISO 26000, adapté aux organisations francophones' },
    { name: 'Engagé RSE (AFNOR)', type: 'Label AFNOR', certifiable: true, description: 'Évaluation AFNOR sur 4 niveaux, reconnu internationalement' },
    { name: 'SD 21000', type: 'Guide AFNOR', certifiable: false, description: 'Guide pour la prise en compte du DD dans la stratégie' },
    { name: 'DD&RS (France)', type: 'Label universitaire', certifiable: true, description: 'Label Développement Durable & Responsabilité Sociétale spécifique aux établissements d\'enseignement supérieur' },
  ],
  roadmap: [
    { label: 'Phase 1 — Diagnostic', duration: '0–6 mois', steps: [
      'Réaliser un auto-diagnostic RSE selon ISO 26000 (7 questions centrales)',
      'Cartographier les parties prenantes (étudiants, entreprises, collectivités, MESRS)',
      'Identifier les pratiques RSE existantes non formalisées',
      'Former un comité RSE avec représentants de 5 facultés pilotes',
    ], color: '#C5933A' },
    { label: 'Phase 2 — Engagement', duration: '6–12 mois', steps: [
      'Définir la politique RSE de l\'université avec objectifs mesurables',
      'Signer la charte RSE avec les partenaires clés (UTICA, ANPE, municipalités)',
      'Lancer 3 projets pilotes (économie d\'énergie, insertion professionnelle, gouvernance participative)',
      'Intégrer les indicateurs RSE dans les tableaux de bord CarthaVillage',
    ], color: '#1B4F72' },
    { label: 'Phase 3 — Certification', duration: '12–24 mois', steps: [
      'Préparer le dossier de candidature au label DD&RS ou LUCIE',
      'Audit externe par un organisme accrédité (AFNOR, Bureau Veritas)',
      'Obtenir le label et communiquer (site web, rapport RSE annuel)',
      'Planifier le cycle d\'amélioration continue (revue tous les 3 ans)',
    ], color: '#1E8449' },
  ],
  partnerships: [
    'ANPE (Agence Nationale de Protection de l\'Environnement) — accompagnement environnemental',
    'UTICA — partenariats entreprises pour l\'insertion professionnelle',
    'Municipalités locales (Carthage, La Marsa, Ariana) — projets communautaires',
    'GIZ Tunisie — coopération allemande sur les projets DD',
    'AFD / Expertise France — financement de projets RSE universitaires',
    'Réseau francophone DD&RS — benchmarking avec universités françaises',
  ],
}
