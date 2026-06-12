import { useState } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import type { SdAStore } from '@renderer/store/sdaStore'
import { generarConIA } from '@renderer/services/aiService'
import { stripHtml } from '@renderer/utils/stripHtml'
import type { SdA } from '@renderer/types'

export interface InsertAction {
  label: string
  fn: () => void
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
  insertActions?: InsertAction[]
  storedTargetField?: string
}

export interface Chip {
  label: string
  prompt: string
  targetField?: string
}

// ── Persistence ──────────────────────────────────────────────────────────────

type StoredMessage = {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
  storedTargetField?: string
}

const MAX_STORED_MESSAGES = 40

function historyKey(sdaId: string, sectionIndex: number): string {
  return `sda-ai-chat-${sdaId}-${sectionIndex}`
}

function loadHistory(sdaId: string, sectionIndex: number): StoredMessage[] {
  try {
    const raw = localStorage.getItem(historyKey(sdaId, sectionIndex))
    return raw ? (JSON.parse(raw) as StoredMessage[]) : []
  } catch {
    return []
  }
}

function saveHistory(sdaId: string, sectionIndex: number, messages: ChatMessage[]): void {
  try {
    const toStore: StoredMessage[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
      error: m.error,
      storedTargetField: m.storedTargetField,
    }))
    localStorage.setItem(historyKey(sdaId, sectionIndex), JSON.stringify(toStore.slice(-MAX_STORED_MESSAGES)))
  } catch {
    // localStorage lleno — ignorar silenciosamente
  }
}

function clearHistory(sdaId: string, sectionIndex: number): void {
  try {
    localStorage.removeItem(historyKey(sdaId, sectionIndex))
  } catch { /* noop */ }
}

// ── Context builder ─────────────────────────────────────────────────────────

function smartTruncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const slice = text.slice(0, maxLen)
  const lastDot = slice.lastIndexOf('.')
  const lastComma = slice.lastIndexOf(',')
  const cut = Math.max(lastDot, lastComma)
  return cut > maxLen * 0.6 ? slice.slice(0, cut + 1) + '…' : slice + '…'
}

function buildSdAContext(sda: SdA): string {
  const meta = [
    `Título: "${sda.titulo || 'Sin título'}"`,
    `Ciclo/etapa: ${sda.ciclo || 'No especificado'}`,
    `Ámbito/área: ${sda.ambito || 'No especificado'}`,
    sda.areas?.length ? `Áreas: ${sda.areas.join(', ')}` : '',
    sda.curso ? `Curso: ${sda.curso}` : '',
    sda.numSesiones ? `Número de sesiones: ${sda.numSesiones}` : '',
    sda.docente ? `Docente: ${sda.docente}` : '',
    sda.centro ? `Centro: ${sda.centro}` : '',
  ].filter(Boolean).join('\n')

  const filled: string[] = []
  if (stripHtml(sda.justificacion).trim())
    filled.push(`Justificación: ${smartTruncate(stripHtml(sda.justificacion), 300)}`)
  if (stripHtml(sda.situacionProblema).trim())
    filled.push(`Reto/Situación-problema: ${smartTruncate(stripHtml(sda.situacionProblema), 300)}`)
  if (stripHtml(sda.productoFinal).trim())
    filled.push(`Producto final: ${smartTruncate(stripHtml(sda.productoFinal), 200)}`)
  if (stripHtml(sda.planteamientoMetodologico).trim())
    filled.push(`Metodología: ${smartTruncate(stripHtml(sda.planteamientoMetodologico), 200)}`)

  return `CONTEXTO DE LA SdA:\n${meta}${filled.length ? '\n\nContenido ya redactado:\n' + filled.join('\n') : ''}`
}

// ── Section metadata ─────────────────────────────────────────────────────────

function getSectionMeta(idx: number, sda: SdA): { name: string; chips: Chip[] } {
  const ciclo = sda.ciclo || 'el ciclo correspondiente'
  const ambito = sda.ambito || 'el área'
  const sesiones = sda.numSesiones || 8

  switch (idx) {
    case 0: return {
      name: 'Identificación',
      chips: [
        { label: 'Sugerir títulos creativos', prompt: `Sugiere 3 títulos creativos y motivadores para una SdA de ${ambito} (${ciclo}). Concisos, que expresen el reto y despierten curiosidad.` },
        { label: 'Título orientado al producto', prompt: `Propón 3 títulos para una SdA de ${ambito} (${ciclo}) cuyo producto final sea tangible. Que transmitan acción y propósito.` },
      ],
    }
    case 1: return {
      name: 'Justificación',
      chips: [
        { label: 'Justificación completa', prompt: `Redacta la justificación pedagógica completa. 3-4 párrafos: relevancia para el alumnado, conexión con su realidad e intereses, y pertinencia curricular LOMLOE.`, targetField: 'justificacion' },
        { label: 'Contexto del aula', prompt: `Redacta el apartado de contexto del aula/grupo: características del grupo, punto de partida, diversidad. 2 párrafos.`, targetField: 'contexto' },
        { label: 'Más breve', prompt: `Resume la justificación en 1-2 párrafos manteniendo las ideas clave. Responde solo con el texto resumido.`, targetField: 'justificacion' },
        { label: 'Fundamentación pedagógica', prompt: `Añade un párrafo de fundamentación pedagógica y normativa (LOMLOE) que justifique el enfoque de esta SdA.`, targetField: 'justificacion' },
      ],
    }
    case 2: return {
      name: 'Reto / Producto Final',
      chips: [
        { label: 'Situación-problema', prompt: `Redacta la situación-problema o reto: auténtica, motivadora, formulada como encargo real o pregunta esencial. 1-2 párrafos.`, targetField: 'situacionProblema' },
        { label: 'Producto final', prompt: `Describe el producto final que elaborará el alumnado: formato, audiencia real y criterios de calidad esperados. 1-2 párrafos.`, targetField: 'productoFinal' },
        { label: 'Hilo conductor', prompt: `Propón un hilo conductor narrativo que dé coherencia a toda la SdA conectando el reto con todas las actividades. 1 párrafo.`, targetField: 'hilo' },
        { label: 'Hacer más motivador', prompt: `Reescribe el reto haciéndolo más auténtico y motivador. Usa lenguaje directo y cercano al alumnado. Solo el texto reescrito.`, targetField: 'situacionProblema' },
      ],
    }
    case 3: return {
      name: 'Vinculación Curricular',
      chips: [
        { label: 'Competencias relevantes', prompt: `¿Qué competencias clave y específicas de ${ambito} (${ciclo}) encajan mejor con esta SdA? Justifica brevemente cada una.` },
        { label: 'Saberes básicos', prompt: `¿Qué saberes básicos de ${ambito} para ${ciclo} son más pertinentes para esta SdA? Lista los más importantes con breve justificación.` },
        { label: 'Criterios de evaluación', prompt: `¿Qué criterios de evaluación de ${ambito} (${ciclo}) se pueden trabajar con esta SdA? Sugiere los más adecuados.` },
      ],
    }
    case 4: return {
      name: 'Metodología',
      chips: [
        { label: 'Planteamiento completo', prompt: `Redacta el planteamiento metodológico completo: 3-4 párrafos con enfoque pedagógico (ABP, indagación, cooperativo…), organización del aula, principios DUA y evaluación formativa.`, targetField: 'planteamientoMetodologico' },
        { label: 'Enfoque ABP', prompt: `Redacta el planteamiento metodológico siguiendo el Aprendizaje Basado en Proyectos. Describe las fases y cómo se organiza el trabajo. 3 párrafos.`, targetField: 'planteamientoMetodologico' },
        { label: 'Aprendizaje cooperativo', prompt: `Describe cómo se implementará el aprendizaje cooperativo: estructuras, roles y gestión de grupos. 2-3 párrafos.`, targetField: 'planteamientoMetodologico' },
        { label: 'Recursos y materiales', prompt: `Lista y describe los recursos y materiales necesarios: digitales, manipulativos, espacios, herramientas TIC. Organizado por tipo.`, targetField: 'recursos' },
      ],
    }
    case 5: return {
      name: 'Secuencia Didáctica',
      chips: [
        { label: `Planificar ${sesiones} sesiones`, prompt: `Diseña una secuencia de ${sesiones} sesiones para esta SdA. Para cada sesión: número, título, descripción detallada de actividades, duración y agrupamiento del alumnado.` },
        { label: 'Sesión de introducción', prompt: `Describe detalladamente la sesión introductoria: cómo presentar el reto, actividades de enganche, cómo generar expectativas. Incluye duración y agrupamiento.` },
        { label: 'Sesión de cierre', prompt: `Describe la sesión final de presentación del producto: cómo organizar la exposición, la co-evaluación y la reflexión metacognitiva final.` },
        { label: 'Actividades formativas', prompt: `Propón 3-4 actividades de evaluación formativa integradas en la secuencia: portfolios, rúbricas, co-evaluación, diarios, etc. Con descripción breve de cada una.` },
      ],
    }
    case 6: return {
      name: 'Evaluación',
      chips: [
        { label: 'Criterios de calificación', prompt: `Redacta los criterios de calificación: instrumentos de evaluación, peso porcentual de cada uno y cómo se relacionan con los criterios curriculares.`, targetField: 'criteriosCalificacion' },
        { label: 'Diseñar rúbrica', prompt: `Diseña una rúbrica de evaluación para el producto final: 4-5 criterios con 4 niveles de desempeño (Excelente, Notable, Suficiente, Insuficiente). Redacta cada celda de forma descriptiva.`, targetField: 'rubrica' },
        { label: 'Instrumentos de evaluación', prompt: `Describe los instrumentos de evaluación más adecuados: observación, portfolios, autoevaluación, co-evaluación, pruebas. Justifica cada uno.`, targetField: 'criteriosCalificacion' },
        { label: 'Evaluación formativa vs sumativa', prompt: `Explica el equilibrio entre evaluación formativa (para aprender) y sumativa (de los aprendizajes) en esta SdA. 2 párrafos.`, targetField: 'criteriosCalificacion' },
      ],
    }
    case 7: return {
      name: 'Atención a la Diversidad (DUA)',
      chips: [
        { label: 'Medidas de Implicación', prompt: `Redacta las medidas de implicación DUA: cómo captar y mantener el interés, opciones de autonomía y autorregulación del alumnado. 2-3 párrafos.`, targetField: 'duaImplicacion' },
        { label: 'Medidas de Representación', prompt: `Redacta las medidas de representación DUA: cómo presentar la información en múltiples formatos para que todo el alumnado la perciba y comprenda. 2-3 párrafos.`, targetField: 'duaRepresentacion' },
        { label: 'Acción y Expresión', prompt: `Redacta las medidas de acción y expresión DUA: alternativas para que el alumnado demuestre su aprendizaje. Incluye apoyos específicos para NEAE. 2-3 párrafos.`, targetField: 'duaAccionExpresion' },
        { label: 'DUA completo', prompt: `Redacta los tres principios DUA (Implicación, Representación, Acción y Expresión) para esta SdA. 2 párrafos específicos y concretos por principio.` },
      ],
    }
    case 8: return {
      name: 'Interdisciplinariedad',
      chips: [
        { label: 'Conexiones interdisciplinares', prompt: `Describe las conexiones interdisciplinares: qué otras materias se relacionan con esta SdA y cómo se coordinan contenidos y evaluación. 2-3 párrafos.`, targetField: 'transversales' },
        { label: 'Temas transversales LOMLOE', prompt: `Describe los temas transversales LOMLOE que se trabajan: igualdad de género, sostenibilidad, ciudadanía, TIC, emprendimiento. 2-3 párrafos.`, targetField: 'transversales' },
        { label: 'Coordinación docente', prompt: `Describe cómo se coordinan los docentes implicados en esta SdA: reuniones, distribución de tareas y evaluación compartida.`, targetField: 'transversales' },
      ],
    }
    case 9: return {
      name: 'ODS',
      chips: [
        { label: 'Justificar conexión ODS', prompt: `Redacta la justificación de la relación entre esta SdA y los ODS de la Agenda 2030. Explica cómo los aprendizajes del alumnado contribuyen a cada ODS. 2-3 párrafos.`, targetField: 'justificacionOds' },
        { label: 'ODS más relevantes', prompt: `¿Con qué ODS de la Agenda 2030 conecta mejor esta SdA? Sugiere los 2-3 más pertinentes con justificación breve de cada uno.` },
        { label: 'Actividades vinculadas a ODS', prompt: `Propón 2-3 actividades concretas dentro de esta SdA que contribuyan directamente a los ODS. Describe cómo el alumnado toma conciencia y actúa.`, targetField: 'justificacionOds' },
      ],
    }
    default: return { name: 'Sección', chips: [] }
  }
}

// ── Insert action builder ────────────────────────────────────────────────────

function textToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function makeInsert(label: string, field: string, html: string, store: SdAStore): InsertAction {
  return {
    label,
    fn: () => {
      switch (field) {
        case 'justificacion': store.setJustificacion(html); break
        case 'contexto': store.setContexto(html); break
        case 'situacionProblema': store.setSituacionProblema(html); break
        case 'productoFinal': store.setProductoFinal(html); break
        case 'hilo': store.setHilo(html); break
        case 'planteamientoMetodologico': store.setPlanteamientoMetodologico(html); break
        case 'recursos': store.setRecursos(html); break
        case 'criteriosCalificacion': store.setCriteriosCalificacion(html); break
        case 'rubrica': store.setRubrica(html); break
        case 'duaImplicacion': store.setDuaImplicacion(html); break
        case 'duaRepresentacion': store.setDuaRepresentacion(html); break
        case 'duaAccionExpresion': store.setDuaAccionExpresion(html); break
        case 'transversales': store.setTransversales(html); break
        case 'justificacionOds': store.setJustificacionOds(html); break
      }
    },
  }
}

const FIELD_LABELS: Record<string, string> = {
  justificacion: 'Insertar en Justificación',
  contexto: 'Insertar en Contexto',
  situacionProblema: 'Insertar en Situación-problema',
  productoFinal: 'Insertar en Producto Final',
  hilo: 'Insertar en Hilo Conductor',
  planteamientoMetodologico: 'Insertar en Metodología',
  recursos: 'Insertar en Recursos',
  criteriosCalificacion: 'Insertar en Criterios',
  rubrica: 'Insertar en Rúbrica',
  duaImplicacion: 'Implicación',
  duaRepresentacion: 'Representación',
  duaAccionExpresion: 'Acción y Expresión',
  transversales: 'Insertar en sección',
  justificacionOds: 'Insertar en sección',
}

function buildInsertActions(text: string, targetField: string | undefined, sectionIdx: number, store: SdAStore): InsertAction[] {
  const html = textToHtml(text)
  const mk = (field: string) => makeInsert(FIELD_LABELS[field] ?? 'Insertar', field, html, store)

  if (targetField) return [mk(targetField)]

  switch (sectionIdx) {
    case 1: return [mk('justificacion'), mk('contexto')]
    case 2: return [mk('situacionProblema'), mk('productoFinal')]
    case 4: return [mk('planteamientoMetodologico'), mk('recursos')]
    case 6: return [mk('criteriosCalificacion'), mk('rubrica')]
    case 7: return [mk('duaImplicacion'), mk('duaRepresentacion'), mk('duaAccionExpresion')]
    case 8: return [mk('transversales')]
    case 9: return [mk('justificacionOds')]
    default: return []
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

const SYSTEM = `Eres un experto en pedagogía LOMLOE y currículum educativo español. Ayudas a docentes a redactar situaciones de aprendizaje (SdA) de alta calidad, claras y directamente utilizables en el aula. Responde siempre en español. Cuando te pidan redactar un texto, escribe directamente el contenido sin introducción ni explicación, a menos que el usuario pida orientación o una lista de opciones.`

export function useSectionAI(sectionIndex: number) {
  const store = useSdAStore()
  const sdaId = store.sda.id

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadHistory(sdaId, sectionIndex)
    return stored.map((m): ChatMessage => ({
      role: m.role,
      content: m.content,
      error: m.error,
      storedTargetField: m.storedTargetField,
      insertActions:
        m.role === 'assistant' && !m.error
          ? buildInsertActions(m.content, m.storedTargetField, sectionIndex, useSdAStore.getState() as SdAStore)
          : undefined,
    }))
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const meta = getSectionMeta(sectionIndex, store.sda)

  async function send(userText: string, chip?: Chip): Promise<void> {
    const userMsg: ChatMessage = { role: 'user', content: userText }
    const history = [...messages, userMsg]
    setMessages(history)
    setIsGenerating(true)

    try {
      const context = buildSdAContext(store.sda)
      const conversationText = history
        .slice(-12)
        .map((m) => `${m.role === 'user' ? 'Docente' : 'Asistente'}: ${m.content}`)
        .join('\n\n')

      const fullPrompt = `${SYSTEM}\n\n${context}\n\nSección actual: ${meta.name}\n\nConversación:\n${conversationText}\n\nResponde al último mensaje del Docente:`

      const result = await generarConIA(fullPrompt)

      const insertActions = buildInsertActions(result, chip?.targetField, sectionIndex, store)
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: result,
        insertActions,
        storedTargetField: chip?.targetField,
      }
      const updated = [...history, assistantMsg]
      setMessages(updated)
      saveHistory(sdaId, sectionIndex, updated)
    } catch (e) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: e instanceof Error ? e.message : 'Error al conectar con la IA.',
        error: true,
      }
      const updated = [...history, errorMsg]
      setMessages(updated)
      saveHistory(sdaId, sectionIndex, updated)
    } finally {
      setIsGenerating(false)
    }
  }

  function clear(): void {
    setMessages([])
    clearHistory(sdaId, sectionIndex)
  }

  return { messages, isGenerating, send, clear, chips: meta.chips, sectionName: meta.name }
}
