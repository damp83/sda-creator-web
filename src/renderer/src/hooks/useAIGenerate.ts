import { useState, useCallback, useRef } from 'react'
import { generarConIA } from '@renderer/services/aiService'

const promptCache = new Map<string, string>()
const MAX_CACHE_SIZE = 60

function cacheSet(prompt: string, result: string): void {
  if (promptCache.size >= MAX_CACHE_SIZE) {
    promptCache.delete(promptCache.keys().next().value as string)
  }
  promptCache.set(prompt, result)
}

interface UseAIGenerateResult {
  generating: boolean
  result: string | null
  error: string | null
  generate: (prompt: string) => Promise<void>
  cancel: () => void
  clear: () => void
}

export function useAIGenerate(): UseAIGenerateResult {
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const generate = useCallback(async (prompt: string) => {
    const cached = promptCache.get(prompt)
    if (cached) {
      setResult(cached)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const text = await generarConIA(prompt)
      if (controller.signal.aborted) return
      cacheSet(prompt, text)
      setResult(text)
    } catch (e) {
      if (controller.signal.aborted) return
      setError(e instanceof Error ? e.message : 'Error al generar')
    } finally {
      if (!controller.signal.aborted) {
        setGenerating(false)
      }
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setGenerating(false)
  }, [])

  const clear = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { generating, result, error, generate, cancel, clear }
}
