import React, { useState, useEffect, useCallback, useRef } from 'react'
import DOMPurify from 'dompurify'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'
import { ChevronLeft, ChevronRight, X, Presentation } from 'lucide-react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS, COMPETENCIAS_CLAVE, ODS_LIST, type Ciclo } from '@renderer/types'

interface Props {
  isOpen: boolean
  onClose: () => void
}

// ── Primitivos de slide ────────────────────────────────────────────────────────

function SlideTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <h2 className="mb-6 text-xs font-black uppercase tracking-widest text-primary-400">
      {children}
    </h2>
  )
}

function HtmlContent({ html }: { html: string }): React.ReactElement {
  return (
    <div
      className="prose prose-lg max-w-none text-slate-200 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_strong]:font-bold [&_strong]:text-white [&_em]:italic"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}

function Chip({ text, color }: { text: string; color?: string }): React.ReactElement {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
      style={color ? { backgroundColor: `${color}40`, color } : { backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
    >
      {text}
    </span>
  )
}

// ── Definición de slides ───────────────────────────────────────────────────────

type SlideContent = () => React.ReactElement

interface Slide {
  id: string
  label: string
  render: SlideContent
}

function useSlides(): Slide[] {
  const { sda } = useSdAStore()
  const cicloLabel = sda.ciclo ? CICLO_LABELS[sda.ciclo as Ciclo] : null

  const slides: Slide[] = []

  // Portada
  slides.push({
    id: 'portada',
    label: 'Portada',
    render: () => (
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {cicloLabel && <Chip text={cicloLabel} />}
          {sda.ambito && <Chip text={sda.ambito} />}
          {sda.numSesiones > 0 && <Chip text={`${sda.numSesiones} sesiones`} />}
        </div>
        <h1 className="mb-6 text-4xl font-black leading-tight text-white">
          {sda.titulo || 'Sin título'}
        </h1>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          {sda.docente && <span className="flex flex-col items-center gap-0.5"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Docente</span>{sda.docente}</span>}
          {sda.centro && <span className="flex flex-col items-center gap-0.5"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Centro</span>{sda.centro}</span>}
          {sda.curso && <span className="flex flex-col items-center gap-0.5"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Curso</span>{sda.curso}</span>}
          {sda.temporalizacion && <span className="flex flex-col items-center gap-0.5"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Temporalización</span>{sda.temporalizacion}</span>}
        </div>
      </div>
    ),
  })

  // S02 Justificación
  if (sda.justificacion || sda.contexto) {
    slides.push({
      id: 's02',
      label: 'Justificación',
      render: () => (
        <div>
          <SlideTitle>02 · Justificación y contextualización</SlideTitle>
          {sda.justificacion && (
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Justificación</p>
              <HtmlContent html={sda.justificacion} />
            </div>
          )}
          {sda.contexto && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Contexto del aula</p>
              <HtmlContent html={sda.contexto} />
            </div>
          )}
        </div>
      ),
    })
  }

  // S03 Reto
  if (sda.situacionProblema || sda.productoFinal || sda.hilo) {
    slides.push({
      id: 's03',
      label: 'Reto',
      render: () => (
        <div>
          <SlideTitle>03 · Reto / Producto Final</SlideTitle>
          {sda.hilo && (
            <div className="mb-5 rounded-xl border border-primary-700/40 bg-primary-900/20 p-4">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-primary-400">Hilo conductor</p>
              <p className="text-lg font-semibold italic text-slate-200">{sda.hilo.replace(/<[^>]+>/g, '')}</p>
            </div>
          )}
          {sda.situacionProblema && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Situación-problema</p>
              <HtmlContent html={sda.situacionProblema} />
            </div>
          )}
          {sda.productoFinal && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Producto final</p>
              <HtmlContent html={sda.productoFinal} />
            </div>
          )}
        </div>
      ),
    })
  }

  // S04 Vinculación
  if (sda.competenciasClave.length > 0 || sda.elementosCurriculares.length > 0) {
    slides.push({
      id: 's04',
      label: 'Currículo',
      render: () => (
        <div>
          <SlideTitle>04 · Vinculación Curricular</SlideTitle>
          {sda.competenciasClave.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Competencias clave</p>
              <div className="flex flex-wrap gap-2">
                {sda.competenciasClave.map((cc) => (
                  <span
                    key={cc}
                    title={COMPETENCIAS_CLAVE[cc]}
                    className="rounded-full bg-primary-800/50 px-4 py-1.5 text-sm font-bold text-primary-300"
                  >
                    {cc}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sda.elementosCurriculares.length > 0 && (
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-500">
                Elementos curriculares ({sda.elementosCurriculares.length})
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sda.elementosCurriculares.slice(0, 6).map((el) => (
                  <div key={el.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm">
                    <p className="font-semibold text-slate-200">{el.area}</p>
                    <p className="text-xs text-slate-400">{el.ce}</p>
                  </div>
                ))}
                {sda.elementosCurriculares.length > 6 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-700 p-3 text-sm text-slate-500">
                    +{sda.elementosCurriculares.length - 6} más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ),
    })
  }

  // S05 Metodología
  if (sda.planteamientoMetodologico || sda.agrupamientos.length > 0) {
    slides.push({
      id: 's05',
      label: 'Metodología',
      render: () => (
        <div>
          <SlideTitle>05 · Metodología</SlideTitle>
          {sda.planteamientoMetodologico && (
            <div className="mb-5">
              <HtmlContent html={sda.planteamientoMetodologico} />
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {sda.agrupamientos.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Agrupamientos</p>
                <div className="flex flex-wrap gap-1.5">
                  {sda.agrupamientos.map((a) => <Chip key={a} text={a} />)}
                </div>
              </div>
            )}
            {sda.espacios.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Espacios</p>
                <div className="flex flex-wrap gap-1.5">
                  {sda.espacios.map((e) => <Chip key={e} text={e} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    })
  }

  // S06 Secuencia didáctica
  if (sda.sesiones.length > 0) {
    slides.push({
      id: 's06',
      label: 'Secuencia',
      render: () => (
        <div>
          <SlideTitle>06 · Secuencia Didáctica — {sda.sesiones.length} sesiones</SlideTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {sda.sesiones.map((s) => (
              <div key={s.numero} className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">
                    {s.numero}
                  </span>
                  <span className="truncate text-xs font-semibold text-slate-200">{s.titulo || `Sesión ${s.numero}`}</span>
                </div>
                {s.duracion && <p className="text-[10px] text-slate-500">{s.duracion}</p>}
              </div>
            ))}
          </div>
        </div>
      ),
    })
  }

  // S07 Evaluación
  if (sda.momentosEvaluacion.length > 0 || sda.instrumentosEvaluacion.length > 0 || sda.criteriosCalificacion) {
    slides.push({
      id: 's07',
      label: 'Evaluación',
      render: () => (
        <div>
          <SlideTitle>07 · Evaluación</SlideTitle>
          <div className="space-y-5">
            {sda.momentosEvaluacion.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Momentos</p>
                <div className="flex flex-wrap gap-2">
                  {sda.momentosEvaluacion.map((m) => <Chip key={m} text={m} />)}
                </div>
              </div>
            )}
            {sda.instrumentosEvaluacion.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Instrumentos</p>
                <div className="flex flex-wrap gap-2">
                  {sda.instrumentosEvaluacion.map((i) => <Chip key={i} text={i} />)}
                </div>
              </div>
            )}
            {sda.criteriosCalificacion && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Criterios de calificación</p>
                <HtmlContent html={sda.criteriosCalificacion} />
              </div>
            )}
          </div>
        </div>
      ),
    })
  }

  // S08 DUA
  if (sda.duaImplicacion || sda.duaRepresentacion || sda.duaAccionExpresion) {
    slides.push({
      id: 's08',
      label: 'DUA',
      render: () => (
        <div>
          <SlideTitle>08 · Atención a la Diversidad (DUA)</SlideTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Implicación', html: sda.duaImplicacion },
              { label: 'Representación', html: sda.duaRepresentacion },
              { label: 'Acción y expresión', html: sda.duaAccionExpresion },
            ].filter((d) => d.html).map((d) => (
              <div key={d.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-primary-400">{d.label}</p>
                <HtmlContent html={d.html} />
              </div>
            ))}
          </div>
        </div>
      ),
    })
  }

  // S09 Interdisciplinariedad
  if (sda.conexiones.length > 0 || sda.transversales) {
    slides.push({
      id: 's09',
      label: 'Interdisciplinariedad',
      render: () => (
        <div>
          <SlideTitle>09 · Interdisciplinariedad</SlideTitle>
          {sda.conexiones.length > 0 && (
            <div className="mb-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Conexiones con otras áreas</p>
              <div className="space-y-2">
                {sda.conexiones.map((c, i) => (
                  <div key={`conexion-${i}`} className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-800/40 p-3">
                    <span className="shrink-0 rounded bg-cyan-900/50 px-2 py-0.5 text-xs font-bold text-cyan-400">{c.area}</span>
                    <span className="text-sm text-slate-300">{c.descripcion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {sda.transversales && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Temas transversales</p>
              <HtmlContent html={sda.transversales} />
            </div>
          )}
        </div>
      ),
    })
  }

  // S10 ODS
  if (sda.ods.length > 0) {
    slides.push({
      id: 's10',
      label: 'ODS',
      render: () => (
        <div>
          <SlideTitle>10 · ODS</SlideTitle>
          <div className="mb-5 flex flex-wrap gap-3">
            {sda.ods.map((num) => {
              const ods = ODS_LIST.find((o) => o.num === num)
              return ods ? (
                <span
                  key={num}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: ods.color }}
                >
                  <span className="font-black">{num}</span>
                  {ods.titulo}
                </span>
              ) : null
            })}
          </div>
          {sda.justificacionOds && <HtmlContent html={sda.justificacionOds} />}
        </div>
      ),
    })
  }

  return slides
}

// ── Componente principal ───────────────────────────────────────────────────────

export function PresentationModal({ isOpen, onClose }: Props): React.ReactElement | null {
  const { sda } = useSdAStore()
  const [current, setCurrent] = useState(0)
  const slides = useSlides()
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(containerRef, isOpen)

  useEffect(() => {
    if (isOpen) setCurrent(0)
  }, [isOpen])

  const prev = useCallback(() => setCurrent((i) => Math.max(0, i - 1)), [])
  const next = useCallback(() => setCurrent((i) => Math.min(slides.length - 1, i + 1)), [slides.length])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, next, prev])

  if (!isOpen || slides.length === 0) return null

  const slide = slides[current]
  const isFirst = current === 0
  const isLast  = current === slides.length - 1

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" aria-label="Modo presentación" tabIndex={-1} className="fixed inset-0 z-50 flex flex-col bg-slate-950 outline-none">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Presentation size={14} />
          <span className="text-xs font-medium">{sda.titulo || 'Sin título'}</span>
        </div>

        {/* Slide pills */}
        <div className="hidden items-center gap-1 sm:flex">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                i === current
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {current + 1} <span className="text-slate-700">/</span> {slides.length}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-16 py-8">
        <div key={slide.id} className="w-full max-w-4xl animate-in fade-in duration-300 overflow-y-auto max-h-full">
          {slide.render()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex shrink-0 items-center justify-between border-t border-slate-800 px-6 py-4">
        <button
          onClick={prev}
          disabled={isFirst}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-slate-200 disabled:opacity-20"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={`slide-dot-${i}`}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? 'h-2 w-6 bg-primary-500'
                  : 'h-2 w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={isLast}
          className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:border-slate-500 hover:text-slate-200 disabled:opacity-20"
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
