import { Bell, Search, ChevronDown, LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ─── Role labels displayed under the user's name ───────────────────────────
const ROLE_LABEL: Record<string, string> = {
  ucar_central:      'Présidence · UCAR',
  institution_admin: 'Direction · FSEGT',
  enseignant:        'Enseignant · FSEGT',
  etudiant:          'Étudiant · FSEGT',
}

type NavItem = { label: string; to: string; children?: { label: string; to: string }[] }

// ─── Per-role navigation items ──────────────────────────────────────────────
const NAV_ITEMS: Record<string, NavItem[]> = {
  ucar_central: [
    { label: 'Accueil',   to: '/central' },
    { label: 'Dashboard', to: '/central' },
    {
      label: 'Établissements', to: '/central',
      children: [
        { label: 'FSEGT',  to: '/institution/fsegt' },
        { label: 'ISEAHC', to: '/central' },
        { label: 'ISLT',   to: '/central' },
      ],
    },
    { label: 'Enseignants', to: '/central' },
    { label: 'Étudiants',   to: '/central' },
    { label: 'Rapports',    to: '/central' },
  ],
  institution_admin: [
    { label: 'Accueil',           to: '/institution/fsegt' },
    { label: 'Mon établissement', to: '/institution/fsegt' },
    { label: 'Enseignants',       to: '/institution/fsegt' },
    { label: 'Étudiants',         to: '/institution/fsegt' },
  ],
  enseignant: [
    { label: 'Accueil',   to: '/teacher' },
    { label: 'Mes cours', to: '/teacher' },
    { label: 'Étudiants', to: '/teacher' },
  ],
  etudiant: [
    { label: 'Accueil',      to: '/student' },
    { label: 'Mon parcours', to: '/student' },
    { label: 'Mes notes',    to: '/student' },
  ],
}

export default function Topbar() {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  // Derive initials from the user's display name
  const initials = user
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  const navItems = role ? (NAV_ITEMS[role] ?? []) : []
  const homeRoute = navItems[0]?.to ?? '/'

  return (
    <header className="w-full bg-white shadow-sm">

      {/* ══════════════════════════════════════════════════════
          TOP STRIP — logo left · nav center/right · actions far-right
          Mirrors the Université de Carthage two-zone layout.
      ══════════════════════════════════════════════════════ */}
      <div className="mx-auto flex max-w-screen-2xl items-stretch px-6">

        {/* ── Logo block ───────────────────────────────────── */}
        <NavLink
          to={homeRoute}
          className="flex shrink-0 items-center gap-3 py-4 pr-8 select-none border-r border-gray-100"
        >
          {/* Geometric monogram — echoes the pillar/arch motif of UdC */}
          <div className="relative flex h-12 w-12 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-sm border-2 border-[#1a3a6b]" />
            {/* Inner accent bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#c8a951]" />
            <span className="relative text-xl font-black text-[#1a3a6b] tracking-tight leading-none">
              CV
            </span>
          </div>

          {/* Word-mark */}
          <div className="leading-tight">
            <p className="text-[17px] font-black tracking-[0.12em] text-[#1a3a6b] uppercase leading-none">
              CarthaVillage
            </p>
            <p className="text-[10px] font-medium text-[#c8a951] tracking-widest uppercase leading-tight mt-0.5">
              Université de Carthage
            </p>
          </div>
        </NavLink>

        {/* ── Main nav — fills remaining width, links spread out ── */}
        <nav className="flex flex-1 items-stretch overflow-x-auto scrollbar-none">
          {navItems.map((item) =>
            item.children ? (
              /* Dropdown nav item */
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'group flex h-full items-center gap-1 px-4 xl:px-5',
                      'border-b-[3px] border-transparent',
                      'text-[12px] font-bold uppercase tracking-[0.08em] text-[#1a3a6b] whitespace-nowrap',
                      'transition-all hover:border-[#c8a951] hover:text-[#1a3a6b]',
                      'focus:outline-none',
                    )}
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={0}
                  className="min-w-[200px] rounded-none rounded-b-sm border-0 border-t-[3px] border-t-[#c8a951] p-0 shadow-xl"
                >
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.label} asChild className="rounded-none p-0">
                      <NavLink
                        to={child.to}
                        className="block cursor-pointer px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#1a3a6b] transition-colors hover:bg-[#f0f4fa] hover:text-[#c8a951]"
                      >
                        {child.label}
                      </NavLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Regular nav link */
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex h-full items-center px-4 xl:px-5',
                    'border-b-[3px]',
                    'text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap',
                    'transition-all',
                    isActive
                      ? 'border-[#1a3a6b] text-[#1a3a6b]'
                      : 'border-transparent text-[#1a3a6b] hover:border-[#c8a951] hover:text-[#1a3a6b]',
                  )
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        {/* ── Right-side actions ───────────────────────────── */}
        <div className="flex shrink-0 items-center gap-0.5 pl-4">

          {/* Search — icon only, like the UdC reference */}
          <button className="flex h-full items-center px-3 text-[#1a3a6b] transition-colors hover:bg-gray-50">
            <Search className="h-4 w-4" />
          </button>

          {/* Bell with unread badge */}
          <button className="relative flex h-full items-center px-3 text-[#1a3a6b] transition-colors hover:bg-gray-50">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-3.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
              3
            </span>
          </button>

          <div className="mx-1 h-6 w-px bg-gray-200" />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-3 transition-colors hover:bg-gray-50 focus:outline-none">
                <Avatar className="h-8 w-8 rounded-sm">
                  <AvatarFallback className="rounded-sm bg-[#1a3a6b] text-white text-[11px] font-black">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left lg:flex">
                  <span className="text-[12px] font-bold leading-tight text-[#1a3a6b] uppercase tracking-wide">
                    {user}
                  </span>
                  <span className="text-[10px] leading-tight text-gray-400 tracking-wide">
                    {role ? ROLE_LABEL[role] : ''}
                  </span>
                </div>
                <ChevronDown className="hidden h-3 w-3 text-gray-400 lg:block" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 rounded-none rounded-b-sm border-0 border-t-[3px] border-t-[#c8a951] p-0 shadow-xl"
            >
              <DropdownMenuLabel className="px-5 py-3.5 font-normal">
                <p className="text-[13px] font-bold uppercase tracking-wide text-[#1a3a6b]">{user}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 tracking-wide">{role ? ROLE_LABEL[role] : ''}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="m-0 bg-gray-100" />
              <DropdownMenuItem
                className="cursor-pointer gap-2 rounded-none px-5 py-3 text-[12px] font-semibold uppercase tracking-wide text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={() => { logout(); navigate('/login') }}
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  )
}   