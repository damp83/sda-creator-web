import React, { useRef, useEffect } from 'react'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'

interface ModalShellProps {
  isOpen: boolean
  onClose: () => void
  /** Used as aria-label for the dialog — should match the modal's visible title */
  title: string
  children: React.ReactNode
  /** Class names applied to the dialog container (max-w, rounded, bg, etc.) */
  className?: string
  /** Extra class names for the outer positioning wrapper (default: items-center justify-center p-4) */
  positionClass?: string
}

/**
 * Accessible modal shell: role="dialog", aria-modal, aria-label, focus trap, Escape-to-close.
 * Drop-in replacement for the fixed+backdrop+container triple-div pattern used across all modals.
 */
export function ModalShell({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  positionClass = 'items-center justify-center p-4',
}: ModalShellProps): React.ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, isOpen)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm ${positionClass}`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative outline-none ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
