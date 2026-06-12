import React from 'react'
import { X, CheckCircle2, AlertTriangle, XCircle, FileDown, Printer } from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import type { SdA } from '@renderer/types'
import { getSectionComplete } from '@renderer/utils/sdaProgress'
import { stripHtml } from '@renderer/utils/stripHtml'

interface Props {
  isOpen: boolean
  format: 'pdf' | 'docx'
  onClose: () => void
  onConfirm: () => void
}

interface SectionStatus {
  label: string
  complete: boolean
  warnings: string[]
}

function buildStatuses(sda: SdA): SectionStatus[] {
  function hasContent(html: string): boolean {
    return stripHtml(html ?? '').trim().length > 10
  }

  return [
    {
      label: 'Identificación',
      complete: getSectionComplete(sda, 0),
      warnings: [
        !sda.titulo?.trim() ? 'Sin título' : '',
        !sda.ciclo ? 'Sin ciclo/etapa' : '',
        !sda.ambito ? 'Sin área/ámbito' : '',
        !sda.docente?.trim() ? 'Sin docente' : '',
      ].filter(Boolean),
    },
    {
      label: 'Justificación',
      complete: getSectionComplete(sda, 1),
      warnings: [
        !hasContent(sda.justificacion) ? 'Justificación vacía' : '',
      ].filter(Boolean),
    },
    {
      label: 'Reto / Producto Final',
      complete: getSectionComplete(sda, 2),
      warnings: [
        !hasContent(sda.situacionProblema) ? 'Situación-problema vacía' : '',
        !hasContent(sda.productoFinal) ? 'Producto final vacío' : '',
      ].filter(Boolean),
    },
    {
      label: 'Vinculación Curricular',
      complete: getSectionComplete(sda, 3),
      warnings: [
        sda.elementosCurriculares.length === 0 ? 'Sin criterios de evaluación' : '',
        sda.competenciasClave.length === 0 ? 'Sin competencias clave' : '',
      ].filter(Boolean),
    },
    {
      label: 'Metodología',
      complete: getSectionComplete(sda, 4),
      warnings: [
        !hasContent(sda.planteamientoMetodologico) ? 'Planteamiento metodológico vacío' : '',
      ].filter(Boolean),
    },
    {
      label: 'Secuencia Didáctica',
      complete: getSectionComplete(sda, 5),
      warnings: [
        sda.sesiones.length === 0 ? 'Sin sesiones creadas' : '',
        sda.numSesiones > 0 && sda.sesiones.length !== sda.numSesiones
          ? `Planificadas ${sda.numSesiones} sesiones pero solo hay ${sda.sesiones.length}`
          : '',
      ].filter(Boolean),
    },
    {
      label: 'Evaluación',
      complete: getSectionComplete(sda, 6),
      warnings: [
        sda.instrumentosEvaluacion.length === 0 ? 'Sin instrumentos de evaluación' : '',
      ].filter(Boolean),
    },
    {
      label: 'Atención a la Diversidad (DUA)',
      complete: getSectionComplete(sda, 7),
      warnings: [
        !hasContent(sda.duaImplicacion) && !hasContent(sda.duaRepresentacion) && !hasContent(sda.duaAccionExpresion)
          ? 'Todos los apartados DUA vacíos'
          : '',
      ].filter(Boolean),
    },
    {
      label: 'Interdisciplinariedad',
      complete: getSectionComplete(sda, 8),
      warnings: [
        sda.conexiones.length === 0 ? 'Sin conexiones interdisciplinares' : '',
      ].filter(Boolean),
    },
    {
      label: 'ODS',
      complete: getSectionComplete(sda, 9),
      warnings: [
        sda.ods.length === 0 ? 'Sin ODS seleccionados' : '',
      ].filter(Boolean),
    },
  ]
}

export function ExportChecklistModal({ isOpen, format, onClose, onConfirm }: Props): React.ReactElement | null {
  const { sda } = useSdAStore()

  if (!isOpen) return null

  const statuses = buildStatuses(sda)
  const complete = statuses.filter((s) => s.complete).length
  const total = statuses.length
  const pct = Math.round((complete / total) * 100)
  const allWarnings = statuses.flatMap((s) => s.warnings)
  const hasIssues = allWarnings.length > 0

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={`Exportar como ${format === 'pdf' ? 'PDF' : 'Word'}`} className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${format === 'pdf' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
              {format === 'pdf'
                ? <Printer size={18} className="text-red-600 dark:text-red-400" />
                : <FileDown size={18} className="text-blue-600 dark:text-blue-400" />
              }
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Exportar como {format === 'pdf' ? 'PDF' : 'Word'}
              </h2>
              <p className="text-xs text-slate-400">
                {complete} de {total} secciones completadas · {pct}%
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-500 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Lista de secciones */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {hasIssues && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Hay {allWarnings.length} aviso{allWarnings.length > 1 ? 's' : ''} en la SdA. Puedes exportar igualmente, pero el documento tendrá secciones incompletas.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            {statuses.map((s) => (
              <div
                key={s.label}
                className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${
                  s.complete
                    ? 'bg-emerald-50 dark:bg-emerald-900/10'
                    : s.warnings.length > 0
                      ? 'bg-amber-50 dark:bg-amber-900/10'
                      : 'bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {s.complete
                    ? <CheckCircle2 size={15} className="text-emerald-500" />
                    : s.warnings.length > 0
                      ? <AlertTriangle size={15} className="text-amber-500" />
                      : <XCircle size={15} className="text-slate-300 dark:text-slate-600" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium ${s.complete ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {s.label}
                  </p>
                  {s.warnings.length > 0 && (
                    <ul className="mt-0.5 space-y-0.5">
                      {s.warnings.map((w, j) => (
                        <li key={j} className="text-[11px] text-amber-600 dark:text-amber-400">
                          · {w}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors ${
              format === 'pdf'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {format === 'pdf' ? <Printer size={15} /> : <FileDown size={15} />}
            {hasIssues ? 'Exportar de todos modos' : `Exportar como ${format === 'pdf' ? 'PDF' : 'Word'}`}
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
