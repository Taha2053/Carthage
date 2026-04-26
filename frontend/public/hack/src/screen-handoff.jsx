// Screen 6 — Code handoff (TSX snippets per screen)
const code = {
  setup: `// Tailwind extension (tailwind.config.ts)
extend: {
  fontFamily: {
    serif: ['Fraunces', 'ui-serif', 'Georgia'],
    sans:  ['Inter Tight', 'ui-sans-serif', 'system-ui'],
    mono:  ['JetBrains Mono', 'ui-monospace'],
    arabic:['Noto Naskh Arabic', 'serif'],
  },
  colors: {
    paper:   '#F0F5FA',
    paper2:  '#E4EDF5',
    ink:     '#003966',
    ink2:    '#1A4A72',
    ink3:    '#607D8B',
    rule:    '#C8D8E8',
    accent:  '#EE771D',
    accent2: '#B85C0D',
    ok: '#3F6B3F', warn: '#B8842B', crit: '#A8341E',
  },
}

// Install
pnpm add framer-motion recharts lucide-react
pnpm dlx shadcn@latest add card badge button table tabs dialog input scroll-area`,

  pulseLine: `// PulseLine.tsx — health indicator (the "نبض" reference)
import { motion } from 'framer-motion';

export function PulseLine({ score, w = 240, h = 32, animated = false }: { score: number; w?: number; h?: number; animated?: boolean; }) {
  const c = score >= 85 ? '#3F6B3F' : score >= 72 ? '#003966' : score >= 60 ? '#B8842B' : '#A8341E';
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
      <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="#C8D8E8" strokeWidth="0.5" strokeDasharray="2 2"/>
      <motion.path d={d} fill="none" stroke={c} strokeWidth={1.4}
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1.2, ease: 'easeInOut' }} />
    </svg>
  );
}`,

  dashboard: `// app/dashboard/page.tsx — UCAR Central
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Sparkles, Bell } from 'lucide-react';
import { PulseLine } from '@/components/PulseLine';

export default function DashboardPage() {
  return (
    <main className="bg-paper paper-tex">
      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-20">
        {/* Magazine masthead */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 font-mono">
          <span>UCAR Central · The Pulse</span>
          <span>April 26, 2026 · Issue Nº 7</span>
          <span>Composite v3.2.7</span>
        </div>

        <div className="grid grid-cols-12 gap-8 mt-10">
          <header className="col-span-12 lg:col-span-8">
            <Badge variant="outline" className="rounded-full">President's view</Badge>
            <h1 className="font-serif text-[72px] leading-[0.92] tracking-[-0.025em] mt-5">
              Good morning, Dr. Faisal.<br/>
              <em className="not-italic italic">The week reads </em>
              <span className="text-accent">cautiously up.</span>
            </h1>
          </header>
          <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
            <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">University composite</span>
            <div className="font-serif text-[88px] leading-none tracking-[-0.025em]">81.4</div>
            <PulseLine score={81} w={300} h={42} animated />
          </aside>
        </div>

        {/* AI weekly briefing — magazine cover treatment */}
        <Card className="mt-10 bg-ink text-paper border-ink rounded p-10 grid grid-cols-2 gap-x-10">
          <div className="col-span-2 flex justify-between text-[11px] uppercase tracking-[0.18em] text-paper/60 font-mono">
            <span>The Briefing · Issue Nº 7</span>
            <span className="flex items-center gap-1.5"><Sparkles size={11}/> Written by NABD</span>
          </div>
          <h2 className="col-span-2 font-serif text-[60px] leading-[0.95] tracking-[-0.025em] mt-4 max-w-[22ch]">
            Engineering pulls forward; Preparatory College needs intervention.
          </h2>
          {/* …two-column body, blockquote, footnotes… */}
        </Card>

        {/* Roster — sortable */}
        <table className="w-full mt-12 border-collapse">
          <thead>
            <tr className="border-b border-rule text-[10px] uppercase tracking-[0.18em] text-ink3">
              <th className="text-left py-3">№</th>
              <th className="text-left">Institution</th>
              <th className="text-right">Score</th>
              <th>Pulse · 26 weeks</th>
              <th className="text-right">Trend</th>
            </tr>
          </thead>
          <tbody>{/* map institutions */}</tbody>
        </table>

        {/* NL query bar — sticky */}
        <div className="sticky bottom-6 mt-12">
          <div className="bg-ink text-paper rounded-full pl-6 pr-2 py-2 flex items-center gap-3 max-w-[920px] mx-auto">
            <Sparkles size={14} className="text-accent"/>
            <input className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-paper/50"
                   placeholder="Ask NABD anything — «Why did Education drop?»" />
            <Button className="bg-accent hover:bg-accent2 rounded-full w-9 h-9 p-0">
              <ArrowUpRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}`,

  briefing: `// components/BriefingCard.tsx — magazine-cover AI briefing
export function BriefingCard({ briefing }: { briefing: Briefing }) {
  return (
    <article className="bg-ink text-paper rounded p-10 relative overflow-hidden">
      <div className="absolute inset-0 grain opacity-15 pointer-events-none" />
      <header className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-paper/60 font-mono">
        <span>The Briefing · Issue Nº {briefing.issue}</span>
        <span>{briefing.date}</span>
        <span className="flex items-center gap-1.5">
          <Sparkles size={11}/> Written by NABD
        </span>
      </header>
      <hr className="border-paper/15 mt-3 mb-6" />
      <h2 className="font-serif text-[60px] leading-[0.95] tracking-[-0.025em] max-w-[22ch]">
        {briefing.headline}
      </h2>
      <p className="font-serif italic text-[17px] leading-snug mt-5 max-w-[58ch] text-paper/80">
        {briefing.deck}
      </p>
      <div className="grid grid-cols-2 gap-x-10 mt-10 text-[14px] leading-[1.65] text-paper/85">
        <div className="space-y-4">
          <p><span className="font-serif text-[44px] float-left mr-2 mt-1">{briefing.body[0][0]}</span>
             {briefing.body[0].slice(1)}</p>
          <p>{briefing.body[1]}</p>
        </div>
        <div className="space-y-4">
          <blockquote className="font-serif italic text-[24px] border-l-2 border-accent pl-5">
            {briefing.body[2]}
          </blockquote>
          <p>{briefing.body[3]}</p>
        </div>
      </div>
      <footer className="border-t border-paper/15 mt-8 pt-4 grid grid-cols-3 gap-6 text-[11px] text-paper/55 font-mono">
        {briefing.citations.map((c, i) => (
          <div key={i}><sup className="text-accent">{i+1}</sup> {c}</div>
        ))}
      </footer>
    </article>
  );
}`,

  charts: `// components/InstitutionTrend.tsx — recharts wired with paper palette
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function InstitutionTrend({ data, color = '#003966' }: { data: { wk: string; v: number }[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 18, right: 16, bottom: 26, left: 36 }}>
        <CartesianGrid stroke="#C8D8E8" strokeDasharray="2 3" vertical={false} />
        <XAxis dataKey="wk" stroke="#607D8B" fontFamily="JetBrains Mono" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#607D8B" fontFamily="JetBrains Mono" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: '#003966', color: '#F0F5FA', border: 'none', fontFamily: 'JetBrains Mono', fontSize: 12 }} />
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 4, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}`,

  teacher: `// app/teacher/[course]/page.tsx — kanban-style at-risk board
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TeacherCoursePage({ params }: { params: { course: string } }) {
  const cohort = useCohort(params.course);
  return (
    <Tabs defaultValue="roster" className="mt-12">
      <TabsList className="bg-transparent gap-1">
        <TabsTrigger value="roster" className="rounded-full data-[state=active]:bg-ink data-[state=active]:text-paper">Roster</TabsTrigger>
        <TabsTrigger value="risk"   className="rounded-full data-[state=active]:bg-ink data-[state=active]:text-paper">At-risk board</TabsTrigger>
      </TabsList>

      <TabsContent value="risk" className="mt-6 grid grid-cols-3 gap-6">
        {(['high','med','low'] as const).map(level => (
          <div key={level} className="bg-paper2/50 border border-rule rounded p-5 min-h-[420px]">
            <h3 className="font-serif text-[24px] tracking-tight">
              {level === 'high' ? 'At-risk' : level === 'med' ? 'On watch' : 'On track'}
            </h3>
            {cohort.filter(s => s.risk === level).map(s => (
              <div key={s.id} className="bg-paper border border-rule rounded p-3 mt-2 flex items-center gap-2">
                <Avatar className="w-7 h-7"><AvatarFallback className="bg-ink text-paper text-[10px]">{s.initials}</AvatarFallback></Avatar>
                <div className="flex-1"><div className="font-serif text-[14px]">{s.name}</div></div>
                <span className="font-mono text-[16px]">{s.score}</span>
              </div>
            ))}
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
      {/* KPI rings */}
      <div className="grid grid-cols-4 gap-3 mt-12">
        {kpis.map(k => (
          <Card key={k.label} className="bg-paper2/70 border-rule rounded p-5 flex items-center gap-4">
            <Ring value={k.ring} size={64} stroke={5} color={k.color} />
            <div>
              <span className="text-[11px] uppercase tracking-[0.18em] text-ink3">{k.label}</span>
              <div className="font-serif text-[30px] leading-none tracking-[-0.025em]">{k.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI nudge — centered, prominent */}
      <article className="mt-12 bg-ink text-paper rounded p-10 grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-paper/60 font-mono">
            <Sparkles size={11} className="text-accent"/> A note from NABD
          </span>
          <h2 className="font-serif text-[52px] leading-[0.97] tracking-[-0.025em] mt-3">
            {nudge.headline}
          </h2>
        </div>
      </article>
    </main>
  );
}`,

  landing: `// app/page.tsx — Editorial landing
export default function Landing() {
  return (
    <main className="paper-tex">
      <section className="max-w-[1400px] mx-auto px-8 pt-14 pb-10">
        <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 font-mono">
          <span>The Pulse · Issue Nº 7</span>
          <span>April 26, 2026 — Riyadh</span>
        </div>
        <h1 className="font-serif text-[132px] leading-[0.88] tracking-[-0.025em] mt-12">
          One pulse for <em className="italic">thirty-four</em><br/>faculties.
        </h1>
        {/* hero figure: 12-faculty pulse skyline on dark ink card */}
      </section>
      {/* marquee, three pillars, pull quote, methodology, big wordmark */}
    </main>
  );
}`,
};

const Block = ({ title, body, lang='tsx' }) => (
  <div className="bg-ink text-paper rounded border border-ink overflow-hidden">
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
        <span>For your engineers</span>
        <span>React 18 · Next.js · Tailwind · shadcn/ui · Recharts · Framer Motion</span>
        <span>Drop-in</span>
      </div>
      <div className="hairline mt-3"/>

      <div className="grid grid-cols-12 gap-8 mt-10">
        <div className="col-span-12 lg:col-span-8">
          <Pill>Code handoff</Pill>
          <h1 className="font-display text-[64px] leading-[0.92] tracking-tighter2 mt-4">Drop-in TSX, in your stack.</h1>
          <p className="text-ink2 text-[16px] leading-relaxed mt-4 max-w-[60ch]">
            Each block below is an excerpt of the production-ready component. Tailwind classes match the prototype exactly. Components reference shadcn/ui primitives where the prototype uses them, and Recharts where charts are needed.
          </p>
        </div>
        <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-3">Stack</div>
          <ul className="text-[14px] space-y-1.5">
            <li>· React 18 + TypeScript</li>
            <li>· Tailwind CSS (token extensions ↓)</li>
            <li>· shadcn/ui · Card, Badge, Button, Tabs, Table, Dialog, Avatar</li>
            <li>· Recharts (line, bar, area)</li>
            <li>· Framer Motion (pulse path, hero reveal)</li>
            <li>· lucide-react (icons)</li>
          </ul>
        </aside>
      </div>

      <div className="hairline my-12"/>

      <div className="space-y-8">
        <Block title="01 · Setup — tokens, install" body={code.setup} lang="ts" />
        <Block title="02 · PulseLine.tsx — health indicator" body={code.pulseLine} />
        <Block title="03 · BriefingCard.tsx — magazine-cover AI briefing" body={code.briefing} />
        <Block title="04 · InstitutionTrend.tsx — Recharts" body={code.charts} />
        <Block title="05 · Dashboard page (Screen 1)" body={code.dashboard} />
        <Block title="06 · Teacher page (Screen 3)" body={code.teacher} />
        <Block title="07 · Student page (Screen 4)" body={code.student} />
        <Block title="08 · Landing page (Screen 5)" body={code.landing} />
      </div>

      <div className="hairline my-12"/>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-6">
          <Pill>Notes for engineering</Pill>
          <h3 className="font-display text-[28px] tracking-tightish mt-3">Things to watch.</h3>
          <ul className="text-[14px] text-ink2 space-y-2 mt-3 list-disc pl-5">
            <li>The <code className="num">paper-tex</code> background is two stacked radial-gradients; render once on <code className="num">&lt;body&gt;</code>.</li>
            <li>Set <code className="num">font-feature-settings: 'tnum'</code> on every numeric span — column alignment depends on it.</li>
            <li>Briefing card body should accept Markdown so editors can author without redeploys.</li>
            <li>Pulse waveform amplitude is purely a function of the composite score — no extra props needed.</li>
            <li>RTL: wrap Arabic strings in a <code className="num">&lt;bdi&gt;</code> with <code className="num">dir="rtl"</code> to keep mixed lines clean.</li>
          </ul>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Pill>Accessibility</Pill>
          <h3 className="font-display text-[28px] tracking-tightish mt-3">A11y commitments.</h3>
          <ul className="text-[14px] text-ink2 space-y-2 mt-3 list-disc pl-5">
            <li>Color is never the only signal. Pulse score also encodes amplitude; tables include text labels.</li>
            <li>All charts ship with a sibling <code className="num">&lt;table&gt;</code> for screen readers, hidden visually.</li>
            <li>Body text remains ≥ 14px; numerics ≥ 13px in tables.</li>
            <li>Tab order respects masthead → primary CTA → roster → NL bar.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

window.ScreenHandoff = ScreenHandoff;
