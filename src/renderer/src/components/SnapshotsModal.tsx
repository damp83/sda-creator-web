import React, { useEffect, useState } from 'react'
import {
  History, RotateCcw, Trash2, X, FileWarning, Clock, Loader2,
  GitCompare, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import { parseSdAFromJSON } from '@renderer/utils/validateSda'
import { stripHtml } from '@renderer/utils/stripHtml'
import type { SdA } from '@renderer/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onRestored: (msg: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ─── Diff engine ─────────────────────────────────────────────────────────────

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function textSummary(html: string, isHtml: boolean): string {
  const t = isHtml ? stripHtml(html ?? '') : (html ?? '')
  const wc = wordCount(t)
  return t.trim() ? `${wc} palabra${wc !== 1 ? 's' : ''}` : '(vacío)'
}

interface DiffEntry {
  label: string
  section: string
  status: 'added' | 'removed' | 'changed'
  before: string
  after: string
}

const TEXT_FIELDS: Array<{ key: keyof SdA; label: string; section: string; isHtml: boolean }> = [
  { key: 'titulo', label: 'Título', section: 'Identificación', isHtml: false },
  { key: 'ciclo', label: 'Ciclo', section: 'Identificación', isHtml: false },
  { key: 'ambito', label: 'Área/Ámbito', section: 'Identificación', isHtml: false },
  { key: 'docente', label: 'Docente', section: 'Identificación', isHtml: false },
  { key: 'justificacion', label: 'Justificación', section: 'Justificación', isHtml: true },
  { key: 'contexto', label: 'Contexto', section: 'Justificación', isHtml: true },
  { key: 'situacionProblema', label: 'Situación-problema', section: 'Reto', isHtml: true },
  { key: 'productoFinal', label: 'Producto final', section: 'Reto', isHtml: true },
  { key: 'planteamientoMetodologico', label: 'Planteamiento metodológico', section: 'Metodología', isHtml: true },
  { key: 'duaImplicacion', label: 'DUA — Implicación', section: 'DUA', isHtml: true },
  { key: 'duaRepresentacion', label: 'DUA — Representación', section: 'DUA', isHtml: true },
  { key: 'duaAccionExpresion', label: 'DUA — Acción y expresión', section: 'DUA', isHtml: true },
  { key: 'transversales', label: 'Temas transversales', section: 'Interdisciplinariedad', isHtml: true },
  { key: 'justificacionOds', label: 'Justificación ODS', section: 'ODS', isHtml: true },
]

const ARRAY_FIELDS: Array<{ key: keyof SdA; label: string; section: string }> = [
  { key: 'competenciasClave', label: 'Competencias clave', section: 'Vinculación' },
  { key: 'elementosCurriculares', label: 'Elementos curriculares', section: 'Vinculación' },
  { key: 'sesiones', label: 'Sesiones', section: 'Secuencia Didáctica' },
  { key: 'instrumentosEvaluacion', label: 'Instrumentos de evaluación', section: 'Evaluación' },
  { key: 'conexiones', label: 'Conexiones interdisciplinares', section: 'Interdisciplinariedad' },
  { key: 'ods', label: 'ODS seleccionados', section: 'ODS' },
]

function computeDiff(snap: SdA, cur: SdA): DiffEntry[] {
  const entries: DiffEntry[] = []

  for (const f of TEXT_FIELDS) {
    const snapVal = String(snap[f.key] ?? '')
    const curVal = String(cur[f.key] ?? '')
    const snapText = f.isHtml ? stripHtml(snapVal) : snapVal
    const curText = f.isHtml ? stripHtml(curVal) : curVal
    const snapEmpty = !snapText.trim()
    const curEmpty = !curText.trim()

    if (snapEmpty && curEmpty) continue
    if (snapEmpty && !curEmpty) {
      entries.push({ label: f.label, section: f.section, status: 'added', before: '(vacío)', after: textSummary(curVal, f.isHtml) })
    } else if (!snapEmpty && curEmpty) {
      entries.push({ label: f.label, section: f.section, status: 'removed', before: textSummary(snapVal, f.isHtml), after: '(vacío)' })
    } else if (snapText.trim() !== curText.trim()) {
      entries.push({ label: f.label, section: f.section, status: 'changed', before: textSummary(snapVal, f.isHtml), after: textSummary(curVal, f.isHtml) })
    }
  }

  for (const f of ARRAY_FIELDS) {
    const snapArr = (snap[f.key] as unknown[]) ?? []
    const curArr = (cur[f.key] as unknown[]) ?? []
    if (snapArr.length === curArr.length) continue
    const label = (n: number) => `${n} elemento${n !== 1 ? 's' : ''}`
    const status: DiffEntry['status'] = snapArr.length === 0 ? 'added' : curArr.length === 0 ? 'removed' : 'changed'
    entries.push({ label: f.label, section: f.section, status, before: label(snapArr.length), after: label(curArr.length) })
  }

  return entries
}

// ─── DiffPanel ────────────────────────────────────────────────────────────────

function DiffPanel({ snap, cur, onClose }: { snap: SdA; cur: SdA; onClose: () => void }): React.ReactElement {
  const entries = computeDiff(snap, cur)
  const added = entries.filter((e) => e.status === 'added').length
  const removed = entries.filter((e) => e.status === 'removed').length
  const changed = entries.filter((e) => e.status === 'changed').length

  const sections = [...new Set(entries.map((e) => e.section))]

  const statusIcon = (s: DiffEntry['status']) => {
    if (s === 'added') return <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">+</span>
    if (s === 'removed') return <span className="text-[9px] font-black text-red-500 dark:text-red-400">−</span>
    return <span className="text-[9px] font-black text-amber-500">~</span>
  }

  const statusBg = (s: DiffEntry['status']) => {
    if (s === 'added') return 'border-emerald-100 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10'
    if (s === 'removed') return 'border-red-100 bg-red-50 dark:border-red-900/40 dark:bg-red-900/10'
    return 'border-amber-100 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10'
  }

  return (
    <div className="flex flex-col border-t border-slate-200 dark:border-slate-700">
      {/* Diff header */}
      <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <GitCompare size={13} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Cambios respecto a la versión actual
          </span>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
          <X size={12} />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="text-2xl">✓</span>
          <p className="text-xs text-slate-400">Esta versión es idéntica a la actual.</p>
        </div>
      ) : (
        <>
          {/* Summary pills */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            {changed > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">{changed} modificado{changed !== 1 ? 's' : ''}</span>}
            {added > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{added} añadido{added !== 1 ? 's' : ''}</span>}
            {removed > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-300">{removed} eliminado{removed !== 1 ? 's' : ''}</span>}
          </div>

          {/* Grouped entries */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {sections.map((sec) => (
              <div key={sec}>
                <p className="mb-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">{sec}</p>
                <div className="space-y-1.5">
                  {entries.filter((e) => e.section === sec).map((e, i) => (
                    <div key={`${e.section}-${e.label}-${i}`} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${statusBg(e.status)}`}>
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current bg-white dark:bg-slate-800">
                        {statusIcon(e.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{e.label}</p>
                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{e.before}</span>
                          <ArrowRight size={9} className="shrink-0" />
                          <span className="font-medium">{e.after}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SnapshotsModal({ isOpen, onClose, onRestored }: Props): React.ReactElement | null {
  const { filePath, sda, cargar } = useSdAStore()
  const [snapshots, setSnapshots] = useState<SnapshotInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [diffTarget, setDiffTarget] = useState<{ snap: SnapshotInfo; sdaData: SdA } | null>(null)
  const [loadingDiff, setLoadingDiff] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !filePath) { setSnapshots([]); setDiffTarget(null); return }
    setLoading(true)
    setError(null)
    window.api.listarSnapshots(filePath)
      .then(setSnapshots)
      .catch(() => setError('No se pudo cargar el historial.'))
      .finally(() => setLoading(false))
  }, [isOpen, filePath])

  async function handleRestore(snap: SnapshotInfo): Promise<void> {
    if (!filePath) return
    setRestoring(snap.fileName)
    setError(null)
    try {
      const content = await window.api.leerSnapshot({ basePath: filePath, fileName: snap.fileName })
      const restoredSda = parseSdAFromJSON(content)
      cargar(restoredSda, '')
      onClose()
      onRestored(`Restaurado: versión del ${formatDate(snap.savedAt)}`)
    } catch {
      setError('No se pudo restaurar este snapshot.')
    } finally {
      setRestoring(null)
    }
  }

  async function handleDelete(snap: SnapshotInfo): Promise<void> {
    if (!filePath) return
    await window.api.eliminarSnapshot({ basePath: filePath, fileName: snap.fileName })
    setSnapshots((prev) => prev.filter((s) => s.fileName !== snap.fileName))
    if (diffTarget?.snap.fileName === snap.fileName) setDiffTarget(null)
  }

  async function handleToggleDiff(snap: SnapshotInfo): Promise<void> {
    if (diffTarget?.snap.fileName === snap.fileName) {
      setDiffTarget(null)
      return
    }
    if (!filePath) return
    setLoadingDiff(snap.fileName)
    try {
      const content = await window.api.leerSnapshot({ basePath: filePath, fileName: snap.fileName })
      const snapSda = parseSdAFromJSON(content)
      setDiffTarget({ snap, sdaData: snapSda })
    } catch {
      setError('No se pudo cargar el snapshot para comparar.')
    } finally {
      setLoadingDiff(null)
    }
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Historial de versiones" className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
      <div>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
              <History size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Historial de versiones</h2>
              <p className="text-xs text-slate-400">Copias automáticas creadas al guardar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {!filePath ? (
            <EmptyState message="Guarda la SdA en disco al menos una vez para que aparezca el historial de versiones." />
          ) : loading ? (
            <div className="flex h-32 items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 size={18} className="animate-spin" />
              Cargando historial…
            </div>
          ) : snapshots.length === 0 ? (
            <EmptyState message="Todavía no hay versiones guardadas. Se crean automáticamente cada vez que guardas el archivo en disco." />
          ) : (
            <div className="space-y-2">
              {snapshots.map((snap) => {
                const isDiffOpen = diffTarget?.snap.fileName === snap.fileName
                return (
                  <div
                    key={snap.fileName}
                    className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    {/* Row */}
                    <div className="flex items-center justify-between gap-3 bg-white p-3 dark:bg-slate-800/50">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Clock size={14} className="shrink-0 text-slate-400" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            {formatDate(snap.savedAt)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatSize(snap.size)} · Versión #{snap.num}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {/* Ver cambios */}
                        <button
                          onClick={() => void handleToggleDiff(snap)}
                          disabled={!!restoring || loadingDiff === snap.fileName}
                          className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                            isDiffOpen
                              ? 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200'
                              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
                          }`}
                          title="Ver qué cambió respecto a la versión actual"
                        >
                          {loadingDiff === snap.fileName
                            ? <Loader2 size={11} className="animate-spin" />
                            : <GitCompare size={11} />}
                          {isDiffOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>

                        <button
                          onClick={() => void handleRestore(snap)}
                          disabled={!!restoring}
                          className="flex items-center gap-1 rounded-lg bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 disabled:opacity-50 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                        >
                          {restoring === snap.fileName
                            ? <Loader2 size={11} className="animate-spin" />
                            : <RotateCcw size={11} />}
                          Restaurar
                        </button>
                        <button
                          onClick={() => void handleDelete(snap)}
                          disabled={!!restoring}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Eliminar esta versión"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Diff panel (inline, below the row) */}
                    {isDiffOpen && diffTarget && (
                      <DiffPanel
                        snap={diffTarget.sdaData}
                        cur={sda}
                        onClose={() => setDiffTarget(null)}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {filePath && !loading && snapshots.length > 0 && (
          <div className="shrink-0 border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-center text-xs text-slate-400">
              Se conservan hasta 20 versiones. Las más antiguas se eliminan automáticamente al guardar.
            </p>
          </div>
        )}
      </div>
    </ModalShell>
  )
}

function EmptyState({ message }: { message: string }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <FileWarning size={32} className="text-slate-300 dark:text-slate-600" />
      <p className="max-w-[260px] text-sm text-slate-400">{message}</p>
    </div>
  )
}
