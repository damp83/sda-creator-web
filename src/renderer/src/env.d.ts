/// <reference types="vite/client" />

interface DecretoInfo {
  fileName: string
  ambito: string
  numAreas: number
  numCEs: number
}

interface ImportDecretoResult {
  error?: string
  fileName?: string
  ambito?: string
}

type AIProvider = 'claude' | 'openai' | 'gemini'

interface AIPublicSettings {
  activeProvider: AIProvider
  providers: Record<AIProvider, { model: string; hasKey: boolean }>
}

interface ElectronAPI {
  exportarDocx: (sda: unknown) => Promise<string | null>
  abrirArchivo: () => Promise<{ filePath: string; content: string } | null>
  guardarArchivo: (content: string, filePath: string | null) => Promise<string | null>
  guardarComo: (content: string) => Promise<string | null>
  confirmar: (mensaje: string) => Promise<boolean>
  leerCurriculo: (filename: string) => Promise<string>
  setTitle: (title: string) => void
  onWindowCloseRequested: (cb: () => void) => void
  confirmClose: () => Promise<void>
  onMenuNueva: (cb: () => void) => void
  onMenuAbrir: (cb: () => void) => void
  onMenuGuardar: (cb: () => void) => void
  onMenuGuardarComo: (cb: () => void) => void
  onMenuExportarPdf: (cb: () => void) => void
  removeAllListeners: (channel: string) => void
  // IA
  getAISettings: () => Promise<AIPublicSettings>
  saveAISettings: (data: unknown) => Promise<boolean>
  generarConIA: (prompt: string, timeoutMs?: number, maxTokens?: number) => Promise<string>
  testConexionIA: (data: { provider: AIProvider; apiKey: string; model: string }) => Promise<string>
  // Gestión de decretos de usuario
  listarDecretosUsuario: () => Promise<DecretoInfo[]>
  leerDecretoUsuario: (fileName: string) => Promise<string>
  importarDecreto: () => Promise<ImportDecretoResult | null>
  eliminarDecreto: (fileName: string) => Promise<boolean>
}

declare interface Window {
  api: ElectronAPI
}
