// Screen 5 — Landing page (editorial hero, marquee, sections)
const ScreenLanding = ({ setActive }) => {
  return (
    <div className="screen" data-active="true">
      {/* Hero */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-8 pt-14 pb-10">
          {/* meta line */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
            <span>The Pulse · Issue Nº 7</span>
            <span>April 26, 2026 — Riyadh</span>
            <span>Vol. III</span>
          </div>
          <div className="hairline mt-3"/>

          <div className="grid grid-cols-12 gap-8 mt-12">
            <div className="col-span-12 lg:col-span-8">
              <Pill><span className="w-1.5 h-1.5 rounded-full bg-accent"></span>For university administration</Pill>
              <h1 className="font-display font-medium text-[88px] md:text-[132px] leading-[0.88] tracking-tighter2 mt-6">
                One pulse for <em className="not-italic" style={{fontStyle:'italic', fontVariationSettings:'"opsz" 144, "SOFT" 100'}}>thirty-four</em><br/>
                faculties.
              </h1>
              <p className="text-ink2 text-[18px] leading-[1.55] max-w-[58ch] mt-8">
                NABD is the operating system for university leadership — a single, audited signal across colleges, institutes and graduate schools, with weekly briefings written for the board, not the dashboard.
              </p>
              <div className="flex items-center gap-3 mt-10">
                <button onClick={()=>setActive('dashboard')} className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]">
                  Open the dashboard <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full"><Icon name="arrow-up-right" size={14} stroke={2}/></span>
                </button>
                <button className="text-[14px] text-ink2 hover:text-ink ul-link">Read this week's briefing</button>
              </div>
            </div>

            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-4">University index, this week</div>
              <div className="flex items-end gap-4">
                <span className="font-display text-[88px] leading-none tracking-tighter2">81.4</span>
                <span className="num text-ok text-[13px] pb-3">+0.6</span>
              </div>
              <PulseLine score={81} w={280} h={42} animated />
              <div className="grid grid-cols-3 gap-3 mt-6 text-[12px]">
                <div><div className="text-ink3 mb-1">Above 85</div><div className="num text-[18px]">12</div></div>
                <div><div className="text-ink3 mb-1">On watch</div><div className="num text-[18px] text-warn">5</div></div>
                <div><div className="text-ink3 mb-1">Critical</div><div className="num text-[18px] text-crit">2</div></div>
              </div>
              <div className="mt-6 p-4 bg-paper2 border border-rule rounded">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-1">Headline</div>
                <p className="font-display text-[18px] leading-snug">Engineering crosses 88; Preparatory College needs intervention.</p>
              </div>
            </aside>
          </div>
        </div>

        {/* hero figure — abstract pulse skyline as a placeholder hero composition */}
        <div className="max-w-[1400px] mx-auto px-8 pt-2 pb-16">
          <div className="relative bg-ink text-paper rounded-md overflow-hidden border border-ink">
            <div className="absolute inset-0 grain opacity-20"/>
            <div className="grid grid-cols-12 px-10 pt-10 pb-12 relative">
              <div className="col-span-7">
                <span className="text-[11px] uppercase tracking-[0.18em] text-paper/60">Live · this morning, 09:00</span>
                <h3 className="font-display text-[44px] leading-[0.95] tracking-tighter2 mt-4 max-w-[18ch]">
                  Every faculty, on a single rhythm.
                </h3>
                <p className="text-paper/70 text-[14.5px] leading-relaxed max-w-[52ch] mt-4">
                  Each line is a faculty's composite over the past 26 weeks. Up means more students arrived, submitted, and passed; down means a board-level conversation is owed.
                </p>
              </div>
              <div className="col-span-5 flex items-end justify-end">
                <div className="num text-[12px] text-paper/60">34 institutions · ingested 04:00 KSA</div>
              </div>
            </div>
            <div className="px-10 pb-10 grid grid-cols-12 gap-x-6 gap-y-4 relative">
              {window.NABD.INSTITUTIONS.slice(0,12).map((i,idx)=>(
                <div key={i.id} className="col-span-2 border-t border-paper/15 pt-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-paper/50 truncate">{i.name}</div>
                  <div className="num text-[15px] mt-1">{i.score}</div>
                  <PulseLine score={i.score} w={140} h={26} color={i.score>=85?'#D2532A':i.score>=72?'#F6F2EA':'#C49A6C'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marquee — institutional partners (placeholder names; original) */}
      <section className="border-y border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center gap-8">
          <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-ink3">Trusted across the network</span>
          <div className="overflow-hidden flex-1 no-scrollbar">
            <div className="marquee flex gap-12 whitespace-nowrap">
              {[...Array(2)].map((_,k)=>(
                <div key={k} className="flex gap-12 items-center text-[18px] font-display text-ink2/70">
                  <span>Riyadh University</span><span>·</span>
                  <span className="ar">جامعة الملك فهد</span><span>·</span>
                  <span>Al-Faisal Institute</span><span>·</span>
                  <span className="italic">Northern Polytechnic</span><span>·</span>
                  <span className="ar">جامعة الجزيرة</span><span>·</span>
                  <span>Eastern Province Council</span><span>·</span>
                  <span>UCAR Board</span><span>·</span>
                  <span className="ar">المجلس الأكاديمي</span><span>·</span>
                  <span>Al-Madinah Institute</span><span>·</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Three pillar section (editorial cards) */}
      <section className="max-w-[1400px] mx-auto px-8 py-24">
        <SectionHeader kicker="What NABD does" title={<>Three views, <em className="not-italic" style={{fontStyle:'italic'}}>one truth</em>.</>} ar="ثلاثة منظورات وحقيقة واحدة"/>
        <div className="grid grid-cols-12 gap-6 mt-14">
          {[
            { num:'01', title:'For the President', body:'A magazine-style weekly briefing, written by NABD, that turns thirty-four data streams into a single board-ready paragraph — with citations.', cta:'Open dashboard', screen:'dashboard' },
            { num:'02', title:'For the Director',  body:'Every institution gets the full apparatus: composites, attendance, on-time, pass-rates, and a one-page audit of where the week went well and where it didn\'t.', cta:'Open institution', screen:'institution' },
            { num:'03', title:'For the Faculty',   body:'Teachers see their cohort the way the board sees the university: a pulse, a roster, and a short list of students who need a conversation this week.', cta:'Open teacher view', screen:'teacher' },
          ].map(c=>(
            <article key={c.num} className="col-span-12 md:col-span-4 bg-paper2 border border-rule rounded p-7 lift">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3"><span className="num">{c.num}</span><span>Module</span></div>
              <h3 className="font-display text-[34px] leading-[1.0] tracking-tighter2 mt-6">{c.title}</h3>
              <p className="text-ink2 text-[15px] leading-relaxed mt-4">{c.body}</p>
              <button onClick={()=>setActive(c.screen)} className="mt-8 inline-flex items-center gap-2 text-[13px] text-ink hover:text-accent ul-link">{c.cta} <Icon name="arrow-up-right" size={12}/></button>
            </article>
          ))}
        </div>
      </section>

      {/* Pull quote section */}
      <section className="border-t border-rule">
        <div className="max-w-[1100px] mx-auto px-8 py-24 text-center">
          <Pill>Letter from the editor</Pill>
          <blockquote className="font-display text-[44px] md:text-[64px] leading-[1.02] tracking-tighter2 mt-8">
            "We stopped asking deans for slides. NABD writes <em className="not-italic" style={{fontStyle:'italic'}}>one</em> page each Monday and the board reads it before nine."
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-4 text-[13px] text-ink3">
            <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-display">FK</div>
            <div className="text-left"><div className="text-ink">Dr. Faisal Al-Kuwari</div><div className="num">President · UCAR</div></div>
          </div>
        </div>
      </section>

      {/* Methodology strip */}
      <section className="border-t border-rule bg-paper2/70">
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <Pill>Methodology</Pill>
            <h3 className="font-display text-[40px] leading-[1.0] tracking-tighter2 mt-6 max-w-[18ch]">A composite the board can <em className="not-italic" style={{fontStyle:'italic'}}>defend</em>.</h3>
            <p className="text-ink2 text-[15px] leading-relaxed mt-5 max-w-[44ch]">NABD's index is a transparent, weighted composite of attendance, assessment performance, on-time submission, and retention. Every number is traceable to the source row. Every weight is published.</p>
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-x-10 gap-y-8">
            {[
              ['Attendance', '0.30', 'Weighted by class type. Excludes excused absences.'],
              ['Assessment', '0.30', 'Pass rate × distance from cohort baseline.'],
              ['On-time', '0.20', 'Submission window, weighted by assignment severity.'],
              ['Retention', '0.20', 'Continuation against expected progression.'],
            ].map(([k,w,d])=>(
              <div key={k} className="border-t border-rule pt-4">
                <div className="flex items-baseline justify-between"><span className="font-display text-[24px]">{k}</span><span className="num text-ink3 text-[12px]">w = {w}</span></div>
                <p className="text-ink2 text-[13.5px] leading-relaxed mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big wordmark closer */}
      <section className="border-t border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-10 grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-7">
            <Pill>Get started</Pill>
            <h3 className="font-display text-[56px] md:text-[80px] leading-[0.92] tracking-tighter2 mt-6">One place for thirty-four faculties — without chaos.</h3>
            <div className="flex items-center gap-3 mt-8">
              <button onClick={()=>setActive('dashboard')} className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]">Open NABD <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full"><Icon name="arrow-up-right" size={14} stroke={2}/></span></button>
              <button className="text-[14px] text-ink2 hover:text-ink ul-link">Schedule a board demo</button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-6 text-[13px]">
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Reach</div><div className="font-display text-[28px]">42,300+</div><div className="text-ink3">students under signal</div></div>
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Briefings</div><div className="font-display text-[28px]">156</div><div className="text-ink3">delivered to date</div></div>
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Faculties</div><div className="font-display text-[28px]">34</div><div className="text-ink3">across UCAR</div></div>
            <div><div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">Latency</div><div className="font-display text-[28px]">04:00</div><div className="text-ink3">KSA, daily ingest</div></div>
          </div>
        </div>
        <div className="border-t border-rule">
          <div className="max-w-[1400px] mx-auto px-8 overflow-hidden">
            <div className="font-display tracking-tighter2 leading-[0.85] text-[28vw] md:text-[22vw] -mb-[3vw] -mt-[1vw] select-none">
              NABD<span className="ar text-[16vw] md:text-[12vw] align-baseline pl-6 text-accent">نبض</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

window.ScreenLanding = ScreenLanding;
