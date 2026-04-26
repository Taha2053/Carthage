import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fetchStudentProfile } from '@/services/adapters'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, Sparkles } from 'lucide-react'
import type { StudentProfile } from '@/types'

export default function StudentPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudentProfile().then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  if (loading || !profile) {
    return (
      <div className="space-y-6 py-6 px-6 max-w-[1400px] mx-auto">
        <div className="h-8 bg-rule rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
              <div className="h-8 bg-rule rounded w-1/2 mb-2" />
              <div className="h-3 bg-rule rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { name, filiere, annee, tauxPresence, moyenne, credits, creditsTotal, progression, nudge, courses } = profile

  const progressionColor = progression === 'critical' ? 'text-red-600' : progression === 'at_risk' ? 'text-amber-600' : 'text-emerald-600'
  const progressionLabel = progression === 'critical' ? 'Situation critique' : progression === 'at_risk' ? 'À surveiller' : 'Sur la bonne voie'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mon parcours</h1>
        <p className="text-sm text-gray-500 mt-1">{name} · {filiere} · Année {annee}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 flex items-start gap-3"
      >
        <Sparkles className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-700 mb-1">Conseil personnalisé CarthaVillage</p>
          <p className="text-sm text-gray-700 leading-relaxed">{nudge}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={cn('text-2xl font-bold', tauxPresence < 70 ? 'text-red-600' : tauxPresence < 80 ? 'text-amber-600' : 'text-emerald-600')}>
              {tauxPresence}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Présence globale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={cn('text-2xl font-bold', moyenne < 10 ? 'text-red-600' : moyenne < 12 ? 'text-amber-600' : 'text-emerald-600')}>
              {moyenne.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Moyenne générale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{credits}<span className="text-sm text-gray-400">/{creditsTotal}</span></p>
            <p className="text-xs text-gray-500 mt-1">Crédits validés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className={cn('text-lg font-bold', progressionColor)}>{progressionLabel}</p>
            <p className="text-xs text-gray-500 mt-1">Progression</p>
          </CardContent>
        </Card>
      </div>

      {tauxPresence < 75 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Taux de présence insuffisant</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Votre taux de présence est en dessous du seuil requis (75%). Des absences supplémentaires peuvent entraîner une exclusion des examens.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Résultats par matière</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matière</TableHead>
                <TableHead>Note /20</TableHead>
                <TableHead>Présence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses
                .sort((a, b) => a.note - b.note)
                .map((course) => (
                  <TableRow key={course.name}>
                    <TableCell className="font-medium text-sm">{course.name}</TableCell>
                    <TableCell>
                      <span className={cn('font-semibold text-sm', course.note < 10 ? 'text-red-600' : course.note < 12 ? 'text-amber-600' : 'text-emerald-600')}>
                        {course.note.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-gray-100">
                          <div
                            className={cn('h-1.5 rounded-full', course.presence < 70 ? 'bg-red-400' : course.presence < 80 ? 'bg-amber-400' : 'bg-emerald-400')}
                            style={{ width: `${course.presence}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{course.presence}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
