const STORAGE_KEY = 'sda-ai-prompts-v1'

export type PromptKey =
  | 'justificacion'
  | 'contexto'
  | 'situacionProblema'
  | 'productoFinal'
  | 'hilo'
  | 'metodologia'
  | 'recursos'
  | 'tiempos'
  | 'sesionInicio'
  | 'sesionDesarrollo'
  | 'sesionCierre'
  | 'criteriosCalificacion'
  | 'duaImplicacion'
  | 'duaRepresentacion'
  | 'duaAccionExpresion'
  | 'transversales'
  | 'justificacionOds'

export interface PromptDefinition {
  key: PromptKey
  label: string
  section: string
  default: string
}

export const PROMPT_DEFINITIONS: PromptDefinition[] = [
  {
    key: 'justificacion',
    label: 'Justificación pedagógica',
    section: 'S02 · Justificación',
    default: 'Redacta la justificación pedagógica de una Situación de Aprendizaje titulada "{{titulo}}" para el área de {{ambito}} ({{ciclo}}). Explica por qué es relevante y significativa para el alumnado, su conexión con la realidad y los intereses del grupo. Extensión: 3-4 párrafos.'
  },
  {
    key: 'contexto',
    label: 'Contextualización del aula',
    section: 'S02 · Justificación',
    default: 'Redacta el apartado de contextualización de una Situación de Aprendizaje titulada "{{titulo}}" para el área de {{ambito}} ({{ciclo}}). Describe el contexto del centro educativo, el entorno sociocultural y las características generales del grupo-clase. Extensión: 2-3 párrafos.'
  },
  {
    key: 'situacionProblema',
    label: 'Situación-problema / Reto',
    section: 'S03 · Reto',
    default: 'Redacta la situación-problema o reto de la Situación de Aprendizaje "{{titulo}}" para el área de {{ambito}} ({{ciclo}}). Debe ser auténtica, motivadora y conectada con la realidad. Puede formularse como una pregunta esencial o un encargo real a resolver por el alumnado. Extensión: 1-2 párrafos.'
  },
  {
    key: 'productoFinal',
    label: 'Producto final',
    section: 'S03 · Reto',
    default: 'Describe el producto final o tarea integradora de la Situación de Aprendizaje "{{titulo}}" para el área de {{ambito}} ({{ciclo}}). Especifica el formato, la audiencia real y los criterios básicos de calidad esperados. Extensión: 1-2 párrafos.'
  },
  {
    key: 'hilo',
    label: 'Hilo conductor (sugerencias)',
    section: 'S03 · Reto',
    default: 'Sugiere 5 hilos conductores o narrativas para la Situación de Aprendizaje "{{titulo}}" de {{ambito}} ({{ciclo}}). El hilo conductor es el rol o metáfora que da coherencia a todas las sesiones (ej: "somos periodistas", "somos científicos del agua", "somos arqueólogos del futuro"). Devuelve solo la lista numerada, sin explicaciones.'
  },
  {
    key: 'metodologia',
    label: 'Planteamiento metodológico',
    section: 'S05 · Metodología',
    default: `Redacta el planteamiento metodológico de una Situación de Aprendizaje con estas características:
- Título: "{{titulo}}"
- Ámbito/Área: {{ambito}}
- Ciclo: {{ciclo}}
- Hilo conductor: {{hilo}}
- Reto: {{situacionProblema}}
- Competencias clave: {{competenciasClave}}

Describe el enfoque metodológico (ABP, indagación, aprendizaje cooperativo…), justifica su idoneidad para el ciclo y el reto, e incluye los principios pedagógicos clave (DUA, evaluación formativa, personalización). Extensión: 3-4 párrafos.`
  },
  {
    key: 'recursos',
    label: 'Recursos didácticos',
    section: 'S05 · Metodología',
    default: 'Lista los recursos didácticos necesarios para una SdA titulada "{{titulo}}" ({{ambito}}, {{ciclo}}). Incluye: materiales físicos, recursos digitales, espacios, recursos humanos y bibliografía de referencia. Formato: lista clara y concisa.'
  },
  {
    key: 'tiempos',
    label: 'Distribución temporal',
    section: 'S05 · Metodología',
    default: 'Propón una distribución temporal para una SdA titulada "{{titulo}}" de {{numSesiones}} sesiones ({{temporalizacion}}). Organiza las sesiones por fases (lanzamiento, desarrollo, producto final, evaluación) y estima la duración de cada una. Formato: descripción clara con fases y número de sesiones por fase.'
  },
  {
    key: 'sesionInicio',
    label: 'Inicio de sesión',
    section: 'S06 · Secuencia Didáctica',
    default: 'Redacta las actividades de inicio y activación para la sesión "{{sesionTitulo}}" de la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Incluye rutina de pensamiento, pregunta detonadora o motivación inicial conectada con el reto. Extensión: 1-2 párrafos.'
  },
  {
    key: 'sesionDesarrollo',
    label: 'Desarrollo de sesión',
    section: 'S06 · Secuencia Didáctica',
    default: 'Redacta las actividades de desarrollo para la sesión "{{sesionTitulo}}" de la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Describe qué hace el alumnado, qué hace el docente, cómo se organizan y qué recursos utilizan. Extensión: 2-3 párrafos.'
  },
  {
    key: 'sesionCierre',
    label: 'Cierre de sesión',
    section: 'S06 · Secuencia Didáctica',
    default: 'Redacta el cierre y reflexión de la sesión "{{sesionTitulo}}" de la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Incluye síntesis de lo aprendido, reflexión metacognitiva y conexión con la siguiente sesión. Extensión: 1-2 párrafos.'
  },
  {
    key: 'criteriosCalificacion',
    label: 'Criterios de calificación',
    section: 'S07 · Evaluación',
    default: 'Redacta los criterios de calificación para la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Especifica el peso porcentual de: producto final, proceso y participación, y otros elementos relevantes (exposición oral, autoevaluación, etc.). Adapta los porcentajes al tipo de SdA. Formato: lista clara con porcentajes.'
  },
  {
    key: 'duaImplicacion',
    label: 'DUA · Implicación y motivación',
    section: 'S08 · Atención a la Diversidad',
    default: 'Redacta las medidas de implicación (principio DUA) para la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Describe cómo motivar al alumnado, mantener su interés y desarrollar la autorregulación del aprendizaje. Incluye estrategias concretas para captar el interés, mantener el esfuerzo y promover la autoevaluación. Extensión: 2-3 párrafos.'
  },
  {
    key: 'duaRepresentacion',
    label: 'DUA · Representación',
    section: 'S08 · Atención a la Diversidad',
    default: 'Redacta las medidas de representación (principio DUA) para la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Describe cómo presentar la información en múltiples formatos (texto, audio, imagen, vídeo) y niveles de complejidad para que todo el alumnado pueda percibirla y comprenderla. Extensión: 2-3 párrafos.'
  },
  {
    key: 'duaAccionExpresion',
    label: 'DUA · Acción y expresión',
    section: 'S08 · Atención a la Diversidad',
    default: 'Redacta las medidas de acción y expresión (principio DUA) para la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}). Describe las alternativas que tendrá el alumnado para demostrar su aprendizaje: oral, escrito, visual, digital o manipulativo. Incluye apoyos para alumnado NEAE. Extensión: 2-3 párrafos.'
  },
  {
    key: 'transversales',
    label: 'Temas transversales',
    section: 'S09 · Interdisciplinariedad',
    default: `Redacta el apartado de temas transversales para la Situación de Aprendizaje "{{titulo}}" ({{ambito}}, {{ciclo}}).
Reto: {{situacionProblema}}
ODS trabajados: {{odsNumeros}}
Describe qué temas transversales del currículo LOMLOE (educación para el desarrollo sostenible, ciudadanía digital, igualdad de género, valores cívicos…) se abordan y cómo se integran en las actividades. Extensión: 2-3 párrafos.`
  },
  {
    key: 'justificacionOds',
    label: 'Justificación de ODS',
    section: 'S10 · ODS',
    default: `Redacta la justificación de la relación entre la Situación de Aprendizaje y los ODS seleccionados.
SdA: "{{titulo}}" — {{ambito}} ({{ciclo}})
ODS seleccionados: {{odsNombres}}
Reto o situación-problema: {{situacionProblema}}
Explica de forma concreta cómo esta SdA contribuye a cada ODS seleccionado, qué actividades los abordan directamente y cómo el alumnado desarrolla conciencia sobre los retos globales. Extensión: 2-3 párrafos.`
  }
]

// ─── Interpolación y acceso ───────────────────────────────────────────────────

export type PromptVars = Partial<Record<string, string>>

export function getPrompt(key: PromptKey, vars: PromptVars = {}): string {
  const stored = loadCustomPrompts()
  const def = PROMPT_DEFINITIONS.find((d) => d.key === key)
  if (!def) return ''
  const template = stored[key] ?? def.default
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `(${k})`)
}

export function isCustomized(key: PromptKey): boolean {
  const stored = loadCustomPrompts()
  return key in stored
}

export function loadCustomPrompts(): Partial<Record<PromptKey, string>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Record<PromptKey, string>>
  } catch {
    return {}
  }
}

export function saveCustomPrompts(prompts: Partial<Record<PromptKey, string>>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
}

export function resetPrompt(key: PromptKey): void {
  const stored = loadCustomPrompts()
  delete stored[key]
  saveCustomPrompts(stored)
}
