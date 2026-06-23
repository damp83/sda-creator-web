/**
 * Utilidades puras (sin dependencias de Electron) para sanear nombres de archivo
 * recibidos del renderer. Centralizadas aquí para poder probarlas de forma aislada
 * y evitar duplicar la lógica en cada handler IPC.
 */

/**
 * Indica si un nombre de archivo es peligroso (intento de path traversal o nombre
 * vacío/no válido). Los handlers deben rechazar cuando esto devuelve `true`.
 */
export function isUnsafeFileName(name: unknown): boolean {
  return (
    typeof name !== 'string' ||
    name.length === 0 ||
    name.includes('..') ||
    name.includes('/') ||
    name.includes('\\') ||
    name.includes('\0')
  )
}

// Nombres de dispositivo reservados de Windows/NTFS que no pueden usarse como archivo.
const NTFS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i

/** Convierte un título arbitrario en una base de nombre de archivo segura. */
function sanitizeBaseName(titulo: string | undefined): string {
  // eslint-disable-next-line no-control-regex -- saneado deliberado de caracteres de control en nombres de archivo
  const base = (titulo ?? '').slice(0, 50).replace(/[/\\?%*:|"<>\x00-\x1f]/g, '_').replace(/[. ]+$/, '').trim() || 'sda'
  return NTFS_RESERVED.test(base) ? `sda_${base}` : base
}

/** Devuelve un nombre de archivo `.pdf` seguro a partir del título de la SdA. */
export function safePdfName(titulo?: string): string {
  return `${sanitizeBaseName(titulo)}.pdf`
}

/** Devuelve un nombre de archivo `.docx` seguro a partir del título de la SdA. */
export function safeDocxName(titulo?: string): string {
  return `${sanitizeBaseName(titulo)}.docx`
}
