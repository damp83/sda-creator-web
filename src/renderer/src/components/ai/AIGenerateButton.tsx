import React from 'react'
import { Sparkles, Loader2, X, Check, Wand2 } from 'lucide-react'
import { useAIGenerate } from '@renderer/hooks/useAIGenerate'
import { stripHtml } from '@renderer/utils/stripHtml'

function parseSuggestions(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[\.\)\-]\s*["«»]?/, '').replace(/["»]$/, '').trim())
    .filter((line) => line.length > 4)
}

interface AIGenerateButtonProps {
  prompt: string
  onResult: (text: string) => void
  mode?: 'text' | 'suggestions'
  label?: string
  improveLabel?: string
  currentValue?: string
  className?: string
}

export function AIGenerateButton({
  prompt,
  onResult,
  mode = 'text',
  label,
  improveLabel = 'Mejorar texto',
  currentValue,
  className = ''
}: AIGenerateButtonProps): React.ReactElement {
  const { generating, result, error, generate, cancel, clear } = useAIGenerate()

  const hasContent = Boolean(currentValue && stripHtml(currentValue).trim().length > 10)

  function handleImprove(): void {
    const improvePrompt = `${prompt}\n\nMejora el siguiente texto ya redactado (mantén el contenido principal pero hazlo más preciso, fluido y pedagógicamente sólido). Devuelve únicamente el texto mejorado:\n\n${stripHtml(currentValue!).trim()}`
    generate(improvePrompt)
  }

  function handleUse(text: string): void {
    onResult(text)
    clear()
  }

  const mainLabel = generating
    ? 'Generando…'
    : label ?? (mode === 'suggestions' ? 'Ideas con IA' : 'Generar con IA')

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => generating ? cancel() : generate(prompt)}
          className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30"
        >
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {generating ? <><span>{mainLabel}</span><span className="ml-1 opacity-60">(cancelar)</span></> : mainLabel}
        </button>

        {hasContent && (
          <button
            type="button"
            onClick={handleImprove}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-100 disabled:opacity-60 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30"
          >
            <Wand2 size={12} />
            {improveLabel}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={clear} className="shrink-0 hover:text-red-800">
            <X size={12} />
          </button>
        </div>
      )}

      {result && mode === 'suggestions' && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-3 dark:border-violet-800 dark:bg-violet-900/10">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-400">
              Sugerencias — haz clic en una para usarla:
            </p>
            <button type="button" onClick={clear} className="text-violet-400 hover:text-violet-600">
              <X size={13} />
            </button>
          </div>
          <div className="space-y-1.5">
            {parseSuggestions(result).map((s, i) => (
              <button
                key={`sug-${i}`}
                type="button"
                onClick={() => handleUse(s)}
                className="flex w-full items-start gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-violet-600 dark:hover:bg-violet-900/20"
              >
                <span className="mt-0.5 shrink-0 text-xs font-bold text-violet-400">{i + 1}</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {result && mode === 'text' && (
        <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-3 dark:border-violet-800 dark:bg-violet-900/10">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Texto generado:</p>
            <button type="button" onClick={clear} className="text-violet-400 hover:text-violet-600">
              <X size={13} />
            </button>
          </div>
          <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {result}
          </p>
          <button
            type="button"
            onClick={() => handleUse(result)}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            <Check size={12} />
            Usar este texto
          </button>
        </div>
      )}
    </div>
  )
}
