import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { useRef } from 'react'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'

function Fixture({ active }: { active: boolean }): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(ref, active)
  return (
    <div ref={ref} tabIndex={-1}>
      <button>Primero</button>
      <button>Segundo</button>
      <button>Tercero</button>
    </div>
  )
}

describe('useFocusTrap', () => {
  afterEach(() => vi.restoreAllMocks())

  it('focuses the first focusable element when activated', () => {
    const { rerender } = render(<Fixture active={false} />)
    rerender(<Fixture active={true} />)
    expect(document.activeElement?.textContent).toBe('Primero')
  })

  it('wraps forward: Tab from last focuses first', () => {
    render(<Fixture active={true} />)
    const buttons = screen.getAllByRole('button')
    buttons[buttons.length - 1].focus()
    fireEvent.keyDown(buttons[buttons.length - 1], { key: 'Tab', shiftKey: false })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('wraps backward: Shift+Tab from first focuses last', () => {
    render(<Fixture active={true} />)
    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    fireEvent.keyDown(buttons[0], { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(buttons[buttons.length - 1])
  })

  it('does not trap when inactive', () => {
    render(<Fixture active={false} />)
    const buttons = screen.getAllByRole('button')
    buttons[0].focus()
    fireEvent.keyDown(buttons[0], { key: 'Tab', shiftKey: true })
    // focus stays unchanged — no wrapping
    expect(document.activeElement).toBe(buttons[0])
  })
})
