// Screen 2 — Institution page (director view)
const ScreenInstitution = ({ setActive }) => {
  const [tab, setTab] = React.useState('composite');
  const series = window.NABD.ENG_SERIES;
  const tabs = [
    { id:'composite', label:'Composite', data: series.composite, color:'#13110E' },
    { id:'attendance',label:'Attendance', data: series.attendance, color:'#3F6B3F' },
    { id:'ontime',    label:'On-time submission', data: series.ontime, color:'#D2532A' },
    { id:'pass',      label:'Pass rate', data: series.pass, color:'#7A2E12' },
  ];
  const active = tabs.find(t=>t.id===tab);

  return (
    <div className="screen" data-active="true">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
          <span>UCAR · College of Engineering</span>
          <span>Director: Dr. Hala Al-Najjar</span>
          <span>Last ingest 04:00 KSA</span>
        </div>
        <div className="hairline mt-3"/>

        <button onClick={()=>setActive('dashboard')} className="text-[12px] text-ink3 hover:text-ink ul-link mt-6 inline-flex items-center gap-1"><Icon name="corner" size={11}/> Back to Central</button>

        <div className="grid grid-cols-12 gap-8 mt-6">
          <div className="col-span-12 lg:col-span-8">
            <Pill>Institution view · Director</Pill>
            <h1 className="font-display text-[72px] leading-[0.92] tracking-tighter2 mt-4">
              College of Engineering
            </h1>
            <p className="ar text-[24px] text-ink2 mt-1">كلية الهندسة</p>
            <p className="text-ink2 text-[16px] leading-relaxed mt-5 max-w-[60ch]">
              Composite at <span className="num text-ok">88</span>, the institution's highest score on record. Movement is led by Mechanical and Software; Chemical remains the soft spot.
            </p>
          </div>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-3">Composite, this week</div>
            <div className="flex items-end gap-4">
              <span className="font-display text-[88px] leading-none tracking-tighter2">88</span>
              <span className="num text-ok text-[13px] pb-3">+4.1 wk</span>
            </div>
            <PulseLine score={88} w={300} h={42} animated/>
          </aside>
        </div>

        {/* KPI tiles with sparklines */}
        <div className="grid grid-cols-12 gap-3 mt-12">
          {[
            { k:'Students',    v:'4,120', s:'+38 this term', spark: window.NABD.ts(33, 4000, 30), color:'#13110E', unit:'enrolled' },
            { k:'Attendance',  v:'92.4%', s:'+1.2 wk',       spark: series.attendance,            color:'#3F6B3F', unit:'avg, all cohorts' },
            { k:'On-time',     v:'81.6%', s:'+4.1 wk',       spark: series.ontime,                color:'#D2532A', unit:'submission window' },
            { k:'Pass rate',   v:'89.2%', s:'+0.6 wk',       spark: series.pass,                  color:'#7A2E12', unit:'last assessment' },
          ].map(t=>(
            <div key={t.k} className="col-span-6 md:col-span-3 bg-paper2/70 border border-rule rounded p-5">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3"><span>{t.k}</span><span className="num text-ok">{t.s}</span></div>
              <div className="font-display text-[44px] leading-none tracking-tighter2 mt-2">{t.v}</div>
              <div className="text-[12px] text-ink3 mt-1">{t.unit}</div>
              <div className="mt-3"><Sparkline data={t.spark} w={240} h={28} color={t.color}/></div>
            </div>
          ))}
        </div>

        {/* Big chart with tabs */}
        <div className="mt-12 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 bg-paper2/50 border border-rule rounded p-7">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">Trends · 26 weeks</span>
                <h3 className="font-display text-[28px] tracking-tightish mt-1">{active.label}</h3>
              </div>
              <div className="flex items-center gap-1 text-[12px] flex-wrap">
                {tabs.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-full border ${tab===t.id?'bg-ink text-paper border-ink':'bg-paper border-rule text-ink2 hover:border-ink'}`}>{t.label}</button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <LineChart data={active.data} color={active.color} w={780} h={280}/>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-rule text-[12px]">
              <div><div className="text-ink3 text-[10px] uppercase tracking-[0.18em]">Latest</div><div className="num text-[20px] mt-1">{active.data.at(-1).v}</div></div>
              <div><div className="text-ink3 text-[10px] uppercase tracking-[0.18em]">Min · Max</div><div className="num text-[20px] mt-1">{Math.min(...active.data.map(d=>d.v))} · {Math.max(...active.data.map(d=>d.v))}</div></div>
              <div><div className="text-ink3 text-[10px] uppercase tracking-[0.18em]">Cohort baseline</div><div className="num text-[20px] mt-1">{(active.data.reduce((s,d)=>s+d.v,0)/active.data.length).toFixed(1)}</div></div>
            </div>
          </div>

          {/* Departments bar */}
          <div className="col-span-12 lg:col-span-4 bg-paper2/50 border border-rule rounded p-7">
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">Departments</span>
            <h3 className="font-display text-[28px] tracking-tightish mt-1">By composite</h3>
            <div className="mt-4 space-y-3.5">
              {window.NABD.ENG_DEPTS.sort((a,b)=>b.value-a.value).map(d=>(
                <div key={d.name}>
                  <div className="flex items-baseline justify-between text-[13px]"><span>{d.name}</span><span className="num">{d.value}</span></div>
                  <div className="mt-1.5"><Bar value={d.value} color={d.value>=88?'#3F6B3F':d.value>=80?'#13110E':'#B8842B'} height={3}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload area + alerts + briefing */}
        <div className="mt-10 grid grid-cols-12 gap-8">
          {/* Upload */}
          <div className="col-span-12 lg:col-span-5 bg-paper2/50 border border-rule rounded p-7">
            <Pill>Weekly submission</Pill>
            <h3 className="font-display text-[32px] tracking-tightish mt-3 leading-tight">Upload this week's roster.</h3>
            <p className="text-ink2 text-[13.5px] leading-relaxed mt-2 max-w-[44ch]">CSV or XLSX. We'll match columns automatically and send a confirmation to faculty leads.</p>
            <div className="mt-5 dashed-box rounded p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-ink text-paper inline-flex items-center justify-center"><Icon name="upload" size={16} stroke={2}/></div>
              <div className="font-display text-[22px] tracking-tightish mt-3">Drop a CSV here, or <span className="text-accent ul-link" style={{textDecorationColor:'#D2532A'}}>browse</span></div>
              <div className="num text-[11px] text-ink3 mt-1">Max 25 MB · template v3.2.7</div>
            </div>
            <div className="mt-4 space-y-2 text-[13px]">
              {[
                ['attendance_W17.csv', 'Mar 21', 'verified'],
                ['assessments_W16.csv','Mar 14', 'verified'],
                ['retention_M03.xlsx','Mar 02', 'pending'],
              ].map(([f,d,s])=>(
                <div key={f} className="flex items-center gap-3 border-t border-rule pt-2">
                  <Icon name="doc" size={14} className="text-ink3"/>
                  <span className="flex-1 truncate">{f}</span>
                  <span className="text-ink3 text-[12px] num">{d}</span>
                  <span className={`text-[10px] uppercase tracking-[0.14em] num ${s==='verified'?'text-ok':'text-warn'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Briefing */}
          <article className="col-span-12 lg:col-span-7 bg-ink text-paper rounded p-9 relative overflow-hidden">
            <div className="absolute inset-0 grain opacity-15 pointer-events-none"/>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-paper/60 num">
              <span>Engineering · Director's Brief</span>
              <span>Issue Nº 7</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="sparkle" size={11}/> Written by NABD</span>
            </div>
            <div className="border-t border-paper/15 mt-3 mb-6"/>
            <h2 className="font-display text-[40px] leading-[0.97] tracking-tighter2 max-w-[22ch]">
              Mechanical and Software led the rebound; Chemical needs a conversation.
            </h2>
            <div className="grid grid-cols-2 gap-x-8 mt-6 text-[13.5px] leading-[1.65] text-paper/85">
              <p>Composite advanced 4.1 points — the largest single-week gain in the engineering history of the index. Mechanical Department contributed 1.6 points alone, driven by a 9pt jump in third-year on-time submissions.</p>
              <p>Chemical Engineering remains at 79. The drift correlates with a 22% decline in lab-attendance for second-year students. Recommend a one-on-one with Dr. Mahmoud this week.</p>
            </div>
            <div className="border-t border-paper/15 mt-6 pt-3 text-[10px] text-paper/55 num flex items-center gap-4">
              <span>Source: NABD ingest 2026-W17</span><span>·</span><span>Confidence 91%</span><span>·</span><span>Cited rows: 14,820</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="bg-paper text-ink inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[13px]">Open full report <span className="bg-accent text-paper inline-flex items-center justify-center w-7 h-7 rounded-full"><Icon name="arrow-up-right" size={12} stroke={2}/></span></button>
              <button className="text-[13px] text-paper/70 hover:text-paper ul-link" style={{textDecorationColor:'rgba(246,242,234,0.3)'}}>Forward to faculty</button>
            </div>
          </article>
        </div>

        {/* Alerts list specific to engineering */}
        <div className="mt-10 grid grid-cols-12 gap-8">
          <div className="col-span-12 bg-paper2/50 border border-rule rounded p-7">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[24px] tracking-tightish">Alerts in Engineering</h3>
              <span className="num text-[11px] text-ink3">3 open · 2 acknowledged</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { l:'warning',  inst:'Chemical Eng., Y2', msg:'Lab attendance fell 22% over 3 weeks',         when:'2h ago' },
                { l:'info',     inst:'Civil Eng., Y4',     msg:'Capstone defenses scheduled — 14 students',    when:'1d ago' },
                { l:'critical', inst:'Mechanical, Y3',     msg:'A re-grade request opened on ME 351 final',    when:'3d ago' },
              ].map((a,i)=>(
                <div key={i} className="border border-rule rounded bg-paper p-4">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] num">
                    <span className={a.l==='critical'?'text-crit':a.l==='warning'?'text-warn':'text-ink3'}>{a.l}</span>
                    <span className="text-ink3">{a.when}</span>
                  </div>
                  <div className="font-display text-[18px] tracking-tightish mt-2">{a.inst}</div>
                  <p className="text-[13px] text-ink2 mt-1 leading-snug">{a.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ScreenInstitution = ScreenInstitution;
