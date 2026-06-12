import React, { useState, useRef, useEffect } from 'react'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'
import { X, Sparkles, Trash2, BookmarkPlus, Clock } from 'lucide-react'
import { PLANTILLAS, type Plantilla, type PlantillaColor, type PlantillaEtapa } from '@renderer/data/templates'
import { loadUserTemplates, deleteUserTemplate, type UserTemplate } from '@renderer/utils/userTemplates'
import type { SdA } from '@renderer/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (sda: Partial<SdA>) => void
  onGuardarPlantilla?: () => void
}

type Tab = 'base' | 'mis'
type FiltroEtapa = 'Todas' | PlantillaEtapa

const COLOR_CLASSES: Record<PlantillaColor, { icon: string; badge: string; badgeText: string; hover: string }> = {
  emerald: {
    icon: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    hover: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20'
  },
  blue: {
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-300',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-blue-100 dark:hover:shadow-blue-900/20'
  },
  violet: {
    icon: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-100 dark:bg-violet-900/30',
    badgeText: 'text-violet-700 dark:text-violet-300',
    hover: 'hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-violet-100 dark:hover:shadow-violet-900/20'
  },
  amber: {
    icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/30',
    badgeText: 'text-amber-700 dark:text-amber-300',
    hover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-amber-100 dark:hover:shadow-amber-900/20'
  },
  rose: {
    icon: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-100 dark:bg-rose-900/30',
    badgeText: 'text-rose-700 dark:text-rose-300',
    hover: 'hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-rose-100 dark:hover:shadow-rose-900/20'
  },
  teal: {
    icon: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    badge: 'bg-teal-100 dark:bg-teal-900/30',
    badgeText: 'text-teal-700 dark:text-teal-300',
    hover: 'hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-teal-100 dark:hover:shadow-teal-900/20'
  }
}

const FILTROS: FiltroEtapa[] = ['Todas', 'Infantil', 'Primaria']

function PlantillaCard({ plantilla, onSelect }: { plantilla: Plantilla; onSelect: () => void }): React.ReactElement {
  const colors = COLOR_CLASSES[plantilla.color]
  return (
    <button
      onClick={onSelect}
      className={`group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60 ${colors.hover}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${colors.icon}`}>
          {plantilla.emoji}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors.badge} ${colors.badgeText}`}>
            {plantilla.etapa}
          </span>
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {plantilla.nombre}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {plantilla.etiquetaCiclo}
        </p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
          {plantilla.descripcion}
        </p>
      </div>
      {plantilla.sda.areas && plantilla.sda.areas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {plantilla.sda.areas.map((area) => (
            <span
              key={area}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-700/60 dark:text-slate-400"
            >
              {area}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-500 opacity-0 transition-opacity group-hover:opacity-100">
        <Sparkles size={11} />
        Usar esta plantilla
      </div>
    </button>
  )
}

function UserTemplateCard({
  template,
  onSelect,
  onDelete
}: {
  template: UserTemplate
  onSelect: () => void
  onDelete: () => void
}): React.ReactElement {
  const fecha = new Date(template.savedAt).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-teal-700">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-2xl dark:bg-teal-900/30">
          📋
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="rounded-lg p-1.5 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          title="Eliminar plantilla"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {template.nombre}
        </h3>
        {template.descripcion && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
            {template.descripcion}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
          <Clock size={10} />
          <span>{fecha}</span>
          {template.sda.ciclo && (
            <>
              <span className="mx-1">·</span>
              <span>{template.sda.ciclo}</span>
            </>
          )}
          {template.sda.ambito && (
            <>
              <span className="mx-1">·</span>
              <span className="truncate max-w-[100px]">{template.sda.ambito}</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={onSelect}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-50 py-2 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-300 dark:hover:bg-teal-900/40"
      >
        <Sparkles size={11} />
        Usar esta plantilla
      </button>
    </div>
  )
}

export function TemplatesModal({ isOpen, onClose, onSelect, onGuardarPlantilla }: Props): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(containerRef, isOpen)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const [tab, setTab] = useState<Tab>('base')
  const [filtro, setFiltro] = useState<FiltroEtapa>('Todas')
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([])

  React.useEffect(() => {
    if (isOpen) setUserTemplates(loadUserTemplates())
  }, [isOpen, tab])

  const plantillasFiltradas =
    filtro === 'Todas' ? PLANTILLAS : PLANTILLAS.filter((p) => p.etapa === filtro)

  function handleDeleteUser(id: string): void {
    deleteUserTemplate(id)
    setUserTemplates(loadUserTemplates())
  }

  if (!isOpen) return null

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" aria-label="Plantillas" tabIndex={-1} className="fixed inset-0 z-50 flex flex-col bg-black/50 backdrop-blur-sm outline-none">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">
              Plantillas de Situación de Aprendizaje
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Selecciona una plantilla para empezar. Todos los campos son completamente editables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onGuardarPlantilla && (
              <button
                onClick={() => { onClose(); onGuardarPlantilla() }}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                title="Guardar la SdA actual como plantilla"
              >
                <BookmarkPlus size={13} />
                Guardar SdA actual
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 items-center gap-1 border-b border-slate-100 bg-slate-50 px-6 py-2 dark:border-slate-800 dark:bg-slate-900/50">
          <button
            onClick={() => setTab('base')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              tab === 'base'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Plantillas base
            <span className="ml-1.5 opacity-60">({PLANTILLAS.length})</span>
          </button>
          <button
            onClick={() => setTab('mis')}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              tab === 'mis'
                ? 'bg-teal-500 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Mis plantillas
            {userTemplates.length > 0 && (
              <span className="ml-1.5 opacity-60">({userTemplates.length})</span>
            )}
          </button>

          {/* Filtros de etapa — solo en pestaña base */}
          {tab === 'base' && (
            <>
              <div className="mx-2 h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Filtrar:</span>
              {FILTROS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    filtro === f
                      ? 'bg-slate-700 text-white shadow-sm dark:bg-slate-200 dark:text-slate-800'
                      : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                  {f !== 'Todas' && (
                    <span className="ml-1 opacity-60">
                      ({PLANTILLAS.filter((p) => p.etapa === f).length})
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-premium bg-slate-50 p-6 dark:bg-slate-950">
          {tab === 'base' ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {plantillasFiltradas.map((plantilla) => (
                  <PlantillaCard
                    key={plantilla.id}
                    plantilla={plantilla}
                    onSelect={() => { onSelect(plantilla.sda); onClose() }}
                  />
                ))}
              </div>
              {plantillasFiltradas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <span className="text-4xl">📭</span>
                  <p className="mt-3 text-sm font-medium text-slate-400">No hay plantillas para este filtro.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {userTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-900/20">
                    <BookmarkPlus size={28} className="text-teal-400" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No tienes plantillas guardadas
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-slate-400 dark:text-slate-500">
                    Cuando tengas una SdA que quieras reutilizar, guárdala como plantilla desde el botón{' '}
                    <strong>Guardar SdA actual</strong> o desde el cabecero de la aplicación.
                  </p>
                  {onGuardarPlantilla && (
                    <button
                      onClick={() => { onClose(); onGuardarPlantilla() }}
                      className="mt-4 flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700"
                    >
                      <BookmarkPlus size={13} />
                      Guardar SdA actual como plantilla
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userTemplates.map((t) => (
                    <UserTemplateCard
                      key={t.id}
                      template={t}
                      onSelect={() => { onSelect(t.sda); onClose() }}
                      onDelete={() => handleDeleteUser(t.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {tab === 'base'
              ? `${PLANTILLAS.length} plantillas base · Marco LOMLOE / Región de Murcia`
              : `${userTemplates.length} plantilla${userTemplates.length !== 1 ? 's' : ''} guardada${userTemplates.length !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
