import React, { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'

interface TourStep {
  target: string
  title: string
  description: string
  side: 'right' | 'bottom' | 'top' | 'left'
}

const STEPS: TourStep[] = [
  {
    target: 'sidebar',
    title: 'Navegación de secciones',
    description: 'Accede a las 10 secciones de tu SdA desde aquí. El indicador verde muestra las secciones completadas.',
    side: 'right',
  },
  {
    target: 'completar-ia',
    title: 'Completar SdA con IA',
    description: 'Genera automáticamente el contenido de todos los campos vacíos con un solo clic. Útil para empezar rápido.',
    side: 'bottom',
  },
  {
    target: 'asistente-ia',
    title: 'Asistente IA contextual',
    description: 'Consulta dudas o pide contenido concreto para la sección activa. Recuerda el historial de cada sección.',
    side: 'top',
  },
  {
    target: 'historial',
    title: 'Historial de versiones',
    description: 'Guarda snapshots de tu trabajo y compara diferencias entre versiones con un solo clic.',
    side: 'bottom',
  },
  {
    target: 'exportar',
    title: 'Exportar la SdA',
    description: 'Descarga tu SdA como PDF o Word cuando esté lista para compartir o presentar a la comunidad educativa.',
    side: 'bottom',
  },
]

const PAD = 10
const TOOLTIP_W = 276

export function TourOverlay({ onDone }: { onDone: () => void }): React.ReactElement | null {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)

  const current = STEPS[step]

  useEffect(() => {
    function measure(): void {
      const el = document.querySelector<HTMLElement>(`[data-tour="${current.target}"]`)
      if (!el) { setRect(null); return }
      setRect(el.getBoundingClientRect())
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [step, current.target])

  if (!rect) return null

  const sx = rect.left - PAD
  const sy = rect.top - PAD
  const sw = rect.width + PAD * 2
  const sh = rect.height + PAD * 2

  let tooltipStyle: React.CSSProperties = {}
  switch (current.side) {
    case 'right':
      tooltipStyle = { top: Math.max(8, sy), left: sx + sw + 14 }
      break
    case 'bottom':
      tooltipStyle = { top: sy + sh + 14, left: Math.min(Math.max(8, sx), window.innerWidth - TOOLTIP_W - 8) }
      break
    case 'top':
      tooltipStyle = { bottom: window.innerHeight - sy + 14, left: Math.min(Math.max(8, sx), window.innerWidth - TOOLTIP_W - 8) }
      break
    case 'left':
      tooltipStyle = { top: Math.max(8, sy), right: window.innerWidth - sx + 14 }
      break
  }

  function handleNext(): void {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else handleDone()
  }

  function handleDone(): void {
    localStorage.setItem('sda-tour-done', '1')
    onDone()
  }

  return (
    <>
      {/* Backdrop semi-transparent — click fuera salta el tour */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9990, background: 'rgba(0,0,0,0.52)', pointerEvents: 'auto' }}
        onClick={handleDone}
      />
      {/* Spotlight ring sobre el elemento objetivo */}
      <div
        className="fixed transition-all duration-300"
        style={{
          zIndex: 9991,
          left: sx,
          top: sy,
          width: sw,
          height: sh,
          borderRadius: 12,
          border: '2px solid rgba(96,165,250,0.9)',
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.52), 0 0 20px rgba(96,165,250,0.4)',
          pointerEvents: 'none',
        }}
      />
      {/* Tooltip */}
      <div
        className="fixed rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
        style={{ zIndex: 9992, width: TOOLTIP_W, pointerEvents: 'auto', ...tooltipStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Indicadores de paso */}
        <div className="mb-3 flex items-center gap-1">
          {STEPS.map((_, i) => (
            <span
              key={`step-dot-${i}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-5 bg-primary-500' : 'w-1.5 bg-slate-200 dark:bg-slate-600'
              }`}
            />
          ))}
          <button
            onClick={handleDone}
            className="ml-auto rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={13} />
          </button>
        </div>

        <p className="mb-1 text-sm font-bold text-slate-800 dark:text-slate-100">{current.title}</p>
        <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{current.description}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleDone}
            className="text-xs text-slate-400 transition-colors hover:text-slate-500 dark:hover:text-slate-300"
          >
            Saltar tour
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
          >
            {step < STEPS.length - 1 ? 'Siguiente' : '¡Empezar!'}
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </>
  )
}
