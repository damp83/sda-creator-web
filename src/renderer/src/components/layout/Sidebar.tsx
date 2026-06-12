import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  FileText,
  BookOpen,
  Target,
  Settings,
  LayoutList,
  CheckCircle,
  Users,
  Link,
  Globe,
  BookMarked,
  Search,
  X,
  NotebookPen
} from 'lucide-react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS, type Ciclo } from '@renderer/types'
import { getSectionComplete, getSdAProgress } from '@renderer/utils/sdaProgress'

const SECTIONS = [
  { id: 0, label: 'Identificación', icon: FileText, color: 'text-blue-600' },
  { id: 1, label: 'Justificación', icon: BookOpen, color: 'text-emerald-600' },
  { id: 2, label: 'Reto / Producto Final', icon: Target, color: 'text-orange-600' },
  { id: 3, label: 'Vinculación Curricular', icon: BookMarked, color: 'text-purple-600' },
  { id: 4, label: 'Metodología', icon: Settings, color: 'text-teal-600' },
  { id: 5, label: 'Secuencia Didáctica', icon: LayoutList, color: 'text-indigo-600' },
  { id: 6, label: 'Evaluación', icon: CheckCircle, color: 'text-rose-600' },
  { id: 7, label: 'Atención a la Diversidad', icon: Users, color: 'text-amber-600' },
  { id: 8, label: 'Interdisciplinariedad', icon: Link, color: 'text-cyan-600' },
  { id: 9, label: 'ODS', icon: Globe, color: 'text-green-600' },
  { id: 10, label: 'Cuaderno de Trabajo', icon: NotebookPen, color: 'text-violet-600' }
]


export const Sidebar = React.memo(function Sidebar(): React.ReactElement {
  // Selectores granulares — cada uno solo re-renderiza cuando su valor cambia
  const activeSection    = useSdAStore(s => s.activeSection)
  const setActiveSection = useSdAStore(s => s.setActiveSection)
  // Tarjeta "Proyecto actual" — solo cambia al editar título/ciclo en S01
  const titulo = useSdAStore(s => s.sda.titulo)
  const ciclo  = useSdAStore(s => s.sda.ciclo)
  // Barra de progreso global — solo cambia al completar/descompletar secciones
  const pct = useSdAStore(s => getSdAProgress(s.sda).pct)
  // String primitiva '0101…' — Zustand la compara con === sin crear arrays nuevos
  const completionKey = useSdAStore(s =>
    SECTIONS.map(sec => getSectionComplete(s.sda, sec.id) ? '1' : '0').join('')
  )
  // Array derivado: referencia estable mientras no cambie ningún booleano
  const sectionCompletion = useMemo(
    () => completionKey.split('').map(c => c === '1'),
    [completionKey]
  )

  const [search, setSearch] = useState('')
  const [celebrating, setCelebrating] = useState<Set<number>>(new Set())
  const prevDoneRef = useRef<Record<number, boolean>>({})
  const isInitialMount = useRef(true)

  useEffect(() => {
    if (isInitialMount.current) {
      SECTIONS.forEach((sec, i) => { prevDoneRef.current[sec.id] = sectionCompletion[i] })
      isInitialMount.current = false
      return
    }
    SECTIONS.forEach((sec, i) => {
      const isDone = sectionCompletion[i]
      const wasDone = prevDoneRef.current[sec.id] ?? false
      if (isDone && !wasDone) {
        setCelebrating((prev) => new Set([...prev, sec.id]))
        window.dispatchEvent(new CustomEvent('sda-section-complete', { detail: { sectionLabel: sec.label } }))
        setTimeout(() => {
          setCelebrating((prev) => { const n = new Set(prev); n.delete(sec.id); return n })
        }, 1200)
      }
      prevDoneRef.current[sec.id] = isDone
    })
  }, [sectionCompletion])

  const visibleSections = search.trim()
    ? SECTIONS.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))
    : SECTIONS

  return (
    <aside data-tour="sidebar" className="glass relative z-40 flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden border-r shadow-2xl transition-all duration-300">
      {/* Header del Sidebar */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-black text-white shadow-lg shadow-primary-500/20">
            SdA
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
              SdA Creator
            </h1>
            <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">
              LOMLOE · Murcia
            </span>
          </div>
        </div>
      </div>

      {/* Info de la SdA activa con estilo de tarjeta */}
      <div className="mx-4 mb-6 rounded-2xl bg-slate-200/40 p-4 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/30">
        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
          Proyecto Actual
        </p>
        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
          {titulo || 'Nueva Situación'}
        </p>
        {ciclo && (
          <div className="mt-2 inline-flex items-center rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold text-primary-600 dark:text-primary-400">
            {CICLO_LABELS[ciclo as Ciclo]}
          </div>
        )}
      </div>

      {/* Buscador de secciones */}
      <div className="mx-3 mb-2 relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar secciones…"
          className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-7 text-xs text-slate-700 placeholder-slate-400 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500 dark:focus:border-primary-700"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="min-h-0 flex-1 overflow-y-auto scrollbar-premium px-3 space-y-1 pb-6">
        {visibleSections.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-slate-400">Sin resultados</p>
        )}
        {visibleSections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          const isDone = sectionCompletion[section.id]
          const isCelebrating = celebrating.has(section.id)

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl py-3 px-4 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-white/20 rotate-12 scale-110'
                    : isCelebrating
                      ? 'scale-125 bg-emerald-500 shadow-lg shadow-emerald-400/50'
                      : isDone
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-slate-200/50 dark:bg-slate-800'
                }`}
              >
                <Icon
                  size={15}
                  className={
                    isActive || isCelebrating ? 'text-white'
                    : isDone ? 'text-emerald-500'
                    : 'text-slate-500 group-hover:text-primary-500'
                  }
                />
              </div>
              
              <span className={`flex-1 truncate text-[13px] font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {section.label}
              </span>

              {isDone && !isActive && (
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <CheckCircle size={10} />
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer del Sidebar con progreso global */}
      <div className="border-t border-slate-200/50 p-6 dark:border-slate-800/50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Estado Global
            </span>
            <span className="text-[10px] font-black text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
              {pct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  )
})
