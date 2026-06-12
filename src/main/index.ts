import { app, shell, BrowserWindow, dialog, Menu } from 'electron'
import { join } from 'path'
import { initAISettings } from './aiService'
import * as ipcFile from './ipc/file'
import * as ipcBackup from './ipc/backup'
import * as ipcSnapshot from './ipc/snapshot'
import * as ipcAI from './ipc/ai'
import * as ipcPDF from './ipc/pdf'
import * as ipcDecretos from './ipc/decretos'
import * as ipcRecientes from './ipc/recientes'
import * as ipcWindow from './ipc/window'

const isDev = process.env.NODE_ENV === 'development'

// ─── Global error handlers ────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled promise rejection:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[Main] Uncaught exception:', err)
})

let mainWindow: BrowserWindow | null = null

function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1280,
    minHeight: 800,
    show: false,
    autoHideMenuBar: false,
    titleBarStyle: 'default',
    title: 'SdA Creator Pro — Región de Murcia',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow!.webContents.send('window:close-requested')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // ─── Content Security Policy (producción solamente) ───────────────────────
  if (!isDev) {
    const CSP = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'"
    ].join('; ')

    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [CSP]
        }
      })
    })
  }

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  buildMenu()
}

function buildMenu(): void {
  const template = Menu.buildFromTemplate([
    {
      label: 'Archivo',
      submenu: [
        { label: 'Nueva SdA', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:nueva') },
        { label: 'Abrir SdA…', accelerator: 'CmdOrCtrl+O', click: () => mainWindow?.webContents.send('menu:abrir') },
        { label: 'Guardar', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu:guardar') },
        { label: 'Guardar como…', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu:guardar-como') },
        { type: 'separator' },
        { label: 'Exportar PDF', accelerator: 'CmdOrCtrl+P', click: () => mainWindow?.webContents.send('menu:exportar-pdf') },
        { type: 'separator' },
        { role: 'quit', label: 'Salir' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' },
        { role: 'selectAll', label: 'Seleccionar todo' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom normal' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Reducir zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla completa' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de SdA Creator',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              title: 'SdA Creator Pro',
              message: 'SdA Creator Pro v2.0.0',
              detail:
                'Generador de Situaciones de Aprendizaje LOMLOE\nRegión de Murcia\n\n🆕 Novedades en v2.0:\n• Asistente IA con historial por sección\n• Búsqueda global con navegación al campo\n• Historial de versiones con comparador de cambios\n• Plantillas personalizadas guardables\n• Tour interactivo de primera vez\n• Resumen ejecutivo generado por IA\n• Autoguardado nativo en disco (sin límite de tamaño)\n• Optimización de rendimiento con selectores granulares\n\nBasado en el modelo del INTEF.\n\nCreado por Diego Alberto Moya Puerta\nMaestro de Educación Primaria — Región de Murcia',
              type: 'info'
            })
          }
        },
        ...(isDev
          ? [
              { type: 'separator' as const },
              { role: 'toggleDevTools' as const, label: 'Herramientas de desarrollo' }
            ]
          : [])
      ]
    }
  ])
  Menu.setApplicationMenu(template)
}

// ─── Register IPC modules ─────────────────────────────────────────────────────

ipcFile.register(getMainWindow)
ipcBackup.register()
ipcSnapshot.register()
ipcAI.register()
ipcPDF.register(getMainWindow)
ipcDecretos.register(getMainWindow)
ipcRecientes.register()
ipcWindow.register(getMainWindow)

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('es.murciaeduca.sda-creator')
  }
  initAISettings(app.getPath('userData'))
  ipcRecientes.init(app.getPath('userData'))
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
