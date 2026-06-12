import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ModalShell } from '@renderer/components/ui/ModalShell'

function renderModal(props: Partial<Parameters<typeof ModalShell>[0]> = {}): ReturnType<typeof render> {
  const defaults = { isOpen: true, onClose: vi.fn(), title: 'Test modal', children: <p>Contenido</p> }
  return render(<ModalShell {...defaults} {...props} />)
}

describe('ModalShell', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container).toBeEmptyDOMElement()
  })

  it('renders children when isOpen is true', () => {
    renderModal({ isOpen: true })
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('sets role="dialog" and aria-modal="true"', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('sets aria-label from title prop', () => {
    renderModal({ title: 'Mi diálogo' })
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Mi diálogo')
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose, children: <button>Acción</button> })
    // Click the outer wrapper (backdrop), not the dialog
    const backdrop = screen.getByRole('dialog').parentElement!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does NOT call onClose when dialog content is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose, children: <button>Acción</button> })
    fireEvent.click(screen.getByRole('button', { name: 'Acción' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('applies custom className to dialog container', () => {
    renderModal({ className: 'max-w-sm custom-class' })
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toContain('custom-class')
  })
})
