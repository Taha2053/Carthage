import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mockTeacherProfile } from '@/mock/data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, XCircle, Send, Upload, FileText, MessageSquare, Users, Mail } from 'lucide-react'

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

const contacts = [
  { id: '1', name: 'Pr. Ahmed Mbarki', role: 'Directeur FSEGT', type: 'admin' },
  { id: '2', name: 'Dr. Salma Kouki', role: 'Collègue - Marketing', type: 'prof' },
  { id: '3', name: 'Dr. Mohamed Helal', role: 'Collègue - Finance', type: 'prof' },
  { id: '4', name: 'Secrétaire FSEGT', role: 'Administration', type: 'admin' },
]

const recentDocuments = [
  { id: '1', name: 'Énoncé Exam S3.pdf', type: 'exam', status: 'sent', date: '2026-04-25' },
  { id: '2', name: 'Correction DS2.pdf', type: 'correction', status: 'draft', date: '2026-04-24' },
  { id: '3', name: 'PV Session.pdf', type: 'pv', status: 'sent', date: '2026-04-20' },
]

export default function TeacherPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'courses'
  
  const { name, courses } = mockTeacherProfile
  const atRiskCount = courses.flatMap((c) => c.students).filter((s) => s.risk !== 'none').length
  const [showCompose, setShowCompose] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const setTab = (tab: string) => {
    setSearchParams({ tab })
  }

  const { name: n, courses: c } = mockTeacherProfile

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Bienvenue, {n}</h1>
          <p className="text-sm text-ink3 mt-1">FSEGT · Université de Carthage</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rule bg-paper hover:bg-paper2 text-sm text-ink transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Nouveau message
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold text-paper font-medium text-sm hover:bg-gold/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Téléverser
          </button>
        </div>
      </div>

      {atRiskCount > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink">
              {atRiskCount} étudiant{atRiskCount > 1 ? 's' : ''} nécessite{atRiskCount > 1 ? 'nt' : ''} un suivi
            </p>
            <p className="text-xs text-ink3 mt-0.5">
              Taux de présence bas ou moyenne insuffisante. Un accompagnement pédagogique est recommandé.
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-paper rounded-lg border border-rule w-fit">
        <button
          onClick={() => setTab('courses')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'courses' 
              ? 'bg-gold text-paper' 
              : 'text-ink3 hover:text-ink hover:bg-paper2'
          )}
        >
          Mes cours
        </button>
        <button
          onClick={() => setTab('documents')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'documents' 
              ? 'bg-gold text-paper' 
              : 'text-ink3 hover:text-ink hover:bg-paper2'
          )}
        >
          Documents
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'contacts' 
              ? 'bg-gold text-paper' 
              : 'text-ink3 hover:text-ink hover:bg-paper2'
          )}
        >
          Contacts
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {c.map((course) => {
            const avgPresence = Math.round(
              course.students.reduce((acc, s) => acc + s.presence, 0) / course.students.length,
            )
            const avgMoyenne = (
              course.students.reduce((acc, s) => acc + s.moyenne, 0) / course.students.length
            ).toFixed(1)

            return (
              <div key={course.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-lg text-ink">{course.name}</h2>
                    <p className="text-sm text-ink3">{course.group}</p>
                  </div>
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-ink">{course.students.length}</p>
                      <p className="text-xs text-ink3">Étudiants</p>
                    </div>
                    <div>
                      <p className={cn('text-2xl font-bold', avgPresence < 70 ? 'text-crit' : avgPresence < 80 ? 'text-warn' : 'text-ok')}>
                        {avgPresence}%
                      </p>
                      <p className="text-xs text-ink3">Présence</p>
                    </div>
                    <div>
                      <p className={cn('text-2xl font-bold', Number(avgMoyenne) < 10 ? 'text-crit' : 'text-ink')}>
                        {avgMoyenne}
                      </p>
                      <p className="text-xs text-ink3">Moyenne</p>
                    </div>
                  </div>
                </div>

                <Card className="border-rule">
                  <CardContent className="p-0">
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
                            <TableRow key={student.id} className={student.risk === 'critical' ? 'bg-crit/5' : ''}>
                              <TableCell className="font-medium text-sm text-ink">{student.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 rounded-full bg-rule">
                                    <div
                                      className={cn('h-1.5 rounded-full', student.presence < 60 ? 'bg-crit' : student.presence < 75 ? 'bg-warn' : 'bg-ok')}
                                      style={{ width: `${student.presence}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-ink3">{student.presence}%</span>
                                </div>
                              </TableCell>
                              <TableCell className={cn('text-sm font-medium', student.moyenne < 10 ? 'text-crit' : 'text-ink2')}>
                                {student.moyenne.toFixed(1)}/20
                              </TableCell>
                              <TableCell>{riskBadge(student.risk)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-rule hover:border-gold/50 cursor-pointer transition-colors" onClick={() => setShowUpload(true)}>
              <CardContent className="pt-6 pb-4 text-center">
                <Upload className="w-8 h-8 mx-auto text-gold mb-2" />
                <p className="text-sm font-medium text-ink">Téléverser</p>
                <p className="text-xs text-ink3 mt-1">Importer un fichier</p>
              </CardContent>
            </Card>
            <Card className="border-rule hover:border-gold/50 cursor-pointer transition-colors">
              <CardContent className="pt-6 pb-4 text-center">
                <FileText className="w-8 h-8 mx-auto text-gold mb-2" />
                <p className="text-sm font-medium text-ink">Modèles</p>
                <p className="text-xs text-ink3 mt-1">Templates officiels</p>
              </CardContent>
            </Card>
            <Card className="border-rule hover:border-gold/50 cursor-pointer transition-colors" onClick={() => setShowCompose(true)}>
              <CardContent className="pt-6 pb-4 text-center">
                <Mail className="w-8 h-8 mx-auto text-gold mb-2" />
                <p className="text-sm font-medium text-ink">Envoyer</p>
                <p className="text-xs text-ink3 mt-1">Distribuer aux étudiants</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-rule">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-ink">Documents récents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium text-sm text-ink">{doc.name}</TableCell>
                      <TableCell className="text-sm text-ink3 capitalize">{doc.type}</TableCell>
                      <TableCell className="text-sm text-ink3">{doc.date}</TableCell>
                      <TableCell>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          doc.status === 'sent' ? 'bg-ok/10 text-ok' : 'bg-warn/10 text-warn'
                        )}>
                          {doc.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button className="text-ink3 hover:text-ink text-xs">Modifier</button>
                          <button className="text-ink3 hover:text-gold text-xs">Envoyer</button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-rule">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-gold" />
                Administration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.filter(c => c.type === 'admin').map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-paper2 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-ink">{contact.name}</p>
                    <p className="text-xs text-ink3">{contact.role}</p>
                  </div>
                  <button 
                    onClick={() => setShowCompose(true)}
                    className="text-xs text-gold hover:underline"
                  >
                    Contacter
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-rule">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-ink flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gold" />
                Collègues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contacts.filter(c => c.type === 'prof').map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-paper2 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-ink">{contact.name}</p>
                    <p className="text-xs text-ink3">{contact.role}</p>
                  </div>
                  <button 
                    onClick={() => setShowCompose(true)}
                    className="text-xs text-gold hover:underline"
                  >
                    Contacter
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm" onClick={() => setShowCompose(false)}>
          <div className="w-full max-w-md bg-paper rounded-xl shadow-2xl border border-rule p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-ink">Nouveau message</h3>
              <button onClick={() => setShowCompose(false)} className="text-ink3 hover:text-ink">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-ink3">Destinataire</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border border-rule bg-paper2 text-ink text-sm">
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink3">Objet</label>
                <input type="text" className="w-full mt-1 px-3 py-2 rounded-lg border border-rule bg-paper2 text-ink text-sm" placeholder="Objet du message..." />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink3">Message</label>
                <textarea className="w-full mt-1 px-3 py-2 rounded-lg border border-rule bg-paper2 text-ink text-sm h-32 resize-none" placeholder="Votre message..." />
              </div>
              <button className="w-full py-2 rounded-lg bg-gold text-paper font-medium text-sm hover:bg-gold/90 transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="w-full max-w-md bg-paper rounded-xl shadow-2xl border border-rule p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-ink">Téléverser un document</h3>
              <button onClick={() => setShowUpload(false)} className="text-ink3 hover:text-ink">×</button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-rule rounded-xl p-8 text-center hover:border-gold/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto text-ink3 mb-3" />
                <p className="text-sm text-ink">Glissez un fichier ici ou cliquez pour parcourir</p>
                <p className="text-xs text-ink3 mt-1">PDF, DOC, DOCX, PNG, JPG (max 10MB)</p>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink3">Type de document</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border border-rule bg-paper2 text-ink text-sm">
                  <option>Énoncé d'examen</option>
                  <option>Corrigé</option>
                  <option>PV de session</option>
                  <option>Cours / TD</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink3">Cours associé</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg border border-rule bg-paper2 text-ink text-sm">
                  {c.map(co => (
                    <option key={co.id} value={co.id}>{co.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg border border-rule text-ink font-medium text-sm hover:bg-paper2 transition-colors">
                  Sauvegarder
                </button>
                <button className="flex-1 py-2 rounded-lg bg-gold text-paper font-medium text-sm hover:bg-gold/90 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}