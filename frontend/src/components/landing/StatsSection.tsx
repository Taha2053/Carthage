import { useEffect, useRef, useState } from 'react'
import { TOTAL_STUDENTS, TOTAL_STAFF, AVG_INSERTION, TOTAL_PARTNERSHIPS, TOTAL_STUDENTS_DISPLAY, TOTAL_STAFF_DISPLAY } from '@/data/institutions'

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, start])
  return value
}

interface StatProps {
  value: number | string
  suffix?: string
  label: string
  sub: string
  started: boolean
  delay?: number
}

function StatCard({ value, suffix = '', label, sub, started, delay = 0 }: StatProps) {
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (!started) return
    const t = setTimeout(() => setGo(true), delay)
    return () => clearTimeout(t)
  }, [started, delay])
  const count = useCountUp(typeof value === 'number' ? value : 30, 1600, go)

  return (
    <div className="text-center fade-up">
      <p className="font-display text-[52px] leading-none tracking-tighter text-ink num">
        {typeof value === 'string' ? value : count.toLocaleString('fr')}<span className="text-gold text-[36px]">{suffix}</span>
      </p>
      <p className="mt-1 text-[14px] font-semibold text-ink2 tracking-tightish">{label}</p>
      <p className="mt-0.5 text-[12px] text-ink3">{sub}</p>
    </div>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16 border-y border-rule/60" style={{ background: '#F4EBD5' }}>
      <div className="max-w-[1100px] mx-auto px-6">

        {/* Section label */}
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-medium">Université de Carthage en chiffres</p>
          <div className="mt-3 w-16 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #C5933A, transparent)' }}/>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCard
            value="+30"
            label="Établissements"
            sub="Facultés, écoles, instituts & labo"
            started={started}
            delay={0}
          />
          <StatCard
            value={TOTAL_STUDENTS_DISPLAY}
            label="Étudiants inscrits"
            sub="Licence, master & doctorat"
            started={started}
            delay={150}
          />
          <StatCard
            value={TOTAL_STAFF_DISPLAY}
            label="Enseignants & chercheurs"
            sub="Permanents et associés"
            started={started}
            delay={300}
          />
          <StatCard
            value={AVG_INSERTION}
            suffix="%"
            label="Taux d'insertion moyen"
            sub="Diplômés en emploi < 12 mois"
            started={started}
            delay={450}
          />
        </div>

        {/* Second row */}
        <div className="mt-10 pt-10 border-t border-rule/60 grid grid-cols-2 md:grid-cols-4 gap-10">
          <StatCard
            value={TOTAL_PARTNERSHIPS}
            label="Partenariats internationaux"
            sub="Accord de coopération actifs"
            started={started}
            delay={600}
          />
          <StatCard
            value={8}
            label="Domaines de performance"
            sub="Académique, RH, Finance, ESG…"
            started={started}
            delay={700}
          />
          <StatCard
            value="+2K"
            label="Chercheurs actifs"
            sub="Publications & brevets UCAR"
            started={started}
            delay={800}
          />
          <StatCard
            value={2025}
            label="Année de référence"
            sub="Données CarthaVillage en temps réel"
            started={started}
            delay={900}
          />
        </div>

        {/* Glow divider */}
        <div className="glow-line mt-14"/>
      </div>
    </section>
  )
}
