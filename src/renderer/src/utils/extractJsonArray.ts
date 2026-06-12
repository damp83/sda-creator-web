/**
 * Extrae un array JSON de texto generado por IA.
 * Maneja bloques markdown, texto envolvente y objetos que contienen arrays.
 */
export function extractJsonArray<T = unknown>(text: string): T[] {
  const clean = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()

  // Estrategia 1: parseo directo
  try {
    const parsed = JSON.parse(clean)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[]
    // El modelo envolvió el array en un objeto: {"sesiones":[...]}
    if (parsed && typeof parsed === 'object') {
      const val = Object.values(parsed as Record<string, unknown>).find(Array.isArray)
      if (Array.isArray(val) && val.length > 0) return val as T[]
    }
  } catch { /* seguimos */ }

  // Estrategia 2: extracción con conteo de corchetes (robusto ante texto envolvente)
  const start = clean.indexOf('[')
  if (start !== -1) {
    let depth = 0
    let inString = false
    let escape = false
    for (let i = start; i < clean.length; i++) {
      const ch = clean[i]
      if (escape) { escape = false; continue }
      if (ch === '\\' && inString) { escape = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === '[') depth++
      else if (ch === ']') {
        depth--
        if (depth === 0) {
          try {
            const parsed = JSON.parse(clean.slice(start, i + 1))
            if (Array.isArray(parsed) && parsed.length > 0) return parsed as T[]
          } catch { break }
        }
      }
    }
  }

  throw new Error(
    'La IA no devolvió un JSON válido. Asegúrate de tener configurada la clave API e inténtalo de nuevo.'
  )
}
