// Screen — Code handoff (CarthaVillage TSX snippets per screen)
const code = {
  setup: `// Tailwind extension (tailwind.config.ts)
extend: {
  fontFamily: {
    serif: ['DM Serif Display', 'Georgia'],
    sans:  ['Inter', 'ui-sans-serif', 'system-ui'],
    mono:  ['JetBrains Mono', 'ui-monospace'],
    arabic:['Noto Naskh Arabic', 'serif'],
  },
  colors: {
    paper:   '#F7F5F0',   // warm parchment
    paper2:  '#EDEAE3',   // sandy stone
    ink:     '#0F1923',   // Carthage night
    ink2:    '#2A3441',   // deep dusk
    ink3:    '#6B7A8D',   // muted blue-gray
    rule:    '#D6D1C7',   // stone rule
    accent:  '#C5933A',   // Punic gold
    accent2: '#9E7520',   // deep gold
    blue:    '#1B4F72',   // Mediterranean blue
    ok: '#1E8449', warn: '#D4AC0D', crit: '#C0392B',
  },
}

// Install
pnpm add framer-motion recharts lucide-react
pnpm dlx shadcn@latest add card badge button table tabs dialog input scroll-area`,

  pulseLine: `// PulseLine.tsx — health indicator
import { motion } from 'framer-motion';

export function PulseLine({ score, w = 240, h = 32, animated = false }) {
  const c = score >= 85 ? '#1E8449' : score >= 72 ? '#1B4F72' : score >= 60 ? '#D4AC0D' : '#C0392B';
  const amp = 4 + (score / 100) * 9, baseY = h / 2, segs = 6, segW = w / segs;
  let d = \`M0 \${baseY}\`;
  for (let i = 0; i < segs; i++) {
    const x = i * segW;
    d += \` L\${x + segW*0.30} \${baseY} L\${x + segW*0.40} \${baseY - amp*0.6}\`;
    d += \` L\${x + segW*0.50} \${baseY + amp} L\${x + segW*0.60} \${baseY - amp}\`;
    d += \` L\${x + segW*0.70} \${baseY + amp*0.3} L\${x + segW} \${baseY}\`;
  }
  return (
    <svg width={w} height={h} viewBox={\`0 0 \${w} \${h}\`} className="block">
      <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="#D6D1C7" strokeWidth="0.5" strokeDasharray="2 2"/>
      <motion.path d={d} fill="none" stroke={c} strokeWidth={1.4}
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1.2, ease: 'easeInOut' }} />
    </svg>
  );
}`,

  dashboard: `// app/dashboard/page.tsx — UCAR Central (CarthaVillage)
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Sparkles, Bell } from 'lucide-react';
import { PulseLine } from '@/components/PulseLine';

export default function DashboardPage() {
  return (
    <main className="bg-paper paper-tex">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 font-mono">
          <span>UCAR Central · Le Pouls</span>
          <span>26 Avril 2026 · Édition Nº 7</span>
        </div>
        <div className="grid grid-cols-12 gap-8 mt-10">
          <header className="col-span-12 lg:col-span-8">
            <Badge variant="outline" className="rounded-full">Vue présidentielle</Badge>
            <h1 className="font-serif text-[72px] leading-[0.92] tracking-[-0.025em] mt-5">
              Bonjour, Pof. Chaâbane.<br/>
              <em className="italic">La semaine est </em>
              <span className="text-accent">prudemment haussière.</span>
            </h1>
          </header>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">Composite universitaire</span>
            <div className="font-serif text-[88px] leading-none text-blue">81.4</div>
            <PulseLine score={81} w={300} h={42} animated />
          </aside>
        </div>
      </div>
    </main>
  );
}`,

  briefing: `// components/BriefingCard.tsx — magazine-cover AI briefing
export function BriefingCard({ briefing }) {
  return (
    <article className="card-gradient text-paper rounded-xl p-10 relative overflow-hidden">
      <div className="absolute inset-0 grain opacity-15 pointer-events-none" />
      <header className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-paper/60 font-mono">
        <span>Le Briefing · Édition Nº {briefing.issue}</span>
        <span>{briefing.date}</span>
        <span className="flex items-center gap-1.5">
          <Sparkles size={11}/> Rédigé par CarthaVillage
        </span>
      </header>
      <hr className="border-paper/15 mt-3 mb-6" />
      <h2 className="font-serif text-[56px] leading-[0.95] tracking-[-0.025em] max-w-[22ch]">
        {briefing.headline}
      </h2>
      {/* ... body columns ... */}
    </article>
  );
}`,

  charts: `// components/InstitutionTrend.tsx — recharts with CarthaVillage palette
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function InstitutionTrend({ data, color = '#1B4F72' }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 18, right: 16, bottom: 26, left: 36 }}>
        <CartesianGrid stroke="#D6D1C7" strokeDasharray="2 3" vertical={false} />
        <XAxis dataKey="wk" stroke="#6B7A8D" fontFamily="JetBrains Mono" fontSize={10} />
        <YAxis stroke="#6B7A8D" fontFamily="JetBrains Mono" fontSize={10} />
        <Tooltip contentStyle={{ background: '#0F1923', color: '#F7F5F0' }} />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}`,

  teacher: `// app/teacher/[course]/page.tsx — roster & at-risk board
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function TeacherCoursePage({ params }) {
  const cohort = useCohort(params.course);
  return (
    <Tabs defaultValue="roster" className="mt-12">
      <TabsList className="bg-transparent gap-1">
        <TabsTrigger value="roster" className="rounded-full">Registre</TabsTrigger>
        <TabsTrigger value="risk" className="rounded-full">Tableau à risque</TabsTrigger>
      </TabsList>
      <TabsContent value="risk" className="mt-6 grid grid-cols-3 gap-6">
        {['high','med','low'].map(level => (
          <div key={level} className="bg-paper2/50 border border-rule rounded-lg p-5">
            <h3 className="font-serif text-[24px]">
              {level === 'high' ? 'À risque' : level === 'med' ? 'Surveillance' : 'En piste'}
            </h3>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}`,

  student: `// app/student/page.tsx — KPI rings + AI nudge + course cards
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export default function StudentPage() {
  return (
    <main className="bg-paper paper-tex">
      <div className="grid grid-cols-4 gap-3 mt-12">
        {kpis.map(k => (
          <Card key={k.label} className="bg-paper2/70 border-rule rounded-lg p-5 flex items-center gap-4">
            <Ring value={k.ring} size={64} stroke={5} color={k.color} />
            <div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">{k.label}</span>
              <div className="font-serif text-[30px] leading-none">{k.value}</div>
            </div>
          </Card>
        ))}
      </div>
      <article className="mt-12 card-gradient text-paper rounded-xl p-10">
        <span className="flex items-center gap-2 text-[11px] uppercase text-paper/60 font-mono">
          <Sparkles size={11} className="text-accent"/> Une note de CarthaVillage
        </span>
        <h2 className="font-serif text-[52px] leading-[0.97] mt-3">{nudge.headline}</h2>
      </article>
    </main>
  );
}`,

  landing: `// app/page.tsx — CarthaVillage Editorial landing
export default function Landing() {
  return (
    <main className="paper-tex">
      <section className="max-w-[1400px] mx-auto px-8 pt-14 pb-10">
        <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 font-mono">
          <span>Le Pouls · Édition Nº 7</span>
          <span>26 Avril 2026 — Tunis</span>
        </div>
        <h1 className="font-serif text-[120px] leading-[0.88] tracking-[-0.025em] mt-12">
          Un signal pour <em className="italic">trente-cinq</em><br/>établissements.
        </h1>
      </section>
    </main>
  );
}`,
};

const Block = ({ title, body, lang='tsx' }) => (
  <div className="card-gradient text-paper rounded-xl border border-blue/20 overflow-hidden">
    <div className="px-5 py-3 flex items-center justify-between border-b border-paper/15 text-[11px] uppercase tracking-[0.18em] text-paper/55 num">
      <span>{title}</span>
      <span>{lang}</span>
    </div>
    <pre className="p-5 text-[12px] leading-[1.6] overflow-x-auto"><code className="text-paper/90 num">{body}</code></pre>
  </div>
);

const ScreenHandoff = () => (
  <div className="screen" data-active="true">
    <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
        <span>Pour vos ingénieurs</span>
        <span>React 18 · Next.js · Tailwind · shadcn/ui · Recharts · Framer Motion</span>
        <span>Prêt à l'emploi</span>
      </div>
      <div className="hairline mt-3"/>

      <div className="grid grid-cols-12 gap-8 mt-10">
        <div className="col-span-12 lg:col-span-8">
          <Pill tone="accent">Code handoff</Pill>
          <h1 className="font-display text-[64px] leading-[0.92] tracking-tighter2 mt-4">TSX prêt à l'emploi, dans votre stack.</h1>
          <p className="text-ink2 text-[16px] leading-relaxed mt-4 max-w-[60ch]">
            Chaque bloc ci-dessous est un extrait du composant prêt pour la production. Les classes Tailwind correspondent exactement au prototype. Les composants utilisent les primitives shadcn/ui et Recharts pour les graphiques.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-3">Stack technique</div>
          <ul className="text-[14px] space-y-1.5">
            <li>· React 18 + TypeScript</li>
            <li>· Tailwind CSS (extensions de tokens ↓)</li>
            <li>· shadcn/ui · Card, Badge, Button, Tabs, Table</li>
            <li>· Recharts (ligne, barre, aire)</li>
            <li>· Framer Motion (pouls, révélation hero)</li>
            <li>· lucide-react (icônes)</li>
          </ul>
        </aside>
      </div>

      <div className="hairline my-12"/>

      <div className="space-y-8">
        <Block title="01 · Configuration — tokens, installation" body={code.setup} lang="ts" />
        <Block title="02 · PulseLine.tsx — indicateur de santé" body={code.pulseLine} />
        <Block title="03 · BriefingCard.tsx — briefing IA magazine" body={code.briefing} />
        <Block title="04 · InstitutionTrend.tsx — Recharts" body={code.charts} />
        <Block title="05 · Page Dashboard (Écran 1)" body={code.dashboard} />
        <Block title="06 · Page Enseignant (Écran 3)" body={code.teacher} />
        <Block title="07 · Page Étudiant (Écran 4)" body={code.student} />
        <Block title="08 · Page d'accueil (Écran 5)" body={code.landing} />
      </div>

      <div className="hairline my-12"/>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-6">
          <Pill>Notes pour les ingénieurs</Pill>
          <h3 className="font-display text-[28px] tracking-tightish mt-3">Points d'attention.</h3>
          <ul className="text-[14px] text-ink2 space-y-2 mt-3 list-disc pl-5">
            <li>Le fond <code className="num">paper-tex</code> utilise deux radial-gradients empilés ; à rendre une seule fois sur <code className="num">&lt;body&gt;</code>.</li>
            <li>Définir <code className="num">font-feature-settings: 'tnum'</code> sur chaque span numérique — l'alignement des colonnes en dépend.</li>
            <li>Le corps du briefing devrait accepter le Markdown pour que les éditeurs puissent rédiger sans redéploiement.</li>
            <li>L'amplitude du pouls est purement fonction du composite — pas de props supplémentaires.</li>
            <li>RTL : envelopper les chaînes arabes dans un <code className="num">&lt;bdi&gt;</code> avec <code className="num">dir="rtl"</code>.</li>
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Pill>Accessibilité</Pill>
          <h3 className="font-display text-[28px] tracking-tightish mt-3">Engagements A11y.</h3>
          <ul className="text-[14px] text-ink2 space-y-2 mt-3 list-disc pl-5">
            <li>La couleur n'est jamais le seul signal. Le pouls encode aussi l'amplitude ; les tableaux incluent des labels textuels.</li>
            <li>Tous les graphiques sont accompagnés d'un <code className="num">&lt;table&gt;</code> frère pour les lecteurs d'écran, masqué visuellement.</li>
            <li>Le texte principal reste ≥ 14px ; les numériques ≥ 13px dans les tableaux.</li>
            <li>L'ordre de tabulation respecte l'en-tête → CTA principal → registre → barre NL.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

window.ScreenHandoff = ScreenHandoff;
