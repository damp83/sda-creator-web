import { ipcMain } from 'electron'
import { join, parse as parsePath } from 'path'
import { existsSync, readdirSync, readFileSync, statSync, unlinkSync } from 'fs'

export function register(): void {
  ipcMain.handle('app:listarSnapshots', (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') return []
    const { dir, name } = parsePath(filePath)
    if (!existsSync(dir)) return []

    const prefix = `${name}_`
    const suffix = '.bak'
    const result: { fileName: string; num: number; savedAt: string; size: number }[] = []

    for (const file of readdirSync(dir)) {
      if (!file.startsWith(prefix) || !file.endsWith(suffix)) continue
      const num = parseInt(file.slice(prefix.length, -suffix.length), 10)
      if (isNaN(num)) continue
      try {
        const st = statSync(join(dir, file))
        result.push({ fileName: file, num, savedAt: st.mtime.toISOString(), size: st.size })
      } catch { /* archivo inaccesible — ignorar */ }
    }

    return result.sort((a, b) => b.num - a.num)
  })

  ipcMain.handle('app:leerSnapshot', (_event, { basePath, fileName }: { basePath: string; fileName: string }) => {
    if (!basePath || !fileName || fileName.includes('..') || /[/\\]/.test(fileName) || fileName.includes('\0'))
      throw new Error('Parámetros inválidos.')
    const fullPath = join(parsePath(basePath).dir, fileName)
    if (!existsSync(fullPath)) throw new Error('Snapshot no encontrado.')
    try { return readFileSync(fullPath, 'utf-8') } catch { throw new Error('No se pudo leer el snapshot.') }
  })

  ipcMain.handle('app:eliminarSnapshot', (_event, { basePath, fileName }: { basePath: string; fileName: string }) => {
    if (!basePath || !fileName || fileName.includes('..') || /[/\\]/.test(fileName) || fileName.includes('\0'))
      throw new Error('Parámetros inválidos.')
    const fullPath = join(parsePath(basePath).dir, fileName)
    try { if (existsSync(fullPath)) unlinkSync(fullPath) } catch { return false }
    return true
  })
}
