import { extractJsonArray } from '@renderer/utils/extractJsonArray'
import { stripHtml } from '@renderer/utils/stripHtml'
import type { SdA, Sesion } from '@renderer/types'

export function buildSecuenciaPrompt(sda: SdA): string {
  const n = sda.numSesiones || 6
  const metodologia = stripHtml(sda.planteamientoMetodologico).slice(0, 300) || 'ABP / indagación'
  const reto = stripHtml(sda.situacionProblema).slice(0, 400) || '(no definido)'

  return `Eres un experto en diseño curricular LOMLOE. Responde ÚNICAMENTE con un array JSON sin texto adicional, sin explicaciones y sin bloques de código markdown.

Genera ${n} sesiones didácticas para:
Título: "${sda.titulo || 'sin título'}"
Área: ${sda.ambito || 'Educación Primaria'} | Ciclo: ${sda.ciclo || 'Primaria'}
Hilo: ${sda.hilo || '(no definido)'}
Reto: ${reto}
Producto final: ${sda.productoFinal || '(no definido)'}
Metodología: ${metodologia}
Agrupamientos: ${sda.agrupamientos.join(', ') || 'variados'}

Formato de respuesta (array de ${n} objetos, sin nada más):
[{"titulo":"...","duracion":"55 min","agrupamiento":"...","recursos":"...","inicio":"...","desarrollo":"...","cierre":"..."}]

Progresión obligatoria: lanzamiento → exploración → construcción → producto → evaluación.
Inicio: rutina de pensamiento o pregunta detonadora.
Desarrollo: actividad principal conectada al reto (2-3 frases mín.).
Cierre: reflexión metacognitiva y enlace a la siguiente sesión.`
}

export function normalizeSesiones(parsed: Partial<Sesion>[]): Sesion[] {
  return parsed.map((s, i) => ({
    numero: i + 1,
    titulo: s.titulo || `Sesión ${i + 1}`,
    duracion: s.duracion || '55 min',
    agrupamiento: s.agrupamiento || '',
    recursos: s.recursos || '',
    inicio: s.inicio || '',
    desarrollo: s.desarrollo || '',
    cierre: s.cierre || ''
  }))
}

export function parseSecuenciaJSON(text: string): Sesion[] {
  const parsed = extractJsonArray<Partial<Sesion>>(text)
  return normalizeSesiones(parsed)
}
