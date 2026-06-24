import { describe, it, expect, beforeEach } from 'vitest'
import { stripHtml } from '@renderer/utils/stripHtml'
import { sanitizeSvg, isSafeImageDataUrl } from '@renderer/utils/sanitizeSvg'
import { applyTheme, loadSavedTheme, THEMES } from '@renderer/utils/themes'
import { loadUserTemplates, addUserTemplate, deleteUserTemplate } from '@renderer/utils/userTemplates'
import { sdaToPlainText } from '@renderer/utils/sdaToText'
import { cuadernoToMarkdown } from '@renderer/utils/cuadernoToMarkdown'
import { SDA_INICIAL } from '@renderer/types'
import type { SdA } from '@renderer/types'

// ─── stripHtml ────────────────────────────────────────────────────────────────

describe('stripHtml', () => {
  it('elimina etiquetas y normaliza espacios', () => {
    expect(stripHtml('<p>Hola   <strong>mundo</strong></p>')).toBe('Hola mundo')
  })
  it('decodifica entidades comunes', () => {
    expect(stripHtml('a &amp; b &lt;c&gt; &nbsp;d')).toBe('a & b <c> d')
  })
  it('devuelve cadena vacía para entrada vacía', () => {
    expect(stripHtml('')).toBe('')
  })
})

// ─── sanitizeSvg / isSafeImageDataUrl ────────────────────────────────────────

describe('sanitizeSvg', () => {
  it('acepta un SVG válido y sencillo', () => {
    const svg = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>'
    expect(sanitizeSvg(svg)).toBe(svg)
  })
  it('rechaza valores no string o sin etiqueta svg', () => {
    expect(sanitizeSvg(42)).toBeUndefined()
    expect(sanitizeSvg('<div>no</div>')).toBeUndefined()
    expect(sanitizeSvg('<svg>sin cierre')).toBeUndefined()
  })
  it('rechaza SVG con script, manejadores de eventos o URLs externas', () => {
    expect(sanitizeSvg('<svg><script>x</script></svg>')).toBeUndefined()
    expect(sanitizeSvg('<svg onload="x()"></svg>')).toBeUndefined()
    expect(sanitizeSvg('<svg><image xlink:href="http://x"/></svg>')).toBeUndefined()
  })
  it('rechaza SVG excesivamente grande', () => {
    expect(sanitizeSvg('<svg>' + 'a'.repeat(13000) + '</svg>')).toBeUndefined()
  })
})

describe('isSafeImageDataUrl', () => {
  it('acepta data URLs de imagen raster', () => {
    expect(isSafeImageDataUrl('data:image/png;base64,AAAA')).toBe(true)
    expect(isSafeImageDataUrl('data:image/jpeg;base64,Zm9v')).toBe(true)
  })
  it('rechaza otros esquemas o tipos', () => {
    expect(isSafeImageDataUrl('data:text/html;base64,AAAA')).toBe(false)
    expect(isSafeImageDataUrl('http://x/a.png')).toBe(false)
    expect(isSafeImageDataUrl(123)).toBe(false)
  })
})

// ─── themes ───────────────────────────────────────────────────────────────────

describe('themes', () => {
  beforeEach(() => localStorage.clear())

  it('aplica las variables CSS y persiste el tema elegido', () => {
    applyTheme('violeta')
    expect(document.documentElement.style.getPropertyValue('--color-primary-500')).toBe('139 92 246')
    expect(localStorage.getItem('sda-color-theme')).toBe('violeta')
  })
  it('ignora una clave de tema desconocida', () => {
    // @ts-expect-error — clave inválida a propósito
    applyTheme('inexistente')
    expect(localStorage.getItem('sda-color-theme')).toBeNull()
  })
  it('loadSavedTheme devuelve el guardado o azul por defecto', () => {
    expect(loadSavedTheme()).toBe('azul')
    localStorage.setItem('sda-color-theme', 'esmeralda')
    expect(loadSavedTheme()).toBe('esmeralda')
    localStorage.setItem('sda-color-theme', 'basura')
    expect(loadSavedTheme()).toBe('azul')
  })
  it('expone 5 temas con clave y escala', () => {
    expect(THEMES).toHaveLength(5)
    expect(THEMES.every((t) => t.key && t.scale[500])).toBe(true)
  })
})

// ─── userTemplates ────────────────────────────────────────────────────────────

describe('userTemplates', () => {
  beforeEach(() => localStorage.clear())

  it('sin plantillas guardadas devuelve lista vacía', () => {
    expect(loadUserTemplates()).toEqual([])
  })
  it('añade y recupera una plantilla (la más reciente primero)', () => {
    addUserTemplate({ nombre: 'A', descripcion: 'desc A', sda: { titulo: 'A' } })
    addUserTemplate({ nombre: 'B', descripcion: 'desc B', sda: { titulo: 'B' } })
    const list = loadUserTemplates()
    expect(list).toHaveLength(2)
    expect(list[0].nombre).toBe('B')
    expect(list[0].id).toBeTruthy()
  })
  it('elimina una plantilla por id', () => {
    addUserTemplate({ nombre: 'A', descripcion: '', sda: {} })
    const id = loadUserTemplates()[0].id
    deleteUserTemplate(id)
    expect(loadUserTemplates()).toHaveLength(0)
  })
  it('tolera JSON corrupto en almacenamiento', () => {
    localStorage.setItem('sda-user-templates', '{no es json')
    expect(loadUserTemplates()).toEqual([])
  })
})

// ─── sdaToPlainText ────────────────────────────────────────────────────────────

describe('sdaToPlainText', () => {
  it('serializa los campos principales de una SdA', () => {
    const sda: SdA = {
      ...SDA_INICIAL,
      titulo: 'Las plantas',
      ciclo: 'primaria_ciclo_2',
      ambito: 'Ciencias',
      areas: ['Conocimiento del Medio'],
      justificacion: '<p>Justificación <strong>clave</strong></p>',
      competenciasClave: ['CCL', 'STEM'],
      sesiones: [{ numero: 1, titulo: 'Intro', inicio: '<p>Empezamos</p>', desarrollo: '', cierre: '', recursos: '', agrupamiento: 'Parejas', duracion: '50 min' }],
    }
    const text = sdaToPlainText(sda)
    expect(text).toContain('SITUACIÓN DE APRENDIZAJE: Las plantas')
    expect(text).toContain('Ámbito: Ciencias')
    expect(text).toContain('Justificación clave') // HTML eliminado
    expect(text).toContain('COMPETENCIAS CLAVE')
    expect(text).toContain('Sesión 1: Intro')
  })
  it('una SdA vacía produce al menos el encabezado', () => {
    const text = sdaToPlainText(SDA_INICIAL)
    expect(text).toContain('SITUACIÓN DE APRENDIZAJE')
  })
})

// ─── cuadernoToMarkdown ────────────────────────────────────────────────────────

describe('cuadernoToMarkdown', () => {
  it('sin cuaderno devuelve cadena vacía', () => {
    expect(cuadernoToMarkdown(SDA_INICIAL)).toBe('')
  })
  it('serializa el cuaderno a Markdown con misiones y tareas', () => {
    const sda: SdA = {
      ...SDA_INICIAL,
      titulo: 'Aventura',
      ambito: 'Mates',
      ciclo: 'primaria_ciclo_1',
      cuaderno: {
        tematicaJuego: 'Piratas',
        personaje: 'Eres un grumete',
        descripcionMundo: 'Alta mar',
        instruccionesHero: 'Gana XP',
        sesiones: [{
          sesionNumero: 1,
          misionTitulo: 'El tesoro',
          narrativa: 'Comienza la búsqueda',
          reflexion: '¿Qué aprendiste?',
          generado: true,
          tareas: [
            { id: 't1', nivelBloom: 'recordar', titulo: 'Recuerda', enunciado: 'Di los números', verboBloom: 'Identifica', xp: 10, pista: 'Cuenta', retoExtra: 'Hasta 100' },
            { id: 't2', nivelBloom: 'crear', titulo: 'Crea', enunciado: 'Dibuja un mapa', verboBloom: 'Diseña', xp: 60 },
          ],
        }],
      },
    } as SdA
    const md = cuadernoToMarkdown(sda)
    expect(md).toContain('# Cuaderno de Trabajo del Alumnado: Piratas')
    expect(md).toContain('### Misión 1: El tesoro')
    expect(md).toContain('Dibuja un mapa')
    expect(md).toContain('Taxonomía de Bloom')
    expect(md).toContain('NotebookLM')
  })
})
