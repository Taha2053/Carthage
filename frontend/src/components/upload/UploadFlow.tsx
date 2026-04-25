import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type State = 'idle' | 'processing' | 'confirm'

const STEPS = ['Extraction OCR', 'Validation KPIs', 'Prêt pour confirmation']

const MOCK_EXTRACTED = [
  { kpi: 'Taux de réussite', valeur: '78%', domaine: 'Académique', status: 'confirmed' },
  { kpi: "Taux d'abandon", valeur: '12%', domaine: 'Académique', status: 'confirmed' },
  { kpi: 'Budget consommé', valeur: '2 940 000 TND', domaine: 'Finance', status: 'confirmed' },
  { kpi: "Taux d'exécution budgétaire", valeur: '70%', domaine: 'Finance', status: 'confirmed' },
  { kpi: "Taux d'employabilité", valeur: '64%', domaine: 'Insertion', status: 'confirmed' },
  { kpi: 'Consommation énergétique', valeur: '198 000 kWh', domaine: 'ESG', status: 'confirmed' },
]

export default function UploadFlow() {
  const [uiState, setUiState] = useState<State>('idle')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const startProcessing = useCallback(async () => {
    setUiState('processing')
    setProgress(0)
    setCurrentStep(0)

    for (let step = 0; step < STEPS.length; step++) {
      setCurrentStep(step)
      for (let p = step * 33; p <= (step + 1) * 33; p += 2) {
        await new Promise((r) => setTimeout(r, 60))
        setProgress(Math.min(p, 99))
      }
    }
    setProgress(100)
    await new Promise((r) => setTimeout(r, 400))
    setUiState('confirm')
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      startProcessing()
    },
    [startProcessing],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) startProcessing()
    },
    [startProcessing],
  )

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 py-10 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="font-semibold text-gray-800">Données soumises avec succès</p>
        <p className="text-sm text-gray-400">Les KPIs ont été intégrés au système NABD.</p>
        <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setUiState('idle') }}>
          Soumettre un autre fichier
        </Button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {uiState === 'idle' && (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 transition-colors ${
              dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <input type="file" className="sr-only" accept=".xlsx,.csv,.pdf" onChange={handleFileInput} />
            <Upload className={`h-8 w-8 ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Déposez votre fichier ici ou cliquez pour parcourir
              </p>
              <p className="text-xs text-gray-400 mt-1">Formats acceptés : Excel, CSV, PDF</p>
            </div>
          </label>
        </motion.div>
      )}

      {uiState === 'processing' && (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6 py-6"
        >
          <div className="text-center">
            <p className="font-medium text-gray-800">Analyse en cours par NABD Intelligence...</p>
            <p className="text-sm text-gray-400 mt-1">Extraction et validation des indicateurs</p>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="space-y-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < currentStep
                    ? 'bg-emerald-500 text-white'
                    : i === currentStep
                    ? 'bg-blue-800 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-sm ${i <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {uiState === 'confirm' && (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="font-medium text-gray-800">
              {MOCK_EXTRACTED.length} indicateurs extraits — vérifiez et confirmez
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicateur</TableHead>
                <TableHead>Valeur extraite</TableHead>
                <TableHead>Domaine</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_EXTRACTED.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{row.kpi}</TableCell>
                  <TableCell className="text-sm text-blue-700 font-mono">{row.valeur}</TableCell>
                  <TableCell>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {row.domaine}
                    </span>
                  </TableCell>
                  <TableCell>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-blue-800 hover:bg-blue-900"
              onClick={() => setSubmitted(true)}
            >
              Soumettre au système
            </Button>
            <Button
              variant="outline"
              onClick={() => { setUiState('idle'); setProgress(0) }}
            >
              Annuler
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
