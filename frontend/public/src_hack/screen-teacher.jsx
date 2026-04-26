// Screen — Teacher page (CarthaVillage faculty view)
const ScreenTeacher = ({ setActive }) => {
  const [course, setCourse] = React.useState('INF 304');
  const [view, setView] = React.useState('roster');
  const courses = [
    { code:'INF 304', title:'Architecture des Systèmes',   students: 38, avg: 84 },
    { code:'INF 312', title:'Réseaux & Sécurité',          students: 41, avg: 79 },
    { code:'INF 351', title:'Génie Logiciel',              students: 34, avg: 87 },
    { code:'INF 320', title:'Base de Données Avancée',     students: 22, avg: 76 },
  ];
  const cur = courses.find(c=>c.code===course);
  const STU = window.CARTHAVILLAGE.STUDENTS;

  const sortedRisk = [...STU].sort((a,b)=> a.score - b.score);

  return (
    <div className="screen" data-active="true">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
          <span>UCAR · INSAT · Génie Informatique</span>
          <span>Enseignant : Dr. Yassine Trabelsi</span>
          <span>Semestre : Printemps 2026</span>
        </div>
        <div className="hairline mt-3"/>

        <button onClick={()=>setActive('institution')} className="text-[12px] text-ink3 hover:text-ink ul-link mt-6 inline-flex items-center gap-1"><Icon name="corner" size={11}/> Retour à l'institution</button>

        <div className="grid grid-cols-12 gap-8 mt-6">
          <div className="col-span-12 lg:col-span-8">
            <Pill>Vue enseignant · Instructeur</Pill>
            <h1 className="font-display text-[64px] leading-[0.92] tracking-tighter2 mt-4">
              Votre semaine, en <em className="not-italic" style={{fontStyle:'italic', color:'#C5933A'}}>un</em> registre.
            </h1>
            <p className="text-ink2 text-[16px] leading-relaxed mt-4 max-w-[60ch]">
              Quatre cours, 135 étudiants. CarthaVillage a signalé <span className="num text-crit">5</span> étudiants qui nécessitent une conversation cette semaine et <span className="num text-warn">7</span> sous surveillance. Le registre ci-dessous trie par qui a le plus besoin de vous.
            </p>
          </div>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule grid grid-cols-3 gap-3">
            {[['Moy. cohorte','82', 'text-ink'],['Sous surveillance','7', 'text-warn'],['À risque','5', 'text-crit']].map(([k,v,c])=>(
              <div key={k} className="border-t border-rule pt-3"><div className="text-[11px] uppercase tracking-[0.18em] text-ink3">{k}</div><div className={`font-display text-[40px] leading-none tracking-tighter2 mt-1 ${c}`}>{v}</div></div>
            ))}
          </aside>
        </div>

        {/* Course tabs */}
        <div className="mt-12 flex items-end justify-between border-b border-rule pb-3">
          <div className="flex items-end gap-10 overflow-x-auto no-scrollbar pr-4">
            {courses.map(c=>(
              <button key={c.code} onClick={()=>setCourse(c.code)} className="relative pb-3 text-left min-w-fit shrink-0 pr-2">
                <div className="flex items-baseline gap-2">
                  <span className={`num text-[11px] ${course===c.code?'text-accent':'text-ink3'}`}>{c.code}</span>
                  <span className="num text-[10px] text-ink3">· {c.students}</span>
                </div>
                <div className={`font-display text-[22px] tracking-tightish whitespace-nowrap leading-[1.15] ${course===c.code?'text-ink':'text-ink3'}`}>{c.title}</div>
                {course===c.code && <span className="absolute left-0 right-0 -bottom-[7px] h-[2px]" style={{background:'linear-gradient(90deg, #C5933A, #1B4F72)'}}/>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[12px]">
            {[['roster','Registre'],['risk','Tableau à risque']].map(([k,l])=>(
              <button key={k} onClick={()=>setView(k)} className={`px-3 py-1.5 rounded-full border transition-all ${view===k?'text-paper border-blue':'bg-paper border-rule text-ink2 hover:border-ink'}`} style={view===k?{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}:{}}>{l}</button>
            ))}
          </div>
        </div>

        {view==='roster' && (
          <div className="mt-6">
            {/* table header */}
            <div className="grid grid-cols-12 gap-3 py-3 text-[10px] uppercase tracking-[0.18em] text-ink3 num border-b border-rule">
              <span className="col-span-1">№</span>
              <span className="col-span-4">Étudiant</span>
              <span className="col-span-1">Cohorte</span>
              <span className="col-span-2">Présence</span>
              <span className="col-span-1">Ponctualité</span>
              <span className="col-span-1 text-right">Score</span>
              <span className="col-span-1">Risque</span>
              <span className="col-span-1 text-right">Action</span>
            </div>
            {sortedRisk.map((s,idx)=>(
              <div key={s.id} className="grid grid-cols-12 gap-3 py-3 border-b border-rule items-center hover:bg-paper2/60 transition-colors">
                <span className="col-span-1 num text-[12px] text-ink3">{String(idx+1).padStart(2,'0')}</span>
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-8 h-8 rounded-full text-paper inline-flex items-center justify-center text-[11px] font-display" style={{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}}>{s.initials}</span>
                  <div className="min-w-0">
                    <div className="font-display text-[16px] tracking-tightish leading-[1.2] truncate">{s.name}</div>
                    <div className="num text-[11px] text-ink3 leading-[1.2]">{s.id}</div>
                  </div>
                </div>
                <span className="col-span-1 text-[12px] text-ink2">{s.cohort}</span>
                <div className="col-span-2 flex items-center gap-2"><Bar value={s.presence} color={s.presence>=80?'#1E8449':s.presence>=65?'#1B4F72':'#C0392B'} height={4}/><span className="num text-[12px] w-9 text-right">{s.presence}%</span></div>
                <div className="col-span-1 flex items-center gap-2"><Bar value={s.ontime} color={s.ontime>=80?'#1E8449':s.ontime>=65?'#1B4F72':'#C0392B'} height={4}/><span className="num text-[12px] w-9 text-right">{s.ontime}%</span></div>
                <span className="col-span-1 num text-[18px] text-right" style={{color: s.score>=85?'#1E8449':s.score>=72?'#1B4F72':s.score>=60?'#D4AC0D':'#C0392B'}}>{s.score}</span>
                <div className="col-span-1">
                  <span className={`text-[10px] uppercase tracking-[0.14em] num ${s.risk==='high'?'text-crit':s.risk==='med'?'text-warn':'text-ok'}`}>{s.risk==='high'?'à risque':s.risk==='med'?'surveillance':'en piste'}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1.5">
                  <button title="Message" className="w-7 h-7 rounded-full border border-rule hover:bg-paper2 inline-flex items-center justify-center transition-colors"><Icon name="mail" size={12}/></button>
                  <button title="Ouvrir" className="w-7 h-7 rounded-full border border-rule hover:bg-paper2 inline-flex items-center justify-center transition-colors" onClick={()=>setActive('student')}><Icon name="open" size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view==='risk' && (
          <div className="mt-6 grid grid-cols-3 gap-6">
            {[
              { k:'À risque', tone:'text-crit', filter:s=>s.risk==='high', note:'En dessous de 65 — planifier un entretien cette semaine.' },
              { k:'Sous surveillance', tone:'text-warn', filter:s=>s.risk==='med', note:'65–77 — envoyer une note de suivi.' },
              { k:'En piste', tone:'text-ok', filter:s=>s.risk==='low', note:'≥ 78 — aucune action requise.' },
            ].map(col=>{
              const list = STU.filter(col.filter).sort((a,b)=>a.score-b.score);
              return (
                <div key={col.k} className="bg-paper2/50 border border-rule rounded-lg p-5 min-h-[420px]">
                  <div className="flex items-center justify-between"><h3 className={`font-display text-[24px] tracking-tightish ${col.tone}`}>{col.k}</h3><span className="num text-[11px] text-ink3">{list.length}</span></div>
                  <p className="text-[12px] text-ink3 mt-1">{col.note}</p>
                  <div className="mt-4 space-y-2">
                    {list.map(s=>(
                      <div key={s.id} className="bg-paper border border-rule rounded-lg p-3 lift">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full text-paper inline-flex items-center justify-center text-[10px] font-display" style={{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}}>{s.initials}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-[14px] tracking-tightish leading-tight">{s.name}</div>
                            <div className="num text-[10px] text-ink3 leading-tight">{s.id} · {s.cohort}</div>
                          </div>
                          <span className="num text-[16px]" style={{color: s.score>=85?'#1E8449':s.score>=72?'#1B4F72':s.score>=60?'#D4AC0D':'#C0392B'}}>{s.score}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div><div className="text-[9px] uppercase tracking-[0.14em] text-ink3">Prés.</div><Bar value={s.presence} color="#1B4F72" height={3}/></div>
                          <div><div className="text-[9px] uppercase tracking-[0.14em] text-ink3">Ponct.</div><Bar value={s.ontime} color="#1B4F72" height={3}/></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

window.ScreenTeacher = ScreenTeacher;
