import React, { useEffect, useState } from 'react'
import { FilePlus, FolderOpen, Clock, LayoutTemplate, TrendingUp, BookOpen } from 'lucide-react'
import { CICLO_LABELS, type Ciclo } from '@renderer/types'

interface Props {
  onNueva: () => void
  onAbrir: () => void
  onAbrirReciente: (filePath: string) => void
  onDesdePlantilla: () => void
}

function ProgressRing({ pct }: { pct: number }): React.ReactElement {
  const r = 14
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct === 100 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 30 ? '#f59e0b' : '#94a3b8'
  return (
    <svg width={36} height={36} className="shrink-0">
      <circle cx={18} cy={18} r={r} fill="none" stroke="#e2e8f0" strokeWidth={3} />
      <circle
        cx={18} cy={18} r={r} fill="none"
        stroke={color} strokeWidth={3}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={18} y={22} textAnchor="middle" fontSize={9} fontWeight="bold" fill={color}>
        {pct}%
      </text>
    </svg>
  )
}

function cicloLabel(ciclo: string | undefined): string {
  if (!ciclo) return ''
  return CICLO_LABELS[ciclo as Ciclo] ?? ciclo
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function WelcomeScreen({ onNueva, onAbrir, onAbrirReciente, onDesdePlantilla }: Props): React.ReactElement {
  const [recents, setRecents] = useState<RecentFile[]>([])

  useEffect(() => {
    window.api?.getRecentFiles().then(setRecents).catch(() => {})
  }, [])

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-slate-50/50 p-8 dark:bg-slate-950/50">
      <div className="w-full max-w-2xl">

        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-3xl bg-primary-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-black text-white shadow-2xl">
              SdA
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            SdA Creator <span className="text-primary-500">Pro</span>
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="rounded-full bg-primary-100 px-3 py-0.5 text-xs font-black tracking-widest text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">
              VERSIÓN 2.0
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              ✦ Nueva versión mejorada
            </span>
          </div>
          <p className="mx-auto mt-3 max-w-md text-base font-medium text-slate-500 dark:text-slate-400">
            La plataforma definitiva para la creación de Situaciones de Aprendizaje bajo el marco LOMLOE.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={onNueva}
            className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-white/20 bg-white p-7 text-left transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary-500/5 transition-transform group-hover:scale-150" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <FilePlus size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Crear desde cero</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Nueva SdA vacía con el asistente guiado.
              </p>
            </div>
          </button>

          <button
            onClick={onDesdePlantilla}
            className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-7 text-left transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/10 dark:border-amber-800/40 dark:from-amber-900/20 dark:to-orange-900/10 dark:hover:from-amber-900/30"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-500/10 transition-transform group-hover:scale-150" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <LayoutTemplate size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Usar plantilla</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Empieza con una SdA prediseñada y edítala a tu medida.
              </p>
            </div>
          </button>

          <button
            onClick={onAbrir}
            className="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border border-white/20 bg-white p-7 text-left transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-500/10 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-slate-500/5 transition-transform group-hover:scale-150" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Abrir documento</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Continúa trabajando en un proyecto guardado.
              </p>
            </div>
          </button>
        </div>

        {/* Recent Files */}
        {recents.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <Clock size={13} />
              Proyectos Recientes
            </div>

            <div className="space-y-2">
              {recents.map((r) => {
                const pct = r.pct ?? 0
                const ciclo = cicloLabel(r.ciclo)
                const hasExtra = !!(ciclo || r.ambito)
                return (
                  <button
                    key={r.filePath}
                    onClick={() => onAbrirReciente(r.filePath)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-white px-5 py-4 text-left transition-all hover:border-primary-500/30 hover:shadow-lg dark:bg-slate-900/60 dark:hover:bg-slate-800"
                  >
                    {/* Progress ring */}
                    <ProgressRing pct={pct} />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-primary-400">
                        {r.titulo || 'Proyecto sin nombre'}
                      </p>

                      {hasExtra && (
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {ciclo && (
                            <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                              <BookOpen size={9} />
                              {ciclo}
                            </span>
                          )}
                          {r.ambito && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              {r.ambito}
                            </span>
                          )}
                        </div>
                      )}

                      {!hasExtra && (
                        <p className="truncate text-[11px] font-medium text-slate-400">{r.filePath}</p>
                      )}
                    </div>

                    {/* Right side: date + progress text */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold text-slate-400">{formatDate(r.savedAt)}</span>
                      <span className={`flex items-center gap-1 text-[10px] font-semibold ${
                        pct === 100 ? 'text-emerald-500' : pct >= 60 ? 'text-blue-500' : pct >= 30 ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        <TrendingUp size={9} />
                        {pct === 100 ? 'Completa' : pct >= 60 ? 'Avanzada' : pct >= 30 ? 'En progreso' : 'Iniciada'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
