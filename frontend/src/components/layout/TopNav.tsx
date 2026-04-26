import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types'

// ── role-adaptive nav links ──────────────────────────────────────────────────

interface NavItem { label: string; href: string }

const NAV_BY_ROLE: Record<Role | 'public', NavItem[]> = {
  public: [
    { label: 'Accueil',       href: '/' },
    { label: 'À propos',      href: '/#about' },
  ],
  ucar_central: [
    { label: 'Accueil',       href: '/' },
    { label: 'Tableau de bord', href: '/central' },
    { label: 'Institutions',  href: '/central' },
    { label: 'Enseignants',   href: '/teacher' },
    { label: 'Étudiants',     href: '/student' },
  ],
  institution_admin: [
    { label: 'Accueil',       href: '/' },
    { label: 'Tableau de bord', href: '/institution/fsegt' },
    { label: 'Institution',   href: '/institution/fsegt' },
    { label: 'Enseignants',   href: '/teacher' },
    { label: 'Étudiants',     href: '/student' },
  ],
  enseignant: [
    { label: 'Accueil',       href: '/' },
    { label: 'Mes cours',     href: '/teacher' },
    { label: 'Mes étudiants', href: '/teacher' },
  ],
  etudiant: [
    { label: 'Accueil',       href: '/' },
    { label: 'Mon dossier',   href: '/student' },
    { label: 'Mes cours',     href: '/student' },
  ],
}

// ── UCAR columns icon ────────────────────────────────────────────────────────

function UCARIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="icon-g" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F7D98B"/>
          <stop offset="100%" stopColor="#C5933A"/>
        </linearGradient>
      </defs>
      {/* Pediment */}
      <path d="M2 11 L14 4 L26 11Z" fill="url(#icon-g)" opacity="0.9"/>
      {/* Three columns */}
      <rect x="4"  y="12" width="4" height="12" rx="0.5" fill="url(#icon-g)"/>
      <rect x="12" y="12" width="4" height="12" rx="0.5" fill="url(#icon-g)"/>
      <rect x="20" y="12" width="4" height="12" rx="0.5" fill="url(#icon-g)"/>
      {/* Base */}
      <rect x="2" y="24" width="24" height="2" rx="0.5" fill="url(#icon-g)"/>
    </svg>
  )
}

// ── component ────────────────────────────────────────────────────────────────

export function TopNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, role, institutionId, logout } = useAuthStore()
  const [searchOpen, setSearchOpen] = useState(false)

  const links = NAV_BY_ROLE[role ?? 'public']

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const handleInstitutionLink = (item: NavItem) => {
    if (item.href.includes('/institution/') && institutionId) {
      navigate(`/institution/${institutionId}`)
    } else {
      navigate(item.href)
    }
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-rule/60 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #0F1923 0%, #1B4F72 60%, #0F2A3A 100%)' }}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-[60px] flex items-center gap-6">

        {/* ── Left: brand ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <UCARIcon />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-semibold gold-shimmer tracking-tightish">
              CarthaVillage
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-paper/50 num leading-none mt-0.5">
              Université de Carthage
            </p>
          </div>
        </Link>

        {/* ── Centre: nav links ── */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {links.map((item) => {
            const active = isActive(item.href)
            return (
              <button
                key={item.label}
                onClick={() => handleInstitutionLink(item)}
                className={`relative px-3 py-1.5 text-[13px] transition-colors rounded-md ${
                  active
                    ? 'text-paper font-medium'
                    : 'text-paper/60 hover:text-paper/90 hover:bg-paper/5'
                }`}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute left-3 right-3 -bottom-[1px] h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #C5933A, #F7D98B, #C5933A)' }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Right: search + user ── */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="hidden md:flex items-center gap-2 text-[12px] text-paper/60 hover:text-paper transition-colors px-2 py-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
            </svg>
            <span>Recherche</span>
          </button>

          {user ? (
            <>
              <div className="hidden md:block w-px h-4 bg-paper/20" />
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C5933A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>
                </svg>
                <span className="text-[12px] text-paper/80 max-w-[120px] truncate">{user}</span>
                <button
                  onClick={async () => { await logout(); navigate('/') }}
                  className="text-[11px] text-paper/40 hover:text-paper/70 transition-colors ml-1"
                  title="Déconnexion"
                >
                  ×
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="text-[12px] px-3 py-1.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
