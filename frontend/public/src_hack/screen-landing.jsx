// Screen — Landing page: CarthaVillage (editorial hero, marquee, sections)
const ScreenLanding = ({ setActive }) => {
  return (
    <div className="screen" data-active="true">
      {/* Hero */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-8 pt-14 pb-10">
          {/* meta line */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
            <span>Le Pouls · Édition Nº 7</span>
            <span>26 Avril 2026 — Tunis, Tunisie</span>
            <span>Vol. III</span>
          </div>
          <div className="hairline mt-3"/>

          <div className="grid grid-cols-12 gap-8 mt-12">
            <div className="col-span-12 lg:col-span-8">
              <Pill><span className="w-1.5 h-1.5 rounded-full bg-accent"></span>Plateforme d'intelligence universitaire</Pill>
              <h1 className="font-display text-[72px] md:text-[120px] leading-[0.88] tracking-tighter2 mt-6">
                Un signal pour<br/>
                <span className="shimmer-text">trente-cinq</span><br/>
                établissements.
              </h1>
              <p className="text-ink2 text-[18px] leading-[1.55] max-w-[58ch] mt-8">
                CarthaVillage est le système d'exploitation pour la présidence de l'Université de Carthage — un signal unique et audité à travers facultés, instituts et écoles, avec des briefings hebdomadaires écrits pour le conseil, pas pour le tableau de bord.
              </p>
              <div className="flex items-center gap-3 mt-10">
                <button onClick={()=>setActive('dashboard')} className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]">
                  Ouvrir le tableau de bord <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full"><Icon name="arrow-up-right" size={14} stroke={2}/></span>
                </button>
                <button className="text-[14px] text-ink2 hover:text-ink ul-link">Lire le briefing de la semaine</button>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-4">Indice universitaire, cette semaine</div>
              <div className="flex items-end gap-4">
                <span className="font-display text-[88px] leading-none tracking-tighter2" style={{color:'#1B4F72'}}>81.4</span>
                <span className="num text-ok text-[13px] pb-3">+0.6</span>
              </div>
              <PulseLine score={81} w={280} h={42} animated />
              <div className="grid grid-cols-3 gap-3 mt-6 text-[12px]">
                <div><div className="text-ink3 mb-1">Au-dessus de 85</div><div className="num text-[18px] text-ok">12</div></div>
                <div><div className="text-ink3 mb-1">Sous surveillance</div><div className="num text-[18px] text-warn">5</div></div>
                <div><div className="text-ink3 mb-1">Critique</div><div className="num text-[18px] text-crit">2</div></div>
              </div>
              <div className="mt-6 p-4 bg-paper2 border border-rule rounded-lg">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-1">À la une</div>
                <p className="font-display text-[18px] leading-snug">L'INSAT franchit 91 ; l'ISA Chott-Mariem nécessite une intervention.</p>
              </div>
            </aside>
          </div>
        </div>

        {/* hero figure — pulse skyline on dark card */}
        <div className="max-w-[1400px] mx-auto px-8 pt-2 pb-16">
          <div className="relative card-gradient text-paper rounded-xl overflow-hidden border border-blue/20">
            <div className="absolute inset-0 grain opacity-20"/>
            <div className="grid grid-cols-12 px-10 pt-10 pb-12 relative">
              <div className="col-span-7">
                <span className="text-[11px] uppercase tracking-[0.18em] text-paper/60">En direct · ce matin, 09:00 CET</span>
                <h3 className="font-display text-[44px] leading-[0.95] tracking-tighter2 mt-4 max-w-[18ch]">
                  Chaque établissement, sur un même rythme.
                </h3>
                <p className="text-paper/70 text-[14.5px] leading-relaxed max-w-[52ch] mt-4">
                  Chaque ligne représente le composite d'un établissement sur les 26 dernières semaines. Une hausse signifie plus d'étudiants présents, plus de soumissions et plus de réussites. Une baisse appelle un dialogue au niveau du conseil.
                </p>
              </div>
              <div className="col-span-5 flex items-end justify-end">
                <div className="num text-[12px] text-paper/60">35 établissements · ingestion 04:00 CET</div>
              </div>
            </div>
            <div className="px-10 pb-10 grid grid-cols-12 gap-x-6 gap-y-4 relative">
              {window.CARTHAVILLAGE.INSTITUTIONS.slice(0,12).map((i,idx)=>(
                <div key={i.id} className="col-span-2 border-t border-paper/15 pt-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-paper/50 truncate">{i.name}</div>
                  <div className="num text-[15px] mt-1">{i.score}</div>
                  <PulseLine score={i.score} w={140} h={26} color={i.score>=85?'#C5933A':i.score>=72?'#F7F5F0':'#2E86C1'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee — UCAR real institutions */}
      <section className="border-y border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center gap-8">
          <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-ink3">Le réseau UCAR</span>
          <div className="overflow-hidden flex-1 no-scrollbar">
            <div className="marquee flex gap-12 whitespace-nowrap">
              {[...Array(2)].map((_,k)=>(
                <div key={k} className="flex gap-10 items-center text-[17px] font-display text-ink2/70">
                  <span>INSAT</span><span className="text-accent">·</span>
                  <span>FSEGT</span><span className="text-accent">·</span>
                  <span>ENAU</span><span className="text-accent">·</span>
                  <span>ESSECT</span><span className="text-accent">·</span>
                  <span>IHEC Carthage</span><span className="text-accent">·</span>
                  <span>FST</span><span className="text-accent">·</span>
                  <span>IPEIN</span><span className="text-accent">·</span>
                  <span>ISBST</span><span className="text-accent">·</span>
                  <span>ESIM</span><span className="text-accent">·</span>
                  <span>FLSH</span><span className="text-accent">·</span>
                  <span>ISG Tunis</span><span className="text-accent">·</span>
                  <span>ISCAE</span><span className="text-accent">·</span>
                  <span>ISLT</span><span className="text-accent">·</span>
                  <span>FSB</span><span className="text-accent">·</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three pillar section */}
      <section className="max-w-[1400px] mx-auto px-8 py-24">
        <SectionHeader kicker="Les modules CarthaVillage" title={<>Trois vues, <em className="not-italic font-display" style={{fontStyle:'italic', color:'#C5933A'}}>une vérité</em>.</>} subtitle="Chaque acteur voit l'université à son échelle, mais toutes les données convergent."/>
        <div className="grid grid-cols-12 gap-6 mt-14">
          {[
            { num:'01', icon:'chart', title:'Pour le Président', body:'Un briefing hebdomadaire de style magazine, rédigé par CarthaVillage, qui transforme trente-cinq flux de données en un seul paragraphe prêt pour le conseil — avec citations.', cta:'Ouvrir le tableau de bord', screen:'dashboard' },
            { num:'02', icon:'building', title:'Pour le Directeur', body:'Chaque institution dispose de l\'appareil complet : composites, présence, ponctualité, taux de réussite, et un audit d\'une page sur les points forts et faibles de la semaine.', cta:'Ouvrir la vue institution', screen:'institution' },
            { num:'03', icon:'graduation', title:'Pour l\'Enseignant', body:'Les enseignants voient leur cohorte comme le conseil voit l\'université : un pouls, un registre, et une liste courte d\'étudiants qui méritent une conversation cette semaine.', cta:'Ouvrir la vue enseignant', screen:'teacher' },
          ].map(c=>(
            <article key={c.num} className="col-span-12 md:col-span-4 bg-paper2 border border-rule rounded-lg p-7 lift group">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3"><span className="num">{c.num}</span><Icon name={c.icon} size={20} className="text-accent opacity-60 group-hover:opacity-100 transition-opacity"/></div>
              <h3 className="font-display text-[34px] leading-[1.0] tracking-tighter2 mt-6">{c.title}</h3>
              <p className="text-ink2 text-[15px] leading-relaxed mt-4">{c.body}</p>
              <button onClick={()=>setActive(c.screen)} className="mt-8 inline-flex items-center gap-2 text-[13px] text-ink hover:text-accent ul-link transition-colors">{c.cta} <Icon name="arrow-up-right" size={12}/></button>
            </article>
          ))}
        </div>
      </section>

      {/* UCAR Key Facts — from real data */}
      <section className="border-t border-rule bg-paper2/60">
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <Pill tone="blue">L'Université de Carthage</Pill>
            <h3 className="font-display text-[40px] leading-[1.0] tracking-tighter2 mt-6 max-w-[18ch]">Une institution au service de <em className="not-italic" style={{fontStyle:'italic', color:'#C5933A'}}>l'excellence</em>.</h3>
            <p className="text-ink2 text-[15px] leading-relaxed mt-5 max-w-[44ch]">Fondée en 1988, l'Université de Carthage (UCAR) est une institution publique prestigieuse engagée dans l'enseignement supérieur de qualité et la recherche dans de multiples disciplines. Elle opère sous le Ministère de l'Enseignement Supérieur et de la Recherche Scientifique.</p>
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-x-10 gap-y-8">
            {[
              ['35 Institutions', 'Facultés, instituts et écoles à travers la Tunisie.'],
              ['30,000+ Étudiants', 'Inscrits dans tous les cycles de formation.'],
              ['3,191 Enseignants', 'Membres permanents du corps professoral.'],
              ['289 Diplômes', 'Licences, masters, diplômes d\'ingénieur et doctorats.'],
              ['8 Écoles doctorales', 'Encadrant la recherche doctorale multidisciplinaire.'],
              ['56 Laboratoires', '18 unités de recherche au service de l\'innovation.'],
            ].map(([k,d])=>(
              <div key={k} className="border-t border-rule pt-4">
                <div className="font-display text-[24px] tracking-tighter2" style={{color:'#1B4F72'}}>{k}</div>
                <p className="text-ink2 text-[13.5px] leading-relaxed mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote section */}
      <section className="border-t border-rule">
        <div className="max-w-[1100px] mx-auto px-8 py-24 text-center">
          <Pill>Mot de la Présidente</Pill>
          <blockquote className="font-display text-[44px] md:text-[60px] leading-[1.02] tracking-tighter2 mt-8">
            «Nous avons cessé de demander des rapports. CarthaVillage rédige <em className="not-italic" style={{fontStyle:'italic', color:'#C5933A'}}>une</em> page chaque lundi et le conseil la lit avant neuf heures.»
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-4 text-[13px] text-ink3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-display text-paper" style={{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}}>NC</div>
            <div className="text-left"><div className="text-ink font-medium">Pof. Naïla Chaâbane Hammouda</div><div className="num">Présidente · Université de Carthage</div></div>
          </div>
        </div>
      </section>

      {/* Methodology strip */}
      <section className="border-t border-rule bg-paper2/70">
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <Pill>Méthodologie</Pill>
            <h3 className="font-display text-[40px] leading-[1.0] tracking-tighter2 mt-6 max-w-[18ch]">Un composite que le conseil peut <em className="not-italic" style={{fontStyle:'italic', color:'#C5933A'}}>défendre</em>.</h3>
            <p className="text-ink2 text-[15px] leading-relaxed mt-5 max-w-[44ch]">L'indice CarthaVillage est un composite transparent et pondéré de la présence, performance aux évaluations, ponctualité des soumissions et rétention. Chaque chiffre est traçable à la source. Chaque pondération est publiée.</p>
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-x-10 gap-y-8">
            {[
              ['Présence', '0.30', 'Pondérée par type de cours. Absences justifiées exclues.'],
              ['Évaluation', '0.30', 'Taux de réussite × écart par rapport à la base de cohorte.'],
              ['Ponctualité', '0.20', 'Fenêtre de soumission, pondérée par sévérité de l\'évaluation.'],
              ['Rétention', '0.20', 'Continuation par rapport à la progression attendue.'],
            ].map(([k,w,d])=>(
              <div key={k} className="border-t border-rule pt-4">
                <div className="flex items-baseline justify-between"><span className="font-display text-[24px]">{k}</span><span className="num text-ink3 text-[12px]">w = {w}</span></div>
                <p className="text-ink2 text-[13.5px] leading-relaxed mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three strategic pillars */}
      <section className="border-t border-rule">
        <div className="max-w-[1400px] mx-auto px-8 py-20">
          <SectionHeader kicker="Vision stratégique" title={<>Innovation, durabilité, <em className="not-italic" style={{fontStyle:'italic', color:'#C5933A'}}>excellence</em>.</>} subtitle="Les trois piliers fondamentaux de l'Université de Carthage."/>
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { icon:'sparkle', title:'Innovation', body:'Investissement continu dans la recherche et le développement pour favoriser la créativité et les découvertes de pointe.' },
              { icon:'globe', title:'Durabilité', body:'Engagement envers le développement durable avec des politiques environnementales, plan d\'égalité des genres et réduction de l\'empreinte carbone.' },
              { icon:'shield', title:'Excellence', body:'Formation de qualité adossée à 3,191 enseignants, 56 laboratoires et des partenariats internationaux pour former les leaders de demain.' },
            ].map(c=>(
              <div key={c.title} className="bg-paper border border-rule rounded-lg p-8 lift relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1" style={{background:'linear-gradient(90deg, #C5933A, #1B4F72)'}}/>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{background:'linear-gradient(135deg, #1B4F72, #0F1923)'}}><Icon name={c.icon} size={20} className="text-accent"/></div>
                <h3 className="font-display text-[28px] tracking-tighter2">{c.title}</h3>
                <p className="text-ink2 text-[15px] leading-relaxed mt-3">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big wordmark closer */}
      <section className="border-t border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-10 grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-7">
            <Pill tone="accent">Commencer</Pill>
            <h3 className="font-display text-[56px] md:text-[80px] leading-[0.92] tracking-tighter2 mt-6">Un signal pour trente-cinq établissements — sans chaos.</h3>
            <div className="flex items-center gap-3 mt-8">
              <button onClick={()=>setActive('dashboard')} className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]">Ouvrir CarthaVillage <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full"><Icon name="arrow-up-right" size={14} stroke={2}/></span></button>
              <button className="text-[14px] text-ink2 hover:text-ink ul-link">Planifier une démo</button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-6 text-[13px]">
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Couverture</div><div className="font-display text-[28px]" style={{color:'#1B4F72'}}>30,000+</div><div className="text-ink3">étudiants sous signal</div></div>
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Briefings</div><div className="font-display text-[28px]" style={{color:'#1B4F72'}}>156</div><div className="text-ink3">délivrés à ce jour</div></div>
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Établissements</div><div className="font-display text-[28px]" style={{color:'#1B4F72'}}>35</div><div className="text-ink3">à travers le réseau</div></div>
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Latence</div><div className="font-display text-[28px]" style={{color:'#1B4F72'}}>04:00</div><div className="text-ink3">CET, ingestion quotidienne</div></div>
          </div>
        </div>
        <div className="border-t border-rule">
          <div className="max-w-[1400px] mx-auto px-8 overflow-hidden">
            <div className="font-display tracking-tighter2 leading-[0.85] text-[20vw] md:text-[16vw] -mb-[3vw] -mt-[1vw] select-none" style={{background:'linear-gradient(135deg, #1B4F72 30%, #C5933A 70%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
              CarthaVillage
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.ScreenLanding = ScreenLanding;
