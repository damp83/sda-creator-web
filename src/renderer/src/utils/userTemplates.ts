import type { SdA } from '@renderer/types'

const STORAGE_KEY = 'sda-user-templates'
const MAX_TEMPLATES = 20

export interface UserTemplate {
  id: string
  nombre: string
  descripcion: string
  savedAt: string
  sda: Partial<SdA>
}

export function loadUserTemplates(): UserTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as UserTemplate[]
  } catch {
    return []
  }
}

export function addUserTemplate(data: { nombre: string; descripcion: string; sda: Partial<SdA> }): void {
  const list = loadUserTemplates()
  const entry: UserTemplate = {
    id: crypto.randomUUID(),
    nombre: data.nombre,
    descripcion: data.descripcion,
    savedAt: new Date().toISOString(),
    sda: data.sda
  }
  list.unshift(entry)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_TEMPLATES)))
  } catch {
    throw new Error('No se pudo guardar la plantilla: almacenamiento local lleno.')
  }
}

export function deleteUserTemplate(id: string): void {
  const list = loadUserTemplates().filter((t) => t.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch { /* noop — borrar no debe fallar */ }
}
