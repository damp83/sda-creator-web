import log from 'electron-log/main'

/**
 * Inicializa el registro persistente de la aplicación. Los logs se escriben en
 * un archivo dentro de userData (carpeta `logs/`), con rotación al superar el
 * tamaño máximo, además de mostrarse por consola en desarrollo.
 *
 * Windows: %APPDATA%/sda-creator/logs/main.log
 * macOS:   ~/Library/Logs/sda-creator/main.log
 */
export function initLogger(): void {
  log.initialize()
  log.transports.file.level = 'info'
  log.transports.console.level = 'debug'
  // Rotación: al superar 5 MB, el archivo se renombra a .old y se empieza uno nuevo.
  log.transports.file.maxSize = 5 * 1024 * 1024

  // Enrutar console.* del proceso main al archivo de log (sin perder la consola).
  Object.assign(console, log.functions)

  // Capturar errores no gestionados y registrarlos con su traza.
  log.errorHandler.startCatching({ showDialog: false })

  log.info('[App] Logger inicializado')
}

export { log }
