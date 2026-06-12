import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { useAIGenerate } from '@renderer/hooks/useAIGenerate'

interface InputWithAIProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  hint?: string
  error?: string
  aiPrompt: string
  onAIResult: (text: string) => void
}

function parseSuggestions(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)-]\s*["«»]?/, '').replace(/["»]$/, '').trim())
    .filter((line) => line.length > 3)
    .slice(0, 6)
}

export function InputWithAI({
  label,
  hint,
  error,
  aiPrompt,
  onAIResult,
  className = '',
  ...props
}: InputWithAIProps): React.ReactElement {
  const { generating, result, error: aiError, generate, clear } = useAIGenerate()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result) setOpen(true)
  }, [result])

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
        clear()
      }
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') { setOpen(false); clear() }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, clear])

  function handleSelect(text: string): void {
    onAIResult(text)
    setOpen(false)
    clear()
  }

  const suggestions = result ? parseSuggestions(result) : []

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <button
          type="button"
          onClick={() => generate(aiPrompt)}
          disabled={generating}
          title="Sugerir con IA"
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-violet-400 transition-colors hover:bg-violet-50 hover:text-violet-600 disabled:opacity-50 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
        >
          {generating
            ? <Loader2 size={11} className="animate-spin" />
            : <Sparkles size={11} />
          }
          <span>{generating ? 'Generando…' : 'Sugerir'}</span>
        </button>
      </div>

      <div className="relative" ref={panelRef}>
        <input
          {...props}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-shadow focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/50'
              : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100 dark:border-slate-600 dark:focus:border-primary-500 dark:focus:ring-primary-900/50'
          } ${className}`}
        />

        {open && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-xl dark:border-violet-800 dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-violet-100 px-3 py-1.5 dark:border-violet-800/60">
              <p className="text-[10px] font-black uppercase tracking-widest text-violet-400">Sugerencias IA</p>
              <button
                type="button"
                onClick={() => { setOpen(false); clear() }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto p-1">
              {suggestions.map((s, i) => (
                <button
                  key={`sug-${i}`}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-violet-50 dark:text-slate-200 dark:hover:bg-violet-900/30"
                >
                  <span className="mt-0.5 shrink-0 text-[10px] font-bold text-violet-400">{i + 1}</span>
                  <span className="leading-snug">{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {aiError && <p className="text-xs text-red-500">{aiError}</p>}
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}
