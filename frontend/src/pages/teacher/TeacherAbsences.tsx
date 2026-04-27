import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Save, AlertCircle } from 'lucide-react'

interface AbsenceRecord {
  id: number
  matricule: string
  name: string
  status: 'present' | 'absent' | 'excused'
}

let MOCK_DATA: AbsenceRecord[] = [
  { id: 1, matricule: 'ET2401', name: 'Amira Ben Salah', status: 'present' },
  { id: 2, matricule: 'ET2402', name: 'Youssef Gharbi', status: 'absent' },
  { id: 3, matricule: 'ET2403', name: 'Mouna Trabelsi', status: 'excused' },
]

export default function TeacherAbsences() {
  const { t } = useTranslation()
  const [items, setItems] = useState<AbsenceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState('Algorithmique Avancée')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setTimeout(() => { setItems([...MOCK_DATA]); setLoading(false) }, 400)
  }, [])

  const handleStatusChange = (id: number, status: AbsenceRecord['status']) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  const handleSaveAll = () => {
    setSaving(true)
    setTimeout(() => {
      MOCK_DATA = [...items]
      setSaving(false)
      toast.success(t('teacher.absences.saved', 'Le registre de présence a été sauvegardé avec succès.'))
      
      // Simulate generating an alert if too many absences
      const absentCount = items.filter(i => i.status === 'absent').length
      if (absentCount > 1) {
        toast(t('teacher.absences.alertWarning', 'Alerte générée : Certains étudiants dépassent le seuil d\'absences.'), { icon: <AlertCircle className="w-4 h-4 text-warn" /> })
      }
    }, 600)
  }

  const markAllPresent = () => {
    setItems((prev) => prev.map(item => ({ ...item, status: 'present' })))
  }

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">{t('teacher.panel', 'Espace Enseignant')}</p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">{t('teacher.absences.title', 'Registre des présences')}</h1>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving || loading}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? t('common.saving', 'Enregistrement...') : t('common.saveAll', 'Enregistrer tout')}
        </button>
      </div>

      <div className="flex items-center gap-6 fade-up-1">
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1.5">{t('teacher.selectCourse', 'Sélectionnez un cours :')}</label>
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="rounded-lg border border-rule bg-paper px-4 py-2 text-sm focus:border-gold focus:outline-none"
          >
            <option value="Algorithmique Avancée">Algorithmique Avancée (L2 INFO)</option>
            <option value="Bases de données">Bases de données (L2 INFO)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1.5">{t('teacher.date', 'Date de la séance :')}</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-rule bg-paper px-4 py-2 text-sm focus:border-gold focus:outline-none num"
          />
        </div>
      </div>

      <div className="glow-line" />

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-paper2/50 border border-rule rounded-xl" />)}
        </div>
      ) : (
        <div className="fade-up-2">
          <div className="flex justify-end mb-4">
            <button
              onClick={markAllPresent}
              className="text-sm font-medium text-ok border border-ok/30 bg-ok/5 px-3 py-1.5 rounded-lg hover:bg-ok/10 transition-colors"
            >
              {t('teacher.absences.markAllPresent', 'Marquer tous comme présents')}
            </button>
          </div>
          
          <div className="rounded-xl border border-rule overflow-hidden bg-paper shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-paper2 border-b border-rule">
                <tr>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-32">Matricule</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3">Étudiant</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-48 text-center">Présent</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-48 text-center">Absent</th>
                  <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-48 text-center">Excusé</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink num">{b.matricule}</td>
                    <td className="px-4 py-3 text-ink2">{b.name}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`status-${b.id}`}
                        checked={b.status === 'present'}
                        onChange={() => handleStatusChange(b.id, 'present')}
                        className="w-4 h-4 accent-ok cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`status-${b.id}`}
                        checked={b.status === 'absent'}
                        onChange={() => handleStatusChange(b.id, 'absent')}
                        className="w-4 h-4 accent-crit cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="radio"
                        name={`status-${b.id}`}
                        checked={b.status === 'excused'}
                        onChange={() => handleStatusChange(b.id, 'excused')}
                        className="w-4 h-4 accent-warn cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-ink3">{t('common.noData', 'Aucune donnée')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
