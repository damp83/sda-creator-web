import { useState, useCallback } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { generarConIA, generarImagenIA, getAISettings } from '@renderer/services/aiService'
import { buildPromptMarco, buildPromptSesion, buildPromptImagen, buildPromptRevision } from '@renderer/config/cuadernoPrompts'
import { compressImage } from '@renderer/utils/compressImage'
import type { SdA, Sesion, CuadernoTrabajo, MaterialSesion, TareaBloom, NivelBloom, TemaVisual, TemaVisualKey, DisenoCuaderno } from '@renderer/types'
import {
  BLOOM_ORDEN, TEMAS_VISUALES, DISENO_DEFECTO,
  LAYOUTS_CUADERNO, PATRONES_FONDO, FORMAS_TARJETA, TIPOGRAFIAS_CUADERNO, DECORACIONES_CUADERNO
} from '@renderer/types'

import { sanitizeSvg } from '@renderer/utils/sanitizeSvg'

function buildTemaVisual(obj: Record<string, unknown>): TemaVisual | undefined {
  const key = obj.temaVisual
  if (typeof key !== 'string' || !(key in TEMAS_VISUALES)) return undefined
  const base = TEMAS_VISUALES[key as TemaVisualKey]
  return {
    plantilla: key as TemaVisualKey,
    colorPrimario:   base.primario,
    colorSecundario: base.secundario,
    colorAcento:     base.acento,
    colorFondoSuave: base.fondoSuave,
    mascotaSvg:      sanitizeSvg(obj.mascotaSvg),
    emojiTema:       typeof obj.emojiTema === 'string' ? obj.emojiTema : base.emoji,
  }
}

// Cada campo del diseño se valida contra su catálogo; valor desconocido → defecto.
function buildDiseno(raw: unknown): DisenoCuaderno {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...DISENO_DEFECTO }
  const d = raw as Record<string, unknown>
  const pick = <T extends string>(v: unknown, catalogo: readonly T[], defecto: T): T =>
    (typeof v === 'string' && (catalogo as readonly string[]).includes(v)) ? v as T : defecto
  return {
    layout:       pick(d.layout,       LAYOUTS_CUADERNO,      DISENO_DEFECTO.layout),
    patronFondo:  pick(d.patronFondo,  PATRONES_FONDO,        DISENO_DEFECTO.patronFondo),
    formaTarjeta: pick(d.formaTarjeta, FORMAS_TARJETA,        DISENO_DEFECTO.formaTarjeta),
    tipografia:   pick(d.tipografia,   TIPOGRAFIAS_CUADERNO,  DISENO_DEFECTO.tipografia),
    decoracion:   pick(d.decoracion,   DECORACIONES_CUADERNO, DISENO_DEFECTO.decoracion),
  }
}

// ─── Parsers seguros de la respuesta IA ──────────────────────────────────────

function parseMarco(text: string): {
  tematicaJuego: string; personaje: string; descripcionMundo: string; instruccionesHero: string; temaVisual?: TemaVisual; diseno: DisenoCuaderno
} | null {
  try {
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const obj = JSON.parse(clean) as Record<string, unknown>
    if (typeof obj.tematicaJuego !== 'string') return null
    return {
      tematicaJuego:    typeof obj.tematicaJuego    === 'string' ? obj.tematicaJuego    : '',
      personaje:        typeof obj.personaje         === 'string' ? obj.personaje         : '',
      descripcionMundo: typeof obj.descripcionMundo  === 'string' ? obj.descripcionMundo  : '',
      instruccionesHero:typeof obj.instruccionesHero === 'string' ? obj.instruccionesHero : '',
      temaVisual:       buildTemaVisual(obj),
      diseno:           buildDiseno(obj.diseno),
    }
  } catch { return null }
}

function parseTarea(raw: unknown, idx: number): TareaBloom | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const t = raw as Record<string, unknown>
  const nivel = BLOOM_ORDEN.includes(t.nivelBloom as NivelBloom) ? t.nivelBloom as NivelBloom : BLOOM_ORDEN[idx] ?? 'recordar'
  return {
    id: crypto.randomUUID(),
    nivelBloom:  nivel,
    titulo:      typeof t.titulo      === 'string' ? t.titulo      : `Tarea ${nivel}`,
    enunciado:   typeof t.enunciado   === 'string' ? t.enunciado   : '',
    verboBloom:  typeof t.verboBloom  === 'string' ? t.verboBloom  : '',
    pista:       typeof t.pista       === 'string' ? t.pista       : undefined,
    retoExtra:   typeof t.retoExtra   === 'string' ? t.retoExtra   : undefined,
    xp:          typeof t.xp         === 'number'  ? t.xp         : 10,
  }
}

function parseSesion(text: string, sesionNumero: number): MaterialSesion | null {
  try {
    const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
    const obj = JSON.parse(clean) as Record<string, unknown>
    const tareasRaw = Array.isArray(obj.tareas) ? obj.tareas : []
    const tareas = tareasRaw.map((t, i) => parseTarea(t, i)).filter((t): t is TareaBloom => t !== null)
    return {
      sesionNumero,
      misionTitulo: typeof obj.misionTitulo === 'string' ? obj.misionTitulo : `Misión ${sesionNumero}`,
      narrativa:    typeof obj.narrativa    === 'string' ? obj.narrativa    : '',
      reflexion:    typeof obj.reflexion    === 'string' ? obj.reflexion    : '',
      tareas,
      generado: true,
    }
  } catch { return null }
}

// ─── Generación con revisión pedagógica ──────────────────────────────────────

// JSON de 6 tareas con pistas/retos ronda los 2-3K tokens: 4096 evita truncados.
const MAX_TOKENS_SESION = 4096

// Títulos de tareas de otras misiones ya generadas — para exigir variedad.
function tareasPreviasDe(cuaderno: CuadernoTrabajo, exceptIndex: number): string[] {
  return cuaderno.sesiones.flatMap((s, i) =>
    i !== exceptIndex && s.generado ? s.tareas.map(t => t.titulo) : []
  )
}

// Genera la sesión y aplica una segunda pasada de revisión (best-effort:
// si la revisión falla o devuelve menos tareas, se conserva el original).
async function generarYRevisar(
  sda: SdA,
  sesion: Sesion,
  cuaderno: CuadernoTrabajo,
  previas: string[],
  onProgreso: (msg: string) => void
): Promise<MaterialSesion | null> {
  const prompt = buildPromptSesion(sda, sesion, cuaderno, { tareasPrevias: previas })
  const result = await generarConIA(prompt, 60_000, MAX_TOKENS_SESION)
  const material = parseSesion(result, sesion.numero)
  if (!material) return null
  try {
    onProgreso(`Revisando misión ${sesion.numero} (control pedagógico)…`)
    const payload = JSON.stringify({
      misionTitulo: material.misionTitulo,
      narrativa: material.narrativa,
      reflexion: material.reflexion,
      tareas: material.tareas.map(({ id: _id, ...rest }) => rest),
    })
    const revText = await generarConIA(buildPromptRevision(sda, payload), 60_000, MAX_TOKENS_SESION)
    const revisado = parseSesion(revText, sesion.numero)
    if (revisado && revisado.tareas.length >= material.tareas.length) return revisado
  } catch (e) {
    console.warn(`[Cuaderno] Revisión de misión ${sesion.numero} falló, se mantiene el original:`, e)
  }
  return material
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseGenerarCuaderno {
  generando: boolean
  progreso: string | null
  error: string | null
  generarMarco: () => Promise<boolean>
  generarSesion: (index: number) => Promise<boolean>
  generarTodo: () => Promise<void>
  ilustrarSesion: (index: number) => Promise<boolean>
  ilustrarTodo: () => Promise<void>
  clearError: () => void
}

export function useGenerarCuaderno(): UseGenerarCuaderno {
  const store = useSdAStore()
  const [generando, setGenerando] = useState(false)
  const [progreso, setProgreso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generarMarco = useCallback(async (): Promise<boolean> => {
    if (generando) return false
    const sda = useSdAStore.getState().sda
    setGenerando(true)
    setError(null)
    setProgreso('Generando marco gamificado…')
    try {
      const prompt = buildPromptMarco(sda)
      const result = await generarConIA(prompt, 60_000, MAX_TOKENS_SESION)
      const marco = parseMarco(result)
      if (!marco) throw new Error('La IA no devolvió el formato esperado. Inténtalo de nuevo.')
      store.setCuadernoMarco(marco)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar el marco')
      return false
    } finally {
      setGenerando(false)
      setProgreso(null)
    }
  }, [generando, store])

  const generarSesion = useCallback(async (index: number): Promise<boolean> => {
    if (generando) return false
    const sda = useSdAStore.getState().sda
    const sesion = sda.sesiones[index]
    const cuaderno = sda.cuaderno
    if (!sesion || !cuaderno) return false

    setGenerando(true)
    setError(null)
    setProgreso(`Generando sesión ${sesion.numero}: "${sesion.titulo || `Sesión ${sesion.numero}`}"…`)
    try {
      const material = await generarYRevisar(sda, sesion, cuaderno, tareasPreviasDe(cuaderno, index), setProgreso)
      if (!material) throw new Error('La IA no devolvió el formato esperado para la sesión.')
      store.setCuadernoSesion(index, material)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : `Error al generar sesión ${sesion.numero}`)
      return false
    } finally {
      setGenerando(false)
      setProgreso(null)
    }
  }, [generando, store])

  const generarTodo = useCallback(async (): Promise<void> => {
    if (generando) return
    const sda = useSdAStore.getState().sda
    if (!sda.cuaderno) return

    setGenerando(true)
    setError(null)
    const total = sda.sesiones.length
    for (let i = 0; i < total; i++) {
      const ses = useSdAStore.getState().sda.sesiones[i]
      setProgreso(`Sesión ${i + 1} / ${total} — ${ses?.titulo || `Sesión ${i + 1}`}`)
      try {
        const sdaCurrent = useSdAStore.getState().sda
        const cuaderno = sdaCurrent.cuaderno
        if (!cuaderno) break
        const material = await generarYRevisar(
          sdaCurrent, sdaCurrent.sesiones[i], cuaderno, tareasPreviasDe(cuaderno, i), setProgreso
        )
        if (material) store.setCuadernoSesion(i, material)
      } catch (e) {
        console.warn(`[Cuaderno] Error sesión ${i + 1}:`, e)
      }
    }
    setGenerando(false)
    setProgreso(null)
  }, [generando, store])

  // ── Ilustraciones (imágenes IA) ──────────────────────────────────────────

  const ilustrarSesion = useCallback(async (index: number): Promise<boolean> => {
    if (generando) return false
    const sda = useSdAStore.getState().sda
    const cuaderno = sda.cuaderno
    const material = cuaderno?.sesiones[index]
    if (!cuaderno || !material) return false

    setGenerando(true)
    setError(null)
    setProgreso(`Ilustrando misión ${material.sesionNumero}…`)
    try {
      const prompt = buildPromptImagen(cuaderno, material.misionTitulo || `Misión ${material.sesionNumero}`, sda.ciclo)
      const raw = await generarImagenIA(prompt)
      const comprimida = await compressImage(raw, 512, 0.72)
      store.setCuadernoIlustracion(index, comprimida)
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar la ilustración')
      return false
    } finally {
      setGenerando(false)
      setProgreso(null)
    }
  }, [generando, store])

  const ilustrarTodo = useCallback(async (): Promise<void> => {
    if (generando) return
    const cuaderno = useSdAStore.getState().sda.cuaderno
    if (!cuaderno) return

    setGenerando(true)
    setError(null)
    const generadas = cuaderno.sesiones.filter(s => s.generado)
    for (let i = 0; i < cuaderno.sesiones.length; i++) {
      const material = cuaderno.sesiones[i]
      if (!material.generado || material.ilustracion) continue
      setProgreso(`Ilustrando misión ${material.sesionNumero} de ${generadas.length}…`)
      try {
        const sdaCurrent = useSdAStore.getState().sda
        const cua = sdaCurrent.cuaderno
        if (!cua) break
        const prompt = buildPromptImagen(cua, material.misionTitulo || `Misión ${material.sesionNumero}`, sdaCurrent.ciclo)
        const raw = await generarImagenIA(prompt)
        const comprimida = await compressImage(raw, 512, 0.72)
        store.setCuadernoIlustracion(i, comprimida)
      } catch (e) {
        console.warn(`[Cuaderno] Error ilustrando misión ${i + 1}:`, e)
        // Si falla la primera (p. ej. proveedor Claude), abortar para no repetir el error
        if (i === 0) {
          setError(e instanceof Error ? e.message : 'Error al generar ilustraciones')
          break
        }
      }
    }
    setGenerando(false)
    setProgreso(null)
  }, [generando, store])

  return {
    generando, progreso, error,
    generarMarco, generarSesion, generarTodo,
    ilustrarSesion, ilustrarTodo,
    clearError: () => setError(null),
  }
}

/** Comprueba si el proveedor de IA activo puede generar imágenes (Claude no). */
export async function checkImagenDisponible(): Promise<{ disponible: boolean; proveedor: string }> {
  const settings = await getAISettings()
  const proveedor = settings?.activeProvider ?? 'claude'
  return { disponible: proveedor === 'openai' || proveedor === 'gemini', proveedor }
}
