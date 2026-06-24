import { describe, it, expect } from 'vitest'
import { parseSdAFromJSON } from '@renderer/utils/validateSda'
import { SDA_INICIAL } from '@renderer/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function json(obj: Record<string, unknown>): string {
  return JSON.stringify(obj)
}

// ─── Errores de formato ───────────────────────────────────────────────────────

describe('parseSdAFromJSON — errores de formato', () => {
  it('lanza error con JSON inválido', () => {
    expect(() => parseSdAFromJSON('no es json')).toThrow('JSON válido')
  })

  it('lanza error con array JSON', () => {
    expect(() => parseSdAFromJSON('[1,2,3]')).toThrow('formato correcto')
  })

  it('lanza error con null', () => {
    expect(() => parseSdAFromJSON('null')).toThrow()
  })

  it('lanza error con string JSON', () => {
    expect(() => parseSdAFromJSON('"cadena"')).toThrow()
  })
})

// ─── Parseo básico ────────────────────────────────────────────────────────────

describe('parseSdAFromJSON — parseo básico', () => {
  it('parsea un objeto mínimo sin errores', () => {
    const result = parseSdAFromJSON(json({ titulo: 'Test' }))
    expect(result.titulo).toBe('Test')
  })

  it('rellena campos faltantes con valores por defecto', () => {
    const result = parseSdAFromJSON(json({ titulo: 'Test' }))
    expect(Array.isArray(result.sesiones)).toBe(true)
    expect(Array.isArray(result.elementosCurriculares)).toBe(true)
    expect(Array.isArray(result.ods)).toBe(true)
    expect(Array.isArray(result.conexiones)).toBe(true)
    expect(result.rubricaTabla).toEqual([])
  })

  it('preserva titulo, ciclo y ambito', () => {
    const result = parseSdAFromJSON(json({
      titulo: 'Mi SdA', ciclo: 'primaria_ciclo_2', ambito: 'Matemáticas'
    }))
    expect(result.titulo).toBe('Mi SdA')
    expect(result.ciclo).toBe('primaria_ciclo_2')
    expect(result.ambito).toBe('Matemáticas')
  })

  it('actualiza la versión al valor actual', () => {
    const result = parseSdAFromJSON(json({ titulo: 'Test', version: 0 }))
    expect(result.version).toBe(SDA_INICIAL.version)
  })
})

// ─── Normalización de arrays ──────────────────────────────────────────────────

describe('parseSdAFromJSON — normalización de arrays', () => {
  it('normaliza sesiones con campos faltantes', () => {
    const result = parseSdAFromJSON(json({
      sesiones: [{ titulo: 'Solo título' }]
    }))
    expect(result.sesiones).toHaveLength(1)
    expect(result.sesiones[0].duracion).toBe('')
    expect(result.sesiones[0].inicio).toBe('')
    expect(result.sesiones[0].numero).toBe(1)
  })

  it('elimina sesiones con formato incorrecto (null, string)', () => {
    const result = parseSdAFromJSON(json({
      sesiones: [null, 'cadena', { titulo: 'Válida' }]
    }))
    expect(result.sesiones).toHaveLength(3) // normalizeSesion convierte null a sesión vacía
    expect(result.sesiones[0].titulo).toBe('')
    expect(result.sesiones[2].titulo).toBe('Válida')
  })

  it('normaliza elementos curriculares, descarta los inválidos', () => {
    const result = parseSdAFromJSON(json({
      elementosCurriculares: [
        { id: '1', ambito: 'A', area: 'Mates', ce: 'CE1', criterios: [], saberes: [] },
        { sinArea: true },
        null
      ]
    }))
    expect(result.elementosCurriculares).toHaveLength(1)
    expect(result.elementosCurriculares[0].ce).toBe('CE1')
  })

  it('descarta filas de rúbrica inválidas', () => {
    const filaValida = {
      criterio: 'C', area: 'A', instrumento: 'I',
      iniciado: 'I', enProceso: 'EP', conseguido: 'C', avanzado: 'AV'
    }
    const result = parseSdAFromJSON(json({
      rubricaTabla: [filaValida, null, 'invalida']
    }))
    // null y string devuelven null en normalizeRubricaFila y se filtran
    expect(result.rubricaTabla).toHaveLength(1)
  })

  it('trata arrays vacíos como arrays vacíos', () => {
    const result = parseSdAFromJSON(json({ sesiones: [], ods: [], conexiones: [] }))
    expect(result.sesiones).toEqual([])
    expect(result.ods).toEqual([])
    expect(result.conexiones).toEqual([])
  })

  it('ignora campos no-array para arrays', () => {
    const result = parseSdAFromJSON(json({ sesiones: 'no es array', ods: 42 }))
    expect(result.sesiones).toEqual([])
    expect(result.ods).toEqual([])
  })
})

// ─── Validación de tipos de campo string ─────────────────────────────────────

describe('parseSdAFromJSON — tipos incorrectos en campos string', () => {
  it('un campo string con valor numérico usa el valor por defecto', () => {
    const result = parseSdAFromJSON(json({ titulo: 42 }))
    expect(result.titulo).toBe('')
  })

  it('un campo string con valor booleano usa el valor por defecto', () => {
    const result = parseSdAFromJSON(json({ docente: true }))
    expect(result.docente).toBe('')
  })

  it('un campo string con valor objeto usa el valor por defecto', () => {
    const result = parseSdAFromJSON(json({ centro: { nombre: 'CEIP Prueba' } }))
    expect(result.centro).toBe('')
  })

  it('un campo string con valor nulo usa el valor por defecto', () => {
    const result = parseSdAFromJSON(json({ justificacion: null }))
    expect(result.justificacion).toBe('')
  })

  it('valores string válidos se preservan correctamente', () => {
    const result = parseSdAFromJSON(json({ docente: 'María García', centro: 'CEIP La Paz' }))
    expect(result.docente).toBe('María García')
    expect(result.centro).toBe('CEIP La Paz')
  })

  it('numSesiones numérico se preserva', () => {
    const result = parseSdAFromJSON(json({ numSesiones: 8 }))
    expect(result.numSesiones).toBe(8)
  })

  it('numSesiones no numérico usa el valor por defecto', () => {
    const result = parseSdAFromJSON(json({ numSesiones: 'ocho' }))
    expect(result.numSesiones).toBe(6)  // SDA_INICIAL.numSesiones
  })
})

// ─── Validación de enums ──────────────────────────────────────────────────────

describe('parseSdAFromJSON — validación de enums', () => {
  it('ciclo válido se preserva', () => {
    const result = parseSdAFromJSON(json({ ciclo: 'primaria_ciclo_1' }))
    expect(result.ciclo).toBe('primaria_ciclo_1')
  })

  it('ciclo inválido usa el valor por defecto vacío', () => {
    const result = parseSdAFromJSON(json({ ciclo: 'bachillerato' }))
    expect(result.ciclo).toBe('')
  })

  it('ciclo vacío "" es válido', () => {
    const result = parseSdAFromJSON(json({ ciclo: '' }))
    expect(result.ciclo).toBe('')
  })

  it('competenciasClave filtra valores no permitidos', () => {
    const result = parseSdAFromJSON(json({ competenciasClave: ['CCL', 'INVALID', 'STEM'] }))
    expect(result.competenciasClave).toEqual(['CCL', 'STEM'])
    expect(result.competenciasClave).not.toContain('INVALID')
  })

  it('competenciasClave vacío produce array vacío', () => {
    const result = parseSdAFromJSON(json({ competenciasClave: [] }))
    expect(result.competenciasClave).toEqual([])
  })

  it('agrupamientos filtra valores no permitidos', () => {
    const result = parseSdAFromJSON(json({ agrupamientos: ['Individual', 'Tripleta', 'Gran grupo'] }))
    expect(result.agrupamientos).toEqual(['Individual', 'Gran grupo'])
  })

  it('momentosEvaluacion filtra valores no permitidos', () => {
    const result = parseSdAFromJSON(json({ momentosEvaluacion: ['Formativa', 'Parcial', 'Sumativa'] }))
    expect(result.momentosEvaluacion).toEqual(['Formativa', 'Sumativa'])
  })

  it('instrumentosEvaluacion filtra valores no permitidos', () => {
    const result = parseSdAFromJSON(json({ instrumentosEvaluacion: ['Rúbrica', 'ExamenOral', 'Portafolio'] }))
    expect(result.instrumentosEvaluacion).toEqual(['Rúbrica', 'Portafolio'])
  })

  it('ods solo acepta números entre 1 y 17', () => {
    const result = parseSdAFromJSON(json({ ods: [0, 1, 5, 17, 18, -1] }))
    expect(result.ods).toEqual([1, 5, 17])
  })
})

// ─── normalizeConexion — preservación de datos parciales ─────────────────────

describe('parseSdAFromJSON — conexiones parciales', () => {
  it('conexión con ambos campos válidos se preserva', () => {
    const result = parseSdAFromJSON(json({ conexiones: [{ area: 'Ciencias', descripcion: 'Ecosistemas' }] }))
    expect(result.conexiones).toHaveLength(1)
    expect(result.conexiones[0].area).toBe('Ciencias')
  })

  it('conexión con solo area (descripcion ausente) se preserva con descripcion vacía', () => {
    const result = parseSdAFromJSON(json({ conexiones: [{ area: 'Lengua' }] }))
    expect(result.conexiones).toHaveLength(1)
    expect(result.conexiones[0].area).toBe('Lengua')
    expect(result.conexiones[0].descripcion).toBe('')
  })

  it('conexión con ambos campos no-string se descarta', () => {
    const result = parseSdAFromJSON(json({ conexiones: [{ area: 42, descripcion: false }] }))
    expect(result.conexiones).toHaveLength(0)
  })

  it('conexión nula se descarta', () => {
    const result = parseSdAFromJSON(json({ conexiones: [null, { area: 'Arte', descripcion: 'Visual' }] }))
    expect(result.conexiones).toHaveLength(1)
  })
})

// ─── Cuaderno de Trabajo — persistencia y saneado ─────────────────────────────

describe('parseSdAFromJSON — cuaderno de trabajo', () => {
  const cuadernoValido = {
    tematicaJuego: 'La Gran Expedición',
    personaje: 'Eres un Explorador',
    descripcionMundo: 'Un mundo por descubrir',
    instruccionesHero: 'Gana XP completando tareas',
    generadoEn: '2026-06-01T10:00:00.000Z',
    diseno: { layout: 'mosaico', patronFondo: 'puntos', formaTarjeta: 'sello', tipografia: 'clasica', decoracion: 'alta' },
    temaVisual: {
      plantilla: 'selva', colorPrimario: '#14532d', colorSecundario: '#16a34a',
      colorAcento: '#84cc16', colorFondoSuave: '#f0fdf4', emojiTema: '🌿',
      mascotaSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="green"/></svg>'
    },
    sesiones: [{
      sesionNumero: 1, misionTitulo: 'Misión 1', narrativa: 'Comienza la aventura',
      reflexion: '¿Qué aprendiste?', generado: true,
      tareas: [{ id: 't1', nivelBloom: 'recordar', titulo: 'Tarea', enunciado: 'Haz algo', verboBloom: 'Identifica', pista: 'Ayuda', xp: 10 }]
    }]
  }

  it('preserva el cuaderno completo al guardar y reabrir (regresión: antes se perdía)', () => {
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: cuadernoValido }))
    expect(result.cuaderno).toBeDefined()
    expect(result.cuaderno?.tematicaJuego).toBe('La Gran Expedición')
    expect(result.cuaderno?.sesiones).toHaveLength(1)
    expect(result.cuaderno?.sesiones[0].tareas).toHaveLength(1)
    expect(result.cuaderno?.sesiones[0].generado).toBe(true)
    expect(result.cuaderno?.diseno?.layout).toBe('mosaico')
    expect(result.cuaderno?.temaVisual?.plantilla).toBe('selva')
    expect(result.cuaderno?.temaVisual?.mascotaSvg).toContain('<svg')
  })

  it('sin cuaderno en el archivo → undefined', () => {
    const result = parseSdAFromJSON(json({ titulo: 'Test' }))
    expect(result.cuaderno).toBeUndefined()
  })

  it('elimina un SVG de mascota con script (XSS desde archivo)', () => {
    const malicioso = {
      ...cuadernoValido,
      temaVisual: { ...cuadernoValido.temaVisual, mascotaSvg: '<svg onload="alert(1)"><script>alert(2)</script></svg>' }
    }
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: malicioso }))
    expect(result.cuaderno?.temaVisual?.mascotaSvg).toBeUndefined()
  })

  it('preserva colores de tema oscuros válidos', () => {
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: cuadernoValido }))
    expect(result.cuaderno?.temaVisual?.colorPrimario).toBe('#14532d')
    expect(result.cuaderno?.temaVisual?.colorSecundario).toBe('#16a34a')
  })

  it('sustituye un color primario demasiado claro por el oscuro del preset (legibilidad)', () => {
    const claro = {
      ...cuadernoValido,
      temaVisual: { ...cuadernoValido.temaVisual, colorPrimario: '#e9e3ff', colorSecundario: '#d4c5ff' }
    }
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: claro }))
    // 'selva' → primario #14532d / secundario #16a34a
    expect(result.cuaderno?.temaVisual?.colorPrimario).toBe('#14532d')
    expect(result.cuaderno?.temaVisual?.colorSecundario).toBe('#16a34a')
  })

  it('descarta ilustraciones que no sean data URLs de imagen', () => {
    const conIlustracionMala = {
      ...cuadernoValido,
      sesiones: [{ ...cuadernoValido.sesiones[0], ilustracion: 'https://evil.example/img.png' }]
    }
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: conIlustracionMala }))
    expect(result.cuaderno?.sesiones[0].ilustracion).toBeUndefined()
  })

  it('preserva ilustraciones data URL válidas', () => {
    const conIlustracion = {
      ...cuadernoValido,
      sesiones: [{ ...cuadernoValido.sesiones[0], ilustracion: 'data:image/jpeg;base64,AAAA' }]
    }
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: conIlustracion }))
    expect(result.cuaderno?.sesiones[0].ilustracion).toBe('data:image/jpeg;base64,AAAA')
  })

  it('diseño con valores inválidos cae a los valores por defecto', () => {
    const conDisenoMalo = { ...cuadernoValido, diseno: { layout: 'inventado', patronFondo: 42, formaTarjeta: 'sello' } }
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: conDisenoMalo }))
    expect(result.cuaderno?.diseno?.layout).toBe('rejilla')
    expect(result.cuaderno?.diseno?.patronFondo).toBe('cuadricula')
    expect(result.cuaderno?.diseno?.formaTarjeta).toBe('sello')
  })

  it('filtra tareas con nivelBloom inválido', () => {
    const conTareaMala = {
      ...cuadernoValido,
      sesiones: [{
        ...cuadernoValido.sesiones[0],
        tareas: [
          ...cuadernoValido.sesiones[0].tareas,
          { nivelBloom: 'memorizar', titulo: 'Mala', enunciado: '', verboBloom: '', xp: 10 }
        ]
      }]
    }
    const result = parseSdAFromJSON(json({ titulo: 'Test', cuaderno: conTareaMala }))
    expect(result.cuaderno?.sesiones[0].tareas).toHaveLength(1)
  })
})

// ─── Migraciones ──────────────────────────────────────────────────────────────

describe('parseSdAFromJSON — migración v0 → v1', () => {
  it('migra objetivos → situacionProblema si falta situacionProblema', () => {
    const result = parseSdAFromJSON(json({
      version: 0,
      objetivos: '<p>Objetivos del proyecto</p>'
    }))
    expect(result.situacionProblema).toBe('<p>Objetivos del proyecto</p>')
  })

  it('no sobreescribe situacionProblema si ya existe', () => {
    const result = parseSdAFromJSON(json({
      version: 0,
      objetivos: '<p>Objetivos</p>',
      situacionProblema: '<p>Ya tenía problema</p>'
    }))
    expect(result.situacionProblema).toBe('<p>Ya tenía problema</p>')
  })

  it('migra agrupamiento (string) → agrupamientos (array)', () => {
    const result = parseSdAFromJSON(json({
      version: 0,
      agrupamiento: 'Gran grupo'
    }))
    expect(result.agrupamientos).toContain('Gran grupo')
  })
})
