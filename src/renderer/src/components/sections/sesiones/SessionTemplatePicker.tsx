import React, { useRef, useEffect } from 'react'
import { SESSION_TEMPLATES } from './sessionTemplates'
import type { Sesion } from '@renderer/types'

interface SessionTemplatePickerProps {
  onSelect: (partial: Partial<Sesion>) => void
  onClose: () => void
}

export function SessionTemplatePicker({ onSelect, onClose }: SessionTemplatePickerProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
    >
      <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:text-slate-500">
        Plantilla de sesión
      </p>
      <div className="p-2">
        {SESSION_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => { onSelect(t.partial); onClose() }}
            className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            <span className="mt-0.5 text-lg leading-none">{t.emoji}</span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
