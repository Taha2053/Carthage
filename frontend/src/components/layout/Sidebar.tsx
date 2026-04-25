import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Building2, GraduationCap, User, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { role: 'ucar_central', label: 'Tableau de bord', to: '/central', icon: LayoutDashboard },
  { role: 'institution_admin', label: 'Mon établissement', to: '/institution/fsegt', icon: Building2 },
  { role: 'enseignant', label: 'Mes cours', to: '/teacher', icon: GraduationCap },
  { role: 'etudiant', label: 'Mon parcours', to: '/student', icon: User },
]

export default function Sidebar() {
  const { role, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const items = navItems.filter((item) => item.role === role)

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-800 text-white text-sm font-bold">
          ن
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-gray-900">NABD</span>
          <span className="text-xs text-gray-400">نبض — Université de Carthage</span>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
