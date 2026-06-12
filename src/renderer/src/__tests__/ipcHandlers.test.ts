/**
 * Tests for IPC handler logic (pure functions extracted from handlers).
 * These run in Node/jsdom without Electron — we test the business logic,
 * not the IPC wiring.
 */
import { describe, it, expect } from 'vitest'
import { parseSdAFromJSON } from '@renderer/utils/validateSda'
import { getSdAProgress } from '@renderer/utils/sdaProgress'
import { SDA_INICIAL } from '@renderer/types'
import type { SdA } from '@renderer/types'

// ─── parseSdAFromJSON (used by file IPC open handler) ────────────────────────

describe('parseSdAFromJSON — IPC open-file handler validation', () => {
  it('parses a valid JSON SdA string', () => {
    const sda = { ...SDA_INICIAL, titulo: 'Test', ciclo: 'primaria_ciclo_1', ambito: 'Matemáticas' }
    const result = parseSdAFromJSON(JSON.stringify(sda))
    expect(result.titulo).toBe('Test')
  })

  it('throws on malformed JSON', () => {
    expect(() => parseSdAFromJSON('not json')).toThrow()
  })

  it('fills missing fields with SDA_INICIAL defaults', () => {
    const partial = JSON.stringify({ titulo: 'Solo título' })
    const result = parseSdAFromJSON(partial)
    expect(result.sesiones).toEqual([])
    expect(result.competenciasClave).toEqual([])
  })

  it('preserves array fields when present', () => {
    const sda: Partial<SdA> = { ...SDA_INICIAL, sesiones: [{ numero: 1, titulo: 'S1', inicio: '', desarrollo: '', cierre: '', recursos: '', agrupamiento: '', duracion: '' }] }
    const result = parseSdAFromJSON(JSON.stringify(sda))
    expect(result.sesiones).toHaveLength(1)
    expect(result.sesiones[0].titulo).toBe('S1')
  })

  it('rejects non-object payloads', () => {
    expect(() => parseSdAFromJSON('"solo un string"')).toThrow()
    expect(() => parseSdAFromJSON('42')).toThrow()
    expect(() => parseSdAFromJSON('null')).toThrow()
  })
})

// ─── getSdAProgress (used by recientes IPC for pct metadata) ─────────────────

describe('getSdAProgress — IPC recientes pct calculation', () => {
  it('returns 0% for an empty SdA', () => {
    expect(getSdAProgress(SDA_INICIAL).pct).toBe(0)
  })

  it('increments when section 0 (Identificación) is complete', () => {
    const sda: SdA = { ...SDA_INICIAL, titulo: 'T', ciclo: 'primaria_ciclo_1', ambito: 'A' }
    expect(getSdAProgress(sda).pct).toBeGreaterThan(0)
  })

  it('returns done count equal to complete sections', () => {
    const sda: SdA = { ...SDA_INICIAL, titulo: 'T', ciclo: 'primaria_ciclo_1', ambito: 'A' }
    const { done, total } = getSdAProgress(sda)
    expect(done).toBeGreaterThanOrEqual(1)
    expect(total).toBe(11)
  })

  it('increments progress as sections are completed', () => {
    // hasContent() strips HTML and requires > 10 characters of plain text
    const rich = (t: string) => `<p>${t}</p>`
    const s0: SdA = { ...SDA_INICIAL, titulo: 'T', ciclo: 'primaria_ciclo_1', ambito: 'A' }
    const s1: SdA = { ...s0, justificacion: rich('Justificación completa del proyecto') }
    const s2: SdA = { ...s1, situacionProblema: rich('Situación problema detallada'), productoFinal: rich('Producto final del proyecto') }
    const s3: SdA = { ...s2, elementosCurriculares: [{ id: 'e1', ambito: 'A', area: 'A', ce: 'CE1', criterios: ['C'], saberes: ['S'] }] }
    expect(getSdAProgress(s0).done).toBeGreaterThan(0)
    expect(getSdAProgress(s1).done).toBeGreaterThan(getSdAProgress(s0).done)
    expect(getSdAProgress(s2).done).toBeGreaterThan(getSdAProgress(s1).done)
    expect(getSdAProgress(s3).done).toBeGreaterThan(getSdAProgress(s2).done)
  })
})

// ─── Path-traversal guard (snapshot/decreto IPC) ─────────────────────────────

describe('fileName path-traversal validation', () => {
  function isValidFileName(name: string): boolean {
    return !name.includes('..') && !name.includes('/') && !name.includes('\\') && !name.includes('\0')
  }

  it('accepts normal snapshot filenames', () => {
    expect(isValidFileName('snapshot-001.json')).toBe(true)
    expect(isValidFileName('decreto_EP_2024.json')).toBe(true)
  })

  it('rejects path traversal attempts', () => {
    expect(isValidFileName('../secret.json')).toBe(false)
    expect(isValidFileName('../../etc/passwd')).toBe(false)
  })

  it('rejects absolute path separators', () => {
    expect(isValidFileName('/etc/passwd')).toBe(false)
    expect(isValidFileName('folder\\file.json')).toBe(false)
  })

  it('rejects null bytes', () => {
    expect(isValidFileName('file\0.json')).toBe(false)
  })
})
