import { app, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs'

function getAutosavePath(): string {
  const dir = join(app.getPath('userData'), 'backups')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return join(dir, 'autosave.json')
}

export function register(): void {
  ipcMain.handle('backup:guardar', (_event, data: string) => {
    if (typeof data !== 'string') throw new Error('Datos de backup no válidos.')
    writeFileSync(getAutosavePath(), data, 'utf-8')
  })

  ipcMain.handle('backup:leer', () => {
    const p = join(app.getPath('userData'), 'backups', 'autosave.json')
    if (!existsSync(p)) return null
    try { return readFileSync(p, 'utf-8') } catch { return null }
  })

  ipcMain.handle('backup:eliminar', () => {
    const p = join(app.getPath('userData'), 'backups', 'autosave.json')
    try { if (existsSync(p)) unlinkSync(p) } catch { /* noop */ }
  })
}
