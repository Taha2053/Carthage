import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types'

interface DemoAccount {
  email: string
  password: string
  role: Role
  name: string
  institutionId: string | null
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'president@ucar.tn', password: 'demo', role: 'ucar_central', name: 'Prof. Henda Ouali', institutionId: null },
  { email: 'directeur@fsegt.tn', password: 'demo', role: 'institution_admin', name: 'Dr. Slim Chaabane', institutionId: 'fsegt' },
  { email: 'prof@fsegt.tn', password: 'demo', role: 'enseignant', name: 'Dr. Karim Mansouri', institutionId: 'fsegt' },
  { email: 'etudiant@fsegt.tn', password: 'demo', role: 'etudiant', name: 'Amira Ben Salah', institutionId: 'fsegt' },
]

const ROLE_REDIRECT: Record<Role, string> = {
  ucar_central: '/central',
  institution_admin: '/institution/fsegt',
  enseignant: '/teacher',
  etudiant: '/student',
}

interface AuthState {
  user: string | null
  role: Role | null
  institutionId: string | null
  redirectPath: string | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      institutionId: null,
      redirectPath: null,
      login: (email, password) => {
        const account = DEMO_ACCOUNTS.find(
          (a) => a.email === email.trim() && a.password === password,
        )
        if (!account) return false
        set({
          user: account.name,
          role: account.role,
          institutionId: account.institutionId,
          redirectPath: ROLE_REDIRECT[account.role],
        })
        return true
      },
      logout: () => set({ user: null, role: null, institutionId: null, redirectPath: null }),
    }),
    { name: 'nabd-auth' },
  ),
)
