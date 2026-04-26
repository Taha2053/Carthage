import { useState, useCallback } from 'react'
import { uploadFile, getUploadHistory } from '@/services/upload'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function UploadPage() {
  const { t, i18n } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ extractedRows: { kpi: string; valeur: string; domaine: string }[]; confidence: number } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    getUploadHistory().then(setHistory).catch(() => {})
  }, [])

  const handleUpload = useCallback(async () => {
    if (!file) return
    setUploading(true)
    setResult(null)
    try {
      const res = await uploadFile(file)
      setResult(res)
      const h = await getUploadHistory()
      setHistory(h)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }, [file])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const locale = i18n.language === 'en' ? 'en-GB' : 'fr-FR'

  return (
    <div className="space-y-8 py-6 px-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="fade-up">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink3 num mb-1">
          {t('upload.subtitle')}
        </p>
        <h1 className="font-display text-4xl gold-shimmer tracking-tighter2">
          {t('upload.title')}
        </h1>
        <p className="text-ink3 text-sm mt-1">
          {t('upload.description')}
        </p>
      </div>

      <div className="glow-line" />

      {/* Upload zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up-1">
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer
              ${dragOver ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-rule bg-paper2/50 hover:border-gold/50'}
            `}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <div className="text-5xl mb-4">📄</div>
            <p className="font-display text-xl text-ink mb-2">
              {file ? file.name : t('upload.dropFile')}
            </p>
            <p className="text-sm text-ink3">
              {file
                ? `${(file.size / 1024).toFixed(1)} ${t('common.ko')} · ${t('upload.readyToSend')}`
                : t('upload.acceptedFormats')}
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`
              mt-4 w-full py-3 rounded-lg font-medium text-sm transition-all
              ${!file || uploading
                ? 'bg-rule text-ink3 cursor-not-allowed'
                : 'btn-primary'}
            `}
          >
            {uploading ? t('upload.processing') : t('upload.launchExtraction')}
          </button>
        </div>

        {/* Extraction results */}
        <div>
          {result ? (
            <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-ink">{t('upload.extractionResults')}</h3>
                <span className="pill pill-accent">
                  {t('upload.confidence')} {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <div className="rounded-lg border border-rule overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-paper2 border-b border-rule">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">{t('upload.kpi')}</th>
                      <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">{t('upload.value')}</th>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">{t('upload.domain')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.extractedRows.map((row, i) => (
                      <tr key={i} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                        <td className="px-4 py-3 text-ink">{row.kpi}</td>
                        <td className="px-4 py-3 text-right num font-medium text-ink">{row.valeur}</td>
                        <td className="px-4 py-3">
                          <span className="pill">{row.domaine}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-10 text-center">
              <p className="text-ink3 text-sm">{t('upload.resultsWillAppear')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload history */}
      <div className="fade-up-2">
        <h2 className="font-display text-2xl text-ink tracking-tighter2 mb-3">{t('upload.ingestionHistory')}</h2>
        {history.length > 0 ? (
          <div className="rounded-lg border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper2 border-b border-rule">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">{t('upload.file')}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">{t('upload.fileType')}</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">{t('upload.rows')}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.1em] text-ink3">{t('upload.status')}</th>
                  <th className="px-4 py-3 text-right text-[11px] uppercase tracking-[0.1em] text-ink3 num">{t('upload.date')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-rule last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-4 py-3 text-ink font-medium">{item.original_filename ?? '—'}</td>
                    <td className="px-4 py-3"><span className="pill">{item.file_type ?? 'csv'}</span></td>
                    <td className="px-4 py-3 text-right num text-ink3">{item.rows_inserted ?? 0}</td>
                    <td className="px-4 py-3">
                      <span className={`pill ${item.status === 'success' ? 'pill-accent' : ''}`}>
                        {item.status ?? t('upload.pending')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right num text-ink3 text-xs">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString(locale) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-rule bg-paper2/30 p-8 text-center">
            <p className="text-ink3 text-sm">{t('upload.noFilesYet')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
