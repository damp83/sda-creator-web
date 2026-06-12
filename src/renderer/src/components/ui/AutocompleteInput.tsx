import React, { useState, useRef } from 'react'
import { Clock } from 'lucide-react'

const MAX_STORED = 8

function loadSuggestions(storageKey: string): string[] {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function persistSuggestion(storageKey: string, value: string): void {
  if (!value.trim()) return
  const list = loadSuggestions(storageKey).filter((s) => s !== value.trim())
  list.unshift(value.trim())
  try {
    localStorage.setItem(storageKey, JSON.stringify(list.slice(0, MAX_STORED)))
  } catch { /* noop */ }
}

interface AutocompleteInputProps {
  storageKey: string
  value: string
  onChange: (value: string) => void
  label?: React.ReactNode
  placeholder?: string
  className?: string
}

export function AutocompleteInput({
  storageKey,
  value,
  onChange,
  label,
  placeholder,
  className,
}: AutocompleteInputProps): React.ReactElement {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function getFiltered(current: string): string[] {
    const all = loadSuggestions(storageKey)
    return current.trim()
      ? all.filter((s) => s.toLowerCase().includes(current.toLowerCase()) && s !== current)
      : all
  }

  function handleFocus(): void {
    const filtered = getFiltered(value)
    setSuggestions(filtered.slice(0, 5))
    setOpen(filtered.length > 0)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = e.target.value
    onChange(v)
    const filtered = getFiltered(v)
    setSuggestions(filtered.slice(0, 5))
    setOpen(filtered.length > 0)
  }

  function handleBlur(): void {
    // Delay to allow mousedown on suggestion to fire first
    setTimeout(() => setOpen(false), 160)
    persistSuggestion(storageKey, value)
  }

  function handleSelect(s: string): void {
    onChange(s)
    setOpen(false)
    persistSuggestion(storageKey, s)
  }

  return (
    <div className={`relative ${className ?? ''}`} ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm transition-shadow focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-primary-500 dark:focus:ring-primary-900/50"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <p className="border-b border-slate-100 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:text-slate-500">
            Recientes
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={() => handleSelect(s)}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
            >
              <Clock size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
