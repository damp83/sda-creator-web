import { describe, it, expect, beforeEach } from 'vitest'
import { useSdAStore } from '@renderer/store/sdaStore'

// Reinicia el store antes de cada test
beforeEach(() => {
  useSdAStore.getState().nueva()
})

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe('sdaStore — estado inicial tras nueva()', () => {
  it('isDirty empieza en false', () => {
    expect(useSdAStore.getState().isDirty).toBe(false)
  })

  it('undoStack empieza vacío', () => {
    expect(useSdAStore.getState().undoStack).toHaveLength(0)
  })

  it('redoStack empieza vacío', () => {
    expect(useSdAStore.getState().redoStack).toHaveLength(0)
  })

  it('titulo empieza vacío', () => {
    expect(useSdAStore.getState().sda.titulo).toBe('')
  })
})

// ─── Flag dirty ───────────────────────────────────────────────────────────────

describe('sdaStore — flag isDirty', () => {
  it('se activa al cambiar el título', () => {
    useSdAStore.getState().setTitulo('Mi SdA')
    expect(useSdAStore.getState().isDirty).toBe(true)
  })

  it('se activa al cambiar la justificación', () => {
    useSdAStore.getState().setJustificacion('<p>Justificación</p>')
    expect(useSdAStore.getState().isDirty).toBe(true)
  })

  it('se activa al añadir una sesión', () => {
    useSdAStore.getState().addSesion({})
    expect(useSdAStore.getState().isDirty).toBe(true)
  })

  it('se resetea a false tras llamar a nueva()', () => {
    useSdAStore.getState().setTitulo('Test')
    useSdAStore.getState().nueva()
    expect(useSdAStore.getState().isDirty).toBe(false)
  })
})

// ─── Undo / Redo ──────────────────────────────────────────────────────────────

describe('sdaStore — undo / redo', () => {
  it('undo restaura el estado anterior', () => {
    useSdAStore.getState().setTitulo('Primero')
    useSdAStore.getState().setTitulo('Segundo')
    useSdAStore.getState().undo()
    expect(useSdAStore.getState().sda.titulo).toBe('Primero')
  })

  it('redo reaplica el cambio deshecho', () => {
    useSdAStore.getState().setTitulo('Primero')
    useSdAStore.getState().undo()
    useSdAStore.getState().redo()
    expect(useSdAStore.getState().sda.titulo).toBe('Primero')
  })

  it('undo no hace nada si la pila está vacía', () => {
    const tituloBefore = useSdAStore.getState().sda.titulo
    useSdAStore.getState().undo()
    expect(useSdAStore.getState().sda.titulo).toBe(tituloBefore)
  })

  it('redo no hace nada si la pila está vacía', () => {
    useSdAStore.getState().setTitulo('Test')
    const tituloBefore = useSdAStore.getState().sda.titulo
    useSdAStore.getState().redo()
    expect(useSdAStore.getState().sda.titulo).toBe(tituloBefore)
  })

  it('un nuevo cambio vacía el redoStack', () => {
    useSdAStore.getState().setTitulo('Primero')
    useSdAStore.getState().undo()
    useSdAStore.getState().setTitulo('NuevoRumbo')
    expect(useSdAStore.getState().redoStack).toHaveLength(0)
  })

  it('acumula N cambios en undoStack', () => {
    useSdAStore.getState().setTitulo('A')
    useSdAStore.getState().setTitulo('B')
    useSdAStore.getState().setTitulo('C')
    expect(useSdAStore.getState().undoStack.length).toBeGreaterThanOrEqual(3)
  })

  it('undo múltiple recorre el historial completo', () => {
    useSdAStore.getState().setTitulo('Uno')
    useSdAStore.getState().setTitulo('Dos')
    useSdAStore.getState().setTitulo('Tres')
    useSdAStore.getState().undo()
    useSdAStore.getState().undo()
    expect(useSdAStore.getState().sda.titulo).toBe('Uno')
  })
})

// ─── Sesiones ─────────────────────────────────────────────────────────────────

describe('sdaStore — sesiones', () => {
  it('addSesion incrementa la lista', () => {
    useSdAStore.getState().addSesion({})
    expect(useSdAStore.getState().sda.sesiones).toHaveLength(1)
  })

  it('removeSesion elimina la sesión correcta', () => {
    useSdAStore.getState().addSesion({ titulo: 'A' })
    useSdAStore.getState().addSesion({ titulo: 'B' })
    useSdAStore.getState().removeSesion(0)
    expect(useSdAStore.getState().sda.sesiones).toHaveLength(1)
    expect(useSdAStore.getState().sda.sesiones[0].titulo).toBe('B')
  })

  it('updateSesion modifica el campo correcto', () => {
    useSdAStore.getState().addSesion({ titulo: 'Original' })
    useSdAStore.getState().updateSesion(0, 'titulo', 'Modificado')
    expect(useSdAStore.getState().sda.sesiones[0].titulo).toBe('Modificado')
  })

  it('duplicarSesion añade una copia al final', () => {
    useSdAStore.getState().addSesion({ titulo: 'Original' })
    useSdAStore.getState().duplicarSesion(0)
    expect(useSdAStore.getState().sda.sesiones).toHaveLength(2)
    expect(useSdAStore.getState().sda.sesiones[1].titulo).toBe('Original (Copia)')
  })

  it('moveSesion reordena correctamente', () => {
    useSdAStore.getState().addSesion({ titulo: 'A' })
    useSdAStore.getState().addSesion({ titulo: 'B' })
    useSdAStore.getState().addSesion({ titulo: 'C' })
    useSdAStore.getState().moveSesion(0, 2)
    const titulos = useSdAStore.getState().sda.sesiones.map(s => s.titulo)
    expect(titulos[2]).toBe('A')
  })
})

// ─── Elementos curriculares ───────────────────────────────────────────────────

describe('sdaStore — elementos curriculares', () => {
  it('addElementoCurricular añade un elemento con id generado', () => {
    useSdAStore.getState().addElementoCurricular({ ambito: 'A', area: 'Mates', ce: 'CE1', criterios: [], saberes: [] })
    const elems = useSdAStore.getState().sda.elementosCurriculares
    expect(elems).toHaveLength(1)
    expect(elems[0].id).toBeTruthy()
  })

  it('removeElementoCurricular elimina por id', () => {
    useSdAStore.getState().addElementoCurricular({ ambito: 'A', area: 'Mates', ce: 'CE1', criterios: [], saberes: [] })
    const id = useSdAStore.getState().sda.elementosCurriculares[0].id
    useSdAStore.getState().removeElementoCurricular(id)
    expect(useSdAStore.getState().sda.elementosCurriculares).toHaveLength(0)
  })
})
