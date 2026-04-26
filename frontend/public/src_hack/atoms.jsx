// Atomic UI primitives — CarthaVillage design system
const { useState, useEffect, useRef, useMemo } = React;

// SVG icons — Mediterranean editorial style
const Icon = ({ name, size=16, className="", stroke=1.5 }) => {
  const props = { width:size, height:size, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:stroke, strokeLinecap:"round", strokeLinejoin:"round", className };
  switch(name){
    case 'arrow-up-right': return <svg {...props}><path d="M7 17L17 7M9 7h8v8"/></svg>;
    case 'arrow-right':    return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case 'arrow-down':     return <svg {...props}><path d="M12 5v14M6 13l6 6 6-6"/></svg>;
    case 'arrow-up':       return <svg {...props}><path d="M12 19V5M6 11l6-6 6 6"/></svg>;
    case 'minus':          return <svg {...props}><path d="M5 12h14"/></svg>;
    case 'sparkle':        return <svg {...props}><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/></svg>;
    case 'search':         return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case 'bell':           return <svg {...props}><path d="M6 8a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21h4"/></svg>;
    case 'doc':            return <svg {...props}><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></svg>;
    case 'upload':         return <svg {...props}><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>;
    case 'check':          return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'x':              return <svg {...props}><path d="M6 6l12 12M6 18L18 6"/></svg>;
    case 'menu':           return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case 'mail':           return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'user':           return <svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>;
    case 'building':       return <svg {...props}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21V11M15 21V11M9 7h6M9 11h6M9 15h6"/></svg>;
    case 'flag':           return <svg {...props}><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>;
    case 'open':           return <svg {...props}><path d="M14 4h6v6M20 4l-9 9M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4"/></svg>;
    case 'play':           return <svg {...props}><path d="M7 4l13 8-13 8V4z"/></svg>;
    case 'plus':           return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'paperclip':      return <svg {...props}><path d="M21 11l-9.5 9.5a5 5 0 11-7-7l9.5-9.5a3.5 3.5 0 015 5L9.5 18.5a2 2 0 11-3-3L15 7"/></svg>;
    case 'corner':         return <svg {...props}><path d="M9 14l-4 4 4 4"/><path d="M5 18h9a4 4 0 004-4V6"/></svg>;
    case 'history':        return <svg {...props}><path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.5"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>;
    case 'compass':        return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5l-1.4 4.6-4.6 1.4 1.4-4.6 4.6-1.4z"/></svg>;
    case 'shield':         return <svg {...props}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>;
    case 'graduation':     return <svg {...props}><path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c0 1 3 2 6 2s6-1 6-2v-5"/></svg>;
    case 'globe':          return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M12 3c2.2 2.5 3.5 5 3.5 9s-1.3 6.5-3.5 9c-2.2-2.5-3.5-5-3.5-9s1.3-6.5 3.5-9z"/></svg>;
    case 'chart':          return <svg {...props}><path d="M4 20h16"/><path d="M4 20V10l4-4 4 6 4-8 4 6"/></svg>;
    case 'columns':        return <svg {...props}><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>;
    default: return null;
  }
};

// Carthage logo mark — stylized ancient columns
const CarthaLogo = ({ size=32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect x="4" y="8" width="24" height="3" rx="1.5" fill="#C5933A"/>
    <rect x="6" y="11" width="3" height="14" rx="0.5" fill="#1B4F72"/>
    <rect x="14.5" y="11" width="3" height="14" rx="0.5" fill="#1B4F72"/>
    <rect x="23" y="11" width="3" height="14" rx="0.5" fill="#1B4F72"/>
    <rect x="4" y="25" width="24" height="3" rx="1.5" fill="#C5933A"/>
    <rect x="9" y="5" width="14" height="3" rx="1.5" fill="#C5933A" opacity="0.6"/>
  </svg>
);

// Shell / navigation
const TopNav = ({ active, setActive }) => {
  const items = [
    { id:'landing',     label:'Accueil',       icon:'compass' },
    { id:'dashboard',   label:'Tableau de bord', icon:'chart' },
    { id:'institution', label:'Institution',    icon:'building' },
    { id:'teacher',     label:'Enseignant',     icon:'user' },
    { id:'student',     label:'Étudiant',       icon:'graduation' },
    { id:'handoff',     label:'Handoff',        icon:'doc' },
  ];
  return (
    <header className="border-b border-rule bg-paper/90 backdrop-blur-md sticky top-0 z-40">
      <div className="glow-line"/>
      <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
        <button onClick={()=>setActive('landing')} className="flex items-center gap-3 group">
          <CarthaLogo size={28}/>
          <div className="flex flex-col">
            <span className="font-display text-[20px] leading-none tracking-tighter2" style={{color:'#1B4F72'}}>CarthaVillage</span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-ink3 leading-none mt-0.5">Université de Carthage</span>
          </div>
        </button>
        <nav className="hidden md:flex items-center gap-6 text-[13px]">
          {items.map(i => (
            <button key={i.id} onClick={()=>setActive(i.id)} data-active={active===i.id} className="nav-link text-ink2 hover:text-ink transition-colors">{i.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-2 text-[13px] text-ink2 hover:text-ink"><Icon name="search" size={14}/> Recherche</button>
          <span className="hidden md:inline-block w-px h-4 bg-rule"/>
          <button className="hidden md:flex items-center gap-2 text-[13px] text-ink2 hover:text-ink"><Icon name="user" size={14}/> Pof. Chaâbane</button>
          <button onClick={()=>setActive('dashboard')} className="btn-primary inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12.5px]">
            Ouvrir <span className="arr inline-flex items-center justify-center w-7 h-7 rounded-full"><Icon name="arrow-up-right" size={12} stroke={2}/></span>
          </button>
        </div>
      </div>
    </header>
  );
};

const SectionHeader = ({ kicker, title, subtitle, align='left', children }) => (
  <div className={`flex flex-col ${align==='center'?'items-center text-center':''} gap-3`}>
    {kicker && <span className="pill"><span className="w-1.5 h-1.5 rounded-full bg-accent"></span>{kicker}</span>}
    <h2 className="font-display text-[42px] md:text-[56px] leading-[0.95] tracking-tighter2 max-w-[20ch]">{title}</h2>
    {subtitle && <p className="text-ink3 text-[16px] max-w-[48ch]">{subtitle}</p>}
    {children}
  </div>
);

const Pill = ({ children, tone='default' }) => {
  const map = { default:'pill', ink:'pill pill-ink', accent:'pill pill-accent', blue:'pill pill-blue' };
  return <span className={map[tone]}>{children}</span>;
};

const TrendDot = ({ trend }) => {
  if(trend==='up')   return <span className="inline-flex items-center gap-1 text-[11px] num text-ok"><Icon name="arrow-up" size={11} stroke={2}/>hausse</span>;
  if(trend==='down') return <span className="inline-flex items-center gap-1 text-[11px] num text-crit"><Icon name="arrow-down" size={11} stroke={2}/>baisse</span>;
  return                  <span className="inline-flex items-center gap-1 text-[11px] num text-ink3"><Icon name="minus" size={11} stroke={2}/>stable</span>;
};

// Pulse line — health indicator
const PulseLine = ({ score, w=120, h=28, animated=false, color }) => {
  const c = color || (score>=85?'#1E8449': score>=72?'#1B4F72' : score>=60?'#D4AC0D':'#C0392B');
  const d = window.CARTHAVILLAGE.pulsePath(score, w, h);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="#D6D1C7" strokeWidth="0.5" strokeDasharray="2 2"/>
      <path d={d} fill="none" stroke={c} strokeWidth="1.4" className={animated?"ekg-anim":""}/>
    </svg>
  );
};

// Footnote rule
const Rule = () => <div className="hairline w-full"/>;

// Footer
const Footer = () => (
  <footer className="border-t border-rule mt-24 bg-ink text-paper/90">
    <div className="max-w-[1400px] mx-auto px-8 py-14 grid grid-cols-12 gap-8 text-[13px]">
      <div className="col-span-12 md:col-span-4">
        <div className="flex items-center gap-3">
          <CarthaLogo size={36}/>
          <div>
            <div className="font-display text-[24px] tracking-tighter2 leading-none text-accent">CarthaVillage</div>
            <div className="text-[11px] text-paper/50 mt-0.5">Université de Carthage</div>
          </div>
        </div>
        <p className="text-paper/60 mt-4 leading-relaxed max-w-[34ch]">Plateforme unifiée d'intelligence pour l'administration universitaire. Conçue pour 35 établissements, 30 000+ étudiants.</p>
        <div className="flex items-center gap-3 mt-4 text-[12px] text-paper/40 num">
          <span>+216 71 749 100</span>
          <span>·</span>
          <span>webmaster@ucar.rnu.tn</span>
        </div>
      </div>
      <div className="col-span-6 md:col-span-2"><div className="text-paper/40 text-[11px] uppercase tracking-[0.18em] mb-3">Plateforme</div><ul className="space-y-2 text-paper/70"><li>Tableau de bord</li><li>Vue institution</li><li>Outils enseignant</li><li>Portail étudiant</li></ul></div>
      <div className="col-span-6 md:col-span-2"><div className="text-paper/40 text-[11px] uppercase tracking-[0.18em] mb-3">Méthodologie</div><ul className="space-y-2 text-paper/70"><li>Composite v3.2</li><li>Ingestion données</li><li>Piste d'audit</li><li>Protection données</li></ul></div>
      <div className="col-span-6 md:col-span-2"><div className="text-paper/40 text-[11px] uppercase tracking-[0.18em] mb-3">Université</div><ul className="space-y-2 text-paper/70"><li>8 Écoles doctorales</li><li>56 Laboratoires</li><li>18 Unités de recherche</li><li>289 Diplômes</li></ul></div>
      <div className="col-span-6 md:col-span-2"><div className="text-paper/40 text-[11px] uppercase tracking-[0.18em] mb-3">Adresse</div><ul className="space-y-2 text-paper/70"><li>Avenue de la République</li><li>BP 77-1054 Amilcar</li><li>Tunis, Tunisie</li></ul></div>
      <div className="col-span-12 flex items-center justify-between border-t border-paper/10 pt-6 text-paper/40">
        <span className="num">© 2026 CarthaVillage · UCAR. Composite v3.2.7</span>
        <span className="num">Fondée en 1988 · Ministère de l'Enseignement Supérieur</span>
      </div>
    </div>
  </footer>
);

Object.assign(window, { Icon, CarthaLogo, TopNav, SectionHeader, Pill, TrendDot, PulseLine, Rule, Footer });
