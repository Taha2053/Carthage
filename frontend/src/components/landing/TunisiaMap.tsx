import { useState } from 'react'
import { UCAR_INSTITUTIONS, TYPE_COLOR, TYPE_LABEL } from '@/data/institutions'
import type { PublicInstitution } from '@/data/institutions'

interface Props {
  onPinClick?: (id: string) => void
  highlightedId?: string | null
}

const HEALTH_COLOR: Record<string, string> = {
  good:    '#1E8449',
  warning: '#D4AC0D',
  no_data: '#6B7A8D',
}

export default function TunisiaMap({ onPinClick, highlightedId }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{ inst: PublicInstitution; mx: number; my: number } | null>(null)

  const active = hovered ?? highlightedId

  return (
    <section id="map" className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #F4EBD5 0%, #EBE0C8 100%)' }}>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-medium mb-3">Réseau territorial</p>
          <h2 className="font-display text-[38px] leading-[1.15] tracking-tightish text-ink">
            +30 établissements,<br/>
            <span className="gold-shimmer">un seul réseau</span>
          </h2>
          <p className="mt-4 text-[15px] text-ink3 max-w-md mx-auto">
            Du cap Bon à Mateur, du centre de Tunis aux rives de Carthage — l'Université de Carthage couvre tout le nord tunisien.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">

          {/* Map SVG */}
          <div className="relative flex-1 min-h-[420px] flex items-center justify-center">
            <svg
              viewBox="60 20 200 200"
              className="w-full max-w-[480px] drop-shadow-xl"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(15,25,35,0.12))' }}
            >
              {/* Tunisia outline — simplified north corridor */}
              <defs>
                <linearGradient id="map-land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EBE0C8"/>
                  <stop offset="100%" stopColor="#DDD3BA"/>
                </linearGradient>
                <filter id="pin-glow">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
              </defs>

              {/* Land mass */}
              <path
                d="
                  M 100 25 L 108 22 L 120 28 L 135 30 L 148 27 L 165 28 L 178 35
                  L 188 45 L 192 60 L 188 75 L 192 90 L 196 108 L 195 125
                  L 200 142 L 198 158 L 190 168 L 180 172 L 168 170
                  L 158 162 L 150 155 L 142 158 L 130 162 L 118 160
                  L 108 152 L 100 140 L 95 125 L 92 110 L 90 95
                  L 86 80 L 84 65 L 86 50 L 92 38 Z
                "
                fill="url(#map-land)"
                stroke="#C5B89A"
                strokeWidth="0.8"
              />

              {/* Sea shimmer */}
              <path
                d="M 62 25 L 100 25 L 92 38 L 86 50 L 84 65 L 86 80 L 90 95 L 92 110 L 95 125 L 100 140 L 108 152 L 118 160 L 130 162 L 142 158 L 150 155 L 158 162 L 168 170 L 180 172 L 190 168 L 198 158 L 200 142 L 195 125 L 196 108 L 192 90 L 188 75 L 192 60 L 188 45 L 178 35 L 165 28 L 148 27 L 135 30 L 120 28 L 108 22 L 100 25 Z M 62 25 L 62 218 L 255 218 L 255 25 Z"
                fill="#B8D4E8"
                opacity="0.25"
                fillRule="evenodd"
              />

              {/* Gulf of Tunis label */}
              <text x="185" y="70" fontSize="4.5" fill="#1B4F72" opacity="0.5" fontFamily="sans-serif" textAnchor="middle">
                Golfe de Tunis
              </text>
              <text x="210" y="150" fontSize="4" fill="#1B4F72" opacity="0.4" fontFamily="sans-serif" textAnchor="middle">
                Golfe d'Hammamet
              </text>

              {/* City labels */}
              {[
                { label: 'Bizerte', x: 125, y: 37 },
                { label: 'Mateur', x: 112, y: 60 },
                { label: 'Tunis', x: 148, y: 92 },
                { label: 'Carthage', x: 172, y: 80 },
                { label: 'Nabeul', x: 214, y: 133 },
              ].map(c => (
                <text key={c.label} x={c.x} y={c.y} fontSize="4.2" fill="#2A3441" opacity="0.55" fontFamily="sans-serif" textAnchor="middle">
                  {c.label}
                </text>
              ))}

              {/* Institution pins */}
              {UCAR_INSTITUTIONS.map((inst) => {
                const isActive = active === inst.id
                const isHighlighted = highlightedId === inst.id
                const baseColor = TYPE_COLOR[inst.type]
                const healthColor = HEALTH_COLOR[inst.healthStatus]
                const r = isActive ? 4.5 : 3.2

                return (
                  <g
                    key={inst.id}
                    transform={`translate(${inst.pin.x}, ${inst.pin.y})`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      setHovered(inst.id)
                      const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
                      setTooltip({
                        inst,
                        mx: e.clientX - rect.left,
                        my: e.clientY - rect.top,
                      })
                    }}
                    onMouseLeave={() => {
                      setHovered(null)
                      setTooltip(null)
                    }}
                    onClick={() => onPinClick?.(inst.id)}
                  >
                    {/* Pulse ring for active/highlighted */}
                    {(isActive || isHighlighted) && (
                      <circle r={r + 4} fill={baseColor} opacity="0.2">
                        <animate attributeName="r" from={r + 2} to={r + 7} dur="1.5s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" from="0.25" to="0" dur="1.5s" repeatCount="indefinite"/>
                      </circle>
                    )}
                    {/* Warning pulse */}
                    {inst.healthStatus === 'warning' && (
                      <circle r={r + 3} fill="#D4AC0D" opacity="0.15">
                        <animate attributeName="r" from={r + 1} to={r + 5} dur="2s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" from="0.2" to="0" dur="2s" repeatCount="indefinite"/>
                      </circle>
                    )}
                    {/* Main dot */}
                    <circle
                      r={r}
                      fill={baseColor}
                      stroke="#F4EBD5"
                      strokeWidth={isActive ? 1.5 : 1}
                      style={{ transition: 'r 0.15s' }}
                    />
                    {/* Health indicator */}
                    <circle
                      cx={r * 0.65}
                      cy={-r * 0.65}
                      r={r * 0.42}
                      fill={healthColor}
                      stroke="#F4EBD5"
                      strokeWidth="0.4"
                    />
                  </g>
                )
              })}
            </svg>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: Math.min(tooltip.mx + 12, 340),
                  top: Math.max(tooltip.my - 70, 8),
                }}
              >
                <div className="bg-ink text-paper rounded-lg px-3 py-2.5 shadow-xl border border-white/10 min-w-[180px]">
                  <p className="font-display font-semibold text-[13px] text-gold leading-tight">{tooltip.inst.acronym}</p>
                  <p className="text-[10px] text-paper/70 mt-0.5 leading-snug">{tooltip.inst.name}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] num text-paper/60">
                    <span>{tooltip.inst.studentCount.toLocaleString('fr')} étudiants</span>
                    <span className="opacity-40">·</span>
                    <span>{TYPE_LABEL[tooltip.inst.type]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: legend + list */}
          <div className="w-full lg:w-[300px] shrink-0 space-y-5">

            {/* Legend */}
            <div className="bg-white/60 rounded-xl border border-rule p-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-widest text-ink3 font-medium mb-3">Type d'établissement</p>
              <div className="space-y-1.5">
                {(Object.entries(TYPE_LABEL) as [keyof typeof TYPE_LABEL, string][]).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TYPE_COLOR[type] }}/>
                    <span className="text-[12px] text-ink2">{label}</span>
                    <span className="ml-auto text-[11px] num text-ink3">
                      {UCAR_INSTITUTIONS.filter(i => i.type === type).length}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-rule space-y-1.5">
                <p className="text-[11px] uppercase tracking-widest text-ink3 font-medium mb-2">Statut</p>
                {[
                  { color: '#1E8449', label: 'Bon' },
                  { color: '#D4AC0D', label: 'Vigilance' },
                  { color: '#6B7A8D', label: 'Sans données' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }}/>
                    <span className="text-[12px] text-ink2">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick list — visible institutions */}
            <div className="bg-white/60 rounded-xl border border-rule backdrop-blur-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-rule">
                <p className="text-[11px] uppercase tracking-widest text-ink3 font-medium">Survol rapide</p>
              </div>
              <div className="divide-y divide-rule max-h-[260px] overflow-y-auto">
                {UCAR_INSTITUTIONS.slice(0, 8).map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => onPinClick?.(inst.id)}
                    onMouseEnter={() => setHovered(inst.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      active === inst.id ? 'bg-gold/5' : 'hover:bg-paper2/50'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: TYPE_COLOR[inst.type] }}/>
                    <span className="flex-1 text-[12px] text-ink font-medium truncate">{inst.acronym}</span>
                    <span className="text-[10px] num text-ink3">{inst.city}</span>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-rule">
                <button
                  onClick={() => document.getElementById('institutions')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-[11px] text-gold hover:text-gold-deep font-medium transition-colors"
                >
                  Voir les +30 établissements ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
