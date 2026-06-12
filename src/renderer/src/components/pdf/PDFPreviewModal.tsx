import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'
import { X, Printer, ZoomIn, ZoomOut, Check } from 'lucide-react'
import { PrintView, type PrintTemplate } from '@renderer/components/print/PrintView'

interface TemplateOption {
  id: PrintTemplate
  name: string
  desc: string
  color: string
  contentBg: string
  contentBorder: string
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'institucional',
    name: 'Azul LOMLOE',
    desc: 'Institucional',
    color: '#1e40af',
    contentBg: '#f8fafc',
    contentBorder: '#e2e8f0'
  },
  {
    id: 'verde',
    name: 'Verde',
    desc: 'Educativo',
    color: '#166534',
    contentBg: '#f0fdf4',
    contentBorder: '#86efac'
  },
  {
    id: 'gris',
    name: 'Gris',
    desc: 'Moderno',
    color: '#334155',
    contentBg: '#f8fafc',
    contentBorder: '#94a3b8'
  },
  {
    id: 'ambar',
    name: 'Ámbar',
    desc: 'Cálido',
    color: '#92400e',
    contentBg: '#fffbeb',
    contentBorder: '#fcd34d'
  }
]

interface Props {
  isOpen: boolean
  onClose: () => void
  onExport: () => Promise<void>
  template: PrintTemplate
  onTemplateChange: (t: PrintTemplate) => void
  selectedSections?: Record<string, boolean>
}

export function PDFPreviewModal({
  isOpen,
  onClose,
  onExport,
  template,
  onTemplateChange,
  selectedSections
}: Props): React.ReactElement | null {
  const [zoom, setZoom] = useState(0.72)
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(containerRef, isOpen)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleExport = useCallback(async () => {
    onClose()
    await new Promise<void>((r) => setTimeout(r, 120))
    await onExport()
  }, [onExport, onClose])

  if (!isOpen) return null

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" aria-label="Vista previa del PDF" tabIndex={-1} className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm outline-none">
      {/* Cabecera */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Printer size={16} className="text-primary-600" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Vista previa del PDF
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-1 py-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Reducir zoom"
            >
              <ZoomOut size={14} />
            </button>
            <span className="min-w-[38px] text-center text-xs font-medium text-slate-600 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.2, +(z + 0.1).toFixed(1)))}
              className="rounded p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              title="Aumentar zoom"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            title="Cerrar vista previa"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Selector de plantilla */}
      <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-2.5 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Plantilla:</span>
          <div className="flex gap-1.5">
            {TEMPLATES.map((tpl) => {
              const active = template === tpl.id
              return (
                <button
                  key={tpl.id}
                  onClick={() => onTemplateChange(tpl.id)}
                  title={`${tpl.name} — ${tpl.desc}`}
                  className={`group relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-700'
                      : 'border-transparent bg-transparent text-slate-500 hover:bg-white hover:border-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Mini-preview de la plantilla */}
                  <TemplateSwatch tpl={tpl} />
                  <span className={active ? 'text-slate-700 dark:text-slate-200' : ''}>
                    {tpl.name}
                  </span>
                  {active && (
                    <Check size={11} className="text-emerald-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Área de previsualización */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-slate-300 p-8 dark:bg-slate-800"
      >
        <div
          className="mx-auto origin-top"
          style={{
            width: `${794 * zoom}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            marginBottom: `${794 * (zoom - 1) * -1}px`
          }}
        >
          <div className="shadow-2xl">
            <PrintView forPreview template={template} selectedSections={selectedSections} />
          </div>
        </div>
      </div>

      {/* Pie del modal */}
      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Cancelar
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          <Printer size={15} />
          Exportar PDF
        </button>
      </div>
    </div>
  )
}

function TemplateSwatch({ tpl }: { tpl: TemplateOption }): React.ReactElement {
  return (
    <div
      className="flex shrink-0 flex-col overflow-hidden rounded"
      style={{ width: 24, height: 20, border: `1px solid ${tpl.color}40` }}
    >
      {/* Header bar (color primario) */}
      <div style={{ height: 6, backgroundColor: tpl.color }} />
      {/* Content area with left accent border */}
      <div
        style={{
          flex: 1,
          backgroundColor: tpl.contentBg,
          borderLeft: `2px solid ${tpl.contentBorder}`
        }}
      />
    </div>
  )
}
