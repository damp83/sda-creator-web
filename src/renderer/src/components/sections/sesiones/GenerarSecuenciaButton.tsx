import React, { useState, useCallback } from 'react'
import { Sparkles, Loader2, AlertTriangle, X } from 'lucide-react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { generarConIA } from '@renderer/services/aiService'
import { buildSecuenciaPrompt, parseSecuenciaJSON } from './secuenciaUtils'
import type { Sesion } from '@renderer/types'

interface GenerarSecuenciaButtonProps {
  onGenerate: (sesiones: Sesion[]) => void
}

export function GenerarSecuenciaButton({ onGenerate }: GenerarSecuenciaButtonProps): React.ReactElement {
  const { sda } = useSdAStore()
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleGenerate = useCallback(async () => {
    setState('loading')
    setError('')
    try {
      const prompt = buildSecuenciaPrompt(sda)
      const result = await generarConIA(prompt)
      const sesiones = parseSecuenciaJSON(result)
      onGenerate(sesiones)
      setState('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar la secuencia')
      setState('error')
    }
  }, [sda, onGenerate])

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={state === 'loading'}
        className="flex items-center gap-2 rounded-xl border border-violet-300 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition-all hover:from-violet-100 hover:to-purple-100 hover:shadow-md disabled:opacity-60 dark:border-violet-700 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-300 dark:hover:from-violet-900/50"
      >
        {state === 'loading'
          ? <Loader2 size={16} className="animate-spin" />
          : <Sparkles size={16} />
        }
        {state === 'loading' ? 'Generando secuencia…' : `Generar ${sda.numSesiones || 6} sesiones con IA`}
      </button>

      {state === 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setState('idle')} className="shrink-0"><X size={12} /></button>
        </div>
      )}
    </div>
  )
}
