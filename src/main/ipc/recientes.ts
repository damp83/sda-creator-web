import { ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync } from 'fs'

interface RecentFile { filePath: string; titulo: string; savedAt: string; ciclo?: string; ambito?: string; pct?: number }

const MAX_RECENTS = 5
let recentFilesPath = ''

export function init(userDataPath: string): void {
  recentFilesPath = join(userDataPath, 'recent-files.json')
}

function loadRecentFiles(): RecentFile[] {
  if (!recentFilesPath || !existsSync(recentFilesPath)) return []
  try { return JSON.parse(readFileSync(recentFilesPath, 'utf-8')) as RecentFile[] } catch { return [] }
}

function pushRecentFile(data: RecentFile): void {
  const list = loadRecentFiles().filter((r) => r.filePath !== data.filePath)
  list.unshift({ ...data, savedAt: new Date().toISOString() })
  try { writeFileSync(recentFilesPath, JSON.stringify(list.slice(0, MAX_RECENTS), null, 2), 'utf-8') } catch (e) { console.warn('[Recientes] No se pudo guardar archivos recientes:', e) }
}

export function register(): void {
  ipcMain.handle('app:leerArchivoPorRuta', (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') throw new Error('Ruta no válida.')
    if (filePath.includes('\0')) throw new Error('Ruta no válida.')
    if (!filePath.endsWith('.json')) throw new Error('Solo se pueden abrir archivos .json.')
    if (!existsSync(filePath)) throw new Error(`El archivo ya no existe: ${filePath}`)
    try { return readFileSync(filePath, 'utf-8') } catch (err) {
      console.error('[IPC] app:leerArchivoPorRuta — error:', err)
      throw new Error('No se pudo leer el archivo.')
    }
  })

  ipcMain.handle('app:getRecentFiles', () => loadRecentFiles())

  ipcMain.handle('app:addRecentFile', (_event, data: { filePath: string; titulo: string; ciclo?: string; ambito?: string; pct?: number }) => {
    pushRecentFile({ ...data, savedAt: new Date().toISOString() })
    return true
  })
}
