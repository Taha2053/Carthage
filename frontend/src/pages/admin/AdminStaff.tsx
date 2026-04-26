import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

interface Staff {
  id: number
  name: string
  role: string
  department: string
  status: 'active' | 'inactive'
}

let MOCK_DATA: Staff[] = [
  { id: 1, name: 'Dr. Karim Mansouri', role: 'Enseignant', department: 'INFORMATIQUE', status: 'active' },
  { id: 2, name: 'Amina Ben Abdallah', role: 'Administration', department: 'SCOLARITÉ', status: 'active' },
]

export default function AdminStaff() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentEdit, setCurrentEdit] = useState<Partial<Staff> | null>(null)

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
    if (!currentEdit?.name || !currentEdit?.role) {
      toast.error(t('common.error', 'Erreur : champs obligatoires manquants.'))
      return
    }
    if (currentEdit.id) {
      MOCK_DATA = MOCK_DATA.map((d) => (d.id === currentEdit.id ? { ...d, ...currentEdit } as Staff : d))
    } else {
      MOCK_DATA.push({ ...currentEdit, id: Date.now(), status: 'active' } as Staff)
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
          <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">{t('admin.staff.title', 'Personnel')}</h1>
        </div>
        <button
          onClick={() => { setCurrentEdit({ name: '', role: 'Enseignant', department: '' }); setIsModalOpen(true) }}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {t('admin.staff.add', 'Ajouter un membre')}
        </button>
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
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Nom complet</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Rôle</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Département</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">Statut</th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-b border-rule last:border-0 hover:bg-paper2/50">
                  <td className="px-4 py-3 font-medium text-ink">{b.name}</td>
                  <td className="px-4 py-3 text-ink2">{b.role}</td>
                  <td className="px-4 py-3 text-ink2"><span className="pill">{b.department}</span></td>
                  <td className="px-4 py-3">
                    <span className={`pill ${b.status === 'active' ? 'pill-accent' : ''}`}>{b.status}</span>
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
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1">Nom complet *</label>
                <input required value={currentEdit?.name || ''} onChange={e => setCurrentEdit({ ...currentEdit, name: e.target.value })} className="w-full rounded border-rule bg-paper2/50 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1">Rôle *</label>
                <select required value={currentEdit?.role || ''} onChange={e => setCurrentEdit({ ...currentEdit, role: e.target.value })} className="w-full rounded border-rule bg-paper2/50 px-3 py-2 text-sm focus:border-gold focus:outline-none">
                  <option value="Enseignant">Enseignant</option>
                  <option value="Administration">Administration</option>
                  <option value="Technique">Technique</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.1em] text-ink3 block mb-1">Département *</label>
                <input required value={currentEdit?.department || ''} onChange={e => setCurrentEdit({ ...currentEdit, department: e.target.value })} className="w-full rounded border-rule bg-paper2/50 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
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
