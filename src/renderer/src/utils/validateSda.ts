import type { SdA, Sesion, ElementoCurricular, RubricaFila, Conexion, CompetenciaClave, AgrupamientoTipo, MomentoEvaluacion, InstrumentoEvaluacion, CuadernoTrabajo, MaterialSesion, TareaBloom, NivelBloom, TemaVisual, TemaVisualKey, DisenoCuaderno } from '@renderer/types'
import {
  SDA_INICIAL, BLOOM_ORDEN, TEMAS_VISUALES, DISENO_DEFECTO,
  LAYOUTS_CUADERNO, PATRONES_FONDO, FORMAS_TARJETA, TIPOGRAFIAS_CUADERNO, DECORACIONES_CUADERNO
} from '@renderer/types'
import { sanitizeSvg, isSafeImageDataUrl } from './sanitizeSvg'

const VALID_CICLOS = new Set(['infantil_ciclo_1', 'infantil_ciclo_2', 'primaria_ciclo_1', 'primaria_ciclo_2', 'primaria_ciclo_3', ''])
const VALID_COMPETENCIAS: CompetenciaClave[] = ['CCL', 'CP', 'STEM', 'CD', 'CPSAA', 'CC', 'CE', 'CCEC']
const VALID_AGRUPAMIENTOS: AgrupamientoTipo[] = ['Gran grupo', 'Pequeño grupo', 'Parejas', 'Individual', 'Grupo cooperativo']
const VALID_MOMENTOS: MomentoEvaluacion[] = ['Diagnóstica', 'Formativa', 'Sumativa']
const VALID_INSTRUMENTOS: InstrumentoEvaluacion[] = ['Rúbrica', 'Lista de cotejo', 'Diana de autoevaluación', 'Portafolio', 'Prueba escrita', 'Observación directa', 'Diario del alumno', 'Exposición oral']

// ─── Normalizadores de objetos anidados ──────────────────────────────────────

function normalizeSesion(raw: unknown, index: number): Sesion {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { numero: index + 1, titulo: '', duracion: '', inicio: '', desarrollo: '', cierre: '', recursos: '', agrupamiento: '' }
  }
  const s = raw as Record<string, unknown>
  return {
    numero: typeof s.numero === 'number' ? s.numero : index + 1,
    titulo: typeof s.titulo === 'string' ? s.titulo : '',
    duracion: typeof s.duracion === 'string' ? s.duracion : '',
    inicio: typeof s.inicio === 'string' ? s.inicio : '',
    desarrollo: typeof s.desarrollo === 'string' ? s.desarrollo : '',
    cierre: typeof s.cierre === 'string' ? s.cierre : '',
    recursos: typeof s.recursos === 'string' ? s.recursos : '',
    agrupamiento: typeof s.agrupamiento === 'string' ? s.agrupamiento : '',
  }
}

function normalizeElementoCurricular(raw: unknown): ElementoCurricular | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const e = raw as Record<string, unknown>
  if (typeof e.area !== 'string' || typeof e.ce !== 'string') return null
  return {
    id: typeof e.id === 'string' && e.id ? e.id : crypto.randomUUID(),
    ambito: typeof e.ambito === 'string' ? e.ambito : '',
    area: e.area,
    ce: e.ce,
    criterios: Array.isArray(e.criterios) ? e.criterios.filter((c): c is string => typeof c === 'string') : [],
    saberes: Array.isArray(e.saberes) ? e.saberes.filter((s): s is string => typeof s === 'string') : [],
  }
}

function normalizeRubricaFila(raw: unknown): RubricaFila | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>
  return {
    criterio: typeof r.criterio === 'string' ? r.criterio : '',
    area: typeof r.area === 'string' ? r.area : '',
    instrumento: typeof r.instrumento === 'string' ? r.instrumento : '',
    iniciado: typeof r.iniciado === 'string' ? r.iniciado : '',
    enProceso: typeof r.enProceso === 'string' ? r.enProceso : '',
    conseguido: typeof r.conseguido === 'string' ? r.conseguido : '',
    avanzado: typeof r.avanzado === 'string' ? r.avanzado : '',
  }
}

function normalizeConexion(raw: unknown): Conexion | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const c = raw as Record<string, unknown>
  if (typeof c.area !== 'string' && typeof c.descripcion !== 'string') return null
  return {
    area: typeof c.area === 'string' ? c.area : '',
    descripcion: typeof c.descripcion === 'string' ? c.descripcion : '',
  }
}

// ─── Normalizadores del Cuaderno de Trabajo ──────────────────────────────────

function normalizeTareaBloom(raw: unknown): TareaBloom | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const t = raw as Record<string, unknown>
  if (!BLOOM_ORDEN.includes(t.nivelBloom as NivelBloom)) return null
  return {
    id: typeof t.id === 'string' && t.id ? t.id : crypto.randomUUID(),
    nivelBloom: t.nivelBloom as NivelBloom,
    titulo: typeof t.titulo === 'string' ? t.titulo : '',
    enunciado: typeof t.enunciado === 'string' ? t.enunciado : '',
    verboBloom: typeof t.verboBloom === 'string' ? t.verboBloom : '',
    pista: typeof t.pista === 'string' ? t.pista : undefined,
    retoExtra: typeof t.retoExtra === 'string' ? t.retoExtra : undefined,
    xp: typeof t.xp === 'number' ? t.xp : 10,
  }
}

function normalizeMaterialSesion(raw: unknown, index: number): MaterialSesion {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { sesionNumero: index + 1, misionTitulo: '', narrativa: '', tareas: [], reflexion: '', generado: false }
  }
  const m = raw as Record<string, unknown>
  return {
    sesionNumero: typeof m.sesionNumero === 'number' ? m.sesionNumero : index + 1,
    misionTitulo: typeof m.misionTitulo === 'string' ? m.misionTitulo : '',
    narrativa: typeof m.narrativa === 'string' ? m.narrativa : '',
    tareas: Array.isArray(m.tareas) ? m.tareas.map(normalizeTareaBloom).filter((t): t is TareaBloom => t !== null) : [],
    reflexion: typeof m.reflexion === 'string' ? m.reflexion : '',
    generado: m.generado === true,
    // La ilustración se renderiza en <img src>: solo data URLs de imagen raster
    ilustracion: isSafeImageDataUrl(m.ilustracion) ? m.ilustracion : undefined,
  }
}

// Luminancia perceptual aproximada (0 = negro, 255 = blanco) de un color hex.
function colorLuminance(hexColor: string): number {
  let h = hexColor.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length < 6) return 255
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function normalizeTemaVisual(raw: unknown): TemaVisual | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const t = raw as Record<string, unknown>
  const key = t.plantilla
  if (typeof key !== 'string' || !(key in TEMAS_VISUALES)) return undefined
  const base = TEMAS_VISUALES[key as TemaVisualKey]
  const hex = (v: unknown, fb: string): string =>
    typeof v === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : fb
  // primario/secundario se usan como fondo de degradado con texto blanco y como
  // color de texto sobre página clara: si el color guardado es demasiado claro, el
  // texto se vuelve ilegible, así que se sustituye por el color oscuro del preset.
  const darkHex = (v: unknown, fb: string): string => {
    const c = hex(v, fb)
    return colorLuminance(c) <= 140 ? c : fb
  }
  return {
    plantilla: key as TemaVisualKey,
    colorPrimario: darkHex(t.colorPrimario, base.primario),
    colorSecundario: darkHex(t.colorSecundario, base.secundario),
    colorAcento: hex(t.colorAcento, base.acento),
    colorFondoSuave: hex(t.colorFondoSuave, base.fondoSuave),
    // El SVG procede del archivo y se incrusta con dangerouslySetInnerHTML: re-sanear SIEMPRE
    mascotaSvg: sanitizeSvg(t.mascotaSvg),
    emojiTema: typeof t.emojiTema === 'string' ? t.emojiTema.slice(0, 8) : base.emoji,
  }
}

function normalizeDiseno(raw: unknown): DisenoCuaderno | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const d = raw as Record<string, unknown>
  const pick = <T extends string>(v: unknown, cat: readonly T[], fb: T): T =>
    typeof v === 'string' && (cat as readonly string[]).includes(v) ? v as T : fb
  return {
    layout: pick(d.layout, LAYOUTS_CUADERNO, DISENO_DEFECTO.layout),
    patronFondo: pick(d.patronFondo, PATRONES_FONDO, DISENO_DEFECTO.patronFondo),
    formaTarjeta: pick(d.formaTarjeta, FORMAS_TARJETA, DISENO_DEFECTO.formaTarjeta),
    tipografia: pick(d.tipografia, TIPOGRAFIAS_CUADERNO, DISENO_DEFECTO.tipografia),
    decoracion: pick(d.decoracion, DECORACIONES_CUADERNO, DISENO_DEFECTO.decoracion),
  }
}

function normalizeCuaderno(raw: unknown): CuadernoTrabajo | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined
  const c = raw as Record<string, unknown>
  if (typeof c.tematicaJuego !== 'string' || !c.tematicaJuego) return undefined
  return {
    tematicaJuego: c.tematicaJuego,
    personaje: typeof c.personaje === 'string' ? c.personaje : '',
    descripcionMundo: typeof c.descripcionMundo === 'string' ? c.descripcionMundo : '',
    instruccionesHero: typeof c.instruccionesHero === 'string' ? c.instruccionesHero : '',
    temaVisual: normalizeTemaVisual(c.temaVisual),
    diseno: normalizeDiseno(c.diseno),
    sesiones: Array.isArray(c.sesiones) ? c.sesiones.map((s, i) => normalizeMaterialSesion(s, i)) : [],
    generadoEn: typeof c.generadoEn === 'string' ? c.generadoEn : '',
  }
}

// ─── Parser principal ─────────────────────────────────────────────────────────

export function parseSdAFromJSON(raw: string): SdA {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('El archivo no contiene JSON válido.')
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('El archivo no tiene el formato correcto de SdA Creator.')
  }

  const obj = data as Record<string, unknown>

  // Migraciones basadas en la versión del archivo
  const fileVersion = typeof obj.version === 'number' ? obj.version : 0
  const CURRENT_VERSION = SDA_INICIAL.version

  if (fileVersion < CURRENT_VERSION) {
    console.log(`Migrando SdA de versión ${fileVersion} a ${CURRENT_VERSION}...`)

    if (fileVersion < 1) {
      if (obj.objetivos && !obj.situacionProblema) {
        obj.situacionProblema = obj.objetivos
        delete obj.objetivos
      }
      if (typeof obj.agrupamiento === 'string' && !obj.agrupamientos) {
        obj.agrupamientos = [obj.agrupamiento]
        delete obj.agrupamiento
      }
      obj.version = 1
    }
  }

  function str(v: unknown, fallback: string): string {
    return typeof v === 'string' ? v : fallback
  }

  // Merge con valores por defecto + normalización explícita de todos los campos
  const sda: SdA = {
    id: str(obj.id, SDA_INICIAL.id),
    version: CURRENT_VERSION,
    fechaCreacion: str(obj.fechaCreacion, SDA_INICIAL.fechaCreacion),
    fechaModificacion: str(obj.fechaModificacion, SDA_INICIAL.fechaModificacion),
    comunidadCurriculo: str(obj.comunidadCurriculo, SDA_INICIAL.comunidadCurriculo),
    titulo: str(obj.titulo, SDA_INICIAL.titulo),
    ciclo: (VALID_CICLOS.has(str(obj.ciclo, '')) ? str(obj.ciclo, '') : SDA_INICIAL.ciclo) as SdA['ciclo'],
    ambito: str(obj.ambito, SDA_INICIAL.ambito),
    curso: str(obj.curso, SDA_INICIAL.curso),
    numSesiones: typeof obj.numSesiones === 'number' ? obj.numSesiones : SDA_INICIAL.numSesiones,
    temporalizacion: str(obj.temporalizacion, SDA_INICIAL.temporalizacion),
    docente: str(obj.docente, SDA_INICIAL.docente),
    centro: str(obj.centro, SDA_INICIAL.centro),
    logoCentro: str(obj.logoCentro, SDA_INICIAL.logoCentro),
    justificacion: str(obj.justificacion, SDA_INICIAL.justificacion),
    contexto: str(obj.contexto, SDA_INICIAL.contexto),
    situacionProblema: str(obj.situacionProblema, SDA_INICIAL.situacionProblema),
    productoFinal: str(obj.productoFinal, SDA_INICIAL.productoFinal),
    hilo: str(obj.hilo, SDA_INICIAL.hilo),
    planteamientoMetodologico: str(obj.planteamientoMetodologico, SDA_INICIAL.planteamientoMetodologico),
    recursos: str(obj.recursos, SDA_INICIAL.recursos),
    tiempos: str(obj.tiempos, SDA_INICIAL.tiempos),
    criteriosCalificacion: str(obj.criteriosCalificacion, SDA_INICIAL.criteriosCalificacion),
    rubrica: str(obj.rubrica, SDA_INICIAL.rubrica),
    duaImplicacion: str(obj.duaImplicacion, SDA_INICIAL.duaImplicacion),
    duaRepresentacion: str(obj.duaRepresentacion, SDA_INICIAL.duaRepresentacion),
    duaAccionExpresion: str(obj.duaAccionExpresion, SDA_INICIAL.duaAccionExpresion),
    transversales: str(obj.transversales, SDA_INICIAL.transversales),
    justificacionOds: str(obj.justificacionOds, SDA_INICIAL.justificacionOds),
    areas: Array.isArray(obj.areas) ? (obj.areas as string[]).filter((a): a is string => typeof a === 'string') : [],
    competenciasClave: Array.isArray(obj.competenciasClave)
      ? (obj.competenciasClave as unknown[]).filter((v): v is CompetenciaClave => VALID_COMPETENCIAS.includes(v as CompetenciaClave))
      : [],
    elementosCurriculares: Array.isArray(obj.elementosCurriculares)
      ? obj.elementosCurriculares.map(normalizeElementoCurricular).filter((e): e is ElementoCurricular => e !== null)
      : [],
    agrupamientos: Array.isArray(obj.agrupamientos)
      ? (obj.agrupamientos as unknown[]).filter((v): v is AgrupamientoTipo => VALID_AGRUPAMIENTOS.includes(v as AgrupamientoTipo))
      : [],
    espacios: Array.isArray(obj.espacios) ? (obj.espacios as string[]).filter((e): e is string => typeof e === 'string') : [],
    momentosEvaluacion: Array.isArray(obj.momentosEvaluacion)
      ? (obj.momentosEvaluacion as unknown[]).filter((v): v is MomentoEvaluacion => VALID_MOMENTOS.includes(v as MomentoEvaluacion))
      : [],
    instrumentosEvaluacion: Array.isArray(obj.instrumentosEvaluacion)
      ? (obj.instrumentosEvaluacion as unknown[]).filter((v): v is InstrumentoEvaluacion => VALID_INSTRUMENTOS.includes(v as InstrumentoEvaluacion))
      : [],
    instrumentosPersonalizados: Array.isArray(obj.instrumentosPersonalizados)
      ? (obj.instrumentosPersonalizados as string[]).filter((i): i is string => typeof i === 'string')
      : [],
    rubricaTabla: Array.isArray(obj.rubricaTabla)
      ? obj.rubricaTabla.map(normalizeRubricaFila).filter((r): r is RubricaFila => r !== null)
      : [],
    sesiones: Array.isArray(obj.sesiones)
      ? obj.sesiones.map((s, i) => normalizeSesion(s, i))
      : [],
    conexiones: Array.isArray(obj.conexiones)
      ? obj.conexiones.map(normalizeConexion).filter((c): c is Conexion => c !== null)
      : [],
    ods: Array.isArray(obj.ods) ? (obj.ods as number[]).filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 17) : [],
    criterioInstrumentos: (obj.criterioInstrumentos && typeof obj.criterioInstrumentos === 'object' && !Array.isArray(obj.criterioInstrumentos))
      ? (obj.criterioInstrumentos as Record<string, string>)
      : {},
    cuaderno: normalizeCuaderno(obj.cuaderno),
  }

  return sda
}
