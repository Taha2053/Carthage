// Screen — UCAR Central Dashboard (CarthaVillage president view)
const ScreenDashboard = ({ setActive }) => {
  const insts = window.CARTHAVILLAGE.INSTITUTIONS;
  const [filter, setFilter] = React.useState('all');
  const filtered = insts.filter(i => filter==='all' ? true : filter==='watch' ? i.score < 80 : i.score >= 85);

  return (
    <div className="screen" data-active="true">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        {/* Page heading */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
          <span>UCAR Central · Le Pouls</span>
          <span>26 Avril 2026 · Édition Nº 7</span>
          <span>Composite v3.2.7</span>
        </div>
        <div className="hairline mt-3"/>

        <div className="grid grid-cols-12 gap-8 mt-10">
          <div className="col-span-12 lg:col-span-8">
            <Pill tone="blue">Vue présidentielle</Pill>
            <h1 className="font-display text-[64px] leading-[1.02] tracking-tighter2 mt-5 max-w-[20ch]">
              Bonjour, Pof. Chaâbane.<br/>
              <span style={{fontStyle:'italic'}}>La semaine est </span><span style={{color:'#C5933A'}}>prudemment haussière.</span>
            </h1>
            <p className="text-ink2 text-[16px] leading-relaxed mt-8 max-w-[60ch]">
              Le composite agrégé est de 81.4 (+0.6). Douze établissements sont au-dessus de 85. Deux — l'ISA Chott-Mariem et l'IPA — ont franchi votre seuil critique et nécessitent une décision au niveau du conseil avant l'audit de mai.
            </p>
          </div>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-3">Composite universitaire</div>
            <div className="flex items-end gap-4">
              <span className="font-display text-[88px] leading-none tracking-tighter2" style={{color:'#1B4F72'}}>81.4</span>
              <span className="num text-ok text-[13px] pb-3">+0.6 sem</span>
            </div>
            <PulseLine score={81} w={300} h={42} animated/>
            <div className="grid grid-cols-3 gap-2 mt-5 text-[12px]">
              <div className="border-t border-rule pt-2"><div className="text-ink3">Au-dessus de 85</div><div className="num text-[18px] text-ok">12</div></div>
              <div className="border-t border-rule pt-2"><div className="text-ink3">Sous surveillance</div><div className="num text-[18px] text-warn">5</div></div>
              <div className="border-t border-rule pt-2"><div className="text-ink3">Critique</div><div className="num text-[18px] text-crit">2</div></div>
            </div>
          </aside>
        </div>

        <div className="hairline my-12"/>

        {/* Two-column: AI briefing + alerts */}
        <div className="grid grid-cols-12 gap-8">
          {/* AI weekly briefing — magazine cover */}
          <article className="col-span-12 lg:col-span-8 card-gradient text-paper rounded-xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 grain opacity-15 pointer-events-none"/>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-paper/60 num">
              <span>Le Briefing · Édition Nº {window.CARTHAVILLAGE.BRIEFING.issue}</span>
              <span>{window.CARTHAVILLAGE.BRIEFING.date}</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="sparkle" size={11}/> Rédigé par CarthaVillage</span>
            </div>
            <div className="border-t border-paper/15 mt-3 mb-6"/>
            <h2 className="font-display text-[48px] md:text-[56px] leading-[0.95] tracking-tighter2 max-w-[22ch]">
              {window.CARTHAVILLAGE.BRIEFING.headline}
            </h2>
            <p className="text-paper/80 text-[17px] leading-snug mt-5 max-w-[58ch] font-display" style={{fontStyle:'italic'}}>
              {window.CARTHAVILLAGE.BRIEFING.deck}
            </p>

            <div className="grid grid-cols-2 gap-x-10 mt-10 text-[14px] leading-[1.65] text-paper/85">
              <div className="space-y-4">
                <p><span className="font-display text-[44px] leading-[0.8] float-left mr-2 mt-1 text-accent">{window.CARTHAVILLAGE.BRIEFING.body[0].text[0]}</span>{window.CARTHAVILLAGE.BRIEFING.body[0].text.slice(1)}</p>
                <p>{window.CARTHAVILLAGE.BRIEFING.body[1].text}</p>
              </div>
              <div className="space-y-4">
                <blockquote className="font-display text-[24px] leading-tight text-paper border-l-2 border-accent pl-5" style={{fontStyle:'italic'}}>
                  {window.CARTHAVILLAGE.BRIEFING.body[2].text}
                </blockquote>
                <p>{window.CARTHAVILLAGE.BRIEFING.body[3].text}</p>
              </div>
            </div>

            <div className="border-t border-paper/15 mt-8 pt-4 grid grid-cols-3 gap-6 text-[11px] text-paper/55 num">
              {window.CARTHAVILLAGE.BRIEFING.citations.map((c,i)=>(<div key={i}><sup className="text-accent">{i+1}</sup> {c}</div>))}
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button className="bg-paper text-ink inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[13px] hover:shadow-lg transition-shadow">Lire le briefing complet <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{background:'#C5933A'}}><Icon name="arrow-up-right" size={12} stroke={2} className="text-paper"/></span></button>
              <button className="text-[13px] text-paper/70 hover:text-paper ul-link" style={{textDecorationColor:'rgba(247,245,240,0.3)'}}>Transmettre au conseil</button>
              <button className="text-[13px] text-paper/70 hover:text-paper ul-link" style={{textDecorationColor:'rgba(247,245,240,0.3)'}}>Comparer avec l'Édition 6</button>
            </div>
          </article>

          {/* Alerts panel */}
          <aside className="col-span-12 lg:col-span-4 bg-paper2 border border-rule rounded-xl p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon name="bell" size={14} className="text-accent"/><span className="font-display text-[20px]">Alertes requérant décision</span></div>
              <span className="num text-[11px] text-ink3">{window.CARTHAVILLAGE.ALERTS.length}</span>
            </div>
            <div className="mt-5 space-y-1">
              {window.CARTHAVILLAGE.ALERTS.map(a=>{
                const tone = a.level==='critical'?'text-crit':a.level==='warning'?'text-warn':'text-ink3';
                return (
                  <div key={a.id} className="border-t border-rule py-3.5 flex gap-3">
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${a.level==='critical'?'bg-crit':a.level==='warning'?'bg-warn':'bg-ink3'}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-[10px] uppercase tracking-[0.18em] num ${tone}`}>{a.level==='critical'?'critique':a.level==='warning'?'attention':'info'}</span>
                        <span className="text-[10px] text-ink3 num">{a.when}</span>
                      </div>
                      <div className="text-[14px] mt-0.5 font-medium">{a.inst}</div>
                      <p className="text-[12.5px] text-ink2 leading-snug mt-0.5">{a.msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="mt-4 text-[12.5px] ul-link text-ink2 hover:text-ink">Voir le journal d'alertes →</button>
          </aside>
        </div>

        <div className="hairline my-14"/>

        {/* Institution roster */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <Pill><span className="num">35</span> établissements · classés par composite</Pill>
            <h2 className="font-display text-[42px] leading-[0.95] tracking-tighter2 mt-3">Le registre.</h2>
          </div>
          <div className="flex items-center gap-1 text-[12px]">
            {[['all','Tous (35)'],['top','Au-dessus de 85'],['watch','Sous surveillance']].map(([k,l])=>(
              <button key={k} onClick={()=>setFilter(k)} className={`px-3 py-1.5 rounded-full border transition-all ${filter===k?'text-paper border-blue':'bg-paper border-rule text-ink2 hover:border-ink'}`} style={filter===k?{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}:{}}>{l}</button>
            ))}
          </div>
        </div>

        {/* roster grid */}
        <div className="grid grid-cols-12 gap-x-3 gap-y-0 border-t border-rule">
          {/* header row */}
          <div className="col-span-12 grid grid-cols-12 gap-3 py-3 text-[10px] uppercase tracking-[0.18em] text-ink3 num border-b border-rule">
            <span className="col-span-1">№</span>
            <span className="col-span-4">Établissement</span>
            <span className="col-span-1">Type</span>
            <span className="col-span-1 text-right">Étudiants</span>
            <span className="col-span-1 text-right">Score</span>
            <span className="col-span-3">Pouls · 26 semaines</span>
            <span className="col-span-1 text-right">Tendance</span>
          </div>
          {filtered.sort((a,b)=>b.score-a.score).map((i,idx)=>(
            <button onClick={()=>setActive('institution')} key={i.id} className="col-span-12 grid grid-cols-12 gap-3 py-4 border-b border-rule items-center text-left hover:bg-paper2/60 transition-colors">
              <span className="col-span-1 num text-[12px] text-ink3">{String(idx+1).padStart(2,'0')}</span>
              <div className="col-span-4">
                <div className="font-display text-[19px] tracking-tightish leading-tight">{i.name}</div>
                <div className="text-[13px] text-ink3 leading-tight mt-0.5">{i.fr}</div>
              </div>
              <span className="col-span-1 text-[12px] text-ink2">{i.kind}</span>
              <span className="col-span-1 num text-[13px] text-right">{i.students.toLocaleString()}</span>
              <span className="col-span-1 num text-[18px] text-right" style={{color: i.score>=85?'#1E8449':i.score>=72?'#1B4F72':i.score>=60?'#D4AC0D':'#C0392B'}}>{i.score}</span>
              <div className="col-span-3"><PulseLine score={i.score} w={240} h={26}/></div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                {i.alerts>0 && <span className="num text-[10px] text-crit">{i.alerts}!</span>}
                <TrendDot trend={i.trend}/>
              </div>
            </button>
          ))}
        </div>

        {/* NL query bar */}
        <div className="sticky bottom-6 mt-12 z-30">
          <div className="rounded-full pl-6 pr-2 py-2 flex items-center gap-3 shadow-[0_18px_40px_-20px_rgba(15,25,35,0.5)] max-w-[920px] mx-auto" style={{background:'linear-gradient(135deg, #0F1923, #1B4F72)'}}>
            <Icon name="sparkle" size={14} className="text-accent"/>
            <input className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-paper/50 text-paper" placeholder="Demandez à CarthaVillage — «Pourquoi l'ISA a-t-elle chuté ? Quels établissements ont mené le rebond ?»"/>
            <span className="text-[10px] uppercase tracking-[0.18em] text-paper/40 num hidden md:inline">⌘K</span>
            <button className="w-9 h-9 rounded-full inline-flex items-center justify-center hover:opacity-80 transition-opacity" style={{background:'#C5933A'}}><Icon name="arrow-up-right" size={14} stroke={2} className="text-paper"/></button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-ink3">
            <span className="ul-link cursor-pointer">Comparer le top 5</span>
            <span>·</span>
            <span className="ul-link cursor-pointer">Liste de surveillance</span>
            <span>·</span>
            <span className="ul-link cursor-pointer">Alertes de dérive</span>
            <span>·</span>
            <span className="ul-link cursor-pointer">Agenda de mai</span>
          </div>
        </div>
      </div>
    </div>
  );
};

window.ScreenDashboard = ScreenDashboard;
