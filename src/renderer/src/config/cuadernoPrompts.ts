import type { SdA, Sesion } from '@renderer/types'
import { stripHtml } from '@renderer/utils/stripHtml'

function cicloLabel(ciclo: string): string {
  const labels: Record<string, string> = {
    infantil_ciclo_1: 'Educación Infantil (0-3 años)',
    infantil_ciclo_2: 'Educación Infantil (3-6 años)',
    primaria_ciclo_1: 'Primaria 1.º-2.º (6-8 años)',
    primaria_ciclo_2: 'Primaria 3.º-4.º (8-10 años)',
    primaria_ciclo_3: 'Primaria 5.º-6.º (10-12 años)',
  }
  return labels[ciclo] ?? ciclo
}

// Directrices pedagógicas concretas por ciclo: vocabulario, longitud y tipo de respuesta.
function guiaPorCiclo(ciclo: string): string {
  switch (ciclo) {
    case 'infantil_ciclo_1':
    case 'infantil_ciclo_2':
      return `DIRECTRICES OBLIGATORIAS PARA EDUCACIÓN INFANTIL (el alumnado NO sabe leer ni escribir de forma autónoma):
- Cada enunciado se dirige AL DOCENTE como mediador: empieza por "Con ayuda del docente:" y describe la consigna ORAL que este dará al alumnado.
- El alumnado responde DIBUJANDO, RODEANDO, PEGANDO, COLOREANDO, SEÑALANDO o de forma oral/manipulativa — NUNCA redactando texto.
- Consignas orales muy cortas (máximo 10 palabras), vocabulario cotidiano y concreto.
- El espacio de respuesta del cuaderno se usa SIEMPRE para dibujar, no para escribir.
- Los niveles altos de Bloom se concretan en acciones observables: "evaluar" = elegir entre dos opciones y decir por qué; "crear" = inventar dibujando o construyendo.`
    case 'primaria_ciclo_1':
      return `DIRECTRICES OBLIGATORIAS PARA 1.er CICLO (6-8 años, lectoescritura inicial):
- Frases muy cortas (máximo 12-15 palabras), vocabulario sencillo, UNA sola instrucción por tarea.
- Tipos de respuesta preferentes: rodear, unir con flechas, completar palabras, escribir 1-3 palabras, dibujar y poner etiqueta.
- Solo en los niveles "evaluar" y "crear" se puede pedir escribir 1-2 frases completas.
- Nada de enunciados con doble paso ("haz X y después Y") en los niveles 1-3.`
    case 'primaria_ciclo_2':
      return `DIRECTRICES OBLIGATORIAS PARA 2.º CICLO (8-10 años):
- Frases claras de máximo 20 palabras, vocabulario adaptado, máximo dos pasos por instrucción.
- Tipos de respuesta: frases cortas, listas, tablas sencillas, dibujos con explicación de 1-2 frases.
- En "crear" se puede pedir una producción breve (4-5 frases o un esquema).`
    case 'primaria_ciclo_3':
      return `DIRECTRICES PARA 3.er CICLO (10-12 años):
- Se admiten instrucciones de varios pasos y redacción de párrafos breves (3-5 frases).
- Introduce vocabulario académico del área con naturalidad, definiéndolo si es nuevo.
- En "analizar" y "evaluar" pide justificaciones razonadas ("porque…", "comparado con…").`
    default:
      return ''
  }
}

// Vinculación curricular: criterios de evaluación y saberes básicos de S04.
function bloqueCurricular(sda: SdA): string {
  const elems = sda.elementosCurriculares
  if (elems.length === 0) return ''
  const corto = (t: string): string => t.length > 220 ? `${t.slice(0, 220)}…` : t
  const L: string[] = ['VINCULACIÓN CURRICULAR (las tareas DEBEN trabajar estos criterios y saberes):']
  for (const e of elems.slice(0, 6)) {
    L.push(`- ${e.area} — ${corto(e.ce)}`)
    e.criterios.slice(0, 4).forEach(c => L.push(`  · Criterio de evaluación: ${corto(c)}`))
    e.saberes.slice(0, 4).forEach(s => L.push(`  · Saber básico: ${corto(s)}`))
  }
  if (sda.competenciasClave.length > 0) {
    L.push(`- Competencias clave de la SdA: ${sda.competenciasClave.join(', ')}`)
  }
  return L.join('\n')
}

export function buildPromptMarco(sda: SdA): string {
  const hilo = stripHtml(sda.hilo ?? '').trim() || 'no especificado'
  const reto = stripHtml(sda.situacionProblema ?? '').trim() || 'no especificado'
  const producto = stripHtml(sda.productoFinal ?? '').trim() || 'no especificado'

  return `Eres un experto en diseño de materiales educativos gamificados para ${cicloLabel(sda.ciclo)}.

DATOS DE LA SITUACIÓN DE APRENDIZAJE:
- Título: "${sda.titulo}"
- Área / Ámbito: ${sda.ambito}
- Ciclo: ${cicloLabel(sda.ciclo)}
- Hilo conductor: ${hilo}
- Reto / Situación-problema: ${reto}
- Producto final: ${producto}
- Número de sesiones: ${sda.sesiones.length}

${guiaPorCiclo(sda.ciclo)}

TAREA:
Diseña el marco gamificado y visual del cuaderno de trabajo del alumno. El marco debe:
1. Derivarse directamente del hilo conductor y el reto de la SdA
2. Usar lenguaje motivador apropiado al ciclo
3. Crear un universo narrativo coherente que dé sentido a todas las sesiones
4. Incluir un sistema de puntos XP (Puntos de Experiencia) explicado de forma sencilla
5. ELEGIR el tema visual que mejor encaje con la temática, entre estos 6:
   - "espacio": cohetes, planetas, galaxias, astronautas
   - "oceano": mar, criaturas marinas, buceo, submarinos
   - "selva": jungla, animales, naturaleza, exploradores
   - "castillo": medieval, caballeros, reinos, dragones
   - "laboratorio": ciencia, experimentos, descubrimientos, inventos
   - "digital": tecnología, videojuegos, robots, código
6. DISEÑAR una mascota o ilustración temática en SVG plano y sencillo (estilo flat, formas simples, máx. 8 elementos). El SVG debe usar viewBox="0 0 100 100", sin width/height fijos, con colores planos vivos. Será la mascota guía del alumno.
7. DISEÑAR la maquetación del cuaderno eligiendo UNA opción de cada catálogo, coherente con la temática y la edad:
   - layout: "rejilla" (6 tarjetas compactas en 3×2, ideal para 3.er ciclo) | "mosaico" (2 columnas amplias con más espacio para escribir, equilibrado) | "pergamino" (lista vertical tipo ficha, máximo espacio de escritura, ideal para los más pequeños o infantil)
   - patronFondo: "cuadricula" (papel cuadriculado escolar) | "puntos" (topos suaves, alegre) | "lineas" (rayas diagonales sutiles, dinámico) | "liso" (limpio y sobrio)
   - formaTarjeta: "redondeada" (esquinas muy curvas, amigable) | "recta" (esquinas rectas, serio/técnico) | "sello" (borde discontinuo tipo cupón o pasaporte, aventurero)
   - tipografia: "redondeada" (infantil y cercana) | "clasica" (con serifas, cuentos y época) | "moderna" (sans-serif actual, tecnología/ciencia)
   - decoracion: "minima" (sobria) | "media" (equilibrada) | "alta" (festiva, con barras y adornos)

Devuelve ÚNICAMENTE este JSON (sin texto adicional, sin bloques markdown):
{
  "tematicaJuego": "Nombre temático del cuaderno (ej: 'La Gran Expedición Científica')",
  "personaje": "Rol del alumno en primera persona (ej: 'Eres un Explorador del Conocimiento')",
  "descripcionMundo": "2-3 frases que describen el universo narrativo de forma motivadora y en lenguaje apropiado al ciclo",
  "instruccionesHero": "Cómo funciona el sistema XP: qué son los puntos, para qué sirven, cómo se ganan. 2-3 frases claras.",
  "temaVisual": "espacio",
  "emojiTema": "🚀",
  "mascotaSvg": "<svg viewBox=\\"0 0 100 100\\" xmlns=\\"http://www.w3.org/2000/svg\\">...ilustración plana sencilla...</svg>",
  "diseno": {
    "layout": "rejilla",
    "patronFondo": "cuadricula",
    "formaTarjeta": "redondeada",
    "tipografia": "moderna",
    "decoracion": "media"
  }
}`
}

export function buildPromptImagen(
  marco: { tematicaJuego: string; personaje: string; temaVisual?: { plantilla: string } },
  misionTitulo: string,
  ciclo: string
): string {
  const edad = ciclo.startsWith('infantil') ? 'niños de 3 a 6 años' : 'niños de primaria'
  const tema = marco.temaVisual?.plantilla ?? 'aventura'
  return `Ilustración infantil para material educativo de ${edad}. ` +
    `Temática: "${marco.tematicaJuego}" (estilo ${tema}). ` +
    `Escena: ${misionTitulo}. ` +
    `Estilo: dibujo plano colorido, amable y motivador, tipo libro de texto infantil, ` +
    `colores vivos, formas simples, sin texto ni letras en la imagen, fondo claro. ` +
    `Apropiado para el aula, alegre y educativo.`
}

// Fase del proyecto ABP según la posición de la sesión en la secuencia.
function faseProyecto(numero: number, total: number): string {
  if (total <= 1) return 'sesión única'
  const pos = numero / total
  if (pos <= 0.34) return 'fase de LANZAMIENTO Y EXPLORACIÓN — tareas de descubrir, activar conocimientos previos y conectar con el reto'
  if (pos <= 0.75) return 'fase de DESARROLLO — tareas de profundizar, practicar y avanzar hacia el producto final'
  return 'fase de CIERRE Y PRODUCTO FINAL — tareas de pulir, integrar lo aprendido y preparar/presentar el producto final'
}

// Medidas DUA redactadas en S08, resumidas para alinear pistas y retos.
function bloqueDua(sda: SdA): string {
  const corto = (t: string): string => t.length > 300 ? `${t.slice(0, 300)}…` : t
  const imp = stripHtml(sda.duaImplicacion ?? '').trim()
  const rep = stripHtml(sda.duaRepresentacion ?? '').trim()
  const acc = stripHtml(sda.duaAccionExpresion ?? '').trim()
  if (!imp && !rep && !acc) return ''
  const L: string[] = ['MEDIDAS DUA PLANIFICADAS POR EL DOCENTE (alinea las pistas y retos con ellas):']
  if (imp) L.push(`- Implicación: ${corto(imp)}`)
  if (rep) L.push(`- Representación: ${corto(rep)}`)
  if (acc) L.push(`- Acción y expresión: ${corto(acc)}`)
  return L.join('\n')
}

export interface OpcionesPromptSesion {
  /** Títulos de tareas ya generadas en otras misiones — para evitar repetición. */
  tareasPrevias?: string[]
}

export function buildPromptSesion(sda: SdA, sesion: Sesion, marco: { tematicaJuego: string; personaje: string }, opts: OpcionesPromptSesion = {}): string {
  const inicio = stripHtml(sesion.inicio ?? '').trim() || 'no especificado'
  const desarrollo = stripHtml(sesion.desarrollo ?? '').trim() || 'no especificado'
  const cierre = stripHtml(sesion.cierre ?? '').trim() || 'no especificado'
  const reto = stripHtml(sda.situacionProblema ?? '').trim() || 'no especificado'
  const producto = stripHtml(sda.productoFinal ?? '').trim() || 'no especificado'
  const ciclo = cicloLabel(sda.ciclo)
  const curricular = bloqueCurricular(sda)
  const dua = bloqueDua(sda)
  const totalSesiones = sda.sesiones.length
  const previas = (opts.tareasPrevias ?? []).slice(0, 30)
  const bloquePrevias = previas.length > 0
    ? `TAREAS YA EXISTENTES EN OTRAS MISIONES (no repitas sus formatos ni enunciados — busca variedad):\n${previas.map(t => `- ${t}`).join('\n')}\n\n`
    : ''

  return `Eres un experto en diseño de tareas educativas usando la Taxonomía de Bloom actualizada (Anderson & Krathwohl).

MARCO DEL CUADERNO:
- Temática gamificada: "${marco.tematicaJuego}"
- Rol del alumno: "${marco.personaje}"

CONTEXTO DE LA SITUACIÓN DE APRENDIZAJE:
- Reto / Situación-problema: ${reto}
- Producto final hacia el que se trabaja: ${producto}
- Posición en el proyecto: sesión ${sesion.numero} de ${totalSesiones} — ${faseProyecto(sesion.numero, totalSesiones)}

${bloquePrevias}DATOS DE LA SESIÓN ${sesion.numero}:
- Título: "${sesion.titulo}"
- Duración: ${sesion.duracion}
- Ciclo: ${ciclo}
- Área: ${sda.ambito}
- Inicio / Motivación: ${inicio}
- Desarrollo / Actividades: ${desarrollo}
- Cierre / Reflexión: ${cierre}

${curricular ? curricular + '\n\n' : ''}${dua ? dua + '\n\n' : ''}${guiaPorCiclo(sda.ciclo)}

TAREA:
Genera el material del alumno para esta sesión con los 6 niveles de la Taxonomía de Bloom actualizada.
Cada tarea debe:
- Estar integrada en la temática gamificada (usar el lenguaje del marco)
- Trabajar directamente los criterios de evaluación y saberes básicos listados arriba (si los hay), no contenidos genéricos
- Contribuir de forma visible al producto final de la SdA cuando sea posible, acorde a la fase del proyecto indicada
- Cumplir estrictamente las directrices del ciclo (tipo de respuesta, longitud, vocabulario)
- VARIAR el formato de respuesta entre las 6 tareas: combina dibujar, rodear/unir, lista, tabla, completar y redacción breve — nunca las 6 con el mismo formato
- Ser RESOLUBLE EN EL CUADERNO: la respuesta debe poder escribirse o dibujarse en el espacio de respuesta. Si la tarea implica una actividad práctica de aula, el enunciado debe terminar pidiendo registrar algo concreto en el cuaderno (ej.: "después, escribe/dibuja lo que descubriste").
- Incluir el verbo de acción de Bloom correspondiente (varía los verbos: los del ejemplo JSON son solo ilustrativos)
- Escalar en dificultad: Recordar (básico, accesible para todos) → Crear (avanzado, reto máximo)
- "pista": ayuda concreta para alumnado con dificultades o NEAE (obligatorio en niveles 1-3)
- "retoExtra": ampliación para alumnado avanzado (obligatorio en niveles 4-6)
- La carga total de las 6 tareas debe ser realista para una sesión de ${sesion.duracion || '55 min'}: tareas breves y focalizadas

Sistema XP fijo por nivel:
- recordar: 10 XP | comprender: 20 XP | aplicar: 30 XP | analizar: 40 XP | evaluar: 50 XP | crear: 60 XP

Devuelve ÚNICAMENTE este JSON (sin texto adicional, sin bloques markdown):
{
  "misionTitulo": "Nombre gamificado de esta sesión (integra la temática, máx. 8 palabras)",
  "narrativa": "2-3 frases motivadoras que conectan la sesión con el marco gamificado y preparan al alumno",
  "reflexion": "Pregunta metacognitiva final para el alumno (1 pregunta abierta, en lenguaje apropiado al ciclo)",
  "tareas": [
    {
      "nivelBloom": "recordar",
      "titulo": "Título breve gamificado de la tarea",
      "enunciado": "Instrucción completa y clara para el alumno",
      "verboBloom": "Identifica",
      "pista": "Ayuda: ...",
      "xp": 10
    },
    {
      "nivelBloom": "comprender",
      "titulo": "...",
      "enunciado": "...",
      "verboBloom": "Explica",
      "pista": "Ayuda: ...",
      "xp": 20
    },
    {
      "nivelBloom": "aplicar",
      "titulo": "...",
      "enunciado": "...",
      "verboBloom": "Usa",
      "pista": "Ayuda: ...",
      "xp": 30
    },
    {
      "nivelBloom": "analizar",
      "titulo": "...",
      "enunciado": "...",
      "verboBloom": "Relaciona",
      "retoExtra": "Reto extra: ...",
      "xp": 40
    },
    {
      "nivelBloom": "evaluar",
      "titulo": "...",
      "enunciado": "...",
      "verboBloom": "Valora",
      "retoExtra": "Reto extra: ...",
      "xp": 50
    },
    {
      "nivelBloom": "crear",
      "titulo": "...",
      "enunciado": "...",
      "verboBloom": "Diseña",
      "retoExtra": "Reto extra: ...",
      "xp": 60
    }
  ]
}`
}

/**
 * Segunda pasada: revisa el material generado contra una lista de control
 * pedagógica y devuelve el JSON corregido (mismo esquema).
 */
export function buildPromptRevision(sda: SdA, materialJson: string): string {
  const curricular = bloqueCurricular(sda)
  return `Eres un revisor pedagógico experto. Revisa este material de cuaderno del alumno (JSON) y devuélvelo CORREGIDO.

MATERIAL A REVISAR:
${materialJson}

${curricular ? curricular + '\n\n' : ''}${guiaPorCiclo(sda.ciclo)}

LISTA DE CONTROL — corrige cualquier incumplimiento:
1. EDAD: cada enunciado cumple las directrices del ciclo (longitud, vocabulario, tipo de respuesta). Reescribe los que no.
2. CURRÍCULO: las tareas trabajan los criterios y saberes listados (si los hay). Reorienta las que sean genéricas.
3. BLOOM: cada tarea corresponde realmente a su nivel (recordar=recuperar, comprender=explicar, aplicar=usar, analizar=relacionar, evaluar=juzgar con razones, crear=producir algo nuevo) y su verbo es coherente.
4. RESOLUBLE: toda tarea puede responderse escribiendo o dibujando en el cuaderno; si es práctica, termina pidiendo registrar algo.
5. VARIEDAD: las 6 tareas no repiten formato de respuesta.
6. XP: recordar=10, comprender=20, aplicar=30, analizar=40, evaluar=50, crear=60.
7. DUA: niveles 1-3 tienen "pista" útil; niveles 4-6 tienen "retoExtra" real (no trivial).

Devuelve ÚNICAMENTE el JSON completo corregido, con el MISMO esquema exacto del material recibido (misionTitulo, narrativa, reflexion, tareas[]). Sin texto adicional, sin bloques markdown. Si el material ya es correcto, devuélvelo igualmente completo.`
}
