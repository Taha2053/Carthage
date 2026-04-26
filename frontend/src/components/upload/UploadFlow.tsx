import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, CheckCircle2, Edit2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type State = 'idle' | 'uploading' | 'validating' | 'confirm' | 'done' | 'error'

const STEPS = ['Téléversement', 'Validation KPIs', 'Prêt pour confirmation']

interface ExtractedKPI {
  [key: string]: string | number
}

export default function UploadFlow() {
  const [uiState, setUiState] = useState<State>('idle')
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ExtractedKPI[]>([])
  const [error, setError] = useState<string | null>(null)
  const [institutionId] = useState(10)

  const uploadFile = useCallback(async (file: File) => {
    setFile(file)
    setUiState('uploading')
    setProgress(0)
    setCurrentStep(0)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('institution_id', String(institutionId))
    formData.append('domain_code', 'STU')

    try {
      // Upload
      setCurrentStep(0)
      for (let p = 0; p <= 33; p += 5) {
        setProgress(p)
        await new Promise(r => setTimeout(r, 30))
      }

      // Validate
      setUiState('validating')
      setCurrentStep(1)
      for (let p = 33; p <= 66; p += 5) {
        setProgress(p)
        await new Promise(r => setTimeout(r, 30))
      }

      // Extract preview (OCR simulation - AI agent later)
      const extractFormData = new FormData()
      extractFormData.append('file', file)

      const extractRes = await fetch('/api/v1/upload/extract', {
        method: 'POST',
        body: extractFormData,
      })

      if (!extractRes.ok) {
        throw new Error('Failed to extract preview')
      }

      const extractData = await extractRes.json()
      setPreview(extractData.preview || [])

      setProgress(100)
      setUiState('confirm')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUiState('error')
    }
  }, [institutionId])

  const handleSubmit = useCallback(async () => {
    if (!file) return

    setUiState('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('institution_id', String(institutionId))
    formData.append('domain_code', 'STU')

    try {
      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setProgress(100)
      setSubmitted(true)
      setUiState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed')
      setUiState('error')
    }
  }, [file, institutionId])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) uploadFile(droppedFile)
  }, [uploadFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) uploadFile(selectedFile)
  }, [uploadFile])

  const updateKPI = useCallback((index: number, field: string, value: string | number) => {
    setPreview(prev => prev.map((kpi, i) =>
      i === index ? { ...kpi, [field]: value } : kpi
    ))
  }, [])

  if (submitted || uiState === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-3 py-10 text-center"
      >
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <p className="font-semibold text-gray-800">Données soumises avec succès</p>
        <p className="text-sm text-gray-400">Les KPIs ont été intégrés au système UCAR.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmitted(false)
            setUiState('idle')
            setPreview([])
            setFile(null)
          }}
        >
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
            <input
              type="file"
              className="sr-only"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileInput}
            />
            <Upload className={`h-8 w-8 ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Déposez votre fichier ici ou cliquez pour parcourir
              </p>
              <p className="text-xs text-gray-400 mt-1">Formats acceptés : Excel, CSV</p>
            </div>
          </label>
        </motion.div>
      )}

      {(uiState === 'uploading' || uiState === 'validating') && (
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
              {preview.length} indicateurs extraits — vérifiez et confirmez
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicateur</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Établissement</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((kpi, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">
                    {kpi.metric_code || kpi.metric || kpi.metric_code?.toString()}
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      value={kpi.value || 0}
                      onChange={(e) => updateKPI(i, 'value', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm border rounded"
                      step={0.1}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {kpi.institution_code || '-'}
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
              onClick={handleSubmit}
            >
              Soumettre au système
            </Button>
            <Button
              variant="outline"
              onClick={() => { setUiState('idle'); setProgress(0); setPreview([]) }}
            >
              Annuler
            </Button>
          </div>
        </motion.div>
      )}

      {uiState === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-red-600 p-4 bg-red-50 rounded-lg"
        >
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Erreur de traitement</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUiState('idle')}
            className="ml-auto"
          >
            Réessayer
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}