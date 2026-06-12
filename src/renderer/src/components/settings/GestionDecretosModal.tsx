import React, { useEffect, useState } from 'react'
import { X, BookOpen, Plus, Trash2, AlertCircle, CheckCircle2, Loader2, Lock, FileJson } from 'lucide-react'
import { Button, ModalShell } from '@renderer/components/ui'
import {
  listarDecretosUsuario,
  importarDecreto,
  eliminarDecreto,
  invalidarCache,
  type DecretoInfo
} from '@renderer/services/curriculoService'
import { useSdAStore } from '@renderer/store/sdaStore'

const BUILTIN_DECRETOS = [
  { fileName: 'lenguaymates.json', ambito: 'Lengua Castellana, Literatura y Matemáticas', comunidad: 'Región de Murcia' },
  { fileName: 'cienciasnaturalesysociales.json', ambito: 'Ciencias Naturales y Sociales', comunidad: 'Región de Murcia' },
  { fileName: 'educacionfisica.json', ambito: 'Educación Física', comunidad: 'Región de Murcia' },
  { fileName: 'plasticaymusica.json', ambito: 'Ed. Plástica, Visual y Musical', comunidad: 'Región de Murcia' },
]

const JSON_TEMPLATE = {
  comunidad: "Nombre de la Comunidad Autónoma",
  ambito: "NOMBRE DEL ÁMBITO O ÁREA",
  areas: [
    {
      nombre: "Nombre del área o asignatura (D. XXX/XXXX)",
      competencias_especificas: [
        {
          ce: "CE 1: Descripción de la competencia específica...",
          criterios_evaluacion: {
            primaria_ciclo_1: [
              "1.1. Criterio de evaluación para 1º-2º...",
              "1.2. Otro criterio..."
            ],
            primaria_ciclo_2: ["2.1. Criterio para 3º-4º..."],
            primaria_ciclo_3: ["3.1. Criterio para 5º-6º..."]
          }
        }
      ],
      saberes_basicos: {
        "A. BLOQUE DE SABERES": {
          primaria_ciclo_1: ["- Saber básico 1", "- Saber básico 2"],
          primaria_ciclo_2: ["- Saber básico 3"],
          primaria_ciclo_3: ["- Saber básico 4"]
        }
      }
    }
  ]
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

type Status = { type: 'success' | 'error'; text: string } | null

export function GestionDecretosModal({ isOpen, onClose }: Props): React.ReactElement | null {
  const { refreshCurriculo } = useSdAStore()
  const [userDecretos, setUserDecretos] = useState<DecretoInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [showTemplate, setShowTemplate] = useState(false)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    listarDecretosUsuario()
      .then(setUserDecretos)
      .catch(() => setUserDecretos([]))
      .finally(() => setLoading(false))
  }, [isOpen])

  async function handleImportar(): Promise<void> {
    setImporting(true)
    setStatus(null)
    try {
      const result = await importarDecreto()
      if (!result) {
        setImporting(false)
        return
      }
      if (result.error) {
        setStatus({ type: 'error', text: result.error })
      } else {
        invalidarCache()
        refreshCurriculo()
        const updated = await listarDecretosUsuario()
        setUserDecretos(updated)
        setStatus({ type: 'success', text: `Decreto "${result.ambito}" importado correctamente.` })
      }
    } catch {
      setStatus({ type: 'error', text: 'Error inesperado al importar el decreto.' })
    }
    setImporting(false)
  }

  async function handleEliminar(fileName: string, ambito: string): Promise<void> {
    const msg = `¿Eliminar el decreto "${ambito}"? Esta acción no se puede deshacer.`
    const ok = window.api
      ? await window.api.confirmar(msg)
      : window.confirm(msg)
    if (!ok) return

    setDeletingFile(fileName)
    setStatus(null)
    try {
      await eliminarDecreto(fileName)
      invalidarCache()
      refreshCurriculo()
      setUserDecretos((prev) => prev.filter((d) => d.fileName !== fileName))
      setStatus({ type: 'success', text: 'Decreto eliminado correctamente.' })
    } catch {
      setStatus({ type: 'error', text: 'Error al eliminar el decreto.' })
    }
    setDeletingFile(null)
  }

  function downloadTemplate(): void {
    const blob = new Blob([JSON.stringify(JSON_TEMPLATE, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'decreto-curriculo-plantilla.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Gestión de decretos" className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
      <div>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
              <BookOpen size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Gestión de decretos curriculares
              </h2>
              <p className="text-xs text-slate-400">
                Añade decretos de otras comunidades o niveles educativos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Status message */}
          {status && (
            <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {status.type === 'success'
                ? <CheckCircle2 size={15} className="shrink-0" />
                : <AlertCircle size={15} className="shrink-0" />
              }
              {status.text}
            </div>
          )}

          {/* Decretos incluidos */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Lock size={12} />
              Decretos incluidos en la aplicación
            </h3>
            <div className="space-y-2">
              {BUILTIN_DECRETOS.map((d) => (
                <div
                  key={d.fileName}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/40">
                    <BookOpen size={15} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{d.ambito}</p>
                    <p className="text-xs text-slate-400">{d.comunidad}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    Incluido
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Decretos de usuario */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Plus size={12} />
              Mis decretos
            </h3>

            {loading ? (
              <div className="flex items-center gap-2 py-4 text-slate-400">
                <Loader2 size={15} className="animate-spin" />
                <span className="text-sm">Cargando...</span>
              </div>
            ) : userDecretos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center dark:border-slate-700">
                <FileJson size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm text-slate-400">No has añadido ningún decreto todavía.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userDecretos.map((d) => (
                  <div
                    key={d.fileName}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                      <BookOpen size={15} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{d.ambito}</p>
                      <p className="text-xs text-slate-400">
                        {d.comunidad && <><span className="text-violet-500 dark:text-violet-400">{d.comunidad}</span> · </>}
                        {d.numAreas} área{d.numAreas !== 1 ? 's' : ''} · {d.numCEs} CE{d.numCEs !== 1 ? 's' : ''}
                        <span className="ml-2 text-slate-300">·</span>
                        <span className="ml-2 font-mono">{d.fileName}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleEliminar(d.fileName, d.ambito)}
                      disabled={deletingFile === d.fileName}
                      className="shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-900/30"
                      title="Eliminar decreto"
                    >
                      {deletingFile === d.fileName
                        ? <Loader2 size={15} className="animate-spin" />
                        : <Trash2 size={15} />
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Plantilla JSON */}
          <section>
            <button
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => setShowTemplate(!showTemplate)}
            >
              <div className="flex items-center gap-2">
                <FileJson size={15} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  ¿Cómo crear un decreto propio?
                </span>
              </div>
              <span className="text-xs text-slate-400">{showTemplate ? 'Ocultar' : 'Ver formato'}</span>
            </button>
            {showTemplate && (
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  Crea un archivo <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">decreto.json</code> siguiendo esta estructura. Incluye el campo{' '}
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">&quot;comunidad&quot;</code>{' '}
                  para agrupar el decreto por comunidad autónoma. Las claves de ciclo válidas son:{' '}
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">primaria_ciclo_1</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">primaria_ciclo_2</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">primaria_ciclo_3</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">infantil_ciclo_1</code>,{' '}
                  <code className="rounded bg-slate-200 px-1 py-0.5 font-mono text-[11px] dark:bg-slate-700">infantil_ciclo_2</code>
                </p>
                <pre className="max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-50">
                  {JSON.stringify(JSON_TEMPLATE, null, 2)}
                </pre>
                <div className="mt-3">
                  <Button variant="secondary" size="sm" icon={<FileJson size={13} />} onClick={downloadTemplate}>
                    Descargar plantilla
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <p className="text-xs text-slate-400">
            Los decretos importados se guardan en la carpeta de datos de la aplicación.
          </p>
          <Button
            variant="primary"
            icon={importing ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            onClick={handleImportar}
            disabled={importing}
          >
            Importar decreto (JSON)
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
