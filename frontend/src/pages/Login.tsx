import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, redirectPath } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const ok = login(email, password)
    setLoading(false)
    if (!ok) {
      setError('Email ou mot de passe incorrect.')
      return
    }
    navigate(redirectPath ?? '/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-800 text-white text-xl font-bold shadow-lg">
            ن
          </div>
          <h1 className="text-2xl font-bold text-gray-900">NABD</h1>
          <p className="text-sm text-gray-500">نبض — Plateforme intelligente UCAR</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Connexion</CardTitle>
            <CardDescription>Accédez à votre espace personnalisé</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="president@ucar.tn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900" disabled={loading}>
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-white p-4 text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-500 mb-2">Comptes de démonstration :</p>
          <p>president@ucar.tn / demo → Vue UCAR</p>
          <p>directeur@fsegt.tn / demo → Vue direction</p>
          <p>prof@fsegt.tn / demo → Vue enseignant</p>
          <p>etudiant@fsegt.tn / demo → Vue étudiant</p>
        </div>
      </div>
    </div>
  )
}
