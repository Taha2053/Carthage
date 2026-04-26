import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types'

interface DemoAccount {
  email: string
  password: string
  role: Role
  name: string
  institutionId: string | null
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'president@ucar.tn',    password: 'demo', role: 'ucar_central',     name: 'Prof. Henda Ouali',    institutionId: null },
  { email: 'directeur@fsegt.tn',   password: 'demo', role: 'institution_admin', name: 'Dr. Slim Chaabane',    institutionId: 'fsegt' },
  { email: 'prof@fsegt.tn',        password: 'demo', role: 'enseignant',        name: 'Dr. Karim Mansouri',   institutionId: 'fsegt' },
  { email: 'etudiant@fsegt.tn',    password: 'demo', role: 'etudiant',          name: 'Amira Ben Salah',      institutionId: 'fsegt' },
]

const ROLE_REDIRECT: Record<Role, string> = {
  ucar_central:     '/central',
  institution_admin:'/institution/fsegt',
  enseignant:       '/teacher',
  etudiant:         '/student',
}

interface AuthState {
  user: string | null
  role: Role | null
  institutionId: string | null
  redirectPath: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  initSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      institutionId: null,
      redirectPath: null,
      loading: false,

      login: async (email: string, password: string) => {
        set({ loading: true })

        // 1. Try real Supabase auth
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          if (!error && data.user) {
            const meta = data.user.user_metadata ?? {}
            const role = (meta.role ?? null) as Role | null
            const name = meta.name ?? data.user.email ?? email
            const institutionId = meta.institution_id ?? null
            if (role) {
              set({
                user: name,
                role,
                institutionId,
                redirectPath: ROLE_REDIRECT[role] ?? '/',
                loading: false,
              })
              return true
            }
          }
        } catch {
          // Supabase not configured — fall through to demo
        }

        // 2. Demo fallback (works without Supabase being set up)
        const account = DEMO_ACCOUNTS.find(
          (a) => a.email === email.trim() && a.password === password,
        )
        if (account) {
          set({
            user: account.name,
            role: account.role,
            institutionId: account.institutionId,
            redirectPath: ROLE_REDIRECT[account.role],
            loading: false,
          })
          return true
        }

        set({ loading: false })
        return false
      },

      logout: async () => {
        await supabase.auth.signOut().catch(() => {})
        set({ user: null, role: null, institutionId: null, redirectPath: null })
      },

      initSession: async () => {
        // Restore Supabase session on page reload
        try {
          const { data } = await supabase.auth.getSession()
          if (data.session?.user) {
            const meta = data.session.user.user_metadata ?? {}
            const role = (meta.role ?? null) as Role | null
            if (role && !get().role) {
              set({
                user: meta.name ?? data.session.user.email ?? '',
                role,
                institutionId: meta.institution_id ?? null,
                redirectPath: ROLE_REDIRECT[role] ?? '/',
              })
            }
          }
        } catch {
          // ignore
        }
      },
    }),
    { name: 'carthage-auth', partialize: (s) => ({ user: s.user, role: s.role, institutionId: s.institutionId, redirectPath: s.redirectPath }) },
  ),
)
