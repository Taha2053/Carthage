import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setError('Email ou mot de passe incorrect.')
      return
    }
    navigate(result.redirectPath ?? '/central')
  }

  const demo = (em: string) => { setEmail(em); setPassword('demo') }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      {/* Atmospheric background arcs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-gold/10" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border border-gold/8" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-sea/10" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 fade-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink mb-4 shadow-xl">
            <svg viewBox="0 0 64 64" className="w-8 h-8">
              <path d="M8 38 Q16 26 24 34 Q32 42 40 30 Q48 18 56 28" fill="none" stroke="#C5933A" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="32" cy="20" r="3.5" fill="#C5933A"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl gold-shimmer font-semibold tracking-tighter2">CarthaVillage</h1>
          <p className="text-ink3 text-sm mt-1 num">Plateforme intelligente UCAR</p>
        </div>

        {/* Card */}
        <div className="bg-paper border border-rule rounded-xl shadow-2xl p-8 fade-up-1">
          <h2 className="font-display text-2xl text-ink mb-1">Connexion</h2>
          <p className="text-ink3 text-sm mb-6">Accédez à votre espace personnalisé</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[12px] uppercase tracking-[0.1em] text-ink3 mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="president@ucar.tn"
                className="w-full rounded-md border border-rule bg-paper2 px-3 py-2.5 text-sm text-ink placeholder:text-ink3/50 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[12px] uppercase tracking-[0.1em] text-ink3 mb-1.5">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-md border border-rule bg-paper2 px-3 py-2.5 text-sm text-ink placeholder:text-ink3/50 focus:outline-none focus:ring-2 focus:ring-gold/40 transition"
              />
            </div>

            {error && (
              <p className="rounded-md bg-crit/10 border border-crit/20 px-3 py-2 text-sm text-crit">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-lg py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
              ) : null}
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 rounded-lg border border-rule bg-paper/60 backdrop-blur-sm p-4 fade-up-2">
          <p className="text-[11px] uppercase tracking-[0.1em] text-ink3 mb-3">Comptes de démonstration</p>
          <div className="space-y-1.5">
            {[
              { label: 'Présidence UCAR', email: 'president@ucar.tn', pass: 'demo', role: 'ucar_central' },
              { label: 'Directeur FSEGT', email: 'directeur@fsegt.tn', pass: 'demo', role: 'institution_admin' },
              { label: 'Enseignant',      email: 'prof@fsegt.tn',      pass: 'demo', role: 'enseignant' },
              { label: 'Étudiant',        email: 'etudiant@fsegt.tn',  pass: 'demo', role: 'etudiant' },
            ].map(({ label, email: em, pass }) => (
              <button
                key={em}
                onClick={() => { setEmail(em); setPassword(pass) }}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-md hover:bg-paper2 transition-colors group"
              >
                <span className="text-xs text-ink2 group-hover:text-ink">{label}</span>
                <span className="text-[10px] font-mono text-ink3/60">{em} / {pass}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-ink3/60 mt-2 num">mot de passe : demo</p>
        </div>
      </div>
    </div>
  )
}
