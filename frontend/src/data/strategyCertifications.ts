export const ISO_14001 = {
  title: 'ISO 14001 — Système de Management Environnemental',
  timeline: [
    { label: 'Analyse environnementale initiale', duration: '0–3 mois', steps: [
      'Identifier les aspects environnementaux significatifs (énergie, eau, déchets)',
      'Réaliser un bilan carbone simplifié des 5 plus grands établissements',
      'Recenser la réglementation tunisienne applicable (Code de l\'environnement)',
      'Désigner un responsable SME par établissement pilote',
    ], color: '#C5933A' },
    { label: 'Mise en œuvre du SME', duration: '3–12 mois', steps: [
      'Définir la politique environnementale signée par le président',
      'Établir les objectifs et cibles environnementaux mesurables',
      'Mettre en place les procédures de maîtrise opérationnelle',
      'Former 50 personnes clés (gestionnaires, techniciens, enseignants)',
      'Installer des compteurs intelligents et tableaux de suivi',
    ], color: '#1B4F72' },
    { label: 'Audit et certification', duration: '12–18 mois', steps: [
      'Réaliser un audit interne avec auditeurs formés',
      'Revue de direction et actions correctives',
      'Audit de certification par INNORPI ou Bureau Veritas Tunisie',
      'Obtention du certificat ISO 14001 (validité 3 ans)',
    ], color: '#1E8449' },
  ],
  requirements: [
    'Politique environnementale documentée et communiquée',
    'Registre des aspects environnementaux significatifs',
    'Objectifs et cibles environnementaux avec programmes de management',
    'Procédures de maîtrise opérationnelle (gestion déchets, énergie, eau)',
    'Plan de réponse aux situations d\'urgence environnementale',
    'Programme d\'audit interne et revue de direction',
    'Registre de conformité réglementaire (veille juridique)',
  ],
  pilotFaculties: [
    'INSAT — campus technique avec forte consommation énergétique',
    'FSB (Faculté des Sciences de Bizerte) — campus étendu avec espaces verts',
    'ENIT — laboratoires et ateliers industriels',
  ],
  certBodies: [
    'INNORPI (Institut National de la Normalisation et de la Propriété Industrielle) — organisme national',
    'Bureau Veritas Tunisie — certification internationale',
    'TÜV Rheinland Afrique du Nord — certification allemande',
    'SGS Tunisie — leader mondial de la certification',
  ],
}

export const ISO_50001 = {
  title: 'ISO 50001 — Système de Management de l\'Énergie',
  timeline: [
    { label: 'Revue énergétique', duration: '0–4 mois', steps: [
      'Réaliser un audit énergétique détaillé (consommation STEG, GPL, carburants)',
      'Identifier les usages énergétiques significatifs (UES)',
      'Établir la situation énergétique de référence (SER)',
      'Définir les indicateurs de performance énergétique (IPÉ)',
    ], color: '#C5933A' },
    { label: 'Plan d\'action énergétique', duration: '4–12 mois', steps: [
      'Installer des sous-compteurs par bâtiment/département',
      'Remplacer l\'éclairage par des LED dans 10 établissements',
      'Installer 3 systèmes photovoltaïques pilotes (programme ANME)',
      'Former les utilisateurs aux éco-gestes (campagne de sensibilisation)',
    ], color: '#1B4F72' },
    { label: 'Certification', duration: '12–20 mois', steps: [
      'Audit interne du SMÉ',
      'Audit de certification par organisme accrédité',
      'Certification ISO 50001 avec objectif de réduction de 15% en 3 ans',
    ], color: '#1E8449' },
  ],
  requirements: [
    'Politique énergétique approuvée par la direction',
    'Revue énergétique documentée avec identification des UES',
    'Situation énergétique de référence et IPÉ',
    'Plans d\'action pour améliorer la performance énergétique',
    'Compétences et formation du personnel',
    'Surveillance, mesure et analyse de la performance',
    'Audit interne et revue de direction',
  ],
  pilotFaculties: [
    'INSAT — plus gros consommateur d\'énergie (labos, serveurs)',
    'ENIT — ateliers et machines industrielles',
    'Résidence universitaire UCAR — chauffage et climatisation',
  ],
  certBodies: [
    'ANME (Agence Nationale pour la Maîtrise de l\'Énergie) — accompagnement technique',
    'INNORPI — certification nationale',
    'Bureau Veritas Tunisie — certification internationale',
    'AFNOR International — certification française reconnue',
  ],
  financing: [
    'Programme PROSOL/PROMO-ISOL de l\'ANME pour les panneaux solaires',
    'Ligne de crédit environnement (AFD/Banque mondiale) via banques tunisiennes',
    'Programme EU4Energy — financements européens pour l\'efficacité énergétique',
    'GIZ ProGREEN — coopération allemande énergie verte',
  ],
}

export const ISO_9001 = {
  gapAnalysis: [
    { requirement: 'Contexte de l\'organisme', current: 'Pas de cartographie formelle des processus', gap: 'Élevé', action: 'Cartographier les 15 processus clés avec pilotes et indicateurs' },
    { requirement: 'Leadership et engagement', current: 'Engagement verbal, pas de politique qualité formelle', gap: 'Moyen', action: 'Rédiger et diffuser la politique qualité signée par le président' },
    { requirement: 'Planification du SMQ', current: 'Pas d\'analyse des risques et opportunités', gap: 'Élevé', action: 'Réaliser une analyse SWOT et matrice des risques par processus' },
    { requirement: 'Support (ressources, compétences)', current: 'Fiches de poste incomplètes, formation non planifiée', gap: 'Moyen', action: 'Créer un plan de formation annuel et mettre à jour les fiches de poste' },
    { requirement: 'Réalisation des activités opérationnelles', current: 'Procédures non documentées ou obsolètes', gap: 'Élevé', action: 'Rédiger les procédures des 5 processus prioritaires' },
    { requirement: 'Évaluation des performances', current: 'KPIs existants mais pas de revue formelle', gap: 'Faible', action: 'Formaliser la revue de direction trimestrielle avec CR documenté' },
    { requirement: 'Amélioration continue', current: 'Pas de système de gestion des non-conformités', gap: 'Élevé', action: 'Mettre en place un registre de NC/AC dans CarthaVillage' },
  ],
  priorityProcesses: [
    { name: 'Inscription et orientation des étudiants', reason: 'Processus massif touchant 50,000+ étudiants, très visible', effort: 'Moyen' },
    { name: 'Gestion des examens et délibérations', reason: 'Source majeure de réclamations, impact juridique', effort: 'Élevé' },
    { name: 'Traitement des réclamations', reason: 'Obligatoire ISO 9001, améliore la satisfaction', effort: 'Faible' },
    { name: 'Gestion documentaire', reason: 'Fondation du SMQ, déjà partiellement dans CarthaVillage', effort: 'Faible' },
    { name: 'Pilotage de la recherche', reason: 'Impact direct sur les classements internationaux', effort: 'Moyen' },
  ],
  certBodies: [
    'INNORPI — organisme national de normalisation et certification',
    'Bureau Veritas Tunisie — leader international',
    'TÜV SÜD Afrique du Nord — certification allemande',
    'SGS Tunisie — réseau mondial',
    'AFNOR Certification — forte reconnaissance francophone',
  ],
}
