import React from 'react'
import { FilePlus, LayoutTemplate, FolderOpen, X, FileText, Layers, Sparkles, BookOpen, History, Search } from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'

interface Props {
  isOpen: boolean
  hasExisting: boolean
  onClose: () => void
  onNueva: () => void
  onDesdePlantilla: () => void
  onAbrir: () => void
}

const FEATURES = [
  {
    icon: FileText,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    title: '10 secciones LOMLOE',
    desc: 'Identificación, justificación, reto, vinculación curricular, metodología, secuencia, evaluación, DUA, interdisciplinariedad y ODS.'
  },
  {
    icon: Layers,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    title: 'Vinculación curricular',
    desc: 'Conecta CE, criterios y saberes desde los decretos de la Región de Murcia directamente en tu SdA.'
  },
  {
    icon: Sparkles,
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    title: 'IA con historial por sección',
    desc: 'Asistente contextual con memoria, completado automático de campos vacíos y resumen ejecutivo generado por IA.'
  },
  {
    icon: BookOpen,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    title: 'Exportación PDF y Word',
    desc: 'Documentos listos para entregar con portada, logo del centro y 4 plantillas de diseño disponibles.'
  },
  {
    icon: History,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    title: 'Historial y plantillas',
    desc: 'Guarda hasta 20 versiones de tu SdA, compara cambios y guarda tus propias plantillas reutilizables.'
  },
  {
    icon: Search,
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    title: 'Búsqueda global',
    desc: 'Encuentra cualquier texto en toda la SdA y salta directamente al campo exacto con un clic.'
  }
]

export function OnboardingModal({ isOpen, hasExisting, onClose, onNueva, onDesdePlantilla, onAbrir }: Props): React.ReactElement | null {
  return (
    <ModalShell isOpen={isOpen} onClose={hasExisting ? onClose : () => {}} title="Bienvenido a SdA Creator" className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
      <div>

        {/* Botón cerrar — solo si hay proyecto en curso */}
        {hasExisting && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-xl p-1.5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        )}

        {/* Cabecera */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-sm font-black shadow-inner">
              SdA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">SdA Creator Pro</h1>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-white/90">
                  v2.0
                </span>
              </div>
              <p className="text-sm text-primary-200">
                Diseñador de Situaciones de Aprendizaje LOMLOE · Región de Murcia
              </p>
            </div>
          </div>
        </div>

        {/* Features 2×2 */}
        <div className="grid grid-cols-2 gap-3 px-7 py-5">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon size={13} />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100">{title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="border-t border-slate-100 px-7 py-5 dark:border-slate-800">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">¿Por dónde empezamos?</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onNueva}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center transition-all hover:bg-primary-100 hover:shadow-md dark:border-primary-800 dark:bg-primary-900/20 dark:hover:bg-primary-900/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-transform group-hover:scale-110 dark:bg-primary-800/50 dark:text-primary-400">
                <FilePlus size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Desde cero</p>
                <p className="text-[10px] text-slate-400">Nuevo proyecto vacío</p>
              </div>
            </button>

            <button
              onClick={onDesdePlantilla}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center transition-all hover:bg-amber-100 hover:shadow-md dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-800/50 dark:text-amber-400">
                <LayoutTemplate size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Plantilla</p>
                <p className="text-[10px] text-slate-400">6 modelos predefinidos</p>
              </div>
            </button>

            <button
              onClick={onAbrir}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center transition-all hover:bg-slate-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-700/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-transform group-hover:scale-110 dark:bg-slate-700 dark:text-slate-400">
                <FolderOpen size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Abrir</p>
                <p className="text-[10px] text-slate-400">Proyecto guardado</p>
              </div>
            </button>
          </div>

          {hasExisting && (
            <button
              onClick={onClose}
              className="mt-3 w-full rounded-xl py-2 text-xs font-semibold text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              Continuar editando el proyecto actual
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
