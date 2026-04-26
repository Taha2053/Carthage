// Screen 3 — Teacher page
const ScreenTeacher = ({ setActive }) => {
  const [course, setCourse] = React.useState('ME 304');
  const [view, setView] = React.useState('roster');
  const courses = [
    { code:'ME 304', title:'Thermodynamics II',   students: 38, avg: 84 },
    { code:'ME 312', title:'Fluid Mechanics',     students: 41, avg: 79 },
    { code:'ME 351', title:'Mechanical Design',   students: 34, avg: 87 },
    { code:'ME 320', title:'Heat Transfer Lab',   students: 22, avg: 76 },
  ];
  const cur = courses.find(c=>c.code===course);
  const STU = window.NABD.STUDENTS;

  const sortedRisk = [...STU].sort((a,b)=> a.score - b.score);

  return (
    <div className="screen" data-active="true">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
          <span>UCAR · Engineering · Mechanical</span>
          <span>Instructor: Dr. Omar Al-Sayed</span>
          <span>Term: Spring 2026</span>
        </div>
        <div className="hairline mt-3"/>

        <button onClick={()=>setActive('institution')} className="text-[12px] text-ink3 hover:text-ink ul-link mt-6 inline-flex items-center gap-1"><Icon name="corner" size={11}/> Back to institution</button>

        <div className="grid grid-cols-12 gap-8 mt-6">
          <div className="col-span-12 lg:col-span-8">
            <Pill>Faculty view · Instructor</Pill>
            <h1 className="font-display text-[64px] leading-[0.92] tracking-tighter2 mt-4">
              Your week, in <em className="not-italic" style={{fontStyle:'italic'}}>one</em> roster.
            </h1>
            <p className="text-ink2 text-[16px] leading-relaxed mt-4 max-w-[60ch]">
              Four courses, 135 students. NABD has flagged <span className="num text-crit">5</span> who need a conversation this week and <span className="num text-warn">7</span> on watch. The roster below sorts by who needs you most.
            </p>
          </div>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule grid grid-cols-3 gap-3">
            {[['Cohort avg','82', 'text-ink'],['On watch','7', 'text-warn'],['At risk','5', 'text-crit']].map(([k,v,c])=>(
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
                {course===c.code && <span className="absolute left-0 right-0 -bottom-[7px] h-[2px] bg-ink"/>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[12px]">
            {[['roster','Roster'],['risk','At-risk board']].map(([k,l])=>(
              <button key={k} onClick={()=>setView(k)} className={`px-3 py-1.5 rounded-full border ${view===k?'bg-ink text-paper border-ink':'bg-paper border-rule text-ink2 hover:border-ink'}`}>{l}</button>
            ))}
          </div>
        </div>

        {view==='roster' && (
          <div className="mt-6">
            {/* table header */}
            <div className="grid grid-cols-12 gap-3 py-3 text-[10px] uppercase tracking-[0.18em] text-ink3 num border-b border-rule">
              <span className="col-span-1">№</span>
              <span className="col-span-4">Student</span>
              <span className="col-span-1">Cohort</span>
              <span className="col-span-2">Presence</span>
              <span className="col-span-1">On-time</span>
              <span className="col-span-1 text-right">Score</span>
              <span className="col-span-1">Risk</span>
              <span className="col-span-1 text-right">Action</span>
            </div>
            {sortedRisk.map((s,idx)=>(
              <div key={s.id} className="grid grid-cols-12 gap-3 py-3 border-b border-rule items-center hover:bg-paper2/60">
                <span className="col-span-1 num text-[12px] text-ink3">{String(idx+1).padStart(2,'0')}</span>
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-ink text-paper inline-flex items-center justify-center text-[11px] font-display">{s.initials}</span>
                  <div className="min-w-0">
                    <div className="font-display text-[16px] tracking-tightish leading-[1.2] truncate">{s.name}</div>
                    <div className="num text-[11px] text-ink3 leading-[1.2]">{s.id}</div>
                  </div>
                </div>
                <span className="col-span-1 text-[12px] text-ink2">{s.cohort}</span>
                <div className="col-span-2 flex items-center gap-2"><Bar value={s.presence} color={s.presence>=80?'#3F6B3F':s.presence>=65?'#003966':'#A8341E'} height={4}/><span className="num text-[12px] w-9 text-right">{s.presence}%</span></div>
                <div className="col-span-1 flex items-center gap-2"><Bar value={s.ontime} color={s.ontime>=80?'#3F6B3F':s.ontime>=65?'#003966':'#A8341E'} height={4}/><span className="num text-[12px] w-9 text-right">{s.ontime}%</span></div>
                <span className="col-span-1 num text-[18px] text-right" style={{color: s.score>=85?'#3F6B3F':s.score>=72?'#003966':s.score>=60?'#B8842B':'#A8341E'}}>{s.score}</span>
                <div className="col-span-1">
                  <span className={`text-[10px] uppercase tracking-[0.14em] num ${s.risk==='high'?'text-crit':s.risk==='med'?'text-warn':'text-ok'}`}>{s.risk==='high'?'at-risk':s.risk==='med'?'on watch':'on track'}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1.5">
                  <button title="Message" className="w-7 h-7 rounded-full border border-rule hover:bg-paper2 inline-flex items-center justify-center"><Icon name="mail" size={12}/></button>
                  <button title="Open" className="w-7 h-7 rounded-full border border-rule hover:bg-paper2 inline-flex items-center justify-center" onClick={()=>setActive('student')}><Icon name="open" size={12}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view==='risk' && (
          <div className="mt-6 grid grid-cols-3 gap-6">
            {[
              { k:'At-risk', tone:'text-crit', filter:s=>s.risk==='high', note:'Below 65 — schedule a 1:1 this week.' },
              { k:'On watch', tone:'text-warn', filter:s=>s.risk==='med', note:'65–77 — send a check-in note.' },
              { k:'On track', tone:'text-ok', filter:s=>s.risk==='low', note:'≥ 78 — no action required.' },
            ].map(col=>{
              const list = STU.filter(col.filter).sort((a,b)=>a.score-b.score);
              return (
                <div key={col.k} className="bg-paper2/50 border border-rule rounded p-5 min-h-[420px]">
                  <div className="flex items-center justify-between"><h3 className={`font-display text-[24px] tracking-tightish ${col.tone}`}>{col.k}</h3><span className="num text-[11px] text-ink3">{list.length}</span></div>
                  <p className="text-[12px] text-ink3 mt-1">{col.note}</p>
                  <div className="mt-4 space-y-2">
                    {list.map(s=>(
                      <div key={s.id} className="bg-paper border border-rule rounded p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-ink text-paper inline-flex items-center justify-center text-[10px] font-display">{s.initials}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-display text-[14px] tracking-tightish leading-tight">{s.name}</div>
                            <div className="num text-[10px] text-ink3 leading-tight">{s.id} · {s.cohort}</div>
                          </div>
                          <span className="num text-[16px]" style={{color: s.score>=85?'#3F6B3F':s.score>=72?'#003966':s.score>=60?'#B8842B':'#A8341E'}}>{s.score}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div><div className="text-[9px] uppercase tracking-[0.14em] text-ink3">Pres.</div><Bar value={s.presence} color="#003966" height={3}/></div>
                          <div><div className="text-[9px] uppercase tracking-[0.14em] text-ink3">On-time</div><Bar value={s.ontime} color="#003966" height={3}/></div>
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
