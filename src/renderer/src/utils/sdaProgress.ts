import type { SdA } from '@renderer/types'
import { stripHtml } from './stripHtml'

export const SECTION_COUNT = 11

function hasContent(html: string): boolean {
  return stripHtml(html ?? '').trim().length > 10
}

export function getSectionComplete(sda: SdA, id: number): boolean {
  switch (id) {
    case 0: return !!(sda.titulo?.trim() && sda.ciclo && sda.ambito)
    case 1: return hasContent(sda.justificacion)
    case 2: return !!(hasContent(sda.situacionProblema) && hasContent(sda.productoFinal))
    case 3: return sda.elementosCurriculares.length > 0
    case 4: return hasContent(sda.planteamientoMetodologico)
    case 5: return sda.sesiones.length > 0
    case 6: return sda.instrumentosEvaluacion.length > 0
    case 7: return hasContent(sda.duaImplicacion) || hasContent(sda.duaRepresentacion) || hasContent(sda.duaAccionExpresion)
    case 8: return sda.conexiones.length > 0
    case 9: return sda.ods.length > 0
    case 10: return !!(sda.cuaderno && sda.cuaderno.sesiones.some(s => s.generado))
    default: return false
  }
}

export function getSdAProgress(sda: SdA): { done: number; total: number; pct: number } {
  const done = Array.from({ length: SECTION_COUNT }, (_, i) => i)
    .filter((i) => getSectionComplete(sda, i)).length
  return { done, total: SECTION_COUNT, pct: Math.round((done / SECTION_COUNT) * 100) }
}
