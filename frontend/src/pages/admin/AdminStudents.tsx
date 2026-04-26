import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react'

interface Student {
  id: number
  matricule: string
  name: string
  level: string
  status: 'en_cours' | 'diplômé' | 'abandon'
}

let MOCK_DATA: Student[] = [
  { id: 1, matricule: 'ET2401', name: 'Amira Ben Salah', level: 'Licence 2', status: 'en_cours' },
  { id: 2, matricule: 'ET2402', name: 'Youssef Gharbi', level: 'Master 1', status: 'en_cours' },
]

export default function AdminStudents() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentEdit, setCurrentEdit] = useState<Partial<Student> | null>(null)

  useEffect(() => {
    setTimeout(() => { setItems([...MOCK_DATA]); setLoading(false) }, 400)
  }, [])

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm', 'Êtes-vous sûr(e) ?'))) {
      MOCK_DATA = MOCK_DATA.filter((i) => i.id !== id)
      setItems([...MOCK_DATA])
      toast.success(t('admin.deleted', 'Élément supprimé.'))
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentEdit?.name || !currentEdit?.matricule) {
      toast.error(t('common.error', 'Erreur : champs obligatoires manquants.'))
      return
    }
    if (currentEdit.id) {
      MOCK_DATA = MOCK_DATA.map((d) => (d.id === currentEdit.id ? { ...d, ...currentEdit } as Student : d))
    } else {
      MOCK_DATA.push({ ...currentEdit, id: Date.now(), status: 'en_cours' } as Student)
    }
    setItems([...MOCK_DATA])
    setIsModalOpen(false)
    toast.success(t('common.saveSuccess', 'Modifications enregistrées avec succès.'))
  }

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between fade-up">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">{t('admin.panel', 'Administration')}</p>
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">{t('admin.students.title', 'Étudiants')}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.success(t('admin.importSuccess', 'Importation CSV lancée en arrière-plan.'))}
            className="px-4 py-2 bg-paper border border-rule rounded-lg text-sm font-medium hover:border-gold/50 flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-gold" /> {t('admin.students.import', 'Importer')}
          </button>
          <button
            onClick={() => { setCurrentEdit({ name: '', matricule: '', level: 'Licence 1' }); setIsModalOpen(true) }}
            className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t('admin.students.add', 'Ajouter un étudiant')}
          </button>
        </div>
      </div>
      <div className="glow-line" />

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-paper2/50 border border-rule rounded-xl" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-rule overflow-hidden bg-paper shadow-sm fade-up-1">
          <table className="w-full text-sm">
            <thead className="bg-paper2 border-b border-rule">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Matricule</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Nom complet</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Niveau d'étude</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Statut</th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-rule last:border-0 hover:bg-paper2/50">
                  <td className="px-4 py-3 font-medium text-ink num">{b.matricule}</td>
                  <td className="px-4 py-3 text-ink2">{b.name}</td>
                  <td className="px-4 py-3 text-ink2">{b.level}</td>
                  <td className="px-4 py-3">
                    <span className={`pill ${b.status === 'en_cours' ? 'pill-accent' : b.status === 'abandon' ? 'border-crit text-crit bg-crit/10' : ''}`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setCurrentEdit(b); setIsModalOpen(true) }} className="p-1.5 text-sea hover:bg-sea/10 rounded mr-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-crit hover:bg-crit/10 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-ink3">{t('common.noData', 'Aucune donnée')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-paper border border-rule rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-rule">
              <h3 className="font-display text-lg tracking-tight">{currentEdit?.id ? t('common.edit', 'Modifier') : t('common.add', 'Ajouter')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ink3 hover:text-ink"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1">Matricule *</label>
                <input required value={currentEdit?.matricule || ''} onChange={e => setCurrentEdit({ ...currentEdit, matricule: e.target.value })} className="w-full rounded border-rule bg-paper2/50 px-3 py-2 text-sm focus:border-gold focus:outline-none num" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1">Nom complet *</label>
                <input required value={currentEdit?.name || ''} onChange={e => setCurrentEdit({ ...currentEdit, name: e.target.value })} className="w-full rounded border-rule bg-paper2/50 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1">Niveau *</label>
                <select required value={currentEdit?.level || ''} onChange={e => setCurrentEdit({ ...currentEdit, level: e.target.value })} className="w-full rounded border-rule bg-paper2/50 px-3 py-2 text-sm focus:border-gold focus:outline-none">
                  <option value="Licence 1">Licence 1</option>
                  <option value="Licence 2">Licence 2</option>
                  <option value="Licence 3">Licence 3</option>
                  <option value="Master 1">Master 1</option>
                  <option value="Master 2">Master 2</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-ink3 hover:bg-rule rounded-lg transition-colors">{t('common.cancel', 'Annuler')}</button>
                <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-sm transition-colors">{t('common.save', 'Enregistrer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
