// Screen — Institution page (CarthaVillage director view)
const ScreenInstitution = ({ setActive }) => {
  const [tab, setTab] = React.useState('composite');
  const series = window.CARTHAVILLAGE.ENG_SERIES;
  const tabs = [
    { id:'composite', label:'Composite', data: series.composite, color:'#1B4F72' },
    { id:'attendance',label:'Présence', data: series.attendance, color:'#1E8449' },
    { id:'ontime',    label:'Ponctualité', data: series.ontime, color:'#C5933A' },
    { id:'pass',      label:'Taux de réussite', data: series.pass, color:'#C0392B' },
  ];
  const active = tabs.find(t=>t.id===tab);

  return (
    <div className="screen" data-active="true">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
          <span>UCAR · INSAT — Institut National des Sciences Appliquées et de Technologie</span>
          <span>Directeur: Dr. Mohamed Ben Salah</span>
          <span>Dernière ingestion 04:00 CET</span>
        </div>
        <div className="hairline mt-3"/>

        <button onClick={()=>setActive('dashboard')} className="text-[12px] text-ink3 hover:text-ink ul-link mt-6 inline-flex items-center gap-1"><Icon name="corner" size={11}/> Retour au Central</button>

        <div className="grid grid-cols-12 gap-8 mt-6">
          <div className="col-span-12 lg:col-span-8">
            <Pill tone="blue">Vue institution · Directeur</Pill>
            <h1 className="font-display text-[64px] leading-[0.92] tracking-tighter2 mt-4">
              INSAT
            </h1>
            <p className="text-ink3 text-[18px] mt-1">Institut National des Sciences Appliquées et de Technologie</p>
            <p className="text-ink2 text-[16px] leading-relaxed mt-5 max-w-[60ch]">
              Composite à <span className="num" style={{color:'#1E8449'}}>91</span>, le meilleur score historique de l'établissement. Le mouvement est mené par le Génie Informatique et le Génie Industriel ; le Génie Chimique reste le point faible.
            </p>
          </div>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-3">Composite, cette semaine</div>
            <div className="flex items-end gap-4">
              <span className="font-display text-[88px] leading-none tracking-tighter2" style={{color:'#1B4F72'}}>91</span>
              <span className="num text-ok text-[13px] pb-3">+4.1 sem</span>
            </div>
            <PulseLine score={91} w={300} h={42} animated/>
          </aside>
        </div>

        {/* KPI tiles with sparklines */}
        <div className="grid grid-cols-12 gap-3 mt-12">
          {[
            { k:'Étudiants',    v:'2,640', s:'+38 ce terme', spark: window.CARTHAVILLAGE.ts(33, 2600, 30), color:'#1B4F72', unit:'inscrits' },
            { k:'Présence',     v:'92.4%', s:'+1.2 sem',     spark: series.attendance,            color:'#1E8449', unit:'moy. toutes cohortes' },
            { k:'Ponctualité',  v:'85.6%', s:'+4.1 sem',     spark: series.ontime,                color:'#C5933A', unit:'fenêtre de soumission' },
            { k:'Taux réussite',v:'89.2%', s:'+0.6 sem',     spark: series.pass,                  color:'#C0392B', unit:'dernière évaluation' },
          ].map(t=>(
            <div key={t.k} className="col-span-6 md:col-span-3 bg-paper2/70 border border-rule rounded-lg p-5">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3"><span>{t.k}</span><span className="num text-ok">{t.s}</span></div>
              <div className="font-display text-[44px] leading-none tracking-tighter2 mt-2" style={{color:'#1B4F72'}}>{t.v}</div>
              <div className="text-[12px] text-ink3 mt-1">{t.unit}</div>
              <div className="mt-3"><Sparkline data={t.spark} w={240} h={28} color={t.color}/></div>
            </div>
          ))}
        </div>

        {/* Big chart with tabs */}
        <div className="mt-12 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 bg-paper2/50 border border-rule rounded-lg p-7">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">Tendances · 26 semaines</span>
                <h3 className="font-display text-[28px] tracking-tightish mt-1">{active.label}</h3>
              </div>
              <div className="flex items-center gap-1 text-[12px] flex-wrap">
                {tabs.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-1.5 rounded-full border transition-all ${tab===t.id?'text-paper border-blue':'bg-paper border-rule text-ink2 hover:border-ink'}`} style={tab===t.id?{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}:{}}>{t.label}</button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <LineChart data={active.data} color={active.color} w={780} h={280}/>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-4 pt-4 border-t border-rule text-[12px]">
              <div><div className="text-ink3 text-[10px] uppercase tracking-[0.18em]">Dernier</div><div className="num text-[20px] mt-1">{active.data.at(-1).v}</div></div>
              <div><div className="text-ink3 text-[10px] uppercase tracking-[0.18em]">Min · Max</div><div className="num text-[20px] mt-1">{Math.min(...active.data.map(d=>d.v))} · {Math.max(...active.data.map(d=>d.v))}</div></div>
              <div><div className="text-ink3 text-[10px] uppercase tracking-[0.18em]">Base cohorte</div><div className="num text-[20px] mt-1">{(active.data.reduce((s,d)=>s+d.v,0)/active.data.length).toFixed(1)}</div></div>
            </div>
          </div>

          {/* Departments bar */}
          <div className="col-span-12 lg:col-span-4 bg-paper2/50 border border-rule rounded-lg p-7">
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">Départements</span>
            <h3 className="font-display text-[28px] tracking-tightish mt-1">Par composite</h3>
            <div className="mt-4 space-y-3.5">
              {window.CARTHAVILLAGE.ENG_DEPTS.sort((a,b)=>b.value-a.value).map(d=>(
                <div key={d.name}>
                  <div className="flex items-baseline justify-between text-[13px]"><span>{d.name}</span><span className="num">{d.value}</span></div>
                  <div className="mt-1.5"><Bar value={d.value} color={d.value>=88?'#1E8449':d.value>=80?'#1B4F72':'#D4AC0D'} height={3}/></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload area + briefing */}
        <div className="mt-10 grid grid-cols-12 gap-8">
          {/* Upload */}
          <div className="col-span-12 lg:col-span-5 bg-paper2/50 border border-rule rounded-lg p-7">
            <Pill>Soumission hebdomadaire</Pill>
            <h3 className="font-display text-[32px] tracking-tightish mt-3 leading-tight">Télécharger le registre de la semaine.</h3>
            <p className="text-ink2 text-[13.5px] leading-relaxed mt-2 max-w-[44ch]">CSV ou XLSX. Nous ferons la correspondance des colonnes automatiquement et enverrons une confirmation aux responsables de filière.</p>
            <div className="mt-5 dashed-box rounded-lg p-8 text-center">
              <div className="w-12 h-12 rounded-full inline-flex items-center justify-center" style={{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}}><Icon name="upload" size={16} stroke={2} className="text-accent"/></div>
              <div className="font-display text-[22px] tracking-tightish mt-3">Déposer un CSV ici, ou <span className="ul-link" style={{color:'#C5933A', textDecorationColor:'#C5933A'}}>parcourir</span></div>
              <div className="num text-[11px] text-ink3 mt-1">Max 25 Mo · template v3.2.7</div>
            </div>
            <div className="mt-4 space-y-2 text-[13px]">
              {[
                ['presence_S17.csv', '21 Mars', 'vérifié'],
                ['evaluations_S16.csv','14 Mars', 'vérifié'],
                ['retention_M03.xlsx','02 Mars', 'en attente'],
              ].map(([f,d,s])=>(
                <div key={f} className="flex items-center gap-3 border-t border-rule pt-2">
                  <Icon name="doc" size={14} className="text-ink3"/>
                  <span className="flex-1 truncate">{f}</span>
                  <span className="text-ink3 text-[12px] num">{d}</span>
                  <span className={`text-[10px] uppercase tracking-[0.14em] num ${s==='vérifié'?'text-ok':'text-warn'}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Briefing */}
          <article className="col-span-12 lg:col-span-7 card-gradient text-paper rounded-xl p-9 relative overflow-hidden">
            <div className="absolute inset-0 grain opacity-15 pointer-events-none"/>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-paper/60 num">
              <span>INSAT · Briefing Directeur</span>
              <span>Édition Nº 7</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="sparkle" size={11}/> Rédigé par CarthaVillage</span>
            </div>
            <div className="border-t border-paper/15 mt-3 mb-6"/>
            <h2 className="font-display text-[40px] leading-[0.97] tracking-tighter2 max-w-[22ch]">
              L'Informatique et l'Industriel mènent le rebond ; le Chimique nécessite un dialogue.
            </h2>
            <div className="grid grid-cols-2 gap-x-8 mt-6 text-[13.5px] leading-[1.65] text-paper/85">
              <p>Le composite a progressé de 4.1 points — le gain hebdomadaire le plus important dans l'histoire de l'INSAT. Le département Génie Informatique a contribué à lui seul 1.6 points, porté par un bond de 9 points des soumissions dans les délais en 3e année.</p>
              <p>Le Génie Chimique reste à 82. La dérive corrèle avec une baisse de 22% de la présence en laboratoire pour les étudiants de 2e année. Nous recommandons un entretien avec Dr. Mahmoud cette semaine.</p>
            </div>
            <div className="border-t border-paper/15 mt-6 pt-3 text-[10px] text-paper/55 num flex items-center gap-4">
              <span>Source : CarthaVillage ingestion 2026-S17</span><span>·</span><span>Confiance 91%</span><span>·</span><span>Lignes citées : 14,820</span>
            </div>
            <div className="mt-6 flex gap-3">
              <button className="bg-paper text-ink inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[13px] hover:shadow-lg transition-shadow">Ouvrir le rapport complet <span className="inline-flex items-center justify-center w-7 h-7 rounded-full" style={{background:'#C5933A'}}><Icon name="arrow-up-right" size={12} stroke={2} className="text-paper"/></span></button>
              <button className="text-[13px] text-paper/70 hover:text-paper ul-link" style={{textDecorationColor:'rgba(247,245,240,0.3)'}}>Transmettre aux enseignants</button>
            </div>
          </article>
        </div>

        {/* Alerts list specific to institution */}
        <div className="mt-10 grid grid-cols-12 gap-8">
          <div className="col-span-12 bg-paper2/50 border border-rule rounded-lg p-7">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[24px] tracking-tightish">Alertes à l'INSAT</h3>
              <span className="num text-[11px] text-ink3">3 ouvertes · 2 acquittées</span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { l:'warning',  inst:'Génie Chimique, A2', msg:'Présence en laboratoire en baisse de 22% sur 3 semaines',         when:'Il y a 2h' },
                { l:'info',     inst:'Génie Civil, A4',     msg:'Soutenances de PFE programmées — 14 étudiants',    when:'Il y a 1j' },
                { l:'critical', inst:'Génie Mécanique, A3', msg:'Demande de révision de note ouverte sur ME 351',    when:'Il y a 3j' },
              ].map((a,i)=>(
                <div key={i} className="border border-rule rounded-lg bg-paper p-4 lift">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] num">
                    <span className={a.l==='critical'?'text-crit':a.l==='warning'?'text-warn':'text-ink3'}>{a.l==='critical'?'critique':a.l==='warning'?'attention':'info'}</span>
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
