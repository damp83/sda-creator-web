// ─── Currículo ────────────────────────────────────────────────────────────────

export type CicloKey =
  | 'infantil_ciclo_1'
  | 'infantil_ciclo_2'
  | 'primaria_ciclo_1'
  | 'primaria_ciclo_2'
  | 'primaria_ciclo_3'

export interface CompetenciaEspecifica {
  ce: string
  criterios_evaluacion: Partial<Record<CicloKey, string[]>>
}

export interface AreaCurriculo {
  nombre: string
  competencias_especificas: CompetenciaEspecifica[]
  saberes_basicos: Record<string, unknown>
}

export interface AmbitoCurriculo {
  comunidad?: string
  ambito: string
  areas: AreaCurriculo[]
}

// ─── Modelo SdA INTEF ─────────────────────────────────────────────────────────

export type Etapa = 'infantil' | 'primaria'

export type Ciclo =
  | 'infantil_ciclo_1'
  | 'infantil_ciclo_2'
  | 'primaria_ciclo_1'
  | 'primaria_ciclo_2'
  | 'primaria_ciclo_3'

export const CICLO_LABELS: Record<Ciclo, string> = {
  infantil_ciclo_1: 'Infantil - 1er Ciclo (0-3 años)',
  infantil_ciclo_2: 'Infantil - 2º Ciclo (3-6 años)',
  primaria_ciclo_1: 'Primaria - 1er Ciclo (1º-2º)',
  primaria_ciclo_2: 'Primaria - 2º Ciclo (3º-4º)',
  primaria_ciclo_3: 'Primaria - 3er Ciclo (5º-6º)'
}

export type CompetenciaClave =
  | 'CCL'
  | 'CP'
  | 'STEM'
  | 'CD'
  | 'CPSAA'
  | 'CC'
  | 'CE'
  | 'CCEC'

export const COMPETENCIAS_CLAVE: Record<CompetenciaClave, string> = {
  CCL: 'Competencia en comunicación lingüística',
  CP: 'Competencia plurilingüe',
  STEM: 'Competencia matemática y en ciencia, tecnología e ingeniería',
  CD: 'Competencia digital',
  CPSAA: 'Competencia personal, social y de aprender a aprender',
  CC: 'Competencia ciudadana',
  CE: 'Competencia emprendedora',
  CCEC: 'Competencia en conciencia y expresión culturales'
}

export interface ElementoCurricular {
  id: string
  ambito: string
  area: string
  ce: string
  criterios: string[]
  saberes: string[]
}

export type AgrupamientoTipo =
  | 'Gran grupo'
  | 'Pequeño grupo'
  | 'Parejas'
  | 'Individual'
  | 'Grupo cooperativo'

export type EspacioTipo =
  | 'Aula'
  | 'Patio'
  | 'Biblioteca'
  | 'Gimnasio'
  | 'Sala de informática'
  | 'Huerto escolar'
  | 'Salidas al entorno'
  | 'Otro'

export type InstrumentoEvaluacion =
  | 'Rúbrica'
  | 'Lista de cotejo'
  | 'Diana de autoevaluación'
  | 'Portafolio'
  | 'Prueba escrita'
  | 'Observación directa'
  | 'Diario del alumno'
  | 'Exposición oral'

export type MomentoEvaluacion = 'Diagnóstica' | 'Formativa' | 'Sumativa'

export interface Sesion {
  numero: number
  titulo: string
  duracion: string
  inicio: string
  desarrollo: string
  cierre: string
  recursos: string
  agrupamiento: string
}

export interface Conexion {
  area: string
  descripcion: string
}

export interface RubricaFila {
  criterio: string
  area: string
  instrumento: string
  iniciado: string
  enProceso: string
  conseguido: string
  avanzado: string
}

// ─── SdA completa (modelo INTEF) ─────────────────────────────────────────────

export interface SdA {
  id: string
  version: number
  fechaCreacion: string
  fechaModificacion: string

  // Sección 1 — Identificación
  comunidadCurriculo: string
  titulo: string
  ciclo: Ciclo | ''
  ambito: string
  areas: string[]
  curso: string
  numSesiones: number
  temporalizacion: string
  docente: string
  centro: string
  logoCentro: string

  // Sección 2 — Justificación y contextualización
  justificacion: string
  contexto: string

  // Sección 3 — Reto / Situación problema
  situacionProblema: string
  productoFinal: string
  hilo: string

  // Sección 4 — Vinculación curricular
  competenciasClave: CompetenciaClave[]
  elementosCurriculares: ElementoCurricular[]

  // Sección 5 — Metodología
  planteamientoMetodologico: string
  agrupamientos: AgrupamientoTipo[]
  espacios: string[]
  recursos: string
  tiempos: string

  // Sección 6 — Secuencia didáctica
  sesiones: Sesion[]

  // Sección 7 — Evaluación
  criteriosCalificacion: string
  momentosEvaluacion: MomentoEvaluacion[]
  instrumentosEvaluacion: InstrumentoEvaluacion[]
  instrumentosPersonalizados: string[]
  criterioInstrumentos: Record<string, string>
  rubricaTabla: RubricaFila[]
  rubrica: string

  // Sección 8 — Atención a la diversidad (DUA)
  duaImplicacion: string
  duaRepresentacion: string
  duaAccionExpresion: string

  // Sección 9 — Interdisciplinariedad
  conexiones: Conexion[]
  transversales: string

  // Sección 10 — ODS
  ods: number[]
  justificacionOds: string

  // Sección 11 — Cuaderno de Trabajo
  cuaderno?: CuadernoTrabajo
}

export const SDA_INICIAL: SdA = {
  id: '',
  version: 1,
  fechaCreacion: '',
  fechaModificacion: '',
  comunidadCurriculo: 'Región de Murcia',
  titulo: '',
  ciclo: '',
  ambito: '',
  areas: [],
  curso: '',
  numSesiones: 6,
  temporalizacion: '',
  docente: '',
  centro: '',
  logoCentro: '',
  justificacion: '',
  contexto: '',
  situacionProblema: '',
  productoFinal: '',
  hilo: '',
  competenciasClave: [],
  elementosCurriculares: [],
  planteamientoMetodologico: '',
  agrupamientos: [],
  espacios: [],
  recursos: '',
  tiempos: '',
  sesiones: [],
  criteriosCalificacion: '',
  momentosEvaluacion: [],
  instrumentosEvaluacion: [],
  instrumentosPersonalizados: [],
  criterioInstrumentos: {},
  rubricaTabla: [],
  rubrica: '',
  duaImplicacion: '',
  duaRepresentacion: '',
  duaAccionExpresion: '',
  conexiones: [],
  transversales: '',
  ods: [],
  justificacionOds: ''
}

// ─── Cuaderno de Trabajo — Taxonomía de Bloom ────────────────────────────────

export type NivelBloom =
  | 'recordar'
  | 'comprender'
  | 'aplicar'
  | 'analizar'
  | 'evaluar'
  | 'crear'

export const BLOOM_CONFIG: Record<NivelBloom, {
  label: string
  descripcion: string
  verbos: string[]
  xp: number
  color: string
  bg: string
  border: string
  icono: string
}> = {
  recordar:   { label: 'Recordar',   descripcion: 'Recupera información aprendida',          verbos: ['Identifica','Nombra','Lista','Reconoce','Señala'],         xp: 10, color: 'text-slate-700',   bg: 'bg-slate-50',    border: 'border-slate-200',  icono: '🔍' },
  comprender: { label: 'Comprender', descripcion: 'Interpreta y explica con tus palabras',   verbos: ['Explica','Resume','Clasifica','Compara','Describe'],       xp: 20, color: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200',    icono: '💡' },
  aplicar:    { label: 'Aplicar',    descripcion: 'Usa el conocimiento en una situación nueva', verbos: ['Usa','Resuelve','Demuestra','Ejecuta','Construye'],    xp: 30, color: 'text-emerald-700',  bg: 'bg-emerald-50',  border: 'border-emerald-200',icono: '⚙️' },
  analizar:   { label: 'Analizar',   descripcion: 'Encuentra relaciones y diferencias',       verbos: ['Diferencia','Organiza','Relaciona','Examina','Descompone'], xp: 40, color: 'text-amber-700',    bg: 'bg-amber-50',    border: 'border-amber-200',  icono: '🔬' },
  evaluar:    { label: 'Evaluar',    descripcion: 'Emite juicios razonados y argumentados',   verbos: ['Juzga','Defiende','Critica','Valora','Argumenta'],         xp: 50, color: 'text-orange-700',   bg: 'bg-orange-50',   border: 'border-orange-200', icono: '⚖️' },
  crear:      { label: 'Crear',      descripcion: 'Genera algo nuevo y original',              verbos: ['Diseña','Inventa','Planifica','Produce','Compone'],        xp: 60, color: 'text-violet-700',   bg: 'bg-violet-50',   border: 'border-violet-200', icono: '✨' },
}

export const BLOOM_ORDEN: NivelBloom[] = ['recordar', 'comprender', 'aplicar', 'analizar', 'evaluar', 'crear']

export interface TareaBloom {
  id: string
  nivelBloom: NivelBloom
  titulo: string
  enunciado: string
  verboBloom: string
  pista?: string
  retoExtra?: string
  xp: number
}

export interface MaterialSesion {
  sesionNumero: number
  misionTitulo: string
  narrativa: string
  tareas: TareaBloom[]
  reflexion: string
  generado: boolean
  ilustracion?: string   // data URL JPEG comprimida (generada por IA)
}

export type TemaVisualKey = 'espacio' | 'oceano' | 'selva' | 'castillo' | 'laboratorio' | 'digital'

export interface TemaVisual {
  plantilla: TemaVisualKey
  colorPrimario: string      // hex — cabeceras y banners
  colorSecundario: string    // hex — degradado
  colorAcento: string        // hex — detalles y XP
  colorFondoSuave: string    // hex — fondos claros (narrativa, recuadros)
  mascotaSvg?: string        // SVG inline generado por IA (ilustración plana)
  emojiTema: string          // emoji representativo de la temática
}

export const TEMAS_VISUALES: Record<TemaVisualKey, {
  nombre: string
  descripcion: string
  emoji: string
  primario: string
  secundario: string
  acento: string
  fondoSuave: string
  motivo: string             // emoji decorativo de fondo
}> = {
  espacio:     { nombre: 'Aventura Espacial',   descripcion: 'Cohetes, planetas y galaxias', emoji: '🚀', primario: '#1e1b4b', secundario: '#4338ca', acento: '#fbbf24', fondoSuave: '#eef2ff', motivo: '⭐' },
  oceano:      { nombre: 'Expedición Submarina', descripcion: 'Océanos, criaturas marinas',   emoji: '🐠', primario: '#0c4a6e', secundario: '#0284c7', acento: '#06b6d4', fondoSuave: '#ecfeff', motivo: '🌊' },
  selva:       { nombre: 'Exploración en la Selva', descripcion: 'Jungla, animales, naturaleza', emoji: '🌿', primario: '#14532d', secundario: '#16a34a', acento: '#84cc16', fondoSuave: '#f0fdf4', motivo: '🍃' },
  castillo:    { nombre: 'Reino Medieval',       descripcion: 'Castillos, caballeros, dragones', emoji: '🏰', primario: '#7c2d12', secundario: '#c2410c', acento: '#f59e0b', fondoSuave: '#fff7ed', motivo: '⚔️' },
  laboratorio: { nombre: 'Laboratorio Científico', descripcion: 'Experimentos, ciencia, descubrimientos', emoji: '🔬', primario: '#134e4a', secundario: '#0d9488', acento: '#22d3ee', fondoSuave: '#f0fdfa', motivo: '⚗️' },
  digital:     { nombre: 'Mundo Digital',        descripcion: 'Tecnología, videojuegos, código', emoji: '🎮', primario: '#581c87', secundario: '#9333ea', acento: '#ec4899', fondoSuave: '#faf5ff', motivo: '💾' },
}

// ── Manual de estilo del cuaderno — la IA elige cada valor de un catálogo cerrado ──

export type LayoutCuaderno = 'rejilla' | 'mosaico' | 'pergamino'
export type PatronFondo = 'cuadricula' | 'puntos' | 'lineas' | 'liso'
export type FormaTarjeta = 'redondeada' | 'recta' | 'sello'
export type TipografiaCuaderno = 'redondeada' | 'clasica' | 'moderna'
export type DecoracionCuaderno = 'minima' | 'media' | 'alta'

export const LAYOUTS_CUADERNO: LayoutCuaderno[] = ['rejilla', 'mosaico', 'pergamino']
export const PATRONES_FONDO: PatronFondo[] = ['cuadricula', 'puntos', 'lineas', 'liso']
export const FORMAS_TARJETA: FormaTarjeta[] = ['redondeada', 'recta', 'sello']
export const TIPOGRAFIAS_CUADERNO: TipografiaCuaderno[] = ['redondeada', 'clasica', 'moderna']
export const DECORACIONES_CUADERNO: DecoracionCuaderno[] = ['minima', 'media', 'alta']

export interface DisenoCuaderno {
  layout: LayoutCuaderno          // disposición de las tareas en la página
  patronFondo: PatronFondo        // textura del papel
  formaTarjeta: FormaTarjeta      // estilo de los bordes de las cartas
  tipografia: TipografiaCuaderno  // carácter tipográfico
  decoracion: DecoracionCuaderno  // densidad de adornos (HUD, marcos)
}

export const DISENO_DEFECTO: DisenoCuaderno = {
  layout: 'rejilla',
  patronFondo: 'cuadricula',
  formaTarjeta: 'redondeada',
  tipografia: 'moderna',
  decoracion: 'media',
}

export interface CuadernoTrabajo {
  tematicaJuego: string
  personaje: string
  descripcionMundo: string
  instruccionesHero: string
  temaVisual?: TemaVisual
  diseno?: DisenoCuaderno
  sesiones: MaterialSesion[]
  generadoEn: string
}

export const ODS_LIST = [
  { num: 1, titulo: 'Fin de la pobreza', color: '#E5243B' },
  { num: 2, titulo: 'Hambre cero', color: '#DDA63A' },
  { num: 3, titulo: 'Salud y bienestar', color: '#4C9F38' },
  { num: 4, titulo: 'Educación de calidad', color: '#C5192D' },
  { num: 5, titulo: 'Igualdad de género', color: '#FF3A21' },
  { num: 6, titulo: 'Agua limpia y saneamiento', color: '#26BDE2' },
  { num: 7, titulo: 'Energía asequible y no contaminante', color: '#FCC30B' },
  { num: 8, titulo: 'Trabajo decente y crecimiento económico', color: '#A21942' },
  { num: 9, titulo: 'Industria, innovación e infraestructura', color: '#FD6925' },
  { num: 10, titulo: 'Reducción de las desigualdades', color: '#DD1367' },
  { num: 11, titulo: 'Ciudades y comunidades sostenibles', color: '#FD9D24' },
  { num: 12, titulo: 'Producción y consumo responsables', color: '#BF8B2E' },
  { num: 13, titulo: 'Acción por el clima', color: '#3F7E44' },
  { num: 14, titulo: 'Vida submarina', color: '#0A97D9' },
  { num: 15, titulo: 'Vida de ecosistemas terrestres', color: '#56C02B' },
  { num: 16, titulo: 'Paz, justicia e instituciones sólidas', color: '#00689D' },
  { num: 17, titulo: 'Alianzas para lograr los objetivos', color: '#19486A' }
]
