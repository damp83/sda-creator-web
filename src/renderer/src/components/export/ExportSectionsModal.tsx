import React, { useState } from 'react'
import { X, FileDown, Printer } from 'lucide-react'
import { Button, ModalShell } from '@renderer/components/ui'

export interface ExportOptions {
  format: 'pdf' | 'docx'
  sections: Record<string, boolean>
}

interface Props {
  isOpen: boolean
  format: 'pdf' | 'docx'
  onClose: () => void
  onConfirm: (sections: Record<string, boolean>) => void
}

const SECTIONS = [
  { id: 'S01', label: 'Portada e Identificación' },
  { id: 'S02', label: 'Justificación y contextualización' },
  { id: 'S03', label: 'Reto / Situación-problema' },
  { id: 'S04', label: 'Vinculación curricular' },
  { id: 'S05', label: 'Metodología' },
  { id: 'S06', label: 'Secuencia didáctica' },
  { id: 'S07', label: 'Evaluación' },
  { id: 'S08', label: 'Atención a la diversidad (DUA)' },
  { id: 'S09', label: 'Interdisciplinariedad' },
  { id: 'S10', label: 'Objetivos de Desarrollo Sostenible (ODS)' },
  { id: 'S11', label: 'Cuaderno de Trabajo del alumnado (resumen)' }
]

export function ExportSectionsModal({ isOpen, format, onClose, onConfirm }: Props): React.ReactElement | null {
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init = {}
    SECTIONS.forEach((s) => (init[s.id] = true))
    return init
  })

  if (!isOpen) return null

  const toggleAll = (val: boolean) => {
    const next = { ...selected }
    SECTIONS.forEach((s) => (next[s.id] = val))
    setSelected(next)
  }

  const handleConfirm = () => {
    onConfirm(selected)
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title={`Secciones a exportar — ${format === 'pdf' ? 'PDF' : 'Word'}`} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 flex flex-col max-h-[85vh]">
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            {format === 'pdf' ? <Printer className="text-primary-500" size={20} /> : <FileDown className="text-primary-500" size={20} />}
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Exportar {format === 'pdf' ? 'PDF' : 'Word (.docx)'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Selecciona las secciones que deseas incluir en el documento exportado:
          </p>
          
          <div className="flex gap-2 mb-2">
            <button onClick={() => toggleAll(true)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">Marcar todo</button>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button onClick={() => toggleAll(false)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400">Desmarcar todo</button>
          </div>

          <div className="space-y-2">
            {SECTIONS.map((sec) => (
              <label key={sec.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 cursor-pointer hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors">
                <input
                  type="checkbox"
                  checked={!!selected[sec.id]}
                  onChange={(e) => setSelected({ ...selected, [sec.id]: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600 dark:border-slate-600 dark:bg-slate-700 dark:ring-offset-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span className="text-slate-400 dark:text-slate-500 mr-2">{sec.id.replace('S0', '').replace('S', '')}.</span>
                  {sec.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5 dark:border-slate-700 shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirm} icon={format === 'pdf' ? <Printer size={16} /> : <FileDown size={16} />}>
            Continuar
          </Button>
        </div>
      </div>
    </ModalShell>
  )
}
