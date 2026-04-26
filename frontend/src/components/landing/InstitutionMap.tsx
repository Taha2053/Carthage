import { useState, useEffect, useMemo } from 'react'
import { UCAR_INSTITUTIONS, TYPE_COLOR } from '@/data/institutions'
import type { PublicInstitution } from '@/data/institutions'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface Props {
  onPinClick?: (id: string) => void
  highlightedId?: string | null
}

interface Signal {
  id: string
  from: number
  to: number
  createdAt: number
  speed: number
}

export default function InstitutionMap({ onPinClick, highlightedId }: Props) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<PublicInstitution | null>(null)
  const [signals, setSignals] = useState<Signal[]>([])
  const [connections, setConnections] = useState<[number, number][]>([])

  const institutions = UCAR_INSTITUTIONS

  const centerX = 200
  const centerY = 90

  // Evenly distributed positions in a ring with minimum spacing
  const dotPositions = useMemo(() => {
    const positions: { x: number; y: number }[] = []
    const count = institutions.length
    if (count === 0) return positions
    
    const innerRadius = 145
    const outerRadius = 185
    const minDistance = 120
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.25
      let r = innerRadius + (outerRadius - innerRadius) * (i / count)
      r += (Math.random() - 0.5) * 12
      
      let x = centerX + r * Math.cos(angle)
      let y = centerY + r * Math.sin(angle) * 0.35
      
      let attempts = 0
      while (attempts < 10) {
        let overlapping = false
        for (const pos of positions) {
          const dx = pos.x - x
          const dy = pos.y - y
          if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
            overlapping = true
            break
          }
        }
        if (!overlapping) break
        x += (Math.random() - 0.5) * 12
        y += (Math.random() - 0.5) * 12
        attempts++
      }
      
      positions.push({ x, y })
    }
    return positions
  }, [institutions.length])

  // Control points for curved lines
  const curveOffsets = useMemo(() => {
    return Array.from({ length: institutions.length }, () => ({
      x: (Math.random() - 0.5) * 35,
      y: (Math.random() - 0.5) * 35,
    }))
  }, [institutions.length])

  useEffect(() => {
    if (institutions.length === 0) return

    const randomConnections: [number, number][] = []
    const numConnections = Math.min(institutions.length + 5, 30)
    for (let i = 0; i < numConnections; i++) {
      const from = Math.floor(Math.random() * institutions.length)
      const to = Math.floor(Math.random() * institutions.length)
      if (from !== to) {
        randomConnections.push([from, to])
      }
    }
    setConnections(randomConnections)
  }, [])

  useEffect(() => {
    if (institutions.length === 0) return

    const sendSignalToCenter = () => {
      const from = Math.floor(Math.random() * institutions.length)
      const newSignal: Signal = {
        id: `center-${Date.now()}-${Math.random()}`,
        from,
        to: -1, // -1 means center node
        createdAt: Date.now(),
        speed: 2.5 + Math.random() * 2,
      }
      
      setSignals(prev => {
        const toCenter = prev.find(s => s.to === -1)
        if (toCenter) return prev
        return [...prev.slice(-2), newSignal]
      })
      
      setTimeout(() => {
        setSignals(prev => prev.filter(s => s.id !== newSignal.id))
      }, 4000 + Math.random() * 2000)
    }

    // Send signal to center more frequently
    sendSignalToCenter()
    const interval1 = setInterval(sendSignalToCenter, 1200 + Math.random() * 800)
    
    // Occasional inter-node signals
    const sendRandomSignal = () => {
      const from = Math.floor(Math.random() * institutions.length)
      let to = Math.floor(Math.random() * institutions.length)
      while (to === from) {
        to = Math.floor(Math.random() * institutions.length)
      }
      
      const newSignal: Signal = {
        id: `${Date.now()}-${Math.random()}`,
        from,
        to,
        createdAt: Date.now(),
        speed: 2 + Math.random() * 2,
      }
      
      setSignals(prev => [...prev.slice(-2), newSignal])
      
      setTimeout(() => {
        setSignals(prev => prev.filter(s => s.id !== newSignal.id))
      }, 4000 + Math.random() * 2000)
    }

    const interval2 = setInterval(sendRandomSignal, 2000 + Math.random() * 1500)

    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
    }
  }, [institutions.length])

  const active = hovered ?? highlightedId
  const colors = ['#60A5FA', '#34D399', '#A78BFA', '#FBBF24', '#F472B6', '#22D3EE', '#4ADE80', '#FB923C', '#818CF8', '#2DD4BF']

  return (
    <section id="map" className="relative w-full py-12 overflow-hidden" style={{ background: 'linear-gradient(180deg, #061c38 0%, #0c4a6e 35%, #0c4a6e 65%, #061c38 100%)' }}>
      <div className="absolute inset-0" style={{ opacity: 0.6, background: 'linear-gradient(180deg, #061c38 0%, transparent 20%, transparent 80%, #061c38 100%)' }}>
        <svg className="w-full h-full">
          <defs>
            <linearGradient id="fadeGrid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c5933a" stopOpacity="0"/>
              <stop offset="20%" stopColor="#c5933a" stopOpacity="0.2"/>
              <stop offset="50%" stopColor="#c5933a" stopOpacity="0.15"/>
              <stop offset="80%" stopColor="#c5933a" stopOpacity="0.2"/>
              <stop offset="100%" stopColor="#c5933a" stopOpacity="0"/>
            </linearGradient>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="url(#fadeGrid)" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(251, 191, 36, 0.12) 50%, transparent 100%)' }}
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-amber-100">{t('landing.universityName')}</h2>
          <p className="text-amber-400/60 text-xs mt-1">{t('landing.network')} · {institutions.length}</p>
        </div>

        <div className="relative h-[300px]">
          <svg viewBox="0 0 400 180" className="w-full h-full">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="signalGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Curved connections between nodes */}
            {connections.map(([from, to], idx) => {
              if (!dotPositions[from] || !dotPositions[to]) return null
              const fromPos = dotPositions[from]
              const toPos = dotPositions[to]
              const midX = (fromPos.x + toPos.x) / 2 + curveOffsets[idx % curveOffsets.length].x
              const midY = (fromPos.y + toPos.y) / 2 + curveOffsets[idx % curveOffsets.length].y
              const path = `M${fromPos.x},${fromPos.y} Q${midX},${midY} ${toPos.x},${toPos.y}`
              return (
                <path
                  key={`conn-${idx}`}
                  d={path}
                  fill="none"
                  stroke="#C5933A"
                  strokeWidth={0.15}
                  opacity={0.25}
                />
              )
            })}

            {/* Curved lines to center */}
            {institutions.map((inst, idx) => {
              if (!dotPositions[idx]) return null
              const pos = dotPositions[idx]
              const midX = (centerX + pos.x) / 2 + curveOffsets[idx % curveOffsets.length].x * 0.5
              const midY = (centerY + pos.y) / 2 + curveOffsets[idx % curveOffsets.length].y * 0.5
              const path = `M${centerX},${centerY} Q${midX},${midY} ${pos.x},${pos.y}`
              return (
                <path
                  key={`center-${inst.id}`}
                  d={path}
                  fill="none"
                  stroke="#c5933a"
                  strokeWidth={0.3}
                  opacity={0.2}
                />
              )
            })}

            {/* Active signal curves */}
            {signals.map(signal => {
              let fromPos, toPos
              
              if (signal.to === -1) {
                fromPos = dotPositions[signal.from]
                toPos = { x: centerX, y: centerY }
              } else if (!dotPositions[signal.from] || !dotPositions[signal.to]) {
                return null
              } else {
                fromPos = dotPositions[signal.from]
                toPos = dotPositions[signal.to]
              }
              
              const midX = (fromPos.x + toPos.x) / 2 + (Math.random() - 0.5) * 15
              const midY = (fromPos.y + toPos.y) / 2 + (Math.random() - 0.5) * 15
              const duration = signal.speed
              return (
                <g key={signal.id}>
                  <path
                    d={`M${fromPos.x},${fromPos.y} Q${midX},${midY} ${toPos.x},${toPos.y}`}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={1.5}
                    strokeDasharray="4,6"
                    opacity={0.7}
                  />
                  <circle
                    r={5}
                    fill="#fbbf24"
                    filter="url(#signalGlow)"
                  >
                    <animateMotion
                      path={`M${fromPos.x},${fromPos.y} Q${midX},${midY} ${toPos.x},${toPos.y}`}
                      dur={`${duration}s`}
                      fill="freeze"
                      calcMode="spline"
                      keySplines="0.4 0 0.6 1"
                      keyTimes="0;1"
                    />
                  </circle>
                </g>
              )
            })}

            {/* Center node */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <circle r={30} fill="#fbbf24" opacity={0.1}>
                <animate attributeName="r" values="30;40;30" dur="4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.1;0.03;0.1" dur="4s" repeatCount="indefinite"/>
              </circle>
              <circle r={12} fill="#C5933A" filter="url(#glow)">
                <animate attributeName="r" values="12;14;12" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle r={5} fill="#fbbf24"/>
            </g>

            {/* Institution nodes */}
            {institutions.map((inst, idx) => {
              if (!dotPositions[idx]) return null
              const pos = dotPositions[idx]
              const isActive = active === inst.id
              const isSignaling = signals.some(s => s.from === idx || s.to === idx)
              const color = colors[idx % colors.length]

              return (
                <g
                  key={inst.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => {
                    setSelected(inst)
                    onPinClick?.(inst.id)
                  }}
                  onMouseEnter={() => setHovered(inst.id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {(isActive || isSignaling) && (
                    <circle r={14} fill={color} opacity={0.1}>
                      <animate attributeName="r" values="14;20;14" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.1;0.03;0.1" dur="2s" repeatCount="indefinite"/>
                    </circle>
                  )}
                  <circle r={5} fill={color} stroke="#050505" strokeWidth={0.8}/>
                  {isActive && (
                    <circle r={7} fill="none" stroke={color} strokeWidth={1.2} opacity={0.5}>
                      <animate attributeName="r" values="7;10;7" dur="1.8s" repeatCount="indefinite"/>
                    </circle>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <AnimatePresence>
          {hovered && !selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur rounded-lg px-4 py-2 border border-slate-700"
            >
              {(() => {
                const inst = institutions.find(i => i.id === hovered)
                if (!inst) return null
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[inst.type] }}/>
                    <div>
                      <p className="text-white text-sm font-medium">{inst.acronym}</p>
                      <p className="text-slate-400 text-xs">{inst.city}</p>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"/>
          <span>UCAR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"/>
          <span>{t('landing.faculties')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"/>
          <span>{t('landing.schools')}</span>
        </div>
      </div>
    </section>
  )
}