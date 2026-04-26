import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'
import { UCAR_INSTITUTIONS } from '@/data/institutions'
import { useTranslation } from 'react-i18next'

interface NavItem { labelKey: string; href: string }

const NAV_BY_ROLE: Record<Role | 'public', NavItem[]> = {
  public: [
    { labelKey: 'nav.home',       href: '/' },
    { labelKey: 'nav.about',      href: '/#about' },
  ],
  ucar_central: [
    { labelKey: 'Accueil',         href: '/' },
    { labelKey: 'Tableau de bord', href: '/central' },
    { labelKey: 'Intelligence',    href: '/strategy' },
    { labelKey: 'Socio-Culturel',  href: '/socio' },
  ],
  institution_admin: [
    { labelKey: 'nav.home',        href: '/' },
    { labelKey: 'nav.dashboard',   href: '/institution/placeholder' },
    { labelKey: 'nav.departments', href: '/admin/departments' },
    { labelKey: 'nav.staff',       href: '/admin/staff' },
    { labelKey: 'nav.students',    href: '/admin/students' },
    { labelKey: 'Socio-Culturel',  href: '/socio' },
  ],
  enseignant: [
    { labelKey: 'nav.home',       href: '/' },
    { labelKey: 'nav.courses',    href: '/teacher' },
    { labelKey: 'nav.grades',     href: '/teacher/grades' },
    { labelKey: 'nav.absences',   href: '/teacher/absences' },
  ],
  etudiant: [
    { labelKey: 'nav.home',       href: '/' },
    { labelKey: 'nav.myRecord',   href: '/student' },
    { labelKey: 'nav.myCourses',  href: '/student' },
  ],
}

function UCARIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="icon-g" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D98B"/>
          <stop offset="100%" stopColor="#C5933A"/>
        </linearGradient>
      </defs>
      <path d="M2 11 L14 4 L26 11Z" fill="url(#icon-g)" opacity="0.9"/>
      <rect x="4"  y="12" width="4" height="12" rx="0.5" fill="url(#icon-g)"/>
      <rect x="12" y="12" width="4" height="12" rx="0.5" fill="url(#icon-g)"/>
      <rect x="20" y="12" width="4" height="12" rx="0.5" fill="url(#icon-g)"/>
      <rect x="2"  y="24" width="24" height="2"  rx="0.5" fill="url(#icon-g)"/>
    </svg>
  )
}

function LangToggle() {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const toggle = () => i18n.changeLanguage(isEn ? 'fr' : 'en')

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 transition-colors"
      title={isEn ? 'Passer en français' : 'Switch to English'}
    >
      <span className={isEn ? 'opacity-50' : 'opacity-100'}>FR</span>
      <span className="opacity-30">|</span>
      <span className={isEn ? 'opacity-100' : 'opacity-50'}>EN</span>
    </button>
  )
}

export function TopNav() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, role, institutionId, logout } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const links = NAV_BY_ROLE[role ?? 'public']

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [base] = href.split('?')
      return pathname === base || pathname.startsWith(base + '/')
    }
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  const handleNavigation = (item: NavItem) => {
    if (item.href.includes('/institution/')) {
      const targetId = institutionId || item.href.split('/institution/')[1]
      if (targetId && targetId !== 'placeholder') {
        navigate(`/institution/${targetId}`)
      } else {
        navigate('/central')
      }
    } else {
      navigate(item.href)
    }
  }

  const results = query.trim().length >= 2
    ? UCAR_INSTITUTIONS.filter(i =>
        i.acronym.toLowerCase().includes(query.toLowerCase()) ||
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.city.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : []

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80)
  }, [searchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-white/10 shadow-sm"
        style={{ background: '#0F1923' }}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center gap-4">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <UCARIcon />
            <div className="leading-tight">
              <p className="font-display text-[17px] font-semibold gold-shimmer tracking-tightish">
                CarthaVillage
              </p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40 num leading-none mt-0.5">
                {t('nav.universityOf')}
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {links.map((item) => (
              <button
                key={item.labelKey}
                onClick={() => handleNavigation(item)}
                className={`relative px-3 py-1.5 text-[12.5px] rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-white font-medium'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                }`}
              >
                {t(item.labelKey)}
                {isActive(item.href) && (
                  <span
                    className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #C5933A, #F7D98B, #C5933A)' }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right: lang + search + auth */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">

            <LangToggle />

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full border border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <span>{t('nav.search')}</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:block w-px h-4 bg-white/20" />
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5933A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>
                  </svg>
                  <span className="text-[12px] text-white/80 max-w-[120px] truncate">{user}</span>
                  <button
                    onClick={async () => { await logout(); navigate('/') }}
                    className="text-[11px] text-white/40 hover:text-white/70 transition-colors ml-1"
                    title={t('nav.logout')}
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-[12px] px-4 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          style={{ background: 'rgba(15,25,35,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setQuery('') } }}
        >
          <div className="w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ background: '#0F1923' }}>
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7A8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholderShort')}
                className="flex-1 text-[14px] text-white bg-transparent focus:outline-none placeholder:text-white/30"
              />
              <button
                onClick={() => { setSearchOpen(false); setQuery('') }}
                className="text-[11px] text-white/40 hover:text-white/60 px-1.5 py-0.5 rounded border border-white/10"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <div className="divide-y divide-white/10">
                {results.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      setSearchOpen(false)
                      setQuery('')
                      navigate(`?inst=${inst.id}`)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-ink"
                      style={{ background: 'linear-gradient(135deg, #C5933A, #F7D98B)' }}
                    >
                      {inst.acronym.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{inst.acronym}</p>
                      <p className="text-[11px] text-white/50 truncate">{inst.name}</p>
                    </div>
                    <span className="text-[10px] text-white/40 num shrink-0">{inst.city}</span>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="px-4 py-8 text-center text-[13px] text-white/40">
                {t('nav.noResults')} "{query}"
              </div>
            ) : (
              <div className="px-4 py-5">
                <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-3">{t('nav.quickAccess')}</p>
                <div className="flex flex-wrap gap-2">
                  {['INSAT', "SUP'COM", 'EPT', 'IHEC', 'INAT', 'FSB'].map(name => (
                    <button
                      key={name}
                      onClick={() => setQuery(name)}
                      className="px-3 py-1.5 rounded-full border border-white/10 text-[12px] text-white/60 hover:border-gold/40 hover:text-gold transition-colors"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}