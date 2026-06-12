import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { SaveTemplateModal } from '@renderer/components/SaveTemplateModal'
import * as userTemplates from '@renderer/utils/userTemplates'
import { useSdAStore } from '@renderer/store/sdaStore'
import { SDA_INICIAL } from '@renderer/types'

vi.mock('@renderer/utils/userTemplates', () => ({
  addUserTemplate: vi.fn(),
}))

beforeEach(() => {
  useSdAStore.setState({ sda: { ...SDA_INICIAL, titulo: 'Mi SdA de prueba' } })
})

function renderModal(props: { isOpen?: boolean; onClose?: () => void; onSaved?: () => void } = {}): ReturnType<typeof render> {
  return render(
    <SaveTemplateModal
      isOpen={props.isOpen ?? true}
      onClose={props.onClose ?? vi.fn()}
      onSaved={props.onSaved ?? vi.fn()}
    />
  )
}

describe('SaveTemplateModal', () => {
  it('renders nothing when closed', () => {
    const { container } = renderModal({ isOpen: false })
    expect(container).toBeEmptyDOMElement()
  })

  it('pre-fills the name field with the current SdA title', () => {
    renderModal()
    expect(screen.getByRole('textbox', { name: /nombre/i })).toHaveValue('Mi SdA de prueba')
  })

  it('has role="dialog" with accessible title', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-label', 'Guardar como plantilla')
  })

  it('disables the save button when name is empty', async () => {
    renderModal()
    const input = screen.getByRole('textbox', { name: /nombre/i })
    await userEvent.clear(input)
    expect(screen.getByRole('button', { name: /guardar plantilla/i })).toBeDisabled()
  })

  it('calls addUserTemplate and onSaved when saving with a valid name', async () => {
    const onSaved = vi.fn()
    const onClose = vi.fn()
    renderModal({ onSaved, onClose })

    await userEvent.clear(screen.getByRole('textbox', { name: /nombre/i }))
    await userEvent.type(screen.getByRole('textbox', { name: /nombre/i }), 'Nueva plantilla')
    fireEvent.click(screen.getByRole('button', { name: /guardar plantilla/i }))

    expect(userTemplates.addUserTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Nueva plantilla' })
    )
    expect(onSaved).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
