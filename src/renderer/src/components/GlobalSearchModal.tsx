import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'
import { Search, X, ArrowRight } from 'lucide-react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { stripHtml } from '@renderer/utils/stripHtml'
import { CICLO_LABELS, type Ciclo, type SdA } from '@renderer/types'

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (sectionIndex: number) => void
}

const SECTION_LABELS = [
  'Identificación',
  'Justificación',
  'Reto / Producto Final',
  'Vinculación Curricular',
  'Metodología',
  'Secuencia Didáctica',
  'Evaluación',
  'Atención a la Diversidad',
  'Interdisciplinariedad',
  'ODS',
]

interface SearchHit {
  sectionIndex: number
  fieldLabel: string
  snippet: string
}

function extractAllSnippets(rawText: string, query: string, ctx = 60): string[] {
  const plain = stripHtml(rawText)
  const lower = plain.toLowerCase()
  const qLower = query.toLowerCase()
  const snippets: string[] = []
  let from = 0
  while (true) {
    const idx = lower.indexOf(qLower, from)
    if (idx === -1) break
    const start = Math.max(0, idx - ctx)
    const end = Math.min(plain.length, idx + query.length + ctx)
    snippets.push((start > 0 ? '…' : '') + plain.slice(start, end) + (end < plain.length ? '…' : ''))
    from = idx + qLower.length
  }
  return snippets
}

function buildHits(sda: SdA, query: string): SearchHit[] {
  const q = query.trim()
  if (q.length < 2) return []
  const hits: SearchHit[] = []

  function add(sectionIndex: number, fieldLabel: string, text: string): void {
    if (!text) return
    extractAllSnippets(text, q).forEach((snippet) =>
      hits.push({ sectionIndex, fieldLabel, snippet })
    )
  }

  // S01
  add(0, 'Título', sda.titulo)
  if (sda.ciclo) add(0, 'Ciclo', CICLO_LABELS[sda.ciclo as Ciclo] ?? sda.ciclo)
  add(0, 'Área', sda.ambito)
  sda.areas.forEach((a) => add(0, 'Área', a))
  add(0, 'Docente', sda.docente)
  add(0, 'Centro', sda.centro)
  add(0, 'Temporalización', sda.temporalizacion)

  // S02
  add(1, 'Justificación', sda.justificacion)
  add(1, 'Contextualización', sda.contexto)

  // S03
  add(2, 'Situación-problema', sda.situacionProblema)
  add(2, 'Producto final', sda.productoFinal)
  add(2, 'Hilo conductor', sda.hilo)

  // S04
  sda.competenciasClave.forEach((cc) => add(3, 'Competencia clave', cc))
  sda.elementosCurriculares.forEach((ec) => {
    add(3, `CE — ${ec.area}`, ec.ce)
    ec.criterios.forEach((cr) => add(3, `Criterio — ${ec.area}`, cr))
    ec.saberes.forEach((s) => add(3, `Saber — ${ec.area}`, s))
  })

  // S05
  add(4, 'Planteamiento metodológico', sda.planteamientoMetodologico)
  sda.agrupamientos.forEach((ag) => add(4, 'Agrupamiento', ag))
  sda.espacios.forEach((es) => add(4, 'Espacio', es))
  add(4, 'Recursos', sda.recursos)
  add(4, 'Tiempos', sda.tiempos)

  // S06
  sda.sesiones.forEach((s) => {
    const lbl = `Sesión ${s.numero}`
    add(5, `${lbl} — Título`, s.titulo)
    add(5, `${lbl} — Inicio`, s.inicio)
    add(5, `${lbl} — Desarrollo`, s.desarrollo)
    add(5, `${lbl} — Cierre`, s.cierre)
    add(5, `${lbl} — Recursos`, s.recursos)
  })

  // S07
  add(6, 'Criterios de calificación', sda.criteriosCalificacion)
  sda.instrumentosEvaluacion.forEach((ins) => add(6, 'Instrumento', ins))
  sda.instrumentosPersonalizados.forEach((ins) => add(6, 'Instrumento personalizado', ins))
  add(6, 'Rúbrica', sda.rubrica)
  sda.rubricaTabla.forEach((row) => {
    add(6, `Rúbrica — ${row.criterio}`, row.iniciado)
    add(6, `Rúbrica — ${row.criterio}`, row.enProceso)
    add(6, `Rúbrica — ${row.criterio}`, row.conseguido)
    add(6, `Rúbrica — ${row.criterio}`, row.avanzado)
  })

  // S08
  add(7, 'DUA — Implicación', sda.duaImplicacion)
  add(7, 'DUA — Representación', sda.duaRepresentacion)
  add(7, 'DUA — Acción y expresión', sda.duaAccionExpresion)

  // S09
  sda.conexiones.forEach((c) => add(8, `Conexión — ${c.area}`, c.descripcion))
  add(8, 'Elementos transversales', sda.transversales)

  // S10
  sda.ods.forEach((o) => add(9, 'ODS', String(o)))
  add(9, 'Justificación ODS', sda.justificacionOds)

  // S11 — Cuaderno de Trabajo
  if (sda.cuaderno) {
    add(10, 'Cuaderno — Temática', sda.cuaderno.tematicaJuego)
    add(10, 'Cuaderno — Personaje', sda.cuaderno.personaje)
    add(10, 'Cuaderno — Mundo narrativo', sda.cuaderno.descripcionMundo)
    sda.cuaderno.sesiones.forEach((m) => {
      const lbl = `Misión ${m.sesionNumero}`
      add(10, `${lbl} — Título`, m.misionTitulo)
      add(10, `${lbl} — Narrativa`, m.narrativa)
      add(10, `${lbl} — Reflexión`, m.reflexion)
      m.tareas.forEach((t) => {
        add(10, `${lbl} — Tarea: ${t.titulo}`, t.enunciado)
        if (t.pista) add(10, `${lbl} — Pista`, t.pista)
        if (t.retoExtra) add(10, `${lbl} — Reto extra`, t.retoExtra)
      })
    })
  }

  return hits
}

function SnippetText({ text, query }: { text: string; query: string }): React.ReactElement {
  const qLen = query.length
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-200 not-italic text-amber-900 dark:bg-amber-700/70 dark:text-amber-100">
        {text.slice(idx, idx + qLen)}
      </mark>
      {text.slice(idx + qLen)}
    </span>
  )
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate }: GlobalSearchModalProps): React.ReactElement | null {
  const { sda } = useSdAStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, isOpen)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(-1)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  useEffect(() => { setSelectedIndex(-1) }, [query])

  const hits = useMemo(() => buildHits(sda, query), [sda, query])

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return
    const item = listRef.current.querySelector(`[data-idx="${selectedIndex}"]`)
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') { onClose(); return }
      if (hits.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, hits.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const hit = selectedIndex >= 0 ? hits[selectedIndex] : hits[0]
        if (hit) {
          window.dispatchEvent(new CustomEvent('sda-search-jump', { detail: { fieldLabel: hit.fieldLabel } }))
          onNavigate(hit.sectionIndex)
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, hits, selectedIndex, onNavigate])

  const grouped = useMemo(() => {
    const map = new Map<number, Array<SearchHit & { flatIndex: number }>>()
    hits.forEach((h, i) => {
      if (!map.has(h.sectionIndex)) map.set(h.sectionIndex, [])
      map.get(h.sectionIndex)!.push({ ...h, flatIndex: i })
    })
    return map
  }, [hits])

  if (!isOpen) return null

  const q = query.trim()

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en la SdA"
        tabIndex={-1}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en toda la SdA…"
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[26rem] overflow-y-auto">
          {q.length < 2 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-slate-400">Escribe al menos 2 caracteres para buscar</p>
              <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">↑ ↓ para navegar · Enter para ir · Esc para cerrar</p>
            </div>
          ) : grouped.size === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              Sin resultados para{' '}
              <span className="font-medium text-slate-600 dark:text-slate-300">"{q}"</span>
            </p>
          ) : (
            Array.from(grouped.entries()).map(([sectionIndex, sectionHits]) => (
              <div
                key={sectionIndex}
                className="border-b border-slate-50 last:border-0 dark:border-slate-700/40"
              >
                <div className="sticky top-0 bg-slate-50/90 px-5 py-1.5 backdrop-blur-sm dark:bg-slate-800/90">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">
                      {SECTION_LABELS[sectionIndex]}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {sectionHits.length} resultado{sectionHits.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                {sectionHits.map((hit) => {
                  const isSelected = selectedIndex === hit.flatIndex
                  return (
                    <button
                      key={hit.flatIndex}
                      data-idx={hit.flatIndex}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('sda-search-jump', { detail: { fieldLabel: hit.fieldLabel } }))
                        onNavigate(hit.sectionIndex)
                        onClose()
                      }}
                      onMouseEnter={() => setSelectedIndex(hit.flatIndex)}
                      className={`w-full px-5 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">{hit.fieldLabel}</span>
                        {isSelected && <ArrowRight size={11} className="shrink-0 text-primary-400" />}
                      </div>
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                        <SnippetText text={hit.snippet} query={q} />
                      </p>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {grouped.size > 0 && (
          <div className="border-t border-slate-100 px-5 py-2 dark:border-slate-700">
            <p className="text-[10px] text-slate-400">
              {hits.length} resultado{hits.length !== 1 ? 's' : ''} en{' '}
              {grouped.size} sección{grouped.size !== 1 ? 'es' : ''}
              <span className="ml-3 text-slate-300 dark:text-slate-600">↑ ↓ Enter para navegar</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
