import { useState, useEffect } from 'react'
import { fetchTeacherProfile } from '@/services/adapters'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, XCircle } from 'lucide-react'
import type { TeacherProfile } from '@/types'
import { useTranslation } from 'react-i18next'

export default function TeacherPage() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeacherProfile().then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [])

  const riskBadge = (risk: 'none' | 'at_risk' | 'critical') => {
    if (risk === 'critical') return (
      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 font-medium">
        <XCircle className="h-3 w-3" />{t('teacher.inDanger')}
      </span>
    )
    if (risk === 'at_risk') return (
      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-medium">
        <AlertTriangle className="h-3 w-3" />{t('teacher.atRisk')}
      </span>
    )
    return <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-600">{t('teacher.normal')}</span>
  }

  if (loading || !profile) {
    return (
      <div className="space-y-6 py-6 px-6 max-w-[1400px] mx-auto">
        <div className="h-8 bg-rule rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg border border-rule bg-paper2/50 p-4 animate-pulse">
              <div className="h-8 bg-rule rounded w-1/2 mb-2" />
              <div className="h-3 bg-rule rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { name, courses } = profile
  const atRiskCount = courses.flatMap((c) => c.students).filter((s) => s.risk !== 'none').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('teacher.myCourses')}</h1>
        <p className="text-sm text-gray-500 mt-1">{name} · FSEGT</p>
      </div>

      {atRiskCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {atRiskCount} {t('teacher.studentsNeedFollowUp')}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {t('teacher.followUpAdvice')}
            </p>
          </div>
        </div>
      )}

      {courses.length > 0 && (
        <Tabs defaultValue={courses[0].id}>
          <TabsList className={cn('grid w-full', `grid-cols-${courses.length}`)}>
            {courses.map((course) => (
              <TabsTrigger key={course.id} value={course.id} className="text-xs">
                {course.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {courses.map((course) => {
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
                      <p className="text-xs text-gray-500">{t('teacher.studentsLabel')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className={cn('text-2xl font-bold', avgPresence < 70 ? 'text-red-600' : avgPresence < 80 ? 'text-amber-600' : 'text-emerald-600')}>
                        {avgPresence}%
                      </p>
                      <p className="text-xs text-gray-500">{t('teacher.avgPresence')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 pb-3 text-center">
                      <p className={cn('text-2xl font-bold', Number(avgMoyenne) < 10 ? 'text-red-600' : 'text-gray-900')}>
                        {avgMoyenne}
                      </p>
                      <p className="text-xs text-gray-500">{t('teacher.avgGrade')}</p>
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
                          <TableHead>{t('teacher.studentCol')}</TableHead>
                          <TableHead>{t('teacher.presenceCol')}</TableHead>
                          <TableHead>{t('teacher.gradeCol')}</TableHead>
                          <TableHead>{t('teacher.statusCol')}</TableHead>
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
      )}
    </div>
  )
}
