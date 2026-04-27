import { useState, useEffect } from 'react'
import { Calendar, Users, Globe, ArrowRight, Leaf, MapPin, Handshake } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MOCK_NEWS = [
  {
    id: 1,
    category: 'Environnement',
    title: 'Lancement du programme "Campus Vert Carthage"',
    desc: 'Installation de panneaux solaires et réduction de l\'empreinte carbone de 15% sur les 5 campus principaux.',
    date: '24 Oct 2026',
    icon: Leaf,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    color: 'text-ok',
    bg: 'bg-ok/10',
    border: 'border-ok/20'
  },
  {
    id: 2,
    category: 'Partenariat International',
    title: 'Accord de double diplomation avec l\'Université Paris-Saclay',
    desc: 'Nouvelles opportunités de bourses d\'excellence pour les étudiants en Master d\'Ingénierie et IA.',
    date: '18 Oct 2026',
    icon: Handshake,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    color: 'text-gold',
    bg: 'bg-gold/10',
    border: 'border-gold/20'
  },
  {
    id: 3,
    category: 'Socio-Culturel',
    title: 'Festival des Arts Universitaires',
    desc: 'Une semaine dédiée à la créativité étudiante : théâtre, musique, et exposition d\'arts plastiques.',
    date: '12 Oct 2026',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
    color: 'text-warn',
    bg: 'bg-warn/10',
    border: 'border-warn/20'
  },
  {
    id: 4,
    category: 'Recherche & Innovation',
    title: 'Nouveau Hub Technologique à l\'INSAT',
    desc: 'Ouverture du laboratoire de recherche dédié aux technologies de l\'eau et à l\'agriculture intelligente.',
    date: '05 Oct 2026',
    icon: Globe,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    color: 'text-sea',
    bg: 'bg-sea/10',
    border: 'border-sea/20'
  },
  {
    id: 5,
    category: 'Opportunité',
    title: 'Appel à candidatures : Bourses Erasmus+ 2027',
    desc: 'Le programme de mobilité étudiante et enseignante est ouvert pour l\'année universitaire 2026-2027.',
    date: '01 Oct 2026',
    icon: MapPin,
    image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&q=80',
    color: 'text-crit',
    bg: 'bg-crit/10',
    border: 'border-crit/20'
  }
]

export default function SocioCulturalCarousel() {
  const { t } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % MOCK_NEWS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 relative border-t border-rule bg-paper">
      <div className="max-w-[1400px] mx-auto px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-ink3 num">
                Rayonnement de l'Université
              </span>
            </div>
            <h2 className="font-display text-[32px] md:text-[40px] font-medium tracking-tighter2 text-ink leading-tight">
              Vie Étudiante, Partenariats &<br/>
              <span className="gold-shimmer">Responsabilité Sociétale</span>
            </h2>
          </div>
          <button className="flex items-center gap-2 text-[13px] text-ink2 hover:text-gold transition-colors pb-2">
            Voir toute l'actualité
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden group">
          <div 
            className="flex transition-transform duration-700 ease-out gap-6"
            style={{ transform: `translateX(calc(-${activeIndex * 100}% - ${activeIndex * 24}px))` }}
          >
            {MOCK_NEWS.map((news) => {
              const Icon = news.icon
              return (
                <div 
                  key={news.id}
                  className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] flex-shrink-0"
                >
                  <div className="group/card bg-paper border border-rule hover:border-gold/30 rounded-2xl overflow-hidden transition-all hover:shadow-lg h-full flex flex-col cursor-pointer">
                    
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-ink/20 group-hover/card:bg-transparent transition-colors z-10" />
                      <img 
                        src={news.image} 
                        alt={news.title}
                        className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700"
                      />
                      <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold backdrop-blur-md bg-paper/90 ${news.color} shadow-sm flex items-center gap-1.5`}>
                        <Icon size={12} />
                        {news.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-ink3 font-medium mb-3">
                        <Calendar size={12} />
                        {news.date}
                      </div>
                      
                      <h3 className="font-display text-[18px] font-semibold tracking-tightish text-ink leading-snug mb-3 group-hover/card:text-gold transition-colors">
                        {news.title}
                      </h3>
                      
                      <p className="text-[13px] text-ink2 leading-relaxed mb-6 flex-1">
                        {news.desc}
                      </p>

                      <div className="pt-4 border-t border-rule mt-auto flex justify-between items-center text-[12px] text-ink3 group-hover/card:text-ink transition-colors">
                        <span className="font-medium">Lire la suite</span>
                        <ArrowRight size={14} className="transform group-hover/card:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {MOCK_NEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full ${
                  activeIndex === idx 
                    ? 'w-6 h-1.5 bg-gold' 
                    : 'w-1.5 h-1.5 bg-rule hover:bg-gold/50'
                }`}
                aria-label={`Aller à la diapositive ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
