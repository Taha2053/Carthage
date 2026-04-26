import { useState, useEffect } from 'react'
import { UCAR_INSTITUTIONS, TYPE_COLOR, TYPE_LABEL } from '@/data/institutions'
import type { PublicInstitution } from '@/data/institutions'
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  onPinClick?: (id: string) => void
  highlightedId?: string | null
  anomalies?: Record<string, { severity: 'high' | 'medium' | 'low', message: string }>
}

const HEALTH_COLOR: Record<string, string> = {
  good: '#10B981',
  warning: '#F59E0B',
  critical: '#EF4444',
  no_data: '#6B7280',
}

export default function InstitutionMap({ onPinClick, highlightedId, anomalies = {} }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<PublicInstitution | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const active = hovered ?? highlightedId
  const institutions = UCAR_INSTITUTIONS

  const totalInstitutions = institutions.length
  const totalStudents = institutions.reduce((sum, i) => sum + i.studentCount, 0)
  const criticalCount = Object.values(anomalies).filter(a => a.severity === 'high').length

  return (
    <section className="relative w-full py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)' }}>
      
      {/* Animated background mesh */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500/10"/>
            </pattern>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-amber-500/5"/>
          <circle cx="50%" cy="50%" r="60%" fill="url(#glow)"/>
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              background: i % 2 === 0 ? '#F59E0B' : '#10B981',
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-medium mb-3">
            Cartographie temps réel
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              Université de Carthage
            </span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Surveillance en temps réel de {totalInstitutions} établissements · {totalStudents.toLocaleString('fr-FR')} étudiants
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10"
        >
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"/>
            <span className="text-sm font-medium">{totalInstitutions} établissements</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
            <span className="text-sm font-medium">Fonctionnels</span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4"/>
              <span className="text-sm font-medium">{criticalCount} alertes</span>
            </div>
          )}
        </motion.div>

        {/* Map Container */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
                onClick={() => setSelected(null)}
              >
                <motion.div 
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{selected.acronym}</h3>
                      <p className="text-slate-400 text-sm">{selected.name}</p>
                    </div>
                    <button 
                      onClick={() => setSelected(null)}
                      className="text-slate-500 hover:text-white transition-colors text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Étudiants</p>
                      <p className="text-xl font-bold text-white">{selected.studentCount.toLocaleString('fr-FR')}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Ville</p>
                      <p className="text-xl font-bold text-white">{selected.city}</p>
                    </div>
                  </div>

                  {anomalies[selected.id] && (
                    <div className={`rounded-xl p-4 flex items-start gap-3 ${
                      anomalies[selected.id].severity === 'high' ? 'bg-red-900/20 border border-red-800' :
                      anomalies[selected.id].severity === 'medium' ? 'bg-amber-900/20 border border-amber-800' :
                      'bg-emerald-900/20 border border-emerald-800'
                    }`}>
                      <AlertTriangle className={`w-5 h-5 shrink-0 ${
                        anomalies[selected.id].severity === 'high' ? 'text-red-400' :
                        anomalies[selected.id].severity === 'medium' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}/>
                      <div>
                        <p className={`text-sm font-medium ${
                          anomalies[selected.id].severity === 'high' ? 'text-red-300' :
                          anomalies[selected.id].severity === 'medium' ? 'text-amber-300' :
                          'text-emerald-300'
                        }`}>
                          {anomalies[selected.id].severity === 'high' ? 'Alerte critique' : 'Avertissement'}
                        </p>
                        <p className="text-slate-400 text-sm mt-1">{anomalies[selected.id].message}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => onPinClick?.(selected.id)}
                    className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 font-semibold hover:from-amber-400 hover:to-yellow-400 transition-all"
                  >
                    Voir tableau de bord →
                  </button>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Main Map SVG */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full aspect-[2/1] lg:aspect-[2.5/1]"
          >
            <svg
              viewBox="0 0 400 180"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Tunisia shape */}
                <clipPath id="tunisiaClip">
                  <path d="M 60 25 L 85 18 L 115 22 L 140 28 L 165 30 L 190 35 L 210 50 L 225 70 L 230 95 L 225 120 L 220 145 L 205 160 L 180 170 L 150 175 L 120 172 L 95 165 L 75 150 L 60 130 L 50 105 L 48 75 L 52 50 Z" />
                </clipPath>
                
                {/* Gradient for land */}
                <linearGradient id="tunisiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B"/>
                  <stop offset="50%" stopColor="#0F172A"/>
                  <stop offset="100%" stopColor="#1E293B"/>
                </linearGradient>
                
                {/* Glow filter */}
                <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                </filter>
                
                {/* Pulse animation */}
                <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background land */}
              <g clipPath="url(#tunisiaClip)">
                <rect x="0" y="0" width="400" height="180" fill="url(#tunisiaGrad)"/>
                
                {/* Grid lines */}
                {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
                  <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="#334155" strokeWidth="0.3" strokeDasharray="2,4" opacity="0.3"/>
                ))}
                {[20, 45, 70, 95, 120, 145, 170].map(y => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#334155" strokeWidth="0.3" strokeDasharray="2,4" opacity="0.3"/>
                ))}
              </g>
              
              {/* Coastline */}
              <path 
                d="M 60 25 L 85 18 L 115 22 L 140 28 L 165 30 L 190 35 L 210 50 L 225 70 L 230 95 L 225 120 L 220 145 L 205 160 L 180 170 L 150 175 L 120 172 L 95 165 L 75 150 L 60 130 L 50 105 L 48 75 L 52 50 Z"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
                className="drop-shadow-lg"
              />
              
              {/* Region polygons - styled as elegant shapes */}
              <g filter="url(#softGlow)">
                {/* North East Region */}
                <path 
                  d="M 180 45 L 200 40 L 220 50 L 225 70 L 215 85 L 190 80 L 175 65 Z"
                  fill="#0F766E"
                  opacity="0.15"
                  stroke="#14B8A6"
                  strokeWidth="0.8"
                  strokeDasharray="3,3"
                />
                
                {/* Golf of Tunis */}
              </g>

              {/* City labels */}
              <g fontSize="5" fill="#94A3B8" fontFamily="system-ui" textAnchor="middle">
                <text x="90" y="35">BIZERTE</text>
                <text x="200" y="75">TUNIS</text>
                <text x="135" y="125">NABEUL</text>
                <text x="85" y="95">MATEUR</text>
                <text x="225" y="135">SFAX</text>
              </g>

              {/* Institution markers */}
              <g className="cursor-pointer">
                {institutions.map((inst, idx) => {
                  const anomaly = anomalies[inst.id]
                  const isActive = active === inst.id
                  const hasAnomaly = !!anomaly
                  const baseColor = TYPE_COLOR[inst.type]
                  const anomalyColor = anomaly?.severity === 'high' ? '#EF4444' : anomaly?.severity === 'medium' ? '#F59E0B' : '#10B981'
                  
                  // Calculate position based on normalized coordinates
                  const x = 50 + (inst.pin.x / 280) * 300
                  const y = 20 + (inst.pin.y / 160) * 140
                  
                  return (
                    <g 
                      key={inst.id}
                      transform={`translate(${x}, ${y})`}
                      onMouseEnter={() => setHovered(inst.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelected(inst)}
                    >
                      {/* Glow effect for highlighted/hovered */}
                      {(isActive || hasAnomaly) && (
                        <>
                          <circle 
                            r={isActive ? 12 : 8} 
                            fill={hasAnomaly ? anomalyColor : baseColor}
                            opacity="0.15"
                          >
                            <animate 
                              attributeName="r" 
                              values={`${isActive ? 8 : 5};${isActive ? 14 : 10};${isActive ? 8 : 5}`}
                              dur="2s"
                              repeatCount="indefinite"
                            />
                            <animate 
                              attributeName="opacity" 
                              values="0.2;0.05;0.2"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                          {hasAnomaly && (
                            <g transform="translate(6, -6)">
                              <polygon 
                                points="0,0 5,-5 10,0 5,5" 
                                fill={anomalyColor}
                                className="animate-pulse"
                              >
                                <animate 
                                  attributeName="points"
                                  values="0,0 5,-3 10,0 5,3;0,0 7,-7 14,0 7,7;0,0 5,-3 10,0 5,3"
                                  dur="1s"
                                  repeatCount="indefinite"
                                />
                              </polygon>
                            </g>
                          )}
                        </>
                      )}
                      
                      {/* Main marker - hexagon shape */}
                      <g transform="rotate(30)">
                        <polygon
                          points={isActive ? "0,-6 5.2,-3 5.2,3 0,6 -5.2,3 -5.2,-3" : "0,-4 3.5,-2 3.5,2 0,4 -3.5,2 -3.5,-2"}
                          fill={hasAnomaly ? anomalyColor : baseColor}
                          stroke="#0F172A"
                          strokeWidth="0.8"
                          filter="url(#softGlow)"
                        />
                      </g>
                      
                      {/* Label on hover */}
                      {isActive && (
                        <g transform={`translate(0, -12)`}>
                          <rect
                            x={-inst.acronym.length * 2.5}
                            y="-4"
                            width={inst.acronym.length * 5}
                            height="8"
                            rx="2"
                            fill="#1E293B"
                            stroke={baseColor}
                            strokeWidth="0.5"
                          />
                          <text
                            y="1.5"
                            fontSize="3.5"
                            fill="white"
                            fontFamily="system-ui"
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            {inst.acronym}
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </g>
            </svg>
          </motion.div>

          {/* Hover tooltip */}
          <AnimatePresence>
            {hovered && !selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-700 shadow-2xl z-10"
              >
                {(() => {
                  const inst = institutions.find(i => i.id === hovered)
                  const anomaly = anomalies[inst?.id || '']
                  if (!inst) return null
                  return (
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLOR[inst.type] }}/>
                      <div>
                        <p className="text-white font-semibold text-sm">{inst.name}</p>
                        <p className="text-slate-400 text-xs">{inst.city} · {inst.studentCount.toLocaleString('fr-FR')} étudiants</p>
                      </div>
                      {anomaly && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                          anomaly.severity === 'high' ? 'bg-red-900/30 text-red-400' :
                          anomaly.severity === 'medium' ? 'bg-amber-900/30 text-amber-400' :
                          'bg-emerald-900/30 text-emerald-400'
                        }`}>
                          {anomaly.severity === 'high' ? <TrendingDown className="w-3 h-3"/> :
                           anomaly.severity === 'medium' ? <Minus className="w-3 h-3"/> :
                           <TrendingUp className="w-3 h-3"/>}
                          <span className="text-xs font-medium">{anomaly.severity === 'high' ? 'Critique' : 'Warning'}</span>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 mt-10"
        >
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-3 h-3 rounded bg-amber-500"/>
            <span className="text-xs">Faculté</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-3 h-3 rounded bg-emerald-500"/>
            <span className="text-xs">École</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-3 h-3 rounded bg-cyan-500"/>
            <span className="text-xs">Institut</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-3 h-3 rounded bg-rose-500"/>
            <span className="text-xs">ISIT</span>
          </div>
        </motion.div>

        {/* Interaction hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center text-slate-500 text-xs mt-8"
        >
          Survolez les marqueurs pour voir les détails · Cliquez pour le tableau de bord complet
        </motion.p>
      </div>
    </section>
  )
}