// Screen — Student page (CarthaVillage)
const ScreenStudent = ({ setActive }) => {
  const s = window.CARTHAVILLAGE.STUDENT;
  return (
    <div className="screen" data-active="true">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
          <span>UCAR · {s.program}</span>
          <span>{s.id}</span>
          <span>Mention : {s.standing}</span>
        </div>
        <div className="hairline mt-3"/>

        <button onClick={()=>setActive('teacher')} className="text-[12px] text-ink3 hover:text-ink ul-link mt-6 inline-flex items-center gap-1"><Icon name="corner" size={11}/> Retour au registre</button>

        <div className="grid grid-cols-12 gap-8 mt-6 items-start">
          <div className="col-span-12 lg:col-span-7">
            <Pill tone="accent">Vue étudiant</Pill>
            <h1 className="font-display text-[64px] leading-[0.92] tracking-tighter2 mt-4">{s.name}</h1>
            <p className="ar text-[24px] text-ink2 mt-1">{s.ar}</p>
            <p className="text-ink2 text-[16px] leading-relaxed mt-3">{s.program} · {s.id}</p>
          </div>
          <aside className="col-span-12 lg:col-span-5 lg:pl-8 lg:border-l border-rule">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-3">Composite cette semaine</div>
            <div className="flex items-end gap-4">
              <span className="font-display text-[88px] leading-none tracking-tighter2" style={{color:'#1B4F72'}}>82</span>
              <span className="num text-warn text-[13px] pb-3">−1.4 sem</span>
            </div>
            <PulseLine score={82} w={300} h={42} animated/>
          </aside>
        </div>

        {/* KPI tiles with rings */}
        <div className="grid grid-cols-12 gap-3 mt-12">
          {[
            { k:'MG',          v:s.gpa.toFixed(2), max:4,    ring:Math.round((s.gpa/4)*100), unit:'cumulée', color:'#1B4F72' },
            { k:'Présence',    v:s.attendance+'%', max:100,  ring:s.attendance,               unit:'4 dernières sem.', color:'#1E8449' },
            { k:'Ponctualité', v:s.ontime+'%',     max:100,  ring:s.ontime,                   unit:'fenêtre soumission', color:'#C5933A' },
            { k:'Crédits',     v:'18',             max:24,   ring:Math.round((18/24)*100),    unit:'ce semestre', color:'#C0392B' },
          ].map(t=>(
            <div key={t.k} className="col-span-6 md:col-span-3 bg-paper2/70 border border-rule rounded-lg p-5 flex items-center gap-4">
              <Ring value={t.ring} size={64} stroke={5} color={t.color} />
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink3">{t.k}</div>
                <div className="font-display text-[30px] leading-none tracking-tighter2 mt-1">{t.v}</div>
                <div className="text-[12px] text-ink3 mt-1">{t.unit}</div>
              </div>
            </div>
          ))}
        </div>

        {/* AI nudge — centered, prominent */}
        <article className="mt-12 card-gradient text-paper rounded-xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 grain opacity-15 pointer-events-none"/>
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 lg:col-span-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-paper/60 num">
                <Icon name="sparkle" size={11} className="text-accent"/> Une note de CarthaVillage · personnalisée pour {s.name.split(' ')[0]}
              </div>
              <h2 className="font-display text-[40px] md:text-[44px] leading-[1.05] tracking-tighter2 mt-3 max-w-[24ch]">
                {s.nudge.headline}
              </h2>
              <p className="text-paper/85 text-[15px] leading-relaxed mt-6 max-w-[58ch]">
                {s.nudge.detail}
              </p>
              <div className="flex items-center gap-3 mt-6">
                <button className="bg-paper text-ink inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[13px] hover:shadow-lg transition-shadow">Ouvrir MATH 261 <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{background:'#C5933A'}}><Icon name="arrow-up-right" size={12} stroke={2} className="text-paper"/></span></button>
                <button className="text-[13px] text-paper/70 hover:text-paper ul-link" style={{textDecorationColor:'rgba(247,245,240,0.3)'}}>Reporter 1 jour</button>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/60 mb-3">Tendance · 26 semaines</div>
              <div className="bg-paper/5 rounded-lg p-4">
                <LineChart data={s.trend} w={420} h={180} color="#C5933A" axis={false} fill={false}/>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3 text-[11px]">
                <div><div className="text-paper/60">Min</div><div className="num text-[16px]">{Math.min(...s.trend.map(d=>d.v))}</div></div>
                <div><div className="text-paper/60">Actuel</div><div className="num text-[16px]">{s.trend.at(-1).v}</div></div>
                <div><div className="text-paper/60">Max</div><div className="num text-[16px]">{Math.max(...s.trend.map(d=>d.v))}</div></div>
              </div>
            </div>
          </div>
        </article>

        {/* Course cards */}
        <div className="mt-12">
          <div className="flex items-end justify-between">
            <div>
              <Pill>Ce semestre · 6 cours</Pill>
              <h2 className="font-display text-[40px] leading-[0.95] tracking-tighter2 mt-3">Vos cours.</h2>
            </div>
            <span className="num text-[12px] text-ink3">Total : 18 crédits</span>
          </div>
          <div className="grid grid-cols-12 gap-4 mt-6">
            {s.courses.map(c=>{
              const tone = c.status==='on-track' ? 'text-ok border-ok/30' : 'text-warn border-warn/40';
              return (
                <div key={c.code} className="col-span-12 md:col-span-6 lg:col-span-4 bg-paper2/60 border border-rule rounded-lg p-5 lift">
                  <div className="flex items-center justify-between">
                    <span className="num text-[11px] text-ink3 uppercase tracking-[0.14em]">{c.code} · {c.credits} cr</span>
                    <span className={`text-[10px] uppercase tracking-[0.14em] num px-2 py-0.5 rounded-full border ${tone}`}>{c.status==='on-track'?'en piste':'à surveiller'}</span>
                  </div>
                  <h3 className="font-display text-[24px] leading-tight tracking-tightish mt-2">{c.title}</h3>
                  <div className="flex items-end justify-between mt-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-ink3">Note</div>
                      <div className="font-display text-[44px] leading-none tracking-tighter2" style={{color:'#1B4F72'}}>{c.grade}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.18em] text-ink3">Score</div>
                      <div className="num text-[20px]">{c.mark}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Bar value={c.mark} color={c.mark>=85?'#1E8449':c.mark>=72?'#1B4F72':'#D4AC0D'} height={3}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results table — compact */}
        <div className="mt-12 bg-paper2/40 border border-rule rounded-lg">
          <div className="px-6 py-4 flex items-center justify-between border-b border-rule">
            <h3 className="font-display text-[22px] tracking-tightish">Résultats · 6 dernières évaluations</h3>
            <span className="num text-[11px] text-ink3">MG cumulative {s.gpa.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-12 gap-3 px-6 py-2 text-[10px] uppercase tracking-[0.18em] text-ink3 num border-b border-rule">
            <span className="col-span-2">Date</span>
            <span className="col-span-2">Cours</span>
            <span className="col-span-4">Évaluation</span>
            <span className="col-span-1 text-right">Note</span>
            <span className="col-span-1 text-right">Cohorte</span>
            <span className="col-span-1 text-right">∆</span>
            <span className="col-span-1 text-right">Lettre</span>
          </div>
          {[
            ['2026-04-22','INF 351','Mi-session · Projet Conception',92, 84, +8, 'A'],
            ['2026-04-15','INF 304','Quiz 4 · Pipeline',          88, 79, +9, 'A-'],
            ['2026-04-09','INF 312','Rapport Labo 3',              81, 78, +3, 'B+'],
            ['2026-04-02','MATH 261','Problème Série 7',            65, 76, -11,'C+'],
            ['2026-03-28','HUM 201','Essai · Éthique IA',     94, 81, +13,'A'],
            ['2026-03-21','INF 320','TP Pratique',             76, 80, -4, 'B'],
          ].map((r,i)=>(
            <div key={i} className="grid grid-cols-12 gap-3 px-6 py-3 border-b border-rule items-center text-[13px] hover:bg-paper2/60 transition-colors">
              <span className="col-span-2 num text-ink3">{r[0]}</span>
              <span className="col-span-2 num">{r[1]}</span>
              <span className="col-span-4">{r[2]}</span>
              <span className="col-span-1 num text-right">{r[3]}</span>
              <span className="col-span-1 num text-right text-ink3">{r[4]}</span>
              <span className={`col-span-1 num text-right ${r[5]>=0?'text-ok':'text-crit'}`}>{r[5]>=0?'+':''}{r[5]}</span>
              <span className="col-span-1 font-display text-right text-[18px]">{r[6]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

window.ScreenStudent = ScreenStudent;
