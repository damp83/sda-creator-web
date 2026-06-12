import { app, ipcMain, dialog } from 'electron'
import { join, basename } from 'path'
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, copyFileSync } from 'fs'
import type { BrowserWindow } from 'electron'

function getUserDecretosDir(): string {
  return join(app.getPath('userData'), 'curriculo')
}

export function register(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('app:leerCurriculo', (_event, fileName: string) => {
    if (!fileName || typeof fileName !== 'string') throw new Error('Nombre de archivo no válido.')
    const safeName = basename(fileName)
    if (!safeName || safeName.includes('\0') || !safeName.endsWith('.json')) throw new Error('Nombre de archivo no válido.')
    const devPath = join(__dirname, '../../src/renderer/src/data/curriculo', safeName)
    const prodPath = join(process.resourcesPath, 'curriculo', safeName)
    const resolvedPath = existsSync(devPath) ? devPath : prodPath
    try {
      return readFileSync(resolvedPath, 'utf-8')
    } catch (err) {
      console.error('[IPC] app:leerCurriculo — error:', err)
      throw new Error(`No se encontró el currículo: ${safeName}`)
    }
  })

  ipcMain.handle('app:listarDecretosUsuario', () => {
    const dir = getUserDecretosDir()
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((file) => {
        try {
          const raw = readFileSync(join(dir, file), 'utf-8')
          const data = JSON.parse(raw) as Record<string, unknown>
          const areas = (data.areas as unknown[]) ?? []
          const numCEs = areas.reduce((acc: number, a: unknown) => {
            const area = a as Record<string, unknown>
            return acc + (((area.competencias_especificas as unknown[]) ?? []).length)
          }, 0)
          return {
            fileName: file,
            ambito: (data.ambito as string) ?? file,
            comunidad: data.comunidad as string | undefined,
            numAreas: areas.length,
            numCEs
          }
        } catch {
          return { fileName: file, ambito: file, comunidad: undefined, numAreas: 0, numCEs: 0 }
        }
      })
  })

  ipcMain.handle('app:leerDecretoUsuario', (_event, fileName: string) => {
    if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\') || fileName.includes('\0')) {
      throw new Error('Nombre de archivo no válido.')
    }
    const filePath = join(getUserDecretosDir(), fileName)
    if (!existsSync(filePath)) throw new Error(`Decreto ${fileName} no encontrado`)
    try {
      return readFileSync(filePath, 'utf-8')
    } catch (err) {
      console.error('[IPC] app:leerDecretoUsuario — error:', err)
      throw new Error(`No se pudo leer el decreto: ${fileName}`)
    }
  })

  ipcMain.handle('app:importarDecreto', async () => {
    const win = getMainWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Importar decreto curricular (JSON)',
      filters: [{ name: 'Decreto curricular JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const srcPath = result.filePaths[0]
    let raw: string
    try { raw = readFileSync(srcPath, 'utf-8') } catch { return { error: 'No se pudo leer el archivo.' } }
    let data: Record<string, unknown>
    try { data = JSON.parse(raw) } catch { return { error: 'El archivo no contiene JSON válido.' } }
    if (!data.ambito || typeof data.ambito !== 'string') {
      return { error: 'Falta el campo "ambito" (string) en el JSON.' }
    }
    if (!Array.isArray(data.areas) || (data.areas as unknown[]).length === 0) {
      return { error: 'Falta el campo "areas" (array) en el JSON.' }
    }
    const dir = getUserDecretosDir()
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const fileName = (srcPath.split(/[/\\]/).pop() as string)
    copyFileSync(srcPath, join(dir, fileName))
    return { fileName, ambito: data.ambito }
  })

  ipcMain.handle('app:eliminarDecreto', (_event, fileName: string) => {
    if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\') || fileName.includes('\0')) {
      throw new Error('Nombre de archivo no válido.')
    }
    const filePath = join(getUserDecretosDir(), fileName)
    try { if (existsSync(filePath)) unlinkSync(filePath) } catch (err) {
      console.error('[IPC] app:eliminarDecreto — error:', err)
      throw new Error(`No se pudo eliminar el decreto: ${fileName}`)
    }
    return true
  })
}
