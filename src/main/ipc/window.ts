import { ipcMain } from 'electron'
import type { BrowserWindow } from 'electron'

export function register(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle('window:setTitle', (_event, title: string) => {
    getMainWindow()?.setTitle(title)
  })

  ipcMain.handle('app:confirmClose', () => {
    getMainWindow()?.destroy()
  })
}
