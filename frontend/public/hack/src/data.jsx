// Mock data for NABD / UCAR redesign
const INSTITUTIONS = [
  // 34 institutions across colleges, schools, institutes
  { id: 'med',   name: 'College of Medicine',           ar: 'كلية الطب',                         kind: 'College',  students: 2840, score: 92, trend: 'up',   alerts: 0 },
  { id: 'eng',   name: 'College of Engineering',        ar: 'كلية الهندسة',                      kind: 'College',  students: 4120, score: 88, trend: 'up',   alerts: 1 },
  { id: 'sci',   name: 'College of Sciences',           ar: 'كلية العلوم',                       kind: 'College',  students: 3210, score: 81, trend: 'flat', alerts: 0 },
  { id: 'bus',   name: 'School of Business',            ar: 'كلية إدارة الأعمال',                 kind: 'College',  students: 3890, score: 76, trend: 'down', alerts: 2 },
  { id: 'law',   name: 'College of Law',                ar: 'كلية الحقوق',                       kind: 'College',  students: 1620, score: 84, trend: 'up',   alerts: 0 },
  { id: 'art',   name: 'College of Arts & Letters',     ar: 'كلية الآداب',                       kind: 'College',  students: 2190, score: 79, trend: 'flat', alerts: 1 },
  { id: 'edu',   name: 'College of Education',          ar: 'كلية التربية',                      kind: 'College',  students: 2560, score: 71, trend: 'down', alerts: 3 },
  { id: 'pha',   name: 'College of Pharmacy',           ar: 'كلية الصيدلة',                      kind: 'College',  students: 980,  score: 90, trend: 'up',   alerts: 0 },
  { id: 'arc',   name: 'School of Architecture',        ar: 'كلية العمارة',                      kind: 'College',  students: 1140, score: 86, trend: 'up',   alerts: 0 },
  { id: 'agr',   name: 'College of Agriculture',        ar: 'كلية الزراعة',                      kind: 'College',  students: 1430, score: 68, trend: 'down', alerts: 4 },
  { id: 'vet',   name: 'College of Veterinary Med.',    ar: 'كلية الطب البيطري',                 kind: 'College',  students: 540,  score: 83, trend: 'flat', alerts: 0 },
  { id: 'den',   name: 'College of Dentistry',          ar: 'كلية طب الأسنان',                   kind: 'College',  students: 720,  score: 89, trend: 'up',   alerts: 0 },
  { id: 'nur',   name: 'College of Nursing',            ar: 'كلية التمريض',                      kind: 'College',  students: 1380, score: 82, trend: 'up',   alerts: 1 },
  { id: 'cs',    name: 'School of Computing',           ar: 'كلية الحوسبة',                      kind: 'College',  students: 2640, score: 91, trend: 'up',   alerts: 0 },
  { id: 'pol',   name: 'College of Political Science',  ar: 'كلية العلوم السياسية',               kind: 'College',  students: 1220, score: 74, trend: 'flat', alerts: 1 },
  { id: 'soc',   name: 'College of Social Sciences',    ar: 'كلية العلوم الاجتماعية',             kind: 'College',  students: 1890, score: 77, trend: 'down', alerts: 2 },
  { id: 'mas',   name: 'School of Mass Communication',  ar: 'كلية الإعلام',                      kind: 'College',  students: 1560, score: 80, trend: 'flat', alerts: 0 },
  { id: 'tour',  name: 'College of Tourism & Hosp.',    ar: 'كلية السياحة',                       kind: 'College',  students: 880,  score: 73, trend: 'down', alerts: 1 },
  { id: 'pe',    name: 'College of Physical Education', ar: 'كلية التربية الرياضية',              kind: 'College',  students: 1010, score: 78, trend: 'flat', alerts: 0 },
  { id: 'mus',   name: 'Conservatory of Music',         ar: 'معهد الموسيقى',                     kind: 'Institute', students: 320, score: 85, trend: 'up',   alerts: 0 },
  { id: 'lan',   name: 'Institute of Languages',        ar: 'معهد اللغات',                       kind: 'Institute', students: 1480, score: 87, trend: 'up',   alerts: 0 },
  { id: 'env',   name: 'Institute of Environment',      ar: 'معهد البيئة',                       kind: 'Institute', students: 280, score: 70, trend: 'down', alerts: 2 },
  { id: 'cib',   name: 'Institute of Cybersecurity',    ar: 'معهد الأمن السيبراني',              kind: 'Institute', students: 410, score: 93, trend: 'up',   alerts: 0 },
  { id: 'gss',   name: 'Graduate School of Science',    ar: 'كلية الدراسات العليا - علوم',         kind: 'Graduate', students: 920, score: 85, trend: 'up',   alerts: 0 },
  { id: 'gsh',   name: 'Graduate School of Humanities', ar: 'كلية الدراسات العليا - إنسانيات',     kind: 'Graduate', students: 760, score: 79, trend: 'flat', alerts: 1 },
  { id: 'gsb',   name: 'Graduate School of Business',   ar: 'كلية الدراسات العليا - أعمال',        kind: 'Graduate', students: 540, score: 88, trend: 'up',   alerts: 0 },
  { id: 'pre',   name: 'Preparatory College',           ar: 'الكلية التحضيرية',                  kind: 'College',  students: 3460, score: 65, trend: 'down', alerts: 5 },
  { id: 'mil',   name: 'Military Studies Institute',    ar: 'معهد الدراسات العسكرية',            kind: 'Institute', students: 220, score: 81, trend: 'flat', alerts: 0 },
  { id: 'isl',   name: 'College of Islamic Studies',    ar: 'كلية الدراسات الإسلامية',           kind: 'College',  students: 1140, score: 84, trend: 'up',   alerts: 0 },
  { id: 'fin',   name: 'School of Finance',             ar: 'كلية المالية',                      kind: 'College',  students: 980,  score: 86, trend: 'up',   alerts: 0 },
  { id: 'des',   name: 'College of Design & Media',     ar: 'كلية التصميم والإعلام',              kind: 'College',  students: 1290, score: 82, trend: 'flat', alerts: 0 },
  { id: 'aer',   name: 'School of Aeronautics',         ar: 'كلية الطيران',                      kind: 'College',  students: 460, score: 90, trend: 'up',   alerts: 0 },
  { id: 'pub',   name: 'School of Public Health',       ar: 'كلية الصحة العامة',                 kind: 'College',  students: 880, score: 75, trend: 'down', alerts: 2 },
  { id: 'urb',   name: 'Institute of Urban Planning',   ar: 'معهد التخطيط العمراني',             kind: 'Institute', students: 240, score: 80, trend: 'flat', alerts: 1 },
];

// Pulse waveform path generator (used as health indicator)
const pulsePath = (score, w=120, h=28) => {
  // amplitude grows with health, density of beats slightly lower with low score
  const amp = 4 + (score/100)*9;
  const baseY = h/2;
  const segs = 6;
  const segW = w/segs;
  let d = `M0 ${baseY}`;
  for (let i=0;i<segs;i++){
    const x0 = i*segW;
    // small flat
    d += ` L${x0+segW*0.30} ${baseY}`;
    // up tick
    d += ` L${x0+segW*0.40} ${baseY-amp*0.6}`;
    // big spike down
    d += ` L${x0+segW*0.50} ${baseY+amp}`;
    // big spike up
    d += ` L${x0+segW*0.60} ${baseY-amp}`;
    // back to base
    d += ` L${x0+segW*0.70} ${baseY+amp*0.3}`;
    d += ` L${x0+segW} ${baseY}`;
  }
  return d;
};

const BRIEFING = {
  issue: 7,
  date: 'Week of Apr 20 — Apr 26, 2026',
  headline: 'Engineering pulls forward; Preparatory College needs intervention',
  deck: 'Aggregate university health holds at 81.4. Two faculties cross critical thresholds; a third recovers from last week\'s alert.',
  body: [
    { kind: 'lede', text: 'This week\'s aggregate index advances by +0.6 points, marking the third consecutive week of incremental gains across the UCAR network. Movement is uneven: top performers continue to widen the gap with the lower quartile.' },
    { kind: 'p',    text: 'College of Engineering crossed 88, its highest score on record, on the back of a 4.1pt jump in the on-time submission rate and a halving of late-stage attrition in third-year cohorts. Pharmacy, Cybersecurity, and Aeronautics held above 90.' },
    { kind: 'pull', text: '"The Preparatory College has now sat below 70 for four consecutive weeks. We recommend a targeted intervention before the May audit."' },
    { kind: 'p',    text: 'Five institutions remain on watch. Preparatory and Agriculture continue to drift; Public Health and Education show stabilisation but have not recovered momentum. The board\'s May agenda should include faculty-level remediation budgets.' },
  ],
  citations: [
    'Source: NABD ingestion, weekly cohort snapshots (2026-W17).',
    'Method: composite of attendance, assessment, retention; weights v3.2.',
    'Confidence: 96% on aggregate, 78–94% per institution.'
  ]
};

const ALERTS = [
  { id:1, level:'critical', inst:'Preparatory College',     msg:'Composite below 70 for 4 consecutive weeks',           when:'2h ago' },
  { id:2, level:'critical', inst:'College of Agriculture',  msg:'Drop-out signal triggered for 38 students in 2nd year', when:'5h ago' },
  { id:3, level:'warning',  inst:'School of Public Health', msg:'Late-submission rate exceeded 18% threshold',           when:'1d ago' },
  { id:4, level:'warning',  inst:'College of Education',    msg:'Faculty satisfaction survey response rate <40%',        when:'1d ago' },
  { id:5, level:'info',     inst:'College of Business',     msg:'Cohort C expects fewer assessments than baseline',     when:'2d ago' },
];

// time series for institution / teacher / student charts (52 weeks)
const ts = (seed=1, base=80, vol=4) => {
  const out = [];
  let v = base;
  let s = seed;
  for (let i=0;i<26;i++) {
    s = (s*9301+49297)%233280;
    const r = (s/233280-0.5)*vol*2;
    v = Math.max(40, Math.min(99, v + r*0.6 + (i>20?0.4:0)));
    out.push({ wk: 'W'+(i+1), v: +v.toFixed(1) });
  }
  return out;
};

const ENG_SERIES = {
  composite: ts(11, 84, 3),
  attendance: ts(7, 88, 2.5),
  ontime: ts(13, 79, 5),
  pass: ts(17, 86, 3),
};

const ENG_DEPTS = [
  { name:'Mechanical',     value: 91 },
  { name:'Electrical',     value: 88 },
  { name:'Civil',          value: 84 },
  { name:'Chemical',       value: 79 },
  { name:'Industrial',     value: 86 },
  { name:'Software',       value: 93 },
  { name:'Aerospace',      value: 90 },
];

// teacher students
const STUDENTS = Array.from({length: 18}, (_, i) => {
  const seed = (i+3)*7919;
  const presence = 60 + ((seed*13)%41);
  const ontime   = 50 + ((seed*7)%50);
  const score    = 50 + ((seed*11)%50);
  const risk = score < 65 ? 'high' : score < 78 ? 'med' : 'low';
  const names = [
    ['Rana','Al-Mahmoud'], ['Yusuf','Al-Hassan'],['Layla','Bin-Saud'], ['Khalid','Al-Otaibi'],
    ['Maya','Al-Rashed'],  ['Omar','Al-Sayed'],  ['Hala','Al-Najjar'],  ['Ahmed','Al-Tayeb'],
    ['Sara','Al-Mutairi'], ['Faisal','Al-Anezi'],['Noor','Al-Shamri'],  ['Tariq','Al-Sharif'],
    ['Reem','Al-Harbi'],   ['Mohammed','Al-Dosari'], ['Zayna','Al-Kuwari'], ['Salem','Al-Ghamdi'],
    ['Dina','Al-Saleh'],   ['Bandar','Al-Qahtani']
  ];
  const [first, last] = names[i];
  const initials = first[0] + last[0];
  return {
    id: 'S' + (1000 + i),
    name: `${first} ${last}`,
    initials,
    cohort: ['Y2-A','Y2-B','Y2-C'][i%3],
    presence, ontime, score, risk,
  };
});

// student page: a single student
const STUDENT = {
  name: 'Layla Bin-Saud', ar: 'ليلى بن سعود',
  id: 'S1002', program: 'Mechanical Engineering, Y3',
  gpa: 3.42, attendance: 91, ontime: 84, standing: 'Good',
  trend: ts(101, 82, 4),
  courses: [
    { code:'ME 304', title:'Thermodynamics II',         grade:'A-', mark: 88, status:'on-track', credits:4 },
    { code:'ME 312', title:'Fluid Mechanics',           grade:'B+', mark: 81, status:'on-track', credits:4 },
    { code:'ME 351', title:'Mechanical Design',         grade:'A',  mark: 92, status:'on-track', credits:3 },
    { code:'ME 320', title:'Heat Transfer Lab',         grade:'B',  mark: 76, status:'watch',    credits:2 },
    { code:'MATH 261',title:'Differential Equations',   grade:'B-', mark: 71, status:'watch',    credits:3 },
    { code:'HUM 201',title:'Ethics in Engineering',     grade:'A',  mark: 94, status:'on-track', credits:2 },
  ],
  nudge: {
    headline: 'You\'re drifting in MATH 261 — three on-time submissions will recover the trend.',
    detail:  'Your last two assignments were submitted 19 and 26 hours late. Cohort average late-window is under 6h. Submitting the next problem set on time and attending Wednesday\'s recitation typically restores composite by +3 to +5 points.',
  }
};

window.NABD = { INSTITUTIONS, BRIEFING, ALERTS, ENG_SERIES, ENG_DEPTS, STUDENTS, STUDENT, pulsePath, ts };
