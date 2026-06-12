import { ipcMain, dialog, shell } from 'electron'
import { join, parse as parsePath } from 'path'
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs'
import type { BrowserWindow } from 'electron'

const MAX_BACKUPS = 20

function createBackup(targetPath: string, content: string): void {
  try {
    const { dir, name } = parsePath(targetPath)
    const prefix = `${name}_`
    const suffix = '.bak'
    const backups: { file: string; num: number }[] = []

    for (const file of readdirSync(dir)) {
      if (file.startsWith(prefix) && file.endsWith(suffix)) {
        const num = parseInt(file.slice(prefix.length, -suffix.length), 10)
        if (!isNaN(num)) backups.push({ file, num })
      }
    }

    const maxNumber = backups.length > 0 ? Math.max(...backups.map((b) => b.num)) : 0
    const nextNumber = maxNumber + 1
    const backupPath = join(dir, `${name}_${String(nextNumber).padStart(3, '0')}${suffix}`)
    writeFileSync(backupPath, content, 'utf-8')
    console.log(`[Backup] Creado snapshot: ${backupPath}`)

    backups.push({ file: `${name}_${String(nextNumber).padStart(3, '0')}${suffix}`, num: nextNumber })
    backups.sort((a, b) => a.num - b.num)

    if (backups.length > MAX_BACKUPS) {
      for (const item of backups.slice(0, backups.length - MAX_BACKUPS)) {
        try { unlinkSync(join(dir, item.file)) } catch (e) { console.warn('[Backup] No se pudo eliminar backup antiguo:', item.file, e) }
      }
    }
  } catch (err) {
    console.error('[Backup] Error creando snapshot:', err)
  }
}

export function register(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('dialog:abrirArchivo', async () => {
    const win = getMainWindow()
    if (!win) return null
    const result = await dialog.showOpenDialog(win, {
      title: 'Abrir Situación de Aprendizaje',
      filters: [{ name: 'Situación de Aprendizaje', extensions: ['sda.json', 'json'] }],
      properties: ['openFile']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    const filePath = result.filePaths[0]
    try {
      return { filePath, content: readFileSync(filePath, 'utf-8') }
    } catch (err) {
      console.error('[IPC] dialog:abrirArchivo — error:', err)
      throw new Error('No se pudo leer el archivo seleccionado. Comprueba los permisos.')
    }
  })

  ipcMain.handle('dialog:guardarArchivo', async (_event, { content, filePath }) => {
    const win = getMainWindow()
    if (!win) return null
    let targetPath = filePath
    if (!targetPath) {
      const result = await dialog.showSaveDialog(win, {
        title: 'Guardar Situación de Aprendizaje',
        defaultPath: 'mi-sda.json',
        filters: [{ name: 'Situación de Aprendizaje', extensions: ['json'] }]
      })
      if (result.canceled || !result.filePath) return null
      targetPath = result.filePath
    }
    try {
      writeFileSync(targetPath, content, 'utf-8')
      createBackup(targetPath, content)
    } catch (err) {
      console.error('[IPC] dialog:guardarArchivo — error:', err)
      throw new Error('No se pudo guardar el archivo. Comprueba los permisos.')
    }
    return targetPath
  })

  ipcMain.handle('dialog:guardarComo', async (_event, { content }) => {
    const win = getMainWindow()
    if (!win) return null
    const result = await dialog.showSaveDialog(win, {
      title: 'Guardar como…',
      defaultPath: 'mi-sda.json',
      filters: [{ name: 'Situación de Aprendizaje', extensions: ['json'] }]
    })
    if (result.canceled || !result.filePath) return null
    try {
      writeFileSync(result.filePath, content, 'utf-8')
      createBackup(result.filePath, content)
    } catch (err) {
      console.error('[IPC] dialog:guardarComo — error:', err)
      throw new Error('No se pudo guardar el archivo. Comprueba los permisos.')
    }
    return result.filePath
  })

  ipcMain.handle('dialog:confirmar', async (_event, { mensaje }) => {
    const win = getMainWindow()
    if (!win) return false
    const result = await dialog.showMessageBox(win, {
      type: 'question',
      buttons: ['Cancelar', 'Continuar sin guardar'],
      defaultId: 0,
      cancelId: 0,
      title: 'Cambios sin guardar',
      message: mensaje
    })
    return result.response === 1
  })

  ipcMain.handle('app:mostrarEnExplorador', (_event, filePath: string) => {
    if (!filePath || typeof filePath !== 'string') return
    shell.showItemInFolder(filePath)
  })
}
