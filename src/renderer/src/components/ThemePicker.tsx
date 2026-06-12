import React, { useState, useRef, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { THEMES, type ThemeKey } from '@renderer/utils/themes'

interface Props {
  current: ThemeKey
  onChange: (key: ThemeKey) => void
}

/**
 * Selector de tema como popover: un solo icono en el header que despliega
 * la paleta con etiquetas, en lugar de seis bolitas permanentes.
 */
export function ThemePicker({ current, onChange }: Props): React.ReactElement {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent): void {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const currentTheme = THEMES.find((t) => t.key === current)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={`Color de la interfaz (${currentTheme?.label ?? ''})`}
        aria-label="Cambiar color de la interfaz"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <span className="relative">
          <Palette size={15} />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-white dark:ring-slate-900"
            style={{ backgroundColor: currentTheme?.hex500 }}
          />
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Color de la interfaz
          </p>
          {THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => { onChange(t.key); setOpen(false) }}
              aria-label={`Tema ${t.label}`}
              aria-pressed={current === t.key}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                current === t.key
                  ? 'bg-slate-100 font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
              }`}
            >
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full ${current === t.key ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-800' : ''}`}
                style={{ backgroundColor: t.hex500 }}
              />
              {t.label}
              {current === t.key && <span className="ml-auto text-[10px] text-slate-400">activo</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
