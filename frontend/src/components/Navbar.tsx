import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UCAR_INSTITUTIONS } from '@/data/institutions'
import { useTranslation } from 'react-i18next'

interface Props {
  variant?: 'light' | 'dark'
}

function UCARIcon({ dark = false }) {
  const c1 = dark ? '#F7D98B' : '#C5933A'
  const c2 = dark ? '#C5933A' : '#9E7520'
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="lnav-icon-g" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={c1}/>
          <stop offset="100%" stopColor={c2}/>
        </linearGradient>
      </defs>
      <path d="M2 11 L14 4 L26 11Z" fill="url(#lnav-icon-g)" opacity="0.9"/>
      <rect x="4"  y="12" width="4" height="12" rx="0.5" fill="url(#lnav-icon-g)"/>
      <rect x="12" y="12" width="4" height="12" rx="0.5" fill="url(#lnav-icon-g)"/>
      <rect x="20" y="12" width="4" height="12" rx="0.5" fill="url(#lnav-icon-g)"/>
      <rect x="2"  y="24" width="24" height="2"  rx="0.5" fill="url(#lnav-icon-g)"/>
    </svg>
  )
}

function LangToggle({ isDark }: { isDark: boolean }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language === 'en'
  const toggle = () => i18n.changeLanguage(isEn ? 'fr' : 'en')

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full border transition-colors ${
        isDark
          ? 'border-white/15 text-white/60 hover:text-white/90 hover:border-white/30'
          : 'border-rule text-ink3 hover:text-ink hover:border-ink3/40'
      }`}
      title={isEn ? 'Passer en français' : 'Switch to English'}
    >
      <span className={isEn ? 'opacity-50' : 'opacity-100'}>FR</span>
      <span className="opacity-30">|</span>
      <span className={isEn ? 'opacity-100' : 'opacity-50'}>EN</span>
    </button>
  )
}

export default function Navbar({ variant = 'light' }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, role } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isDark = variant === 'dark'
  const textColor = isDark ? 'text-white/60' : 'text-ink2/70'
  const hoverColor = isDark ? 'hover:text-white/90' : 'hover:text-ink'
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-ink/5'

  const dashHref = role === 'ucar_central' ? '/central'
    : role === 'institution_admin' ? '/institution/fsegt'
    : role === 'enseignant' ? '/teacher'
    : role === 'etudiant' ? '/student'
    : null

  // Search results
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navLinks = [
    { label: t('nav.home'),          href: '/' },
    { label: t('nav.map'),           href: '/#map' },
    { label: t('nav.institutions'),  href: '/#institutions' },
    { label: t('nav.opportunities'), href: '/#opportunities' },
    { label: t('nav.feedback'),      href: '/#feedback' },
  ]

  const navStyle = isDark
    ? { background: 'linear-gradient(135deg, #0F1923 0%, #1B4F72 60%, #0F2A3A 100%)' }
    : { background: '#F4EBD5', borderBottom: '1px solid #D6D1C7' }

  return (
    <>
      <header className="sticky top-0 z-40 shadow-sm" style={navStyle}>
        <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center gap-4">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <UCARIcon dark={isDark} />
            <div className="leading-tight">
              <p className={`font-display text-[17px] font-semibold tracking-tightish ${isDark ? 'gold-shimmer' : 'text-ink'}`}>
                CarthaVillage
              </p>
              <p className={`text-[9px] uppercase tracking-[0.18em] num leading-none mt-0.5 ${isDark ? 'text-white/40' : 'text-ink3'}`}>
                {t('nav.universityOf')}
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map(item => (
              <a
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 text-[12.5px] rounded-md transition-colors ${textColor} ${hoverColor} ${hoverBg}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: lang + search + auth */}
          <div className="flex items-center gap-2.5 shrink-0 ml-auto">

            <LangToggle isDark={isDark} />

            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`hidden md:flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                isDark
                  ? 'border-white/15 text-white/50 hover:text-white/80 hover:border-white/30'
                  : 'border-rule text-ink3 hover:text-ink hover:border-ink3/40'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <span>{t('nav.search')}</span>
              <kbd className={`text-[9px] px-1 py-0.5 rounded border ${isDark ? 'border-white/15 text-white/30' : 'border-rule text-ink3/50'}`}>⌘K</kbd>
            </button>

            {/* Auth */}
            {user && dashHref ? (
              <button
                onClick={() => navigate(dashHref)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full transition-all"
                style={{ background: 'linear-gradient(135deg,#C5933A,#9E7520)', color: '#F4EBD5' }}
              >
                {t('nav.dashboard')}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M9 7h8v8"/>
                </svg>
              </button>
            ) : (
              <Link
                to="/login"
                className={`text-[12px] px-4 py-1.5 rounded-full border transition-colors ${
                  isDark
                    ? 'border-gold/40 text-gold hover:bg-gold/10'
                    : 'border-gold/60 text-gold hover:bg-gold/8 bg-white/40'
                }`}
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
          style={{ background: 'rgba(15,25,35,0.55)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setQuery('') } }}
        >
          <div className="w-full max-w-[560px] mx-4 rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ background: '#F4EBD5' }}>
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-rule">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7A8D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="flex-1 text-[14px] text-ink bg-transparent focus:outline-none placeholder:text-ink3"
              />
              <button
                onClick={() => { setSearchOpen(false); setQuery('') }}
                className="text-[11px] text-ink3 hover:text-ink px-1.5 py-0.5 rounded border border-rule"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <div className="divide-y divide-rule">
                {results.map(inst => (
                  <button
                    key={inst.id}
                    onClick={() => {
                      setSearchOpen(false)
                      setQuery('')
                      document.getElementById('institutions')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-paper2/60 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #1B4F72, #0F1923)' }}
                    >
                      {inst.acronym.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink truncate">{inst.acronym}</p>
                      <p className="text-[11px] text-ink3 truncate">{inst.name}</p>
                    </div>
                    <span className="text-[10px] text-ink3 num shrink-0">{inst.city}</span>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="px-4 py-8 text-center text-[13px] text-ink3">
                {t('nav.noResults')} «{query}»
              </div>
            ) : (
              <div className="px-4 py-5">
                <p className="text-[11px] uppercase tracking-widest text-ink3 font-medium mb-3">{t('nav.quickAccess')}</p>
                <div className="flex flex-wrap gap-2">
                  {['INSAT', "SUP'COM", 'EPT', 'IHEC', 'INAT', 'FSB'].map(name => (
                    <button
                      key={name}
                      onClick={() => setQuery(name)}
                      className="px-3 py-1.5 rounded-full border border-rule text-[12px] text-ink2 hover:border-gold/40 hover:text-gold transition-colors bg-white/60"
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
