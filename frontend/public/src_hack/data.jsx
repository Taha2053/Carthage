// CarthaVillage — real UCAR data
const INSTITUTIONS = [
  { id:'fsegt',  name:'FSEGT',                                  fr:'Fac. Sciences Éco. & Gestion',          kind:'Faculté',   students:4200, score:84, trend:'up',   alerts:1 },
  { id:'fshs',   name:'FSHS',                                   fr:'Fac. Sciences Humaines & Sociales',     kind:'Faculté',   students:3100, score:78, trend:'flat', alerts:2 },
  { id:'fst',    name:'FST',                                    fr:'Fac. Sciences de Tunis',                kind:'Faculté',   students:3800, score:82, trend:'up',   alerts:0 },
  { id:'flsh',   name:'FLSH',                                   fr:'Fac. Lettres, Arts & Humanités',        kind:'Faculté',   students:2900, score:76, trend:'down', alerts:2 },
  { id:'fd',     name:'Fac. de Droit',                          fr:'Faculté de Droit de Nabeul',            kind:'Faculté',   students:2200, score:80, trend:'flat', alerts:1 },
  { id:'insat',  name:'INSAT',                                  fr:'Inst. National Sci. Appliquées',        kind:'Institut',  students:2640, score:91, trend:'up',   alerts:0 },
  { id:'iset',   name:'ISET Bizerte',                           fr:'Inst. Sup. Études Technologiques',      kind:'Institut',  students:1980, score:77, trend:'flat', alerts:1 },
  { id:'issep',  name:'ISSEP',                                  fr:'Inst. Sup. Sport & Éd. Physique',       kind:'Institut',  students:1120, score:73, trend:'down', alerts:2 },
  { id:'islt',   name:'ISLT',                                   fr:'Inst. Sup. Langues de Tunis',           kind:'Institut',  students:1480, score:87, trend:'up',   alerts:0 },
  { id:'isa',    name:'ISA Chott-Mariem',                       fr:'Inst. Sup. Agronomique',                kind:'Institut',  students:1430, score:69, trend:'down', alerts:4 },
  { id:'enau',   name:'ENAU',                                   fr:'École Nat. Architecture & Urbanisme',   kind:'École',     students:1140, score:86, trend:'up',   alerts:0 },
  { id:'essect', name:'ESSECT',                                 fr:'École Sup. Sciences Économiques',       kind:'École',     students:1680, score:83, trend:'up',   alerts:0 },
  { id:'esact',  name:'ESACT',                                  fr:'École Sup. Arts & Création de Tunis',   kind:'École',     students:680,  score:85, trend:'up',   alerts:0 },
  { id:'iseahc', name:'ISEAHC',                                 fr:'Inst. Sup. Administration des Entr.',   kind:'Institut',  students:1200, score:79, trend:'flat', alerts:1 },
  { id:'ipein',  name:'IPEIN',                                  fr:'Inst. Prépa. Études Ingénieurs Nabeul', kind:'Institut',  students:860,  score:88, trend:'up',   alerts:0 },
  { id:'ipeik',  name:'IPEIK',                                  fr:'Inst. Prépa. Études Ingénieurs Kef',    kind:'Institut',  students:620,  score:72, trend:'down', alerts:2 },
  { id:'isg',    name:'ISG Tunis',                              fr:'Inst. Sup. Gestion de Tunis',           kind:'Institut',  students:2100, score:81, trend:'flat', alerts:0 },
  { id:'iscae',  name:'ISCAE',                                  fr:'Inst. Sup. Comptabilité & Admin. Entr.',kind:'Institut',  students:1760, score:84, trend:'up',   alerts:0 },
  { id:'isep',   name:'ISEP',                                   fr:'Inst. Sup. Éducation & Formation Cont.',kind:'Institut',  students:940,  score:75, trend:'flat', alerts:1 },
  { id:'isteub', name:'ISTEUB',                                 fr:'Inst. Sup. Technologies Environnement', kind:'Institut',  students:720,  score:70, trend:'down', alerts:3 },
  { id:'isg2',   name:'ISG Bizerte',                            fr:'Inst. Sup. Gestion de Bizerte',         kind:'Institut',  students:1340, score:77, trend:'flat', alerts:1 },
  { id:'isbm',   name:'ISBM',                                   fr:'Inst. Sup. Biotechnologie Monastir',    kind:'Institut',  students:580,  score:89, trend:'up',   alerts:0 },
  { id:'isaab',  name:'ISAAB',                                  fr:'Inst. Sup. Arts & Artisanat Bizerte',   kind:'Institut',  students:460,  score:82, trend:'flat', alerts:0 },
  { id:'isamm',  name:'ISAMM',                                  fr:'Inst. Sup. Arts Multimédia Manouba',    kind:'Institut',  students:890,  score:80, trend:'up',   alerts:0 },
  { id:'ipag',   name:'IPAG',                                   fr:'Inst. Prépa. Agronomie & Vétérinaire',  kind:'Institut',  students:540,  score:74, trend:'down', alerts:2 },
  { id:'ess',    name:'ESS',                                    fr:'École Sup. des Sciences',               kind:'École',     students:920,  score:85, trend:'up',   alerts:0 },
  { id:'isb',    name:'ISB',                                    fr:'Inst. Sup. de Biologie',                kind:'Institut',  students:760,  score:79, trend:'flat', alerts:1 },
  { id:'fsb',    name:'FSB',                                    fr:'Fac. Sciences de Bizerte',              kind:'Faculté',   students:2180, score:81, trend:'up',   alerts:0 },
  { id:'ipa',    name:'IPA',                                    fr:'Inst. Prépa. Agrégation',               kind:'Institut',  students:320,  score:68, trend:'down', alerts:3 },
  { id:'isda',   name:'ISDA',                                   fr:'Inst. Sup. Droit & Arbitrage',          kind:'Institut',  students:980,  score:83, trend:'up',   alerts:0 },
  { id:'esim',   name:'ESIM',                                   fr:'École Sup. Ingénieurs Mécaniques',      kind:'École',     students:840,  score:90, trend:'up',   alerts:0 },
  { id:'isgb',   name:'ISGB',                                   fr:'Inst. Sup. Gestion & Banque',           kind:'Institut',  students:1100, score:78, trend:'flat', alerts:1 },
  { id:'ecotour',name:'IHEC Carthage',                          fr:'Inst. Hautes Études Commerciales',      kind:'Institut',  students:2400, score:86, trend:'up',   alerts:0 },
  { id:'ispits', name:'ISPITS',                                 fr:'Inst. Sup. Professions Infirmières',    kind:'Institut',  students:1380, score:82, trend:'up',   alerts:0 },
  { id:'isbst',  name:'ISBST',                                  fr:'Inst. Sup. Biotechnologie Sidi Thabet', kind:'Institut',  students:640,  score:88, trend:'up',   alerts:0 },
];

const pulsePath = (score, w=120, h=28) => {
  const amp = 4 + (score/100)*9;
  const baseY = h/2;
  const segs = 6;
  const segW = w/segs;
  let d = `M0 ${baseY}`;
  for (let i=0;i<segs;i++){
    const x0 = i*segW;
    d += ` L${x0+segW*0.30} ${baseY}`;
    d += ` L${x0+segW*0.40} ${baseY-amp*0.6}`;
    d += ` L${x0+segW*0.50} ${baseY+amp}`;
    d += ` L${x0+segW*0.60} ${baseY-amp}`;
    d += ` L${x0+segW*0.70} ${baseY+amp*0.3}`;
    d += ` L${x0+segW} ${baseY}`;
  }
  return d;
};

const BRIEFING = {
  issue: 7,
  date: 'Semaine du 20 — 26 Avril 2026',
  headline: 'L\'INSAT franchit 91 ; l\'ISA Chott-Mariem nécessite une intervention urgente',
  deck: 'L\'indice agrégé de l\'Université de Carthage se maintient à 81.4. Deux établissements dépassent le seuil critique ; un troisième se redresse après l\'alerte de la semaine précédente.',
  body: [
    { kind:'lede', text:'L\'indice agrégé de cette semaine progresse de +0.6 point, marquant la troisième semaine consécutive de gains dans le réseau UCAR. Le mouvement est inégal : les meilleurs établissements continuent de creuser l\'écart avec le quartile inférieur.' },
    { kind:'p',    text:'L\'INSAT a atteint 91, son meilleur score historique, grâce à une hausse de 4.1 points du taux de soumission dans les délais et une réduction de moitié de l\'attrition en 3e année de cycle ingénieur. L\'ESIM, l\'ISBST et l\'ISSB restent au-dessus de 88.' },
    { kind:'pull', text:'"L\'ISA Chott-Mariem est en dessous de 70 pour le quatrième mois consécutif. Nous recommandons une intervention ciblée avant l\'audit de mai."' },
    { kind:'p',    text:'Cinq établissements restent sous surveillance. L\'ISA et l\'IPA continuent de dériver ; l\'ISTEUB et l\'ISSEP montrent une stabilisation mais n\'ont pas encore retrouvé leur dynamique. L\'agenda du Conseil d\'administration de mai devrait inclure des budgets de remédiation par établissement.' },
  ],
  citations: [
    'Source : Ingestion CarthaVillage, snapshots hebdomadaires (2026-S17).',
    'Méthode : composite présence, évaluation, rétention ; pondérations v3.2.',
    'Confiance : 96% sur l\'agrégat, 78–94% par établissement.'
  ]
};

const ALERTS = [
  { id:1, level:'critical', inst:'ISA Chott-Mariem',   msg:'Composite sous 70 pour 4 semaines consécutives',             when:'Il y a 2h' },
  { id:2, level:'critical', inst:'IPA',                msg:'Signal d\'abandon déclenché pour 28 étudiants en 2e année',   when:'Il y a 5h' },
  { id:3, level:'warning',  inst:'ISTEUB',             msg:'Taux de soumission tardive supérieur au seuil de 18%',        when:'Il y a 1j' },
  { id:4, level:'warning',  inst:'ISSEP',              msg:'Taux de réponse au sondage enseignants < 40%',                when:'Il y a 1j' },
  { id:5, level:'info',     inst:'FLSH',               msg:'Cohorte C enregistre moins d\'évaluations que prévu',         when:'Il y a 2j' },
];

const ts = (seed=1, base=80, vol=4) => {
  const out = [];
  let v = base;
  let s = seed;
  for (let i=0;i<26;i++) {
    s = (s*9301+49297)%233280;
    const r = (s/233280-0.5)*vol*2;
    v = Math.max(40, Math.min(99, v + r*0.6 + (i>20?0.4:0)));
    out.push({ wk:'S'+(i+1), v: +v.toFixed(1) });
  }
  return out;
};

const ENG_SERIES = {
  composite:  ts(11, 84, 3),
  attendance: ts(7,  88, 2.5),
  ontime:     ts(13, 79, 5),
  pass:       ts(17, 86, 3),
};

const ENG_DEPTS = [
  { name:'Génie Informatique',  value:93 },
  { name:'Génie Civil',         value:88 },
  { name:'Génie Mécanique',     value:87 },
  { name:'Génie Électrique',    value:85 },
  { name:'Génie Chimique',      value:82 },
  { name:'Génie Industriel',    value:89 },
  { name:'Génie Environnement', value:80 },
];

const STUDENTS = Array.from({length:18}, (_,i) => {
  const seed = (i+3)*7919;
  const presence = 60 + ((seed*13)%41);
  const ontime   = 50 + ((seed*7)%50);
  const score    = 50 + ((seed*11)%50);
  const risk = score < 65 ? 'high' : score < 78 ? 'med' : 'low';
  const names = [
    ['Amira','Ben Salah'],  ['Yassine','Trabelsi'],  ['Lina','Chaabane'],   ['Khalil','Mzoughi'],
    ['Sarra','Ben Amor'],   ['Omar','Ferchichi'],     ['Hana','Jelassi'],    ['Ahmed','Baccouche'],
    ['Nour','Ben Youssef'], ['Fares','Hamdi'],        ['Rim','Sfar'],        ['Tarek','Gharbi'],
    ['Meriem','Khelifi'],   ['Mohamed','Dridi'],      ['Zaineb','Oueslati'], ['Slim','Ben Fredj'],
    ['Dina','Mansouri'],    ['Bilel','Boukadida'],
  ];
  const [first, last] = names[i];
  return { id:'E'+(2000+i), name:`${first} ${last}`, initials:first[0]+last[0], cohort:['L3-A','L3-B','L3-C'][i%3], presence, ontime, score, risk };
});

const STUDENT = {
  name:'Lina Chaabane', ar:'لينا الشعبان',
  id:'E2002', program:'Génie Informatique, 3e année — INSAT',
  gpa:3.42, attendance:91, ontime:84, standing:'Bien',
  trend:ts(101, 82, 4),
  courses:[
    { code:'INF 304', title:'Architecture des Systèmes',    grade:'A-', mark:88, status:'on-track', credits:4 },
    { code:'INF 312', title:'Réseaux & Sécurité',           grade:'B+', mark:81, status:'on-track', credits:4 },
    { code:'INF 351', title:'Génie Logiciel',               grade:'A',  mark:92, status:'on-track', credits:3 },
    { code:'INF 320', title:'Base de Données Avancée',      grade:'B',  mark:76, status:'watch',    credits:2 },
    { code:'MATH 261',title:'Probabilités & Statistiques',  grade:'B-', mark:71, status:'watch',    credits:3 },
    { code:'HUM 201', title:'Éthique & Déontologie',        grade:'A',  mark:94, status:'on-track', credits:2 },
  ],
  nudge:{
    headline:'Vous perdez du terrain en MATH 261 — trois soumissions dans les délais suffiront à redresser la courbe.',
    detail:'Vos deux derniers devoirs ont été rendus avec 19h et 26h de retard. La moyenne de la cohorte est sous 6h. Soumettre le prochain TD à temps et assister au TD du mercredi permet généralement de récupérer +3 à +5 points de composite.',
  }
};

window.CARTHAVILLAGE = { INSTITUTIONS, BRIEFING, ALERTS, ENG_SERIES, ENG_DEPTS, STUDENTS, STUDENT, pulsePath, ts };
// backward compat alias
window.NABD = window.CARTHAVILLAGE;
