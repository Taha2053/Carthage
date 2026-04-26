import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'

// ── tiny helpers ────────────────────────────────────────────────────────────

function ArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="pill">
      <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
      {children}
    </span>
  )
}

// Pulse / health waveform
function pulsePath(score: number, w: number, h: number) {
  const amp = 4 + (score / 100) * 9
  const baseY = h / 2
  const segs = 6
  const segW = w / segs
  let d = `M0 ${baseY}`
  for (let i = 0; i < segs; i++) {
    const x0 = i * segW
    d += ` L${x0 + segW * 0.30} ${baseY}`
    d += ` L${x0 + segW * 0.40} ${baseY - amp * 0.6}`
    d += ` L${x0 + segW * 0.50} ${baseY + amp}`
    d += ` L${x0 + segW * 0.60} ${baseY - amp}`
    d += ` L${x0 + segW * 0.70} ${baseY + amp * 0.3}`
    d += ` L${x0 + segW} ${baseY}`
  }
  return d
}

function PulseLine({ score, w = 120, h = 28, animated = false }: { score: number; w?: number; h?: number; animated?: boolean }) {
  const color = score >= 85 ? '#1E8449' : score >= 72 ? '#0F1923' : score >= 60 ? '#D4AC0D' : '#C0392B'
  const d = pulsePath(score, w, h)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#D6D1C7" strokeWidth="0.5" strokeDasharray="2 2" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" className={animated ? 'ekg-anim' : ''} />
    </svg>
  )
}

// ── institution data (subset) ────────────────────────────────────────────────

const INSTITUTIONS = [
  { id: 'med',  name: 'Médecine',       score: 92 },
  { id: 'eng',  name: 'Ingénierie',     score: 88 },
  { id: 'sci',  name: 'Sciences',       score: 81 },
  { id: 'bus',  name: 'Gestion',        score: 76 },
  { id: 'law',  name: 'Droit',          score: 84 },
  { id: 'art',  name: 'Lettres',        score: 79 },
  { id: 'edu',  name: 'Éducation',      score: 71 },
  { id: 'pha',  name: 'Pharmacie',      score: 90 },
  { id: 'arc',  name: 'Architecture',   score: 86 },
  { id: 'agr',  name: 'Agronomie',      score: 68 },
  { id: 'cs',   name: 'Informatique',   score: 91 },
  { id: 'pre',  name: 'Préparatoire',   score: 65 },
]

const PARTNERS = [
  'Faculté de Médecine', 'École Polytechnique', 'ISG Tunis',
  'ISET Bizerte', 'ENI Sfax', 'FSEG Sousse', 'ISIT Carthage',
  'Université de Sfax', 'Faculté de Droit', 'ENIT',
]
const MARQUEE = [...PARTNERS, ...PARTNERS]

// ── main component ───────────────────────────────────────────────────────────

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <div className="bg-paper min-h-screen carthage-bg">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-8 pt-14 pb-10">

          {/* meta line */}
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
            <span>CarthaVillage · Réseau UCAR</span>
            <span>26 Avril 2026 — Tunis</span>
            <span>+30 Établissements</span>
          </div>
          <div className="hairline mt-3" />

          <div className="grid grid-cols-12 gap-8 mt-12">
            {/* left — headline */}
            <div className="col-span-12 lg:col-span-8">
              <Pill>Pour l'administration universitaire</Pill>
              <h1 className="font-display font-medium text-[72px] md:text-[112px] leading-[0.88] tracking-tighter2 mt-6 fade-up-1">
                <span className="gold-shimmer">Un signal pour{' '}
                <em className="not-italic" style={{ fontStyle: 'italic' }}>trente-cinq</em></span>
                <br />
                <span className="text-ink">établissements.</span>
              </h1>
              <p className="text-ink2 text-[18px] leading-[1.55] max-w-[58ch] mt-8">
                CarthaVillage est le système d'exploitation de l'Université de Carthage — un signal unifié et audité sur l'ensemble des facultés, instituts et écoles doctorales, avec des bilans hebdomadaires rédigés pour le conseil, pas pour le tableau de bord.
              </p>
              <div className="flex items-center gap-3 mt-10">
                <button
                  onClick={() => navigate('/central')}
                  className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]"
                >
                  Ouvrir le tableau de bord
                  <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full">
                    <ArrowUpRight size={14} />
                  </span>
                </button>
                <button onClick={() => navigate('/login')} className="text-[14px] text-ink2 hover:text-ink ul-link">
                  Se connecter
                </button>
              </div>
            </div>

            {/* right — index card */}
            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-4">Indice UCAR, cette semaine</div>
              <div className="flex items-end gap-4">
                <span className="font-display text-[88px] leading-none tracking-tighter2 text-ink">81.4</span>
                <span className="num text-ok text-[13px] pb-3">+0.6</span>
              </div>
              <PulseLine score={81} w={280} h={42} animated />
              <div className="grid grid-cols-3 gap-3 mt-6 text-[12px]">
                <div>
                  <div className="text-ink3 mb-1">Supérieur à 85</div>
                  <div className="num text-[18px] text-ink">12</div>
                </div>
                <div>
                  <div className="text-ink3 mb-1">En vigilance</div>
                  <div className="num text-[18px] text-warn">5</div>
                </div>
                <div>
                  <div className="text-ink3 mb-1">Critique</div>
                  <div className="num text-[18px] text-crit">2</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-paper2 border border-rule rounded">
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink3 mb-1">À la une</div>
                <p className="font-display text-[18px] leading-snug text-ink">
                  Ingénierie franchit 88 ; le Collège Préparatoire nécessite une intervention.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* ── live pulse figure ── */}
        <div className="max-w-[1400px] mx-auto px-8 pt-2 pb-16">
          <div className="relative bg-ink text-paper rounded-md overflow-hidden border border-ink">
            <div className="absolute inset-0 grain opacity-20" />
            <div className="grid grid-cols-12 px-10 pt-10 pb-12 relative">
              <div className="col-span-7">
                <span className="text-[11px] uppercase tracking-[0.18em] text-paper/60">Live · ce matin, 09h00</span>
                <h3 className="font-display text-[44px] leading-[0.95] tracking-tighter2 mt-4 max-w-[18ch] text-paper">
                  Chaque faculté, sur un même rythme.
                </h3>
                <p className="text-paper/70 text-[14.5px] leading-relaxed max-w-[52ch] mt-4">
                  Chaque ligne est l'indice composite d'une faculté sur les 26 dernières semaines. Une hausse signifie que les étudiants arrivent, soumettent et réussissent ; une baisse appelle une conversation au niveau du conseil.
                </p>
              </div>
              <div className="col-span-5 flex items-end justify-end">
                <div className="num text-[12px] text-paper/60">+30 établissements · ingestion 04h00</div>
              </div>
            </div>
            <div className="px-10 pb-10 grid grid-cols-12 gap-x-6 gap-y-4 relative">
              {INSTITUTIONS.map(inst => (
                <div key={inst.id} className="col-span-2 border-t border-paper/15 pt-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-paper/50 truncate">{inst.name}</div>
                  <div className="num text-[15px] mt-1 text-paper">{inst.score}</div>
                  <PulseLine
                    score={inst.score}
                    w={140}
                    h={26}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <section className="border-y border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 py-6 flex items-center gap-8">
          <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-ink3">Reconnu à travers le réseau</span>
          <div className="overflow-hidden flex-1 no-scrollbar">
            <div className="marquee-anim flex gap-12 whitespace-nowrap">
              {MARQUEE.map((name, i) => (
                <span key={i} className="font-display text-[18px] text-ink2/70 shrink-0">
                  {name}
                  <span className="mx-6 text-ink3">·</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="max-w-[1400px] mx-auto px-8 py-24">
        <div className="flex flex-col gap-3 mb-14">
          <Pill>Ce que fait CarthaVillage</Pill>
          <h2 className="font-display text-[42px] md:text-[56px] leading-[0.95] tracking-tighter2 text-ink">
            Trois vues,{' '}
            <em className="not-italic" style={{ fontStyle: 'italic' }}>une seule vérité</em>.
          </h2>
        </div>
        <div className="grid grid-cols-12 gap-6">
          {[
            {
              num: '01',
              title: 'Pour le Président',
              body: 'Un bilan hebdomadaire style magazine, rédigé par CarthaVillage, qui transforme trente-cinq flux de données en un seul paragraphe prêt pour le conseil — avec citations.',
              cta: 'Ouvrir le tableau de bord',
              href: '/central',
            },
            {
              num: '02',
              title: 'Pour le Directeur',
              body: "Chaque établissement dispose de l'ensemble de l'appareil : composites, présence, délais, taux de réussite et un audit d'une page de la semaine.",
              cta: 'Vue institution',
              href: '/institution/med',
            },
            {
              num: '03',
              title: 'Pour l\'Enseignant',
              body: "Les enseignants voient leur cohorte comme le conseil voit l'université : un pouls, une liste et les étudiants qui ont besoin d'un échange cette semaine.",
              cta: 'Vue enseignant',
              href: '/teacher',
            },
          ].map(card => (
            <article
              key={card.num}
              className="col-span-12 md:col-span-4 bg-paper2 border border-rule rounded p-7 lift"
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3">
                <span className="num">{card.num}</span>
                <span>Module</span>
              </div>
              <h3 className="font-display text-[34px] leading-[1.0] tracking-tighter2 mt-6 text-ink">{card.title}</h3>
              <p className="text-ink2 text-[15px] leading-relaxed mt-4">{card.body}</p>
              <button
                onClick={() => navigate(card.href)}
                className="mt-8 inline-flex items-center gap-2 text-[13px] text-ink hover:text-gold ul-link transition-colors"
              >
                {card.cta} <ArrowUpRight size={12} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section className="border-t border-rule">
        <div className="max-w-[1100px] mx-auto px-8 py-24 text-center">
          <span className="pill">Lettre du recteur</span>
          <blockquote className="font-display text-[44px] md:text-[64px] leading-[1.02] tracking-tighter2 mt-8 text-ink">
            "Nous avons arrêté de demander aux doyens des diapositives. CarthaVillage rédige{' '}
            <em className="not-italic" style={{ fontStyle: 'italic' }}>une</em> page chaque lundi et le conseil la lit avant neuf heures."
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-4 text-[13px] text-ink3">
            <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-display text-sm">
              MA
            </div>
            <div className="text-left">
              <div className="text-ink">Pr. Mohamed Ammar</div>
              <div className="num">Président · Université de Carthage</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Methodology ── */}
      <section className="border-t border-rule bg-paper2/70">
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5">
            <Pill>Méthodologie</Pill>
            <h3 className="font-display text-[40px] leading-[1.0] tracking-tighter2 mt-6 max-w-[18ch] text-ink">
              Un composite que le conseil peut{' '}
              <em className="not-italic" style={{ fontStyle: 'italic' }}>défendre</em>.
            </h3>
            <p className="text-ink2 text-[15px] leading-relaxed mt-5 max-w-[44ch]">
              L'indice CarthaVillage est un composite transparent et pondéré de la présence, des résultats d'évaluation, du respect des délais et de la rétention. Chaque chiffre est traçable jusqu'à la ligne source. Chaque pondération est publiée.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-x-10 gap-y-8">
            {[
              ['Présence', '0.30', 'Pondérée par type de cours. Les absences justifiées sont exclues.'],
              ['Évaluation', '0.30', 'Taux de réussite × écart par rapport à la base de cohorte.'],
              ['Délais', '0.20', 'Fenêtre de soumission, pondérée par la sévérité du devoir.'],
              ['Rétention', '0.20', 'Continuation par rapport à la progression attendue.'],
            ].map(([k, w, d]) => (
              <div key={k} className="border-t border-rule pt-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[24px] text-ink">{k}</span>
                  <span className="num text-ink3 text-[12px]">w = {w}</span>
                </div>
                <p className="text-ink2 text-[13.5px] leading-relaxed mt-2">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Big closer ── */}
      <section className="border-t border-rule overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 pt-16 pb-10 grid grid-cols-12 gap-8 items-end">
          <div className="col-span-12 lg:col-span-7">
            <Pill>Commencer</Pill>
            <h3 className="font-display text-[56px] md:text-[80px] leading-[0.92] tracking-tighter2 mt-6 text-ink">
              Un lieu pour trente-cinq facultés — sans chaos.
            </h3>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => navigate('/central')}
                className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]"
              >
                Ouvrir CarthaVillage
                <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full">
                  <ArrowUpRight size={14} />
                </span>
              </button>
              <button onClick={() => navigate('/login')} className="text-[14px] text-ink2 hover:text-ink ul-link">
                Planifier une démonstration
              </button>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-6 text-[13px]">
            {[
              ['Portée', '30 000+', 'étudiants sous signal'],
              ['Bilans', '156', 'délivrés à ce jour'],
              ['Facultés', '+150', "à travers l'UCAR"],
              ['Latence', '04h00', 'ingestion quotidienne'],
            ].map(([label, value, sub]) => (
              <div key={label}>
                <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-2">{label}</div>
                <div className="font-display text-[28px] text-ink">{value}</div>
                <div className="text-ink3">{sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* big wordmark */}
        <div className="border-t border-rule">
          <div className="max-w-[1400px] mx-auto px-8 overflow-hidden">
            <div
              className="font-display tracking-tighter2 leading-[0.85] select-none text-ink/10"
              style={{ fontSize: 'clamp(80px, 20vw, 260px)', marginBottom: '-2vw', marginTop: '-1vw' }}
            >
              UCAR
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-rule mt-0">
        <div className="max-w-[1400px] mx-auto px-8 py-12 grid grid-cols-12 gap-8 text-[13px]">
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[28px] font-semibold tracking-tighter2 leading-none text-ink">CarthaVillage</span>
            </div>
            <p className="text-ink3 mt-3 leading-relaxed max-w-[34ch]">
              Un signal unifié pour l'administration universitaire. Conçu pour les conseils qui ont besoin de voir un seul indicateur sur trente-cinq facultés.
            </p>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">Produit</div>
            <ul className="space-y-2 text-ink2">
              <li>Tableau de bord central</li>
              <li>Vue institution</li>
              <li>Outils enseignant</li>
              <li>Portail étudiant</li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">Méthodologie</div>
            <ul className="space-y-2 text-ink2">
              <li>Composite v3.2</li>
              <li>Ingestion de données</li>
              <li>Piste d'audit</li>
              <li>Confidentialité</li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">Université</div>
            <ul className="space-y-2 text-ink2">
              <li>Bilan hebdomadaire</li>
              <li>Revue trimestrielle</li>
              <li>Archive des rapports</li>
              <li>Presse</li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">Contact</div>
            <ul className="space-y-2 text-ink2">
              <li>Université de Carthage</li>
              <li>info@carthage.tn</li>
              <li>+216 71 000 000</li>
            </ul>
          </div>
          <div className="col-span-12 flex items-center justify-between border-t border-rule pt-6 text-ink3">
            <span className="num">© 2026 CarthaVillage · Université de Carthage</span>
            <span className="num">Composite v3.2 · Données auditées</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
