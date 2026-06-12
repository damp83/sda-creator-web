/**
 * Sanea un SVG procedente de fuentes no confiables (IA o archivos abiertos)
 * antes de incrustarlo con dangerouslySetInnerHTML.
 * Devuelve undefined si el SVG no es seguro o no es válido.
 */
export function sanitizeSvg(svg: unknown): string | undefined {
  if (typeof svg !== 'string') return undefined
  const trimmed = svg.trim()
  if (!trimmed.startsWith('<svg') || !trimmed.includes('</svg>')) return undefined
  if (trimmed.length > 12_000) return undefined
  // Bloquear scripts, manejadores de eventos (onload=…), foreignObject, javascript: y URLs externas
  if (/<script|on\w+\s*=|<foreignObject|javascript:|<!ENTITY|xlink:href\s*=\s*["']?\s*http/i.test(trimmed)) return undefined
  return trimmed
}

/** Valida que una cadena sea un data URL de imagen rasterizada (para <img src>). */
export function isSafeImageDataUrl(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)
}
