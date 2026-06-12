import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'

// Canales permitidos para suscripción (whitelist)
const ALLOWED_CHANNELS = [
  'window:close-requested',
  'menu:nueva',
  'menu:abrir',
  'menu:guardar',
  'menu:guardar-como',
  'menu:exportar-pdf'
] as const

type AllowedChannel = (typeof ALLOWED_CHANNELS)[number]

contextBridge.exposeInMainWorld('api', {
  // Diálogos de archivo
  abrirArchivo: () => ipcRenderer.invoke('dialog:abrirArchivo'),
  guardarArchivo: (content: string, filePath: string | null) =>
    ipcRenderer.invoke('dialog:guardarArchivo', { content, filePath }),
  guardarComo: (content: string) => ipcRenderer.invoke('dialog:guardarComo', { content }),
  confirmar: (mensaje: string) => ipcRenderer.invoke('dialog:confirmar', { mensaje }),

  // Lectura de currículo
  leerCurriculo: (fileName: string) => ipcRenderer.invoke('app:leerCurriculo', fileName),

  // Gestión de decretos de usuario
  listarDecretosUsuario: () => ipcRenderer.invoke('app:listarDecretosUsuario'),
  leerDecretoUsuario: (fileName: string) => ipcRenderer.invoke('app:leerDecretoUsuario', fileName),
  importarDecreto: () => ipcRenderer.invoke('app:importarDecreto'),
  eliminarDecreto: (fileName: string) => ipcRenderer.invoke('app:eliminarDecreto', fileName),

  // PDF
  exportarPDF: (data: { centro: string; logoUrl?: string; titulo?: string; landscape?: boolean; sinPie?: boolean }) =>
    ipcRenderer.invoke('app:exportarPDF', data),

  // Compartir — abre el Explorador de Windows mostrando el archivo
  mostrarEnExplorador: (filePath: string) => ipcRenderer.invoke('app:mostrarEnExplorador', filePath),

  // Ventana
  setTitle: (title: string) => ipcRenderer.invoke('window:setTitle', title),
  onWindowCloseRequested: (cb: () => void) => ipcRenderer.on('window:close-requested', cb),
  confirmClose: () => ipcRenderer.invoke('app:confirmClose'),

  // Escuchar eventos del menú nativo
  onMenuNueva: (cb: () => void) => ipcRenderer.on('menu:nueva', cb),
  onMenuAbrir: (cb: () => void) => ipcRenderer.on('menu:abrir', cb),
  onMenuGuardar: (cb: () => void) => ipcRenderer.on('menu:guardar', cb),
  onMenuGuardarComo: (cb: () => void) => ipcRenderer.on('menu:guardar-como', cb),
  onMenuExportarPdf: (cb: () => void) => ipcRenderer.on('menu:exportar-pdf', cb),

  // Suscripción a canal IPC con whitelist — devuelve función de limpieza
  on: (channel: string, cb: (...args: unknown[]) => void): (() => void) => {
    if (!(ALLOWED_CHANNELS as readonly string[]).includes(channel)) {
      console.warn(`[preload] Canal IPC no permitido: ${channel}`)
      return () => {}
    }
    const handler = (_event: IpcRendererEvent, ...args: unknown[]) => cb(...args)
    ipcRenderer.on(channel as AllowedChannel, handler)
    return () => ipcRenderer.removeListener(channel as AllowedChannel, handler)
  },
  // Mantenido por compatibilidad — preferir el unsubscribe devuelto por on()
  removeAllListeners: (channel: string) => {
    if ((ALLOWED_CHANNELS as readonly string[]).includes(channel)) {
      ipcRenderer.removeAllListeners(channel)
    }
  },

  // Exportar DOCX
  exportarDocx: (sda: unknown) => ipcRenderer.invoke('app:exportarDocx', sda),

  // Exportar texto plano / Markdown
  exportarTexto: (data: { content: string; defaultName?: string; extension?: string }) =>
    ipcRenderer.invoke('app:exportarTexto', data),

  // Archivos recientes
  leerArchivoPorRuta: (filePath: string) => ipcRenderer.invoke('app:leerArchivoPorRuta', filePath),
  getRecentFiles: () => ipcRenderer.invoke('app:getRecentFiles'),
  addRecentFile: (data: { filePath: string; titulo: string }) => ipcRenderer.invoke('app:addRecentFile', data),

  // Snapshots
  listarSnapshots: (filePath: string) => ipcRenderer.invoke('app:listarSnapshots', filePath),
  leerSnapshot: (data: { basePath: string; fileName: string }) => ipcRenderer.invoke('app:leerSnapshot', data),
  eliminarSnapshot: (data: { basePath: string; fileName: string }) => ipcRenderer.invoke('app:eliminarSnapshot', data),

  // Backup nativo
  guardarBackup: (data: string) => ipcRenderer.invoke('backup:guardar', data),
  cargarBackup: () => ipcRenderer.invoke('backup:leer'),
  eliminarBackup: () => ipcRenderer.invoke('backup:eliminar'),

  // IA
  getAISettings: () => ipcRenderer.invoke('ai:getSettings'),
  saveAISettings: (data: unknown) => ipcRenderer.invoke('ai:saveSettings', data),
  generarConIA: (prompt: string, timeoutMs?: number, maxTokens?: number) => ipcRenderer.invoke('ai:generar', { prompt, timeoutMs, maxTokens }),
  generarImagenIA: (prompt: string) => ipcRenderer.invoke('ai:generarImagen', { prompt }),
  testConexionIA: (data: unknown) => ipcRenderer.invoke('ai:testConexion', data)
})
