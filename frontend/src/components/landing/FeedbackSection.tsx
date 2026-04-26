import { useState } from 'react'
import { MessageSquare, GraduationCap, Building2, Cog, Lightbulb, Lock, BarChart3, CheckCircle2 } from 'lucide-react'

type FeedbackCategory = 'general' | 'academic' | 'infrastructure' | 'services' | 'suggestion'

const CATEGORIES: { value: FeedbackCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'general',        label: 'Général',             icon: <MessageSquare size={14} className="opacity-80" /> },
  { value: 'academic',       label: 'Académique',          icon: <GraduationCap size={14} className="opacity-80" /> },
  { value: 'infrastructure', label: 'Infrastructure',      icon: <Building2 size={14} className="opacity-80" /> },
  { value: 'services',       label: 'Services',            icon: <Cog size={14} className="opacity-80" /> },
  { value: 'suggestion',     label: 'Suggestion',          icon: <Lightbulb size={14} className="opacity-80" /> },
]

const UCAR_DOMAINS = [
  'ucar.tn', 'fsegt.ucar.tn', 'insat.tn', 'supcom.tn', 'ept.rnu.tn',
  'ihec.rnu.tn', 'fsb.rnu.tn', 'inat.nat.tn', 'islt.rnu.tn',
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={(hovered || value) >= n ? '#C5933A' : 'none'} stroke="#C5933A" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function FeedbackSection() {
  const [email, setEmail] = useState('')
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [category, setCategory] = useState<FeedbackCategory>('general')
  const [institution, setInstitution] = useState('')
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const checkEmail = (val: string) => {
    setEmail(val)
    if (!val) { setEmailValid(null); return }
    const domain = val.split('@')[1]?.toLowerCase() || ''
    setEmailValid(UCAR_DOMAINS.some(d => domain === d || domain.endsWith('.' + d)))
  }

  const canSubmit = (anonymous || emailValid === true) && message.trim().length >= 20 && rating > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section id="feedback" className="py-20 px-6 border-t border-rule/60" style={{ background: '#F4EBD5' }}>
        <div className="max-w-[560px] mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-ok/10 border border-ok/20 flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E8449" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h3 className="font-display text-[26px] text-ink tracking-tightish">Merci pour votre retour</h3>
          <p className="mt-3 text-[14px] text-ink3 leading-relaxed">
            Votre feedback a été transmis aux équipes concernées de l'Université de Carthage.
            CarthaVillage utilise ces retours pour améliorer la plateforme et orienter les décisions institutionnelles.
          </p>
          <button
            onClick={() => {
              setSubmitted(false); setEmail(''); setEmailValid(null)
              setMessage(''); setRating(0); setCategory('general')
            }}
            className="mt-6 px-5 py-2 rounded-full border border-rule text-[13px] text-ink3 hover:text-ink transition-colors"
          >
            Soumettre un autre retour
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="feedback" className="py-20 px-6 border-t border-rule/60" style={{ background: '#F4EBD5' }}>
      <div className="max-w-[1100px] mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: context */}
          <div className="fade-up">
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-medium mb-3">Votre avis compte</p>
            <h2 className="font-display text-[36px] leading-[1.15] tracking-tightish text-ink">
              Partagez votre<br/>
              expérience UCAR
            </h2>
            <p className="mt-4 text-[14px] text-ink3 leading-relaxed max-w-sm">
              Étudiant, enseignant ou personnel administratif — vos retours alimentent directement les indicateurs de la plateforme et aident à améliorer les services de l'Université de Carthage.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: <Lock className="text-gold" size={20} />, title: 'Données protégées', desc: 'Votre email ne sera jamais partagé. Soumission anonyme possible.' },
                { icon: <BarChart3 className="text-gold" size={20} />, title: 'Impact direct', desc: 'Les feedbacks sont analysés et remontent aux équipes de direction.' },
                { icon: <CheckCircle2 className="text-gold" size={20} />, title: 'Affiliés UCAR uniquement', desc: 'Réservé aux membres de la communauté universitaire.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <span className="text-[20px] mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                    <p className="text-[12px] text-ink3 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <form onSubmit={handleSubmit} className="bg-white/70 rounded-2xl border border-rule p-6 space-y-5 shadow-sm backdrop-blur-sm">

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Soumettre un retour</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymous}
                  onChange={e => setAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-gold"
                />
                <span className="text-[12px] text-ink3">Anonyme</span>
              </label>
            </div>

            {/* Email */}
            {!anonymous && (
              <div>
                <label className="text-[11px] font-medium text-ink2 uppercase tracking-wider block mb-1.5">
                  Email institutionnel
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => checkEmail(e.target.value)}
                  placeholder="prenom.nom@institution.ucar.tn"
                  className={`w-full px-3 py-2.5 text-[13px] rounded-xl border transition-colors bg-paper/50 text-ink placeholder:text-ink3 focus:outline-none ${
                    emailValid === null ? 'border-rule focus:border-gold/60'
                    : emailValid ? 'border-ok bg-ok/5'
                    : 'border-crit bg-crit/5'
                  }`}
                />
                {emailValid === false && (
                  <p className="mt-1 text-[11px] text-crit">Veuillez utiliser un email affilié à l'Université de Carthage.</p>
                )}
                {emailValid === true && (
                  <p className="mt-1 text-[11px] text-ok">Email UCAR vérifié ✓</p>
                )}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="text-[11px] font-medium text-ink2 uppercase tracking-wider block mb-1.5">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                      category === c.value
                        ? 'bg-ink text-paper border-ink'
                        : 'border-rule text-ink3 hover:text-ink hover:border-ink3/40 bg-white/50'
                    }`}
                  >
                    <span>{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="text-[11px] font-medium text-ink2 uppercase tracking-wider block mb-1.5">Établissement (optionnel)</label>
              <select
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-rule bg-paper/50 text-ink focus:outline-none focus:border-gold/60"
              >
                <option value="">— Sélectionner —</option>
                <option value="ucar">Présidence UCAR</option>
                <option value="insat">INSAT</option>
                <option value="supcom">SUP'COM</option>
                <option value="ept">EPT La Marsa</option>
                <option value="ihec">IHEC Carthage</option>
                <option value="fsb">FSB Bizerte</option>
                <option value="inat">INAT</option>
                <option value="esti">ESTI Carthage</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-[11px] font-medium text-ink2 uppercase tracking-wider block mb-2">Évaluation globale</label>
              <StarRating value={rating} onChange={setRating}/>
              {rating > 0 && (
                <p className="mt-1 text-[11px] text-ink3">
                  {['', 'Très insatisfait', 'Insatisfait', 'Neutre', 'Satisfait', 'Très satisfait'][rating]}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="text-[11px] font-medium text-ink2 uppercase tracking-wider block mb-1.5">
                Message <span className="text-ink3 normal-case">(min. 20 caractères)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre expérience, suggestion ou problème…"
                rows={4}
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-rule bg-paper/50 text-ink placeholder:text-ink3 focus:outline-none focus:border-gold/60 resize-none"
              />
              <p className="mt-0.5 text-[10px] num text-ink3 text-right">{message.length} / 500</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`w-full py-3 rounded-xl text-[13px] font-semibold transition-all ${
                canSubmit && !submitting
                  ? 'text-paper shadow-md hover:shadow-lg hover:-translate-y-0.5'
                  : 'text-ink3 cursor-not-allowed'
              }`}
              style={{
                background: canSubmit && !submitting
                  ? 'linear-gradient(135deg, #C5933A, #9E7520)'
                  : '#E5DDD0',
              }}
            >
              {submitting ? 'Envoi en cours…' : 'Soumettre mon retour'}
            </button>

            <p className="text-[10px] text-ink3 text-center">
              En soumettant ce formulaire, vous acceptez que vos retours soient utilisés dans le cadre de l'amélioration des services UCAR.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
