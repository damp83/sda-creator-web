import type { AmbitoCurriculo, CicloKey } from '@renderer/types'

const JSON_FILES = [
  'cienciasnaturalesysociales.json',
  'educacionfisica.json',
  'lenguaymates.json',
  'plasticaymusica.json'
]

let ambitosCache: AmbitoCurriculo[] | null = null

export function invalidarCache(): void {
  ambitosCache = null
}

export async function cargarAmbitos(): Promise<AmbitoCurriculo[]> {
  if (ambitosCache) return ambitosCache

  const results: AmbitoCurriculo[] = []

  // Decretos incluidos
  for (const file of JSON_FILES) {
    try {
      let raw: string
      if (window.api) {
        raw = await window.api.leerCurriculo(file)
      } else {
        const res = await fetch(`/src/data/curriculo/${file}`)
        raw = await res.text()
      }
      results.push(JSON.parse(raw) as AmbitoCurriculo)
    } catch (e) {
      console.error(`Error cargando ${file}:`, e)
    }
  }

  // Decretos de usuario
  if (window.api?.listarDecretosUsuario) {
    try {
      const userFiles = await window.api.listarDecretosUsuario()
      for (const info of userFiles) {
        try {
          const raw = await window.api.leerDecretoUsuario(info.fileName)
          results.push(JSON.parse(raw) as AmbitoCurriculo)
        } catch (e) {
          console.error(`Error cargando decreto usuario ${info.fileName}:`, e)
        }
      }
    } catch (e) {
      console.error('Error listando decretos de usuario:', e)
    }
  }

  ambitosCache = results
  return results
}

export async function listarDecretosUsuario(): Promise<DecretoInfo[]> {
  if (!window.api?.listarDecretosUsuario) return []
  return window.api.listarDecretosUsuario()
}

export async function importarDecreto(): Promise<{ error?: string; fileName?: string; ambito?: string } | null> {
  if (!window.api?.importarDecreto) return null
  return window.api.importarDecreto()
}

export async function eliminarDecreto(fileName: string): Promise<void> {
  if (!window.api?.eliminarDecreto) return
  await window.api.eliminarDecreto(fileName)
}

export interface DecretoInfo {
  fileName: string
  ambito: string
  comunidad?: string
  numAreas: number
  numCEs: number
}

/** Agrupa todos los ámbitos por comunidad autónoma */
export interface ComunidadCurriculo {
  comunidad: string
  ambitos: AmbitoCurriculo[]
}

/** Lista ordenada de comunidades con sus ámbitos */
export async function cargarPorComunidad(): Promise<ComunidadCurriculo[]> {
  const ambitos = await cargarAmbitos()
  const mapa = new Map<string, AmbitoCurriculo[]>()
  for (const a of ambitos) {
    const com = a.comunidad ?? 'Personalizado'
    if (!mapa.has(com)) mapa.set(com, [])
    mapa.get(com)!.push(a)
  }
  // Ordenar: primero las built-in, al final 'Personalizado'
  return Array.from(mapa, ([comunidad, ambitos]) => ({ comunidad, ambitos })).sort((a, b) => {
    if (a.comunidad === 'Personalizado') return 1
    if (b.comunidad === 'Personalizado') return -1
    return a.comunidad.localeCompare(b.comunidad)
  })
}

/** Lista de comunidades disponibles */
export async function listarComunidades(): Promise<string[]> {
  const grupos = await cargarPorComunidad()
  return grupos.map((g) => g.comunidad)
}

/** Obtiene ámbitos filtrados por comunidad */
export async function cargarAmbitosPorComunidad(comunidad: string): Promise<AmbitoCurriculo[]> {
  const grupos = await cargarPorComunidad()
  return grupos.find((g) => g.comunidad === comunidad)?.ambitos ?? []
}

export function getSaberesPorCiclo(
  saberes: Record<string, unknown>,
  cicloKey: CicloKey
): string[] {
  const result: string[] = []

  function traverse(obj: unknown): void {
    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) return

    const record = obj as Record<string, unknown>

    if (cicloKey in record && Array.isArray(record[cicloKey])) {
      result.push(...(record[cicloKey] as string[]))
      return
    }

    for (const key of Object.keys(record)) {
      if (
        key !== 'infantil_ciclo_1' &&
        key !== 'infantil_ciclo_2' &&
        key !== 'primaria_ciclo_1' &&
        key !== 'primaria_ciclo_2' &&
        key !== 'primaria_ciclo_3'
      ) {
        traverse(record[key])
      }
    }
  }

  traverse(saberes)
  return result
}

export function getSaberesConBloque(
  saberes: Record<string, unknown>,
  cicloKey: CicloKey
): Array<{ bloque: string; subbloque?: string; items: string[] }> {
  const result: Array<{ bloque: string; subbloque?: string; items: string[] }> = []

  function traverse(obj: unknown, bloque: string, subbloque?: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return
    const record = obj as Record<string, unknown>

    if (cicloKey in record && Array.isArray(record[cicloKey])) {
      const items = record[cicloKey] as string[]
      if (items.length > 0) {
        result.push({ bloque, subbloque, items })
      }
      return
    }

    for (const key of Object.keys(record)) {
      if (
        !['infantil_ciclo_1', 'infantil_ciclo_2', 'primaria_ciclo_1', 'primaria_ciclo_2', 'primaria_ciclo_3'].includes(key)
      ) {
        const value = record[key]
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const innerRecord = value as Record<string, unknown>
          const hasCicloDirectly = Object.keys(innerRecord).some((k) =>
            ['infantil_ciclo_1', 'infantil_ciclo_2', 'primaria_ciclo_1', 'primaria_ciclo_2', 'primaria_ciclo_3'].includes(k)
          )
          if (hasCicloDirectly) {
            if (subbloque) {
              if (cicloKey in innerRecord && Array.isArray(innerRecord[cicloKey])) {
                const items = innerRecord[cicloKey] as string[]
                if (items.length > 0) {
                  result.push({ bloque, subbloque, items })
                }
              }
            } else {
              traverse(value, bloque, key)
            }
          } else {
            if (subbloque) {
              traverse(value, bloque, key)
            } else {
              traverse(value, key)
            }
          }
        }
      }
    }
  }

  for (const bloqueKey of Object.keys(saberes)) {
    traverse((saberes as Record<string, unknown>)[bloqueKey], bloqueKey)
  }

  return result
}
