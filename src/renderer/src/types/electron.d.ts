type AIProvider = 'claude' | 'openai' | 'gemini'

interface RecentFile {
  filePath: string
  titulo: string
  savedAt: string
  ciclo?: string
  ambito?: string
  pct?: number
}

interface DecretoInfo {
  fileName: string
  ambito: string
  numAreas: number
  numCEs: number
}

interface AISettingsPublic {
  activeProvider: AIProvider
  providers: Record<AIProvider, { model: string; hasKey: boolean }>
}

interface SaveAISettingsPayload {
  activeProvider: AIProvider
  providers: Record<AIProvider, { model: string; apiKey: string }>
}

interface TestConexionPayload {
  provider: AIProvider
  apiKey: string
  model: string
}

interface SnapshotInfo {
  fileName: string
  num: number
  savedAt: string
  size: number
}

interface ElectronAPI {
  // Diálogos de archivo
  abrirArchivo: () => Promise<{ filePath: string; content: string } | null>
  guardarArchivo: (content: string, filePath: string | null) => Promise<string | null>
  guardarComo: (content: string) => Promise<string | null>
  confirmar: (mensaje: string) => Promise<boolean>

  // Currículo
  leerCurriculo: (fileName: string) => Promise<string>

  // Decretos de usuario
  listarDecretosUsuario: () => Promise<DecretoInfo[]>
  leerDecretoUsuario: (fileName: string) => Promise<string>
  importarDecreto: () => Promise<{ fileName: string; ambito: string } | { error: string } | null>
  eliminarDecreto: (fileName: string) => Promise<boolean>

  // PDF
  exportarPDF: (data: { centro: string; logoUrl?: string; titulo?: string; landscape?: boolean; sinPie?: boolean }) => Promise<string | null>
  exportarTexto: (data: { content: string; defaultName?: string; extension?: string }) => Promise<string | null>

  // Compartir
  mostrarEnExplorador: (filePath: string) => Promise<void>

  // Ventana
  setTitle: (title: string) => Promise<void>
  onWindowCloseRequested: (cb: () => void) => void
  confirmClose: () => Promise<void>

  // Eventos del menú nativo
  onMenuNueva: (cb: () => void) => void
  onMenuAbrir: (cb: () => void) => void
  onMenuGuardar: (cb: () => void) => void
  onMenuGuardarComo: (cb: () => void) => void
  onMenuExportarPdf: (cb: () => void) => void

  // Archivos recientes
  leerArchivoPorRuta: (filePath: string) => Promise<string>
  getRecentFiles: () => Promise<RecentFile[]>
  addRecentFile: (data: { filePath: string; titulo: string; ciclo?: string; ambito?: string; pct?: number }) => Promise<boolean>

  // Suscripción a canales IPC con whitelist — devuelve función de cleanup
  on: (channel: string, cb: (...args: unknown[]) => void) => () => void
  removeAllListeners: (channel: string) => void

  // Snapshots
  listarSnapshots: (filePath: string) => Promise<SnapshotInfo[]>
  leerSnapshot: (data: { basePath: string; fileName: string }) => Promise<string>
  eliminarSnapshot: (data: { basePath: string; fileName: string }) => Promise<boolean>

  // Backup nativo (userData/backups/autosave.json)
  guardarBackup: (data: string) => Promise<void>
  cargarBackup: () => Promise<string | null>
  eliminarBackup: () => Promise<void>

  // IA
  getAISettings: () => Promise<AISettingsPublic>
  saveAISettings: (data: SaveAISettingsPayload) => Promise<boolean>
  generarConIA: (prompt: string, timeoutMs?: number, maxTokens?: number) => Promise<string>
  generarImagenIA: (prompt: string) => Promise<string>
  testConexionIA: (data: TestConexionPayload) => Promise<string>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
