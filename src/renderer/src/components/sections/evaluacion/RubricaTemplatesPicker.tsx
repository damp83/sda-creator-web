import React, { useRef, useEffect } from 'react'
import { RUBRICA_TEMPLATES } from './evaluacionConstants'
import type { RubricaFila } from '@renderer/types'

interface RubricaTemplatesPickerProps {
  onSelect: (filas: RubricaFila[]) => void
  onClose: () => void
}

export function RubricaTemplatesPicker({ onSelect, onClose }: RubricaTemplatesPickerProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
    >
      <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:text-slate-500">
        Biblioteca de rúbricas
      </p>
      <div className="max-h-80 overflow-y-auto p-2">
        {RUBRICA_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => { onSelect(t.filas); onClose() }}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            <span className="mt-0.5 text-xl leading-none">{t.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t.desc}</p>
              <p className="mt-0.5 text-[10px] text-slate-300 dark:text-slate-600">{t.filas.length} criterios</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
