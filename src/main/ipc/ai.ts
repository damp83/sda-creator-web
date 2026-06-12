import { ipcMain } from 'electron'
import {
  loadSettings, saveSettings, encryptKey, decryptKey, callAI, generarImagen,
  type AIProvider, type AISettings
} from '../aiService'

const VALID_PROVIDERS: AIProvider[] = ['claude', 'openai', 'gemini']
const MAX_KEY_LEN = 512
const MAX_MODEL_LEN = 128

// Límite: 30 llamadas por minuto (ventana deslizante)
const AI_RATE_LIMIT = 30
const aiCallTimestamps: number[] = []

function checkRateLimit(): void {
  const now = Date.now()
  const cutoff = now - 60_000
  const idx = aiCallTimestamps.findIndex(t => t > cutoff)
  if (idx > 0) aiCallTimestamps.splice(0, idx)
  else if (idx === -1) aiCallTimestamps.length = 0
  if (aiCallTimestamps.length >= AI_RATE_LIMIT) {
    throw new Error('Demasiadas peticiones a la IA en poco tiempo. Espera unos segundos.')
  }
  aiCallTimestamps.push(now)
}

export function register(): void {
  ipcMain.handle('ai:getSettings', () => {
    const s = loadSettings()
    return {
      activeProvider: s.activeProvider,
      providers: {
        claude: { model: s.providers.claude.model, hasKey: !!s.providers.claude.apiKeyEnc },
        openai: { model: s.providers.openai.model, hasKey: !!s.providers.openai.apiKeyEnc },
        gemini: { model: s.providers.gemini.model, hasKey: !!s.providers.gemini.apiKeyEnc }
      }
    }
  })

  ipcMain.handle('ai:saveSettings', (_event, data: unknown) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Datos de configuración no válidos.')
    }
    const d = data as Record<string, unknown>

    if (!VALID_PROVIDERS.includes(d.activeProvider as AIProvider)) {
      throw new Error('Proveedor de IA no válido.')
    }
    if (!d.providers || typeof d.providers !== 'object' || Array.isArray(d.providers)) {
      throw new Error('Sección "providers" no válida.')
    }
    const providers = d.providers as Record<string, unknown>
    for (const p of VALID_PROVIDERS) {
      const prov = providers[p]
      if (!prov || typeof prov !== 'object' || Array.isArray(prov)) {
        throw new Error(`Configuración inválida para el proveedor "${p}".`)
      }
      const { model, apiKey } = prov as Record<string, unknown>
      if (typeof model !== 'string' || model.length === 0 || model.length > MAX_MODEL_LEN) {
        throw new Error(`Modelo no válido para el proveedor "${p}".`)
      }
      if (typeof apiKey !== 'string' || apiKey.length > MAX_KEY_LEN) {
        throw new Error(`Clave de API no válida para el proveedor "${p}".`)
      }
    }

    const typedData = d as { activeProvider: AIProvider; providers: Record<AIProvider, { model: string; apiKey: string }> }
    const cur = loadSettings()
    const updated: AISettings = {
      activeProvider: typedData.activeProvider,
      providers: {
        claude: {
          model: typedData.providers.claude.model,
          apiKeyEnc: typedData.providers.claude.apiKey ? encryptKey(typedData.providers.claude.apiKey) : cur.providers.claude.apiKeyEnc
        },
        openai: {
          model: typedData.providers.openai.model,
          apiKeyEnc: typedData.providers.openai.apiKey ? encryptKey(typedData.providers.openai.apiKey) : cur.providers.openai.apiKeyEnc
        },
        gemini: {
          model: typedData.providers.gemini.model,
          apiKeyEnc: typedData.providers.gemini.apiKey ? encryptKey(typedData.providers.gemini.apiKey) : cur.providers.gemini.apiKeyEnc
        }
      }
    }
    saveSettings(updated)
    return true
  })

  const MAX_PROMPT_LEN = 32_000

  const MAX_OUTPUT_TOKENS = 8192

  ipcMain.handle('ai:generar', async (_event, { prompt, timeoutMs, maxTokens }: { prompt: string; timeoutMs?: number; maxTokens?: number }) => {
    if (typeof prompt !== 'string') throw new Error('Prompt no válido.')
    if (prompt.length > MAX_PROMPT_LEN) throw new Error(`El prompt supera el límite de ${MAX_PROMPT_LEN} caracteres.`)
    const tokens = typeof maxTokens === 'number' && maxTokens > 0 ? Math.min(maxTokens, MAX_OUTPUT_TOKENS) : undefined
    checkRateLimit()
    return callAI(prompt, loadSettings(), timeoutMs, tokens)
  })

  ipcMain.handle('ai:generarImagen', async (_event, { prompt }: { prompt: string }) => {
    if (typeof prompt !== 'string' || prompt.length === 0) throw new Error('Prompt de imagen no válido.')
    if (prompt.length > MAX_PROMPT_LEN) throw new Error(`El prompt supera el límite de ${MAX_PROMPT_LEN} caracteres.`)
    checkRateLimit()
    return generarImagen(prompt, loadSettings())
  })

  ipcMain.handle('ai:testConexion', async (
    _event,
    { provider, apiKey, model }: { provider: AIProvider; apiKey: string; model: string }
  ) => {
    if (!VALID_PROVIDERS.includes(provider as AIProvider)) throw new Error('Proveedor de IA no válido.')
    if (typeof model !== 'string' || model.length === 0 || model.length > MAX_MODEL_LEN) throw new Error('Modelo no válido.')
    if (typeof apiKey !== 'string' || apiKey.length > MAX_KEY_LEN) throw new Error('Clave de API no válida.')
    const cur = loadSettings()
    const keyToUse = apiKey || decryptKey(cur.providers[provider].apiKeyEnc)
    if (!keyToUse) throw new Error('No hay clave configurada para este proveedor.')
    const testSettings: AISettings = {
      activeProvider: provider,
      providers: { ...cur.providers, [provider]: { model, apiKeyEnc: encryptKey(keyToUse) } }
    }
    return callAI('Responde únicamente con la palabra "OK".', testSettings)
  })
}
