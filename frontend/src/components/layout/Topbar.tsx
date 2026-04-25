import { Bell } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNavigate } from 'react-router-dom'

const ROLE_LABEL: Record<string, string> = {
  ucar_central: 'Présidence UCAR',
  institution_admin: 'Direction FSEGT',
  enseignant: 'Enseignant · FSEGT',
  etudiant: 'Étudiant · FSEGT',
}

export default function Topbar() {
  const { user, role, logout } = useAuthStore()
  const navigate = useNavigate()

  const initials = user
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{role ? ROLE_LABEL[role] : ''}</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-[10px]">3</Badge>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-800 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="text-sm font-medium">{user}</div>
              <div className="text-xs text-muted-foreground">{role ? ROLE_LABEL[role] : ''}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => { logout(); navigate('/login') }}
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
