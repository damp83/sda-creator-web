import { useState, useCallback, useMemo } from 'react'

const MODAL_KEYS = [
  'gestionDecretos', 'aiConfig', 'pdfPreview', 'templates', 'onboarding',
  'shortcuts', 'closeConfirm', 'stats', 'search', 'readOnly', 'snapshots',
  'presentation', 'aiPanel', 'saveTemplate', 'tour', 'wizard', 'focusMode'
] as const

export type ModalKey = (typeof MODAL_KEYS)[number]
export type ModalFlags = Record<ModalKey, boolean>

const INITIAL_FLAGS: ModalFlags = {
  gestionDecretos: false,
  aiConfig: false,
  pdfPreview: false,
  templates: false,
  onboarding: true,
  shortcuts: false,
  closeConfirm: false,
  stats: false,
  search: false,
  readOnly: false,
  snapshots: false,
  presentation: false,
  aiPanel: false,
  saveTemplate: false,
  tour: !localStorage.getItem('sda-tour-done'),
  wizard: false,
  focusMode: false,
}

export function useAppModals(): {
  m: ModalFlags
  open: (key: ModalKey) => void
  close: (key: ModalKey) => void
  toggle: (key: ModalKey) => void
  set: (key: ModalKey, value: boolean) => void
  openers: Record<ModalKey, () => void>
  closers: Record<ModalKey, () => void>
  togglers: Record<ModalKey, () => void>
} {
  const [flags, setFlags] = useState<ModalFlags>(INITIAL_FLAGS)

  const open = useCallback((key: ModalKey) => setFlags((f) => ({ ...f, [key]: true })), [])
  const close = useCallback((key: ModalKey) => setFlags((f) => ({ ...f, [key]: false })), [])
  const toggle = useCallback((key: ModalKey) => setFlags((f) => ({ ...f, [key]: !f[key] })), [])
  const set = useCallback((key: ModalKey, value: boolean) => setFlags((f) => ({ ...f, [key]: value })), [])

  const openers = useMemo(
    () => Object.fromEntries(MODAL_KEYS.map((k) => [k, () => open(k)])) as Record<ModalKey, () => void>,
    [open]
  )
  const closers = useMemo(
    () => Object.fromEntries(MODAL_KEYS.map((k) => [k, () => close(k)])) as Record<ModalKey, () => void>,
    [close]
  )
  const togglers = useMemo(
    () => Object.fromEntries(MODAL_KEYS.map((k) => [k, () => toggle(k)])) as Record<ModalKey, () => void>,
    [toggle]
  )

  return { m: flags, open, close, toggle, set, openers, closers, togglers }
}
