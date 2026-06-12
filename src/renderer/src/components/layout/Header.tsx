import React, { useState, useEffect } from 'react'
import {
  Save, FolderOpen, FilePlus, Printer, Moon, Sun, Library, Sparkles,
  Undo2, Redo2, Wand2, Share2, Files, Keyboard, BarChart2,
  PanelLeftClose, PanelLeftOpen, FileDown, Eye, History, Presentation, BookmarkPlus,
} from 'lucide-react'
import { Button } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getSdAProgress } from '@renderer/utils/sdaProgress'
import { useCoherenceWarnings } from '@renderer/hooks/useCoherenceWarnings'
import { ThemePicker } from '@renderer/components/ThemePicker'
import { applyTheme, loadSavedTheme, type ThemeKey } from '@renderer/utils/themes'

interface HeaderProps {
  darkMode: boolean
  onToggleDark: () => void
  onNueva: () => void
  onAbrir: () => void
  onGuardar: () => void
  onCompartir: () => void
  onExportarPdf: () => void
  onExportarDocx: () => void
  onDuplicar: () => void
  onGestionDecretos: () => void
  onAIConfig: () => void
  onAtajos: () => void
  onStats: () => void
  onCompletarSdA: () => void
  completandoSdA: boolean
  progresoSdA: string | null
  focusMode: boolean
  onToggleFocus: () => void
  onReadOnly: () => void
  onSnapshots: () => void
  onPresentation: () => void
  onGuardarComoPlantilla: () => void
}

const iconBtn =
  'flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'

export const Header = React.memo(function Header({
  darkMode,
  onToggleDark,
  onNueva,
  onAbrir,
  onGuardar,
  onCompartir,
  onExportarPdf,
  onExportarDocx,
  onDuplicar,
  onGestionDecretos,
  onAIConfig,
  onAtajos,
  onStats,
  onCompletarSdA,
  completandoSdA,
  progresoSdA,
  focusMode,
  onToggleFocus,
  onReadOnly,
  onSnapshots,
  onPresentation,
  onGuardarComoPlantilla,
}: HeaderProps): React.ReactElement {
  // Selectores granulares — evitan re-renders por cambios en sda no relacionados
  const isDirty   = useSdAStore(s => s.isDirty)
  const filePath  = useSdAStore(s => s.filePath)
  const titulo    = useSdAStore(s => s.sda.titulo)
  const lastSaved = useSdAStore(s => s.lastSaved)
  const undo      = useSdAStore(s => s.undo)
  const redo      = useSdAStore(s => s.redo)
  const undoStack = useSdAStore(s => s.undoStack)
  const redoStack = useSdAStore(s => s.redoStack)
  const pct   = useSdAStore(s => getSdAProgress(s.sda).pct)
  const done  = useSdAStore(s => getSdAProgress(s.sda).done)
  const total = useSdAStore(s => getSdAProgress(s.sda).total)
  const coherenceWarnings = useCoherenceWarnings()
  const warningCount = coherenceWarnings.filter((w) => w.severity === 'warning').length

  const [theme, setTheme] = useState<ThemeKey>(() => loadSavedTheme())
  function handleThemeChange(key: ThemeKey): void {
    setTheme(key)
    applyTheme(key)
  }

  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  function relativeTime(iso: string): string {
    void tick
    const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
    if (min < 1) return 'hace un momento'
    if (min < 60) return `hace ${min} min`
    const h = Math.floor(min / 60)
    return h === 1 ? 'hace 1 hora' : `hace ${h} horas`
  }

  return (
    <header className="glass relative z-50 flex shrink-0 flex-col px-4 transition-all duration-300">
      {/* Barra de progreso superior */}
      <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-slate-200/30 dark:bg-slate-700/30">
        <div
          className="h-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 transition-all duration-700 ease-in-out"
          style={{ width: `${pct}%` }}
          title={`${done} de ${total} secciones completadas`}
        />
      </div>

      {/* ── Fila 1: estado del archivo + acciones de archivo ── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        {/* Izquierda: nombre + estado */}
        <div className="flex min-w-0 flex-col">
          {filePath ? (
            <span
              className="max-w-[18rem] truncate text-xs font-bold tracking-tight text-slate-800 dark:text-slate-200"
              title={filePath}
            >
              {filePath.split(/[/\\]/).pop()?.replace('.json', '')}
            </span>
          ) : titulo ? (
            <span
              className="max-w-[18rem] truncate text-xs font-bold tracking-tight text-slate-800 dark:text-slate-200"
              title={`${titulo} (sin guardar en archivo)`}
            >
              {titulo}
            </span>
          ) : (
            <span className="text-xs font-semibold tracking-tight text-slate-400">Sin título</span>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            {isDirty ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                Cambios pendientes
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Guardado {relativeTime(lastSaved)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Sincronizado
              </span>
            )}
          </div>
        </div>

        {/* Derecha: undo/redo + acciones de archivo + IA completar */}
        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 rounded-xl bg-slate-200/30 p-0.5 dark:bg-slate-800/30">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`${iconBtn} disabled:opacity-20`}
              title="Deshacer (Ctrl+Z)"
              aria-label="Deshacer"
            >
              <Undo2 size={14} />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`${iconBtn} disabled:opacity-20`}
              title="Rehacer (Ctrl+Y)"
              aria-label="Rehacer"
            >
              <Redo2 size={14} />
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Archivo */}
          <Button variant="ghost" size="sm" icon={<FilePlus size={15} />} onClick={onNueva} title="Nueva SdA (Ctrl+N)">
            <span className="hidden lg:inline text-xs">Nueva</span>
          </Button>
          <button onClick={onDuplicar} className={iconBtn} title="Duplicar SdA" aria-label="Duplicar SdA">
            <Files size={15} />
          </button>
          <button onClick={onAbrir} className={iconBtn} title="Abrir (Ctrl+O)" aria-label="Abrir archivo">
            <FolderOpen size={15} />
          </button>
          <Button
            variant={isDirty ? 'primary' : 'ghost'}
            size="sm"
            icon={<Save size={15} />}
            onClick={onGuardar}
            disabled={!isDirty}
            title="Guardar (Ctrl+S)"
          >
            <span className="hidden lg:inline text-xs">Guardar</span>
          </Button>
          <button onClick={onCompartir} className={iconBtn} title="Compartir" aria-label="Compartir archivo">
            <Share2 size={15} />
          </button>
          <button onClick={onGuardarComoPlantilla} className={iconBtn} title="Guardar SdA actual como plantilla" aria-label="Guardar como plantilla">
            <BookmarkPlus size={15} />
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Completar con IA — prominente en fila 1 */}
          <button
            data-tour="completar-ia"
            onClick={onCompletarSdA}
            disabled={completandoSdA}
            title={completandoSdA ? (progresoSdA ?? 'Generando…') : 'Completar SdA con IA'}
            className="flex h-7 items-center gap-1.5 rounded-xl px-2 text-[11px] font-semibold text-amber-600 transition-all hover:bg-amber-50 disabled:opacity-60 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            {completandoSdA ? (
              <><Wand2 size={14} className="animate-pulse" /><span className="hidden xl:inline max-w-[140px] truncate">{progresoSdA ?? 'Generando…'}</span></>
            ) : (
              <><Wand2 size={14} /><span className="hidden xl:inline">Completar SdA</span></>
            )}
          </button>
        </div>
      </div>

      {/* ── Fila 2: progreso + herramientas + apariencia ── */}
      <div className="flex items-center justify-between pb-1.5">
        {/* Izquierda: % completado */}
        <span
          className="rounded-full bg-slate-200/50 px-2 py-0.5 text-[9px] font-black uppercase text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
          title={`${done} de ${total} secciones completadas`}
        >
          {pct}% completado
        </span>

        {/* Derecha: herramientas + vistas + apariencia */}
        <div className="flex items-center gap-0.5">
          {/* Herramientas de análisis */}
          <button
            onClick={onStats}
            title={warningCount > 0 ? `Estadísticas · ${warningCount} aviso${warningCount > 1 ? 's' : ''}` : 'Estadísticas'}
            aria-label={warningCount > 0 ? `Estadísticas, ${warningCount} aviso${warningCount > 1 ? 's' : ''}` : 'Estadísticas'}
            className={`${iconBtn} relative`}
          >
            <BarChart2 size={15} />
            {warningCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-white">
                {warningCount}
              </span>
            )}
          </button>
          <button onClick={onGestionDecretos} className={iconBtn} title="Gestión de Decretos" aria-label="Gestión de decretos">
            <Library size={15} />
          </button>
          <button onClick={onAIConfig} className={iconBtn} title="Configuración de IA" aria-label="Configuración de IA">
            <Sparkles size={15} className="text-primary-500" />
          </button>
          <button onClick={onAtajos} className={iconBtn} title="Atajos de teclado (?)" aria-label="Atajos de teclado">
            <Keyboard size={15} />
          </button>

          <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Vistas */}
          <button onClick={onReadOnly} className={iconBtn} title="Vista de lectura" aria-label="Vista de lectura">
            <Eye size={15} />
          </button>
          <button onClick={onPresentation} className={iconBtn} title="Modo presentación" aria-label="Modo presentación">
            <Presentation size={15} />
          </button>
          <button data-tour="historial" onClick={onSnapshots} className={iconBtn} title="Historial de versiones" aria-label="Historial de versiones">
            <History size={15} />
          </button>

          <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Exportar */}
          <button data-tour="exportar" onClick={onExportarPdf} className={iconBtn} title="Exportar PDF" aria-label="Exportar PDF">
            <Printer size={15} />
          </button>
          <button onClick={onExportarDocx} className={iconBtn} title="Exportar Word (.docx)" aria-label="Exportar Word">
            <FileDown size={15} />
          </button>

          <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Apariencia */}
          <ThemePicker current={theme} onChange={handleThemeChange} />
          <button
            onClick={onToggleFocus}
            className={`${iconBtn} ml-1`}
            title={focusMode ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
            aria-label={focusMode ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
          >
            {focusMode ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
          <button
            onClick={onToggleDark}
            className={`${iconBtn} ml-0.5`}
            title="Claro / Oscuro"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  )
})
