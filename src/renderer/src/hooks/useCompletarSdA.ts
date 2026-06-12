import { useState } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { generarConIA } from '@renderer/services/aiService'
import { stripHtml } from '@renderer/utils/stripHtml'
import type { SdA } from '@renderer/types'

function hasText(html: string): boolean {
  return stripHtml(html).trim().length > 10
}

type Tarea = {
  label: string
  sectionIndex: number
  isEmpty: (s: SdA) => boolean
  buildPrompt: (s: SdA) => string
  apply: (resultado: string) => void
}

export interface CompletarSdAState {
  completar: () => Promise<void>
  completarSeccion: (sectionIndex: number) => Promise<void>
  tieneTareasSeccion: (sectionIndex: number) => boolean
  generando: boolean
  progreso: string | null
  errores: string[]
  completado: boolean
  reset: () => void
  puedeCompletar: boolean
}

export function useCompletarSdA(): CompletarSdAState {
  const store = useSdAStore()
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState<string | null>(null)
  const [errores, setErrores] = useState<string[]>([])
  const [completado, setCompletado] = useState(false)

  const puedeCompletar = Boolean(
    store.sda.titulo && store.sda.ciclo && store.sda.ambito
  )

  function buildTareas(): Tarea[] {
    return [
      {
        label: 'Justificación pedagógica',
        sectionIndex: 1,
        isEmpty: (s) => !hasText(s.justificacion),
        buildPrompt: (s) =>
          `Redacta la justificación pedagógica de una Situación de Aprendizaje titulada "${s.titulo}" para el área de ${s.ambito} (${s.ciclo}). Explica por qué es relevante y significativa para el alumnado, su conexión con la realidad y los intereses del grupo. Extensión: 3-4 párrafos.`,
        apply: (t) => store.setJustificacion(t)
      },
      {
        label: 'Situación-problema / Reto',
        sectionIndex: 2,
        isEmpty: (s) => !hasText(s.situacionProblema),
        buildPrompt: (s) =>
          `Redacta la situación-problema o reto de la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Debe ser auténtica, motivadora y conectada con la realidad. Formulada como un encargo real o pregunta esencial. Extensión: 1-2 párrafos.`,
        apply: (t) => store.setSituacionProblema(t)
      },
      {
        label: 'Producto final',
        sectionIndex: 2,
        isEmpty: (s) => !hasText(s.productoFinal),
        buildPrompt: (s) =>
          `Describe el producto final de la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Reto: ${stripHtml(s.situacionProblema) || 'no especificado'}. Especifica el formato, la audiencia real y los criterios de calidad esperados. Extensión: 1-2 párrafos.`,
        apply: (t) => store.setProductoFinal(t)
      },
      {
        label: 'Planteamiento metodológico',
        sectionIndex: 4,
        isEmpty: (s) => !hasText(s.planteamientoMetodologico),
        buildPrompt: (s) =>
          `Redacta el planteamiento metodológico de la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Describe el enfoque (ABP, indagación, aprendizaje cooperativo…), justifica su idoneidad e incluye los principios pedagógicos clave (DUA, evaluación formativa, personalización). Extensión: 3-4 párrafos.`,
        apply: (t) => store.setPlanteamientoMetodologico(t)
      },
      {
        label: 'DUA — Implicación',
        sectionIndex: 7,
        isEmpty: (s) => !hasText(s.duaImplicacion),
        buildPrompt: (s) =>
          `Redacta las medidas de implicación (DUA) para la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Describe cómo motivar al alumnado, mantener su interés y desarrollar la autorregulación. Extensión: 2-3 párrafos.`,
        apply: (t) => store.setDuaImplicacion(t)
      },
      {
        label: 'DUA — Representación',
        sectionIndex: 7,
        isEmpty: (s) => !hasText(s.duaRepresentacion),
        buildPrompt: (s) =>
          `Redacta las medidas de representación (DUA) para la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Describe cómo presentar la información en múltiples formatos para que todo el alumnado pueda percibirla y comprenderla. Extensión: 2-3 párrafos.`,
        apply: (t) => store.setDuaRepresentacion(t)
      },
      {
        label: 'DUA — Acción y expresión',
        sectionIndex: 7,
        isEmpty: (s) => !hasText(s.duaAccionExpresion),
        buildPrompt: (s) =>
          `Redacta las medidas de acción y expresión (DUA) para la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Describe las alternativas para que el alumnado demuestre su aprendizaje (oral, escrito, visual, digital, manipulativo). Incluye apoyos para NEAE. Extensión: 2-3 párrafos.`,
        apply: (t) => store.setDuaAccionExpresion(t)
      },
      {
        label: 'Temas transversales',
        sectionIndex: 8,
        isEmpty: (s) => !hasText(s.transversales),
        buildPrompt: (s) =>
          `Redacta el apartado de temas transversales para la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}). Describe qué temas transversales LOMLOE se abordan y cómo se integran en las actividades. Extensión: 2-3 párrafos.`,
        apply: (t) => store.setTransversales(t)
      },
      {
        label: 'Justificación ODS',
        sectionIndex: 9,
        isEmpty: (s) => !hasText(s.justificacionOds),
        buildPrompt: (s) => {
          const odsStr =
            s.ods.length > 0
              ? s.ods.map((n) => `ODS ${n}`).join(', ')
              : 'no seleccionados aún'
          return `Redacta la justificación de la relación entre la SdA "${s.titulo}" (${s.ambito}, ${s.ciclo}) y los ODS (${odsStr}). Explica cómo los aprendizajes y acciones del alumnado contribuyen a cada ODS. Extensión: 2-3 párrafos.`
        },
        apply: (t) => store.setJustificacionOds(t)
      }
    ]
  }

  async function completar(): Promise<void> {
    if (!puedeCompletar || generando) return
    setGenerando(true)
    setErrores([])
    setCompletado(false)

    const tareas = buildTareas()
    const pendientes = tareas.filter((t) => t.isEmpty(useSdAStore.getState().sda))
    const nuevosErrores: string[] = []

    for (let i = 0; i < pendientes.length; i++) {
      const tarea = pendientes[i]
      setProgreso(`${i + 1} / ${pendientes.length} — ${tarea.label}`)
      try {
        const sdaActual = useSdAStore.getState().sda
        const resultado = await generarConIA(tarea.buildPrompt(sdaActual), 90_000)
        tarea.apply(resultado)
      } catch {
        nuevosErrores.push(tarea.label)
      }
    }

    setErrores(nuevosErrores)
    setGenerando(false)
    setProgreso(null)
    setCompletado(true)
  }

  function tieneTareasSeccion(sectionIndex: number): boolean {
    if (!puedeCompletar) return false
    const tareas = buildTareas()
    const sda = useSdAStore.getState().sda
    return tareas.some((t) => t.sectionIndex === sectionIndex && t.isEmpty(sda))
  }

  async function completarSeccion(sectionIndex: number): Promise<void> {
    if (!puedeCompletar || generando) return
    setGenerando(true)
    setErrores([])
    setCompletado(false)

    const tareas = buildTareas().filter((t) => t.sectionIndex === sectionIndex)
    const pendientes = tareas.filter((t) => t.isEmpty(useSdAStore.getState().sda))
    const nuevosErrores: string[] = []

    for (let i = 0; i < pendientes.length; i++) {
      const tarea = pendientes[i]
      setProgreso(`${tarea.label}…`)
      try {
        const sdaActual = useSdAStore.getState().sda
        const resultado = await generarConIA(tarea.buildPrompt(sdaActual), 90_000)
        tarea.apply(resultado)
      } catch {
        nuevosErrores.push(tarea.label)
      }
    }

    setErrores(nuevosErrores)
    setGenerando(false)
    setProgreso(null)
    setCompletado(true)
  }

  function reset(): void {
    setCompletado(false)
    setErrores([])
  }

  return { completar, completarSeccion, tieneTareasSeccion, generando, progreso, errores, completado, reset, puedeCompletar }
}
