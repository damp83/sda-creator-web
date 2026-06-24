import { dialog } from 'electron'
import electronUpdater from 'electron-updater'
import type { BrowserWindow } from 'electron'
import { log } from './logger'

const { autoUpdater } = electronUpdater

/**
 * Configura la auto-actualización contra GitHub Releases. Solo debe invocarse en
 * la app empaquetada (no en desarrollo). Descarga las nuevas versiones en segundo
 * plano y, al terminar, ofrece reiniciar para instalar.
 *
 * @param getMainWindow  acceso a la ventana principal para los diálogos.
 * @param markQuitting   marca que el cierre que viene es para instalar la
 *                       actualización, para que el interceptor de cierre lo permita.
 */
export function initAutoUpdate(
  getMainWindow: () => BrowserWindow | null,
  markQuitting: () => void
): void {
  autoUpdater.logger = log
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => log.info('[Update] Buscando actualizaciones…'))
  autoUpdater.on('update-available', (info) => log.info('[Update] Actualización disponible:', info.version))
  autoUpdater.on('update-not-available', () => log.info('[Update] La aplicación está actualizada'))
  autoUpdater.on('download-progress', (p) => log.info(`[Update] Descargando: ${Math.round(p.percent)}%`))
  autoUpdater.on('error', (err) => log.error('[Update] Error de actualización:', err))

  autoUpdater.on('update-downloaded', async (info) => {
    log.info('[Update] Actualización descargada:', info.version)
    const win = getMainWindow()
    if (!win) return
    const { response } = await dialog.showMessageBox(win, {
      type: 'info',
      buttons: ['Reiniciar ahora', 'Más tarde'],
      defaultId: 0,
      cancelId: 1,
      title: 'Actualización disponible',
      message: `Se ha descargado la versión ${info.version} de SdA Creator.`,
      detail: 'Reinicia la aplicación para instalarla. Si lo dejas para más tarde, se instalará automáticamente la próxima vez que cierres la aplicación.'
    })
    if (response === 0) {
      markQuitting()
      // setImmediate: deja que se cierre el diálogo antes de reiniciar.
      setImmediate(() => autoUpdater.quitAndInstall())
    }
  })

  autoUpdater.checkForUpdates().catch((e) => log.error('[Update] No se pudo comprobar actualizaciones:', e))
}
