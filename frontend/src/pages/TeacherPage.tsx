import { mockTeacherProfile } from '@/mock/data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, XCircle } from 'lucide-react'

const riskBadge = (risk: 'none' | 'at_risk' | 'critical') => {
  if (risk === 'critical') return (
    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 font-medium">
      <XCircle className="h-3 w-3" />En danger
    </span>
  )
  if (risk === 'at_risk') return (
    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-medium">
      <AlertTriangle className="h-3 w-3" />À risque
    </span>
  )
  return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">Normal</span>
}

export default function TeacherPage() {
  const { name, courses } = mockTeacherProfile
  const atRiskCount = courses.flatMap((c) => c.students).filter((s) => s.risk !== 'none').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mes cours</h1>
        <p className="text-sm text-gray-500 mt-1">{name} · FSEGT</p>
      </div>

      {atRiskCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {atRiskCount} étudiant{atRiskCount > 1 ? 's' : ''} nécessite{atRiskCount > 1 ? 'nt' : ''} un suivi
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Taux de présence bas ou moyenne insuffisante. Un accompagnement pédagogique est recommandé.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue={courses[0].id}>
        <TabsList className={cn('grid w-full', `grid-cols-${courses.length}`)}>
          {courses.map((course) => (
            <TabsTrigger key={course.id} value={course.id} className="text-xs">
              {course.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {courses.map((course) => {
          const atRisk = course.students.filter((s) => s.risk !== 'none')
          const avgPresence = Math.round(
            course.students.reduce((acc, s) => acc + s.presence, 0) / course.students.length,
          )
          const avgMoyenne = (
            course.students.reduce((acc, s) => acc + s.moyenne, 0) / course.students.length
          ).toFixed(1)

          return (
            <TabsContent key={course.id} value={course.id} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{course.students.length}</p>
                    <p className="text-xs text-gray-500">Étudiants</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className={cn('text-2xl font-bold', avgPresence < 70 ? 'text-red-600' : avgPresence < 80 ? 'text-amber-600' : 'text-emerald-600')}>
                      {avgPresence}%
                    </p>
                    <p className="text-xs text-gray-500">Présence moy.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 text-center">
                    <p className={cn('text-2xl font-bold', Number(avgMoyenne) < 10 ? 'text-red-600' : 'text-gray-900')}>
                      {avgMoyenne}
                    </p>
                    <p className="text-xs text-gray-500">Moyenne /20</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{course.name} — {course.group}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Étudiant</TableHead>
                        <TableHead>Présence</TableHead>
                        <TableHead>Moyenne</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course.students
                        .sort((a, b) => {
                          const o = { critical: 0, at_risk: 1, none: 2 }
                          return o[a.risk] - o[b.risk]
                        })
                        .map((student) => (
                          <TableRow key={student.id} className={student.risk === 'critical' ? 'bg-red-50/50' : ''}>
                            <TableCell className="font-medium text-sm">{student.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 rounded-full bg-gray-100">
                                  <div
                                    className={cn('h-1.5 rounded-full', student.presence < 60 ? 'bg-red-400' : student.presence < 75 ? 'bg-amber-400' : 'bg-emerald-400')}
                                    style={{ width: `${student.presence}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{student.presence}%</span>
                              </div>
                            </TableCell>
                            <TableCell className={cn('text-sm font-medium', student.moyenne < 10 ? 'text-red-600' : 'text-gray-700')}>
                              {student.moyenne.toFixed(1)}/20
                            </TableCell>
                            <TableCell>{riskBadge(student.risk)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
