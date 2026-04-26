import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Save, AlertCircle } from 'lucide-react'

interface GradeRecord {
  id: number
  matricule: string
  name: string
  tp: number | null
  ds: number | null
  examen: number | null
}

let MOCK_DATA: GradeRecord[] = [
  { id: 1, matricule: 'ET2401', name: 'Amira Ben Salah', tp: 15, ds: 14, examen: null },
  { id: 2, matricule: 'ET2402', name: 'Youssef Gharbi', tp: 12, ds: 10, examen: null },
]

export default function TeacherGrades() {
  const { t } = useTranslation()
  const [items, setItems] = useState<GradeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState('Algorithmique Avancée')

  useEffect(() => {
    setTimeout(() => { setItems([...MOCK_DATA]); setLoading(false) }, 400)
  }, [])

  const handleGradeChange = (id: number, field: keyof GradeRecord, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    if (numValue !== null && (numValue < 0 || numValue > 20)) return // Validate 0-20
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: numValue } : item)))
  }

  const handleSaveAll = () => {
    setSaving(true)
    setTimeout(() => {
      MOCK_DATA = [...items]
      setSaving(false)
      toast.success(t('teacher.grades.saved', 'Toutes les notes ont été enregistrées avec succès.'))
    }, 600)
  }

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">{t('teacher.panel', 'Espace Enseignant')}</p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">{t('teacher.grades.title', 'Saisie des notes')}</h1>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving || loading}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {saving ? t('common.saving', 'Enregistrement...') : t('common.saveAll', 'Enregistrer tout')}
        </button>
      </div>

      <div className="flex items-center gap-4 fade-up-1">
        <label className="text-sm font-medium text-ink2">{t('teacher.selectCourse', 'Sélectionnez un cours :')}</label>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="rounded-lg border-rule bg-paper px-4 py-2 text-sm focus:border-gold focus:outline-none"
        >
          <option value="Algorithmique Avancée">Algorithmique Avancée (L2 INFO)</option>
          <option value="Bases de données">Bases de données (L2 INFO)</option>
        </select>
      </div>

      <div className="glow-line" />

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex items-start gap-3 fade-up-1">
        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm text-ink2">
          {t('teacher.grades.info', 'La moyenne sera calculée automatiquement par le système selon les coefficients : TP (20%), DS (30%), Examen (50%). Assurez-vous de saisir des notes entre 0 et 20.')}
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-paper2/50 border border-rule rounded-xl" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-rule overflow-hidden bg-paper shadow-sm fade-up-2">
          <table className="w-full text-sm text-left">
            <thead className="bg-paper2 border-b border-rule">
              <tr>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-32">Matricule</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3">Étudiant</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-32">Note TP (/20)</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-32">Note DS (/20)</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 w-32">Examen (/20)</th>
                <th className="px-4 py-3 text-[11px] uppercase tracking-[0.1em] text-ink3 text-right w-24">Moyenne</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => {
                const moyenne = (
                  ((b.tp || 0) * 0.2) + ((b.ds || 0) * 0.3) + ((b.examen || 0) * 0.5)
                ).toFixed(2)

                const isComplete = b.tp !== null && b.ds !== null && b.examen !== null

                return (
                  <tr key={b.id} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink num">{b.matricule}</td>
                    <td className="px-4 py-3 text-ink2">{b.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={b.tp ?? ''}
                        onChange={(e) => handleGradeChange(b.id, 'tp', e.target.value)}
                        className="w-full rounded border border-rule bg-paper px-2 py-1.5 focus:border-gold focus:outline-none text-center num"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={b.ds ?? ''}
                        onChange={(e) => handleGradeChange(b.id, 'ds', e.target.value)}
                        className="w-full rounded border border-rule bg-paper px-2 py-1.5 focus:border-gold focus:outline-none text-center num"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={b.examen ?? ''}
                        onChange={(e) => handleGradeChange(b.id, 'examen', e.target.value)}
                        className="w-full rounded border border-rule bg-paper px-2 py-1.5 focus:border-gold focus:outline-none text-center num font-medium text-ink"
                      />
                    </td>
                    <td className="px-4 py-3 text-right num">
                      {isComplete ? (
                        <span className={`font-semibold ${parseFloat(moyenne) < 10 ? 'text-crit' : 'text-ok'}`}>{moyenne}</span>
                      ) : (
                        <span className="text-ink3">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-ink3">{t('common.noData', 'Aucune donnée')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
