import { extractJsonArray } from '@renderer/utils/extractJsonArray'
import type { SdA, RubricaFila } from '@renderer/types'

export function parseRubricaJSON(text: string): RubricaFila[] {
  const filas = extractJsonArray<RubricaFila>(text)
  if (filas.length === 0) throw new Error('El JSON no contiene filas')
  return filas
}

export function buildRubricPrompt(sda: SdA): string {
  const lines: string[] = []
  for (const elem of sda.elementosCurriculares) {
    for (let ci = 0; ci < elem.criterios.length; ci++) {
      const key = `${elem.id}|${ci}`
      const inst = sda.criterioInstrumentos?.[key] || ''
      lines.push(`- Área: ${elem.area} | Criterio: ${elem.criterios[ci]}${inst ? ` | Instrumento: ${inst}` : ''}`)
    }
  }
  const criteriosText = lines.length > 0
    ? lines.join('\n')
    : '(Sin criterios seleccionados — genera una rúbrica genérica adecuada al ciclo)'

  return `Genera una rúbrica de evaluación para la Situación de Aprendizaje "${sda.titulo || 'sin título'}" (${sda.ambito || 'Educación Primaria'}, ${sda.ciclo || 'Primaria'}).

Criterios de evaluación:
${criteriosText}

INSTRUCCIONES OBLIGATORIAS:
- Devuelve ÚNICAMENTE un array JSON válido, sin ningún texto adicional, sin bloques de código markdown
- Usa exactamente esta estructura para cada criterio:
[
  {
    "criterio": "Texto completo del criterio de evaluación",
    "area": "Nombre del área curricular",
    "instrumento": "Instrumento asignado o cadena vacía",
    "iniciado": "Descriptor concreto para nivel Iniciado (1): el alumno apenas inicia...",
    "enProceso": "Descriptor concreto para nivel En proceso (2): el alumno avanza pero...",
    "conseguido": "Descriptor concreto para nivel Conseguido (3): el alumno demuestra...",
    "avanzado": "Descriptor concreto para nivel Avanzado (4): el alumno supera con creces..."
  }
]
- Los descriptores deben ser observables, concretos y adaptados a ${sda.ciclo || 'Primaria'}`
}
