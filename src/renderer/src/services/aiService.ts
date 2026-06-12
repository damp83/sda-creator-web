export async function getAISettings(): Promise<AIPublicSettings | null> {
  if (!window.api?.getAISettings) return null
  return window.api.getAISettings()
}

export async function saveAISettings(data: {
  activeProvider: AIProvider
  providers: Record<AIProvider, { model: string; apiKey: string }>
}): Promise<void> {
  await window.api?.saveAISettings?.(data)
}

function cleanIpcError(e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e)
  return new Error(msg.replace(/^Error invoking remote method '[^']+': (Error: )?/, ''))
}

export async function generarConIA(prompt: string, timeoutMs?: number, maxTokens?: number): Promise<string> {
  if (!window.api?.generarConIA) throw new Error('IA no disponible en este entorno.')
  try {
    return await window.api.generarConIA(prompt, timeoutMs, maxTokens)
  } catch (e) {
    throw cleanIpcError(e)
  }
}

export async function generarImagenIA(prompt: string): Promise<string> {
  if (!window.api?.generarImagenIA) throw new Error('Generación de imágenes no disponible en este entorno.')
  try {
    return await window.api.generarImagenIA(prompt)
  } catch (e) {
    throw cleanIpcError(e)
  }
}

export async function testConexionIA(
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<string> {
  if (!window.api?.testConexionIA) throw new Error('IA no disponible en este entorno.')
  try {
    return await window.api.testConexionIA({ provider, apiKey, model })
  } catch (e) {
    throw cleanIpcError(e)
  }
}

export function isAIAvailable(): boolean {
  return !!window.api?.generarConIA
}
