import { describe, it, expect } from 'vitest'
import { getSectionComplete, getSdAProgress } from '@renderer/utils/sdaProgress'
import { SDA_INICIAL } from '@renderer/types'
import type { SdA } from '@renderer/types'

function sda(patch: Partial<SdA> = {}): SdA {
  return { ...SDA_INICIAL, ...patch }
}

describe('getSectionComplete', () => {
  // ── Sección 0: Identificación ────────────────────────────────────────────────
  it('S0 incompleta sin título', () => {
    expect(getSectionComplete(sda(), 0)).toBe(false)
  })

  it('S0 incompleta solo con título', () => {
    expect(getSectionComplete(sda({ titulo: 'Test' }), 0)).toBe(false)
  })

  it('S0 completa con título + ciclo + ambito', () => {
    expect(getSectionComplete(sda({ titulo: 'Test', ciclo: 'primaria_ciclo_1', ambito: 'Matemáticas' }), 0)).toBe(true)
  })

  // ── Sección 1: Justificación ─────────────────────────────────────────────────
  it('S1 incompleta sin justificación', () => {
    expect(getSectionComplete(sda(), 1)).toBe(false)
  })

  it('S1 incompleta con texto < 10 chars', () => {
    expect(getSectionComplete(sda({ justificacion: '<p>Corto</p>' }), 1)).toBe(false)
  })

  it('S1 completa con justificación suficiente', () => {
    expect(getSectionComplete(sda({ justificacion: '<p>Esta justificación es suficientemente larga.</p>' }), 1)).toBe(true)
  })

  // ── Sección 2: Reto ──────────────────────────────────────────────────────────
  it('S2 incompleta sin situación ni producto', () => {
    expect(getSectionComplete(sda(), 2)).toBe(false)
  })

  it('S2 incompleta con solo situación', () => {
    expect(getSectionComplete(sda({ situacionProblema: '<p>Problema suficientemente largo aquí</p>' }), 2)).toBe(false)
  })

  it('S2 completa con situación y producto', () => {
    expect(getSectionComplete(sda({
      situacionProblema: '<p>Situación problema suficiente</p>',
      productoFinal: '<p>Producto final suficiente</p>'
    }), 2)).toBe(true)
  })

  // ── Sección 3: Vinculación Curricular ────────────────────────────────────────
  it('S3 incompleta sin elementos curriculares', () => {
    expect(getSectionComplete(sda(), 3)).toBe(false)
  })

  it('S3 completa con al menos un elemento curricular', () => {
    expect(getSectionComplete(sda({
      elementosCurriculares: [{ id: '1', ambito: 'A', area: 'Mates', ce: 'CE1', criterios: [], saberes: [] }]
    }), 3)).toBe(true)
  })

  // ── Sección 4: Metodología ───────────────────────────────────────────────────
  it('S4 incompleta sin planteamiento', () => {
    expect(getSectionComplete(sda(), 4)).toBe(false)
  })

  it('S4 completa con planteamiento metodológico', () => {
    expect(getSectionComplete(sda({ planteamientoMetodologico: '<p>Metodología activa e indagadora suficientemente descrita.</p>' }), 4)).toBe(true)
  })

  // ── Sección 5: Secuencia Didáctica ───────────────────────────────────────────
  it('S5 incompleta sin sesiones', () => {
    expect(getSectionComplete(sda(), 5)).toBe(false)
  })

  it('S5 completa con al menos una sesión', () => {
    const sesion = { numero: 1, titulo: 'S1', duracion: '55 min', inicio: '', desarrollo: '', cierre: '', recursos: '', agrupamiento: '' }
    expect(getSectionComplete(sda({ sesiones: [sesion] }), 5)).toBe(true)
  })

  // ── Sección 6: Evaluación ────────────────────────────────────────────────────
  it('S6 incompleta sin instrumentos', () => {
    expect(getSectionComplete(sda(), 6)).toBe(false)
  })

  it('S6 completa con al menos un instrumento', () => {
    expect(getSectionComplete(sda({ instrumentosEvaluacion: ['Rúbrica'] }), 6)).toBe(true)
  })

  // ── Sección 7: DUA ───────────────────────────────────────────────────────────
  it('S7 incompleta sin campos DUA', () => {
    expect(getSectionComplete(sda(), 7)).toBe(false)
  })

  it('S7 completa con al menos un campo DUA', () => {
    expect(getSectionComplete(sda({ duaImplicacion: '<p>Estrategias de implicación y motivación para el alumnado.</p>' }), 7)).toBe(true)
  })

  // ── Sección 8: Interdisciplinariedad ────────────────────────────────────────
  it('S8 incompleta sin conexiones', () => {
    expect(getSectionComplete(sda(), 8)).toBe(false)
  })

  it('S8 completa con al menos una conexión', () => {
    expect(getSectionComplete(sda({
      conexiones: [{ area: 'Lengua', descripcion: 'Textos argumentativos' }]
    }), 8)).toBe(true)
  })

  // ── Sección 9: ODS ───────────────────────────────────────────────────────────
  it('S9 incompleta sin ODS', () => {
    expect(getSectionComplete(sda(), 9)).toBe(false)
  })

  it('S9 completa con al menos un ODS', () => {
    expect(getSectionComplete(sda({ ods: [4] }), 9)).toBe(true)
  })

  // ── Sección desconocida ──────────────────────────────────────────────────────
  it('devuelve false para sección desconocida', () => {
    expect(getSectionComplete(sda(), 99)).toBe(false)
  })
})

describe('getSdAProgress', () => {
  it('devuelve 0% para SdA vacía', () => {
    const { pct, done, total } = getSdAProgress(sda())
    expect(pct).toBe(0)
    expect(done).toBe(0)
    expect(total).toBe(11)
  })

  it('devuelve ~9% con una sola sección completa', () => {
    const { done } = getSdAProgress(sda({ titulo: 'Test', ciclo: 'primaria_ciclo_1', ambito: 'Mates' }))
    expect(done).toBe(1)
  })

  it('devuelve 100% con todas las secciones completas (incluido cuaderno)', () => {
    const sesion = { numero: 1, titulo: 'S1', duracion: '', inicio: '', desarrollo: '', cierre: '', recursos: '', agrupamiento: '' }
    const cuaderno = {
      tematicaJuego: 'Test', personaje: 'Alumno', descripcionMundo: 'Mundo', instruccionesHero: 'XP',
      sesiones: [{ sesionNumero: 1, misionTitulo: 'M1', narrativa: 'N', tareas: [], reflexion: 'R', generado: true }],
      generadoEn: new Date().toISOString()
    }
    const full = sda({
      titulo: 'Test completo', ciclo: 'primaria_ciclo_1', ambito: 'Mates',
      justificacion: '<p>Justificación pedagógica detallada y suficientemente larga.</p>',
      situacionProblema: '<p>Situación problema suficientemente desarrollada.</p>',
      productoFinal: '<p>Producto final detallado y suficientemente descrito.</p>',
      elementosCurriculares: [{ id: '1', ambito: 'A', area: 'Mates', ce: 'CE1', criterios: [], saberes: [] }],
      planteamientoMetodologico: '<p>Metodología activa suficientemente desarrollada.</p>',
      sesiones: [sesion],
      instrumentosEvaluacion: ['Rúbrica'],
      duaImplicacion: '<p>Estrategias DUA suficientemente largas.</p>',
      conexiones: [{ area: 'Lengua', descripcion: 'Conexión' }],
      ods: [4],
      cuaderno,
    })
    const { pct, done } = getSdAProgress(full)
    expect(done).toBe(11)
    expect(pct).toBe(100)
  })

  it('el total siempre es 11', () => {
    expect(getSdAProgress(sda()).total).toBe(11)
  })
})
