import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean
): void {
  useEffect(() => {
    if (!isActive || !containerRef.current) return
    const container = containerRef.current
    const previousFocus = document.activeElement as HTMLElement | null

    const getFocusable = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))

    // Focus first focusable element (or the container itself as fallback)
    const first = getFocusable()[0]
    ;(first ?? container)?.focus()

    function trap(e: KeyboardEvent): void {
      if (e.key !== 'Tab') return
      const focusable = getFocusable()
      if (focusable.length === 0) { e.preventDefault(); return }
      const firstEl = focusable[0]
      const lastEl = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === firstEl || document.activeElement === container) {
          e.preventDefault()
          lastEl.focus()
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault()
          firstEl.focus()
        }
      }
    }

    container.addEventListener('keydown', trap)
    return () => {
      container.removeEventListener('keydown', trap)
      previousFocus?.focus()
    }
  }, [isActive, containerRef])
}
