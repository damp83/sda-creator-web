import { safeStorage } from 'electron'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

export type AIProvider = 'claude' | 'openai' | 'gemini'

export interface ProviderConfig {
  model: string
  apiKeyEnc: string
}

export interface AISettings {
  activeProvider: AIProvider
  providers: Record<AIProvider, ProviderConfig>
}

const DEFAULTS: AISettings = {
  activeProvider: 'claude',
  providers: {
    claude: { model: 'claude-haiku-4-5-20251001', apiKeyEnc: '' },
    openai: { model: 'gpt-4o-mini', apiKeyEnc: '' },
    gemini: { model: 'gemini-2.0-flash-lite', apiKeyEnc: '' }
  }
}

let settingsPath = ''
let settingsCache: AISettings | null = null

export function initAISettings(userDataPath: string): void {
  settingsPath = join(userDataPath, 'ai-settings.json')
  settingsCache = null
}

export function loadSettings(): AISettings {
  if (settingsCache) return settingsCache
  if (!settingsPath || !existsSync(settingsPath)) return structuredClone(DEFAULTS)
  try {
    const parsed = JSON.parse(readFileSync(settingsPath, 'utf-8')) as Partial<AISettings>
    settingsCache = {
      activeProvider: parsed.activeProvider ?? DEFAULTS.activeProvider,
      providers: {
        claude: { ...DEFAULTS.providers.claude, ...parsed.providers?.claude },
        openai: { ...DEFAULTS.providers.openai, ...parsed.providers?.openai },
        gemini: { ...DEFAULTS.providers.gemini, ...parsed.providers?.gemini }
      }
    }
    return settingsCache
  } catch {
    return structuredClone(DEFAULTS)
  }
}

export function saveSettings(settings: AISettings): void {
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
  settingsCache = settings
}

function canEncrypt(): boolean {
  return safeStorage.isEncryptionAvailable()
}

export function encryptKey(key: string): string {
  if (!key) return ''
  if (!canEncrypt()) {
    throw new Error(
      'El cifrado seguro no está disponible en este sistema. No se puede guardar la clave de API de forma segura.'
    )
  }
  return safeStorage.encryptString(key).toString('base64')
}

export function decryptKey(enc: string): string {
  if (!enc) return ''
  if (!canEncrypt()) return ''
  try {
    return safeStorage.decryptString(Buffer.from(enc, 'base64'))
  } catch {
    return ''
  }
}

const AI_TIMEOUT_MS = 30_000       // chat / chips rápidos
const AI_TIMEOUT_LONG_MS = 90_000  // completar SdA completa

export { AI_TIMEOUT_LONG_MS }

function withTimeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

async function throwApiError(res: Response): Promise<never> {
  const err = await res.json().catch(() => ({})) as Record<string, unknown>
  const msg = (err.error as Record<string, unknown>)?.message ?? `Error ${res.status}`
  throw new Error(String(msg))
}

const DEFAULT_MAX_TOKENS = 2048

export async function callAI(prompt: string, settings: AISettings, timeoutMs = AI_TIMEOUT_MS, maxTokens = DEFAULT_MAX_TOKENS): Promise<string> {
  const prov = settings.providers[settings.activeProvider]
  const apiKey = decryptKey(prov.apiKeyEnc)
  if (!apiKey) throw new Error('No hay clave API configurada. Ve a Ajustes → IA.')
  switch (settings.activeProvider) {
    case 'claude': return callClaude(prompt, prov.model, apiKey, timeoutMs, maxTokens)
    case 'openai': return callOpenAI(prompt, prov.model, apiKey, timeoutMs, maxTokens)
    case 'gemini': return callGemini(prompt, prov.model, apiKey, timeoutMs, maxTokens)
  }
}

// ─── Generación de imágenes ───────────────────────────────────────────────────

const AI_IMAGE_TIMEOUT_MS = 90_000

/** Indica si el proveedor activo puede generar imágenes (Claude no puede). */
export function canGenerateImages(provider: AIProvider): boolean {
  return provider === 'openai' || provider === 'gemini'
}

/**
 * Genera una imagen a partir de un prompt. Devuelve un data URL (base64).
 * Detecta el proveedor activo; Claude no soporta imágenes.
 */
export async function generarImagen(prompt: string, settings: AISettings): Promise<string> {
  const provider = settings.activeProvider
  const apiKey = decryptKey(settings.providers[provider].apiKeyEnc)
  if (!apiKey) throw new Error('No hay clave API configurada. Ve a Ajustes → IA.')
  switch (provider) {
    case 'openai': return callOpenAIImage(prompt, apiKey)
    case 'gemini': return callGeminiImage(prompt, apiKey)
    case 'claude':
      throw new Error('Claude no genera imágenes. Cambia a OpenAI o Gemini en Ajustes → IA para ilustrar el cuaderno.')
  }
}

async function callOpenAIImage(prompt: string, apiKey: string): Promise<string> {
  const { signal, clear } = withTimeout(AI_IMAGE_TIMEOUT_MS)
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024' }),
      signal
    })
    if (!res.ok) await throwApiError(res)
    const data = await res.json() as { data: Array<{ b64_json?: string; url?: string }> }
    const b64 = data.data[0]?.b64_json
    if (!b64) throw new Error('La API de OpenAI no devolvió ninguna imagen.')
    return `data:image/png;base64,${b64}`
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('Tiempo de espera agotado generando la imagen. Inténtalo de nuevo.')
    throw err
  } finally {
    clear()
  }
}

async function callGeminiImage(prompt: string, apiKey: string): Promise<string> {
  const { signal, clear } = withTimeout(AI_IMAGE_TIMEOUT_MS)
  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict'
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '1:1' }
      }),
      signal
    })
    if (!res.ok) await throwApiError(res)
    const data = await res.json() as { predictions: Array<{ bytesBase64Encoded?: string; mimeType?: string }> }
    const pred = data.predictions?.[0]
    if (!pred?.bytesBase64Encoded) throw new Error('La API de Gemini no devolvió ninguna imagen.')
    return `data:${pred.mimeType ?? 'image/png'};base64,${pred.bytesBase64Encoded}`
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error('Tiempo de espera agotado generando la imagen. Inténtalo de nuevo.')
    throw err
  } finally {
    clear()
  }
}

async function callClaude(prompt: string, model: string, apiKey: string, timeoutMs: number, maxTokens = DEFAULT_MAX_TOKENS): Promise<string> {
  const { signal, clear } = withTimeout(timeoutMs)
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
      signal
    })
    if (!res.ok) await throwApiError(res)
    const data = await res.json() as { content: Array<{ text: string }> }
    return data.content[0]?.text ?? ''
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error(`Tiempo de espera agotado (${timeoutMs / 1000} s). Comprueba tu conexión o usa un modelo más rápido.`)
    throw err
  } finally {
    clear()
  }
}

async function callOpenAI(prompt: string, model: string, apiKey: string, timeoutMs: number, maxTokens = DEFAULT_MAX_TOKENS): Promise<string> {
  const { signal, clear } = withTimeout(timeoutMs)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
      signal
    })
    if (!res.ok) await throwApiError(res)
    const data = await res.json() as { choices: Array<{ message: { content: string } }> }
    return data.choices[0]?.message?.content ?? ''
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error(`Tiempo de espera agotado (${timeoutMs / 1000} s). Comprueba tu conexión o usa un modelo más rápido.`)
    throw err
  } finally {
    clear()
  }
}

async function callGemini(prompt: string, model: string, apiKey: string, timeoutMs: number, maxTokens = DEFAULT_MAX_TOKENS): Promise<string> {
  const { signal, clear } = withTimeout(timeoutMs)
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(model)}:generateContent`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      }),
      signal
    })
    if (!res.ok) await throwApiError(res)
    const data = await res.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> }
    return data.candidates[0]?.content?.parts[0]?.text ?? ''
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw new Error(`Tiempo de espera agotado (${timeoutMs / 1000} s). Comprueba tu conexión o usa un modelo más rápido.`)
    throw err
  } finally {
    clear()
  }
}
