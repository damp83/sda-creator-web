/**
 * Tests de la lógica de saneamiento de nombres de archivo usada por los handlers
 * IPC del proceso main (decretos, snapshots, exportación PDF/DOCX). El módulo es
 * puro (sin Electron), así que se prueba directamente el código de producción.
 */
import { describe, it, expect } from 'vitest'
import { isUnsafeFileName, safePdfName, safeDocxName } from '../ipc/pathSafety'

describe('isUnsafeFileName — guarda de path traversal de los handlers IPC', () => {
  it('acepta nombres de archivo normales', () => {
    expect(isUnsafeFileName('snapshot-001.json')).toBe(false)
    expect(isUnsafeFileName('decreto_EP_2024.json')).toBe(false)
    expect(isUnsafeFileName('mi-sda_003.bak')).toBe(false)
  })

  it('rechaza secuencias de path traversal', () => {
    expect(isUnsafeFileName('../secret.json')).toBe(true)
    expect(isUnsafeFileName('../../etc/passwd')).toBe(true)
    expect(isUnsafeFileName('a..b')).toBe(true)
  })

  it('rechaza separadores de ruta', () => {
    expect(isUnsafeFileName('/etc/passwd')).toBe(true)
    expect(isUnsafeFileName('carpeta\\archivo.json')).toBe(true)
    expect(isUnsafeFileName('sub/dir.json')).toBe(true)
  })

  it('rechaza bytes nulos', () => {
    expect(isUnsafeFileName('archivo\0.json')).toBe(true)
  })

  it('rechaza valores vacíos o de tipo incorrecto', () => {
    expect(isUnsafeFileName('')).toBe(true)
    expect(isUnsafeFileName(undefined)).toBe(true)
    expect(isUnsafeFileName(null)).toBe(true)
    expect(isUnsafeFileName(42)).toBe(true)
    expect(isUnsafeFileName({})).toBe(true)
  })
})

describe('safePdfName / safeDocxName — saneamiento de nombre de exportación', () => {
  it('usa un nombre por defecto cuando no hay título', () => {
    expect(safePdfName()).toBe('sda.pdf')
    expect(safePdfName('')).toBe('sda.pdf')
    expect(safeDocxName()).toBe('sda.docx')
    expect(safeDocxName('')).toBe('sda.docx')
  })

  it('conserva títulos normales', () => {
    expect(safePdfName('Mi proyecto')).toBe('Mi proyecto.pdf')
    expect(safeDocxName('Unidad 3')).toBe('Unidad 3.docx')
  })

  it('reemplaza caracteres no válidos en nombres de archivo', () => {
    expect(safePdfName('a/b\\c:d*e?f"g<h>i|j')).toBe('a_b_c_d_e_f_g_h_i_j.pdf')
  })

  it('elimina caracteres de control', () => {
    expect(safePdfName('hola\x00\x1fmundo')).toBe('hola__mundo.pdf')
  })

  it('recorta el título a 50 caracteres', () => {
    const largo = 'x'.repeat(80)
    const nombre = safePdfName(largo)
    expect(nombre).toBe(`${'x'.repeat(50)}.pdf`)
  })

  it('quita puntos y espacios finales (restricción de Windows)', () => {
    expect(safePdfName('documento...')).toBe('documento.pdf')
    expect(safePdfName('documento   ')).toBe('documento.pdf')
  })

  it('antepone un prefijo a los nombres de dispositivo reservados de NTFS', () => {
    expect(safePdfName('CON')).toBe('sda_CON.pdf')
    expect(safePdfName('lpt1')).toBe('sda_lpt1.pdf')
    expect(safeDocxName('nul.txt')).toBe('sda_nul.txt.docx')
    expect(safePdfName('aux')).toBe('sda_aux.pdf')
  })

  it('recurre al nombre por defecto cuando el saneamiento deja la base vacía', () => {
    // Solo puntos/espacios: la base queda vacía tras recortar el final → 'sda'.
    expect(safePdfName('...')).toBe('sda.pdf')
    expect(safePdfName('   ')).toBe('sda.pdf')
  })

  it('reemplaza separadores por guion bajo en lugar de descartarlos', () => {
    expect(safePdfName('///')).toBe('___.pdf')
  })
})
