import { describe, it, expect } from 'vitest'
import { extractJsonArray } from '@renderer/utils/extractJsonArray'

describe('extractJsonArray', () => {
  it('parsea un array JSON limpio', () => {
    const result = extractJsonArray('[{"a":1},{"a":2}]')
    expect(result).toHaveLength(2)
  })

  it('elimina bloque markdown ```json```', () => {
    const result = extractJsonArray('```json\n[{"a":1}]\n```')
    expect(result).toHaveLength(1)
  })

  it('elimina bloque markdown ``` genérico', () => {
    const result = extractJsonArray('```\n[{"a":1}]\n```')
    expect(result).toHaveLength(1)
  })

  it('extrae array envuelto en objeto {"sesiones":[...]}', () => {
    const result = extractJsonArray('{"sesiones":[{"titulo":"S1"},{"titulo":"S2"}]}')
    expect(result).toHaveLength(2)
  })

  it('extrae array con texto envolvente antes y después', () => {
    const result = extractJsonArray('Aquí va el resultado:\n[{"a":1}]\nFin.')
    expect(result).toHaveLength(1)
  })

  it('preserva los datos de cada elemento', () => {
    const result = extractJsonArray<{ titulo: string }>('[{"titulo":"Sesión 1","duracion":"55 min"}]')
    expect(result[0].titulo).toBe('Sesión 1')
  })

  it('lanza error si no hay array JSON válido', () => {
    expect(() => extractJsonArray('texto sin json')).toThrow()
  })

  it('lanza error si el array está vacío', () => {
    expect(() => extractJsonArray('[]')).toThrow()
  })

  it('maneja escape de comillas dentro de strings', () => {
    const result = extractJsonArray('[{"a":"valor \\"con comillas\\""}]')
    expect(result).toHaveLength(1)
  })

  it('maneja arrays anidados en el JSON', () => {
    const result = extractJsonArray('[{"items":[1,2,3],"name":"test"}]')
    expect(result).toHaveLength(1)
  })
})
