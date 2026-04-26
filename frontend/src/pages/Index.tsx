import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import InstitutionMap from '@/components/landing/InstitutionMap'
import StatsSection from '@/components/landing/StatsSection'
import InstitutionGrid from '@/components/landing/InstitutionGrid'
import OpportunitiesFeed from '@/components/landing/OpportunitiesFeed'
import FeedbackSection from '@/components/landing/FeedbackSection'
import SocioCulturalCarousel from '@/components/landing/SocioCulturalCarousel'
import { Trophy, Leaf, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

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

export default function Index() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  return (
    <div className="bg-paper min-h-screen">
      <Navbar variant="light" />

      {/* ── Hero ── */}
      <section className="relative carthage-bg on-dark">
        <div className="max-w-[1400px] mx-auto px-8 pt-14 pb-10">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-ink3 num">
            <span>{t('landing.network')}</span>
            <span>{t('landing.date')}</span>
            <span>{t('landing.establishments')}</span>
          </div>
          <div className="hairline mt-3" />

          <div className="grid grid-cols-12 gap-8 mt-12 mb-10">
            {/* left — headline */}
            <div className="col-span-12 lg:col-span-8">
              <div className="flex items-center gap-4 mb-8 fade-up text-white">
                <div className="bg-white/10 backdrop-blur border border-white/20 p-2 rounded-xl inline-flex shadow-lg">
                  <img src="/logos/logo-ucar-2.png" alt="Université de Carthage" className="h-16 object-contain filter brightness-0 invert" style={{ WebkitFilter: 'brightness(0) invert(1)' }} />
                </div>
                <div className="bg-white p-2 text-ink text-sm rounded-xl inline-flex items-center gap-2 font-medium shadow-xl absolute translate-x-24 opacity-0 transition-opacity hover:opacity-100">
                  <img src="/logos/logo-ucar-2.png" alt="Original Logo" className="h-12 object-contain" />
                </div>
              </div>
              <Pill>{t('landing.pill')}</Pill>
              <h1 className="font-display font-medium text-[72px] md:text-[96px] leading-[0.88] tracking-tighter2 mt-6 fade-up-1">
                <span className="gold-shimmer">{t('landing.headline1')}{' '}
                <em className="not-italic" style={{ fontStyle: 'italic' }}>+30</em></span>
                <br />
                <span className="gold-shimmer">{t('landing.headline2')}</span>
              </h1>
              <p className="text-ink2 text-[18px] leading-[1.55] max-w-[58ch] mt-8">
                {t('landing.description')}
              </p>
              <div className="flex items-center gap-3 mt-10">
                <button
                  onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary inline-flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full text-[14px]"
                >
                  {t('landing.exploreMap')}
                  <span className="arr inline-flex items-center justify-center w-9 h-9 rounded-full">
                    <ArrowUpRight size={14} />
                  </span>
                </button>
                <button onClick={() => navigate('/login')} className="text-[14px] text-ink2 hover:text-ink ul-link ml-4">
                  {t('landing.privateAccess')}
                </button>
              </div>
            </div>

{/* right — index card */}
            <aside className="col-span-12 lg:col-span-4 lg:pl-8 lg:border-l border-rule">
              {/* Blue Card - Entrepreneurial School */}
              <div className="bg-sea text-paper rounded-lg p-6 mb-4 border border-sea/20">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-paper/50" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-paper/50">{t('landing.ranking2026')}</span>
                </div>
                <div className="text-[64px] font-bold leading-none tracking-tighter2"># 1</div>
                <div className="mt-3 text-[18px] text-paper/90 leading-snug font-light">
                  {t('landing.firstSchool')}<br/>{t('landing.entrepreneurial')}
                </div>
                <div className="mt-6 pt-4 border-t border-paper/15 flex items-center gap-2 text-[11px] text-paper/50">
                  <MapPin className="w-3 h-3" />
                  <span>{t('landing.tunisia')}</span>
                  <span className="ml-auto">UCAR 2026</span>
                </div>
              </div>
              
              {/* Green Card - Green Metrics */}
              <div className="bg-ok text-paper rounded-lg p-6 border border-ok/20">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-4 h-4 text-paper/50" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-paper/50">{t('landing.greenMetrics')}</span>
                </div>
                <div className="text-[64px] font-bold leading-none tracking-tighter2"># 1</div>
                <div className="mt-3 text-[18px] text-paper/90 leading-snug font-light">
                  {t('landing.firstUniversity')}<br/>{t('landing.sustainability')}
                </div>
                <div className="mt-6 pt-4 border-t border-paper/15 flex items-center gap-2 text-[11px] text-paper/50">
                  <MapPin className="w-3 h-3" />
                  <span>{t('landing.tunisia')}</span>
                  <span className="ml-auto">ESG 2025</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Landing Sections ── */}
      <InstitutionMap onPinClick={setHighlightedId} highlightedId={highlightedId} />
      <StatsSection />
      <InstitutionGrid highlightedId={highlightedId} />
      <OpportunitiesFeed />
      <FeedbackSection />
      <SocioCulturalCarousel />

      {/* ── Partner Universities Marquee ── */}
      <section className="border-t border-rule py-12 bg-paper overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-8 mb-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 text-center num">{t('landing.partnerEstablishments', 'Nos institutions partenaires')}</p>
        </div>
        <div className="relative w-full overflow-hidden flex items-center">
          {/* Fading transparent edges over the marquee */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[100px] bg-gradient-to-r from-[#F4EBD5] to-transparent"></div>
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[100px] bg-gradient-to-l from-[#F4EBD5] to-transparent"></div>

          <div className="flex shrink-0 min-w-full marquee-anim gap-16 items-center">
            {[
              "Ecole Nationale d'Architecture et d'Urbanisme de Tunis.jpeg",
              "Ecole Polytechnique de Tunisie.jpeg",
              "Ecole Supérieure de Technologie et d'Informatique à Carthage.png",
              "Ecole Supérieure de l'Audiovisuel et du Cinéma de Gammarth.jpeg",
              "Ecole Supérieure des Statistiques et d'Analyse de l'Information.png",
              "Faculté des Sciences Economiques et de Gestion de Nabeul.jpeg",
              "Faculté des Sciences Juridiques, Politiques et Sociales de Tunis.jpeg",
              "Institut National Agronomique de Tunisie.jpeg",
              "Institut National des Sciences Appliquées et de Technologie.jpeg",
              "Institut Préparatoire aux Etudes Scientifiques et Techniques.jpeg",
              "Institut des Hautes Etudes Commerciales de Carthage.jpg",
              "Sup'Com.png",
              "enstab.png",
              "faculte des sciences de bizerte.jpeg"
            ].map((filename, i) => (
              <div key={i} className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 px-4">
                <img src={`/logos/${filename}`} alt="University Partner" className="h-16 w-auto mix-blend-multiply object-contain opacity-70 hover:opacity-100" />
              </div>
            ))}
            {/* Duplicated for smooth infinite sliding */}
            {[
              "Ecole Nationale d'Architecture et d'Urbanisme de Tunis.jpeg",
              "Ecole Polytechnique de Tunisie.jpeg",
              "Ecole Supérieure de Technologie et d'Informatique à Carthage.png",
              "Ecole Supérieure de l'Audiovisuel et du Cinéma de Gammarth.jpeg",
              "Ecole Supérieure des Statistiques et d'Analyse de l'Information.png",
              "Faculté des Sciences Economiques et de Gestion de Nabeul.jpeg",
              "Faculté des Sciences Juridiques, Politiques et Sociales de Tunis.jpeg",
              "Institut National Agronomique de Tunisie.jpeg",
              "Institut National des Sciences Appliquées et de Technologie.jpeg",
              "Institut Préparatoire aux Etudes Scientifiques et Techniques.jpeg",
              "Institut des Hautes Etudes Commerciales de Carthage.jpg",
              "Sup'Com.png",
              "enstab.png",
              "faculte des sciences de bizerte.jpeg"
            ].map((filename, i) => (
              <div key={`dup-${i}`} className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 px-4">
                <img src={`/logos/${filename}`} alt="University Partner" className="h-16 w-auto mix-blend-multiply object-contain opacity-70 hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-rule mt-0" style={{ background: '#F4EBD5' }}>
        <div className="max-w-[1400px] mx-auto px-8 py-12 grid grid-cols-12 gap-8 text-[13px]">
          <div className="col-span-12 md:col-span-4">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-[28px] font-semibold tracking-tighter2 leading-none text-ink">CarthaVillage</span>
            </div>
            <p className="text-ink3 mt-3 leading-relaxed max-w-[34ch]">
              {t('landing.footerDesc')}
            </p>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">{t('landing.navigation')}</div>
            <ul className="space-y-2 text-ink2">
              <li><a href="#map" className="hover:text-gold">{t('landing.interactiveMap')}</a></li>
              <li><a href="#institutions" className="hover:text-gold">{t('nav.institutions')}</a></li>
              <li><a href="#opportunities" className="hover:text-gold">{t('nav.opportunities')}</a></li>
              <li><a href="#feedback" className="hover:text-gold">{t('nav.feedback')}</a></li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">{t('landing.privateAccessTitle')}</div>
            <ul className="space-y-2 text-ink2">
              <li><button onClick={() => navigate('/login')} className="hover:text-gold">{t('landing.studentRole')}</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-gold">{t('landing.teacherRole')}</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-gold">{t('landing.administration')}</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-gold">{t('landing.ucarCentral')}</button></li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">{t('landing.legal')}</div>
            <ul className="space-y-2 text-ink2">
              <li>{t('landing.privacy')}</li>
              <li>{t('landing.terms')}</li>
              <li>{t('landing.legalNotice')}</li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-2">
            <div className="text-ink3 text-[11px] uppercase tracking-[0.18em] mb-3">{t('landing.contact')}</div>
            <ul className="space-y-2 text-ink2">
              <li>{t('landing.universityName')}</li>
              <li>info@carthage.tn</li>
              <li>+216 71 000 000</li>
            </ul>
          </div>
          <div className="col-span-12 flex items-center justify-between border-t border-rule pt-6 text-ink3">
            <span className="num">{t('landing.copyright')}</span>
            <span className="num">{t('landing.hackathon')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
