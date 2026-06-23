import { ipcMain, dialog } from 'electron'
import { writeFileSync } from 'fs'
import { generarDocx, type SdADocxData } from '../docxGenerator'
import { safePdfName, safeDocxName } from './pathSafety'
import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'

export function register(getMainWindow: () => BrowserWindow | null): void {
  ipcMain.handle(
    'app:exportarPDF',
    async (event: IpcMainInvokeEvent, { centro, logoUrl, titulo, landscape, sinPie }: { centro: string; logoUrl?: string; titulo?: string; landscape?: boolean; sinPie?: boolean }) => {
      const win = getMainWindow()
      if (!win) return null

      const centroSafe = (centro || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const fechaSafe = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
      const safeLogoUrl = logoUrl && /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/.test(logoUrl) ? logoUrl : ''
      const logoHtml = safeLogoUrl
        ? `<img src="${safeLogoUrl}" style="max-height:14mm;max-width:32mm;object-fit:contain;" />`
        : ''

      const headerTemplate = `
        <div style="width:100%;height:100%;display:flex;justify-content:flex-end;
                    align-items:center;padding:0 16mm;box-sizing:border-box;">
          ${logoHtml}
        </div>`

      const footerTemplate = `
        <div style="width:100%;height:100%;display:flex;justify-content:space-between;
                    align-items:center;padding:0 20mm;box-sizing:border-box;
                    font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:#64748b;
                    border-top:0.5pt solid #cbd5e1;">
          <span>Generado: ${fechaSafe}</span>
          <span style="font-weight:500;">${centroSafe}</span>
          <span>P&aacute;g. <span class="pageNumber"></span></span>
        </div>`

      // API moderna de printToPDF (Chromium headless): márgenes en pulgadas
      const pdfData = await event.sender.printToPDF(
        sinPie
          ? {
              // Cuaderno del alumno: diseño propio a sangre, sin cabecera/pie institucional
              printBackground: true,
              pageSize: 'A4',
              landscape: !!landscape,
              displayHeaderFooter: false,
              margins: { top: 0, bottom: 0, left: 0, right: 0 }
            }
          : {
              printBackground: true,
              pageSize: 'A4',
              landscape: !!landscape,
              displayHeaderFooter: true,
              headerTemplate,
              footerTemplate,
              margins: { top: 1.02, bottom: 0.94, left: 0.79, right: 0.79 }
            }
      )

      const result = await dialog.showSaveDialog(win, {
        title: 'Exportar PDF',
        defaultPath: safePdfName(titulo),
        filters: [{ name: 'Archivo PDF', extensions: ['pdf'] }]
      })
      if (result.canceled || !result.filePath) return null
      try {
        writeFileSync(result.filePath, pdfData)
      } catch (err) {
        console.error('[IPC] app:exportarPDF — error:', err)
        throw new Error('No se pudo guardar el PDF. Comprueba los permisos.')
      }
      return result.filePath
    }
  )

  ipcMain.handle('app:exportarTexto', async (_event, { content, defaultName, extension }: { content: string; defaultName?: string; extension?: string }) => {
    const win = getMainWindow()
    if (!win) return null
    if (typeof content !== 'string') throw new Error('Contenido no válido.')
    const ext = (extension === 'txt' || extension === 'md') ? extension : 'md'
    const base = safeDocxName(defaultName).replace(/\.docx$/, '')
    const result = await dialog.showSaveDialog(win, {
      title: 'Exportar para NotebookLM',
      defaultPath: `${base}.${ext}`,
      filters: [{ name: ext === 'md' ? 'Markdown' : 'Texto', extensions: [ext] }]
    })
    if (result.canceled || !result.filePath) return null
    try {
      // BOM UTF-8 (EF BB BF): garantiza que editores antiguos (Bloc de notas
      // clásico) muestren acentos y eñes. NotebookLM lo ignora sin problema.
      const bom = Buffer.from([0xef, 0xbb, 0xbf])
      writeFileSync(result.filePath, Buffer.concat([bom, Buffer.from(content, 'utf-8')]))
      return result.filePath
    } catch (err) {
      console.error('[IPC] app:exportarTexto — error:', err)
      throw new Error('No se pudo guardar el archivo.')
    }
  })

  ipcMain.handle('app:exportarDocx', async (_event, sda: SdADocxData) => {
    const win = getMainWindow()
    if (!win) return null
    const result = await dialog.showSaveDialog(win, {
      title: 'Exportar Word (.docx)',
      defaultPath: safeDocxName(sda.titulo),
      filters: [{ name: 'Documento Word', extensions: ['docx'] }]
    })
    if (result.canceled || !result.filePath) return null
    try {
      const buffer = await generarDocx(sda)
      writeFileSync(result.filePath, buffer)
      return result.filePath
    } catch (err) {
      console.error('[IPC] app:exportarDocx — error:', err)
      throw new Error('No se pudo generar el archivo Word.')
    }
  })
}
