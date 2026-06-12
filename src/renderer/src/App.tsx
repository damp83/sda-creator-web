import React, { useEffect, useCallback, useState, useRef } from 'react'
import { useIpcListener } from '@renderer/hooks/useIpcListener'
import { ChevronLeft, ChevronRight, RotateCcw, X, CheckCircle2, AlertTriangle, Loader2, BrainCircuit } from 'lucide-react'
import { useCompletarSdA } from '@renderer/hooks/useCompletarSdA'
import { Header } from '@renderer/components/layout/Header'
import { Sidebar } from '@renderer/components/layout/Sidebar'
import { ToastContainer, type ToastMessage, type ToastType } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import type { SdA } from '@renderer/types'
import { parseSdAFromJSON } from '@renderer/utils/validateSda'
import { getSectionComplete } from '@renderer/utils/sdaProgress'
import { sdaToPlainText } from '@renderer/utils/sdaToText'

const AUTOSAVE_DELAY = 30_000
const DISK_AUTOSAVE_DELAY = 5 * 60_000

import { lazy, Suspense } from 'react'

const S01Identificacion = lazy(() => import('@renderer/components/sections/S01Identificacion').then(m => ({ default: m.S01Identificacion })))
const S02Justificacion = lazy(() => import('@renderer/components/sections/S02Justificacion').then(m => ({ default: m.S02Justificacion })))
const S03Reto = lazy(() => import('@renderer/components/sections/S03Reto').then(m => ({ default: m.S03Reto })))
const S04VinculacionCurricular = lazy(() => import('@renderer/components/sections/S04VinculacionCurricular').then(m => ({ default: m.S04VinculacionCurricular })))
const S05Metodologia = lazy(() => import('@renderer/components/sections/S05Metodologia').then(m => ({ default: m.S05Metodologia })))
const S06SecuenciaDidactica = lazy(() => import('@renderer/components/sections/S06SecuenciaDidactica').then(m => ({ default: m.S06SecuenciaDidactica })))
const S07Evaluacion = lazy(() => import('@renderer/components/sections/S07Evaluacion').then(m => ({ default: m.S07Evaluacion })))
const S08DUA = lazy(() => import('@renderer/components/sections/S08DUA').then(m => ({ default: m.S08DUA })))
const S09Interdisciplinariedad = lazy(() => import('@renderer/components/sections/S09Interdisciplinariedad').then(m => ({ default: m.S09Interdisciplinariedad })))
const S10ODS = lazy(() => import('@renderer/components/sections/S10ODS').then(m => ({ default: m.S10ODS })))
const S11CuadernoTrabajo = lazy(() => import('@renderer/components/sections/S11CuadernoTrabajo').then(m => ({ default: m.S11CuadernoTrabajo })))

import { PrintView } from '@renderer/components/print/PrintView'
import { CuadernoView } from '@renderer/components/print/CuadernoView'
import { PDFPreviewModal } from '@renderer/components/pdf/PDFPreviewModal'
import { GestionDecretosModal } from '@renderer/components/settings/GestionDecretosModal'
import { AIConfigModal } from '@renderer/components/settings/AIConfigModal'
import { WelcomeScreen } from '@renderer/components/WelcomeScreen'
import { OnboardingModal } from '@renderer/components/OnboardingModal'
import { TemplatesModal } from '@renderer/components/TemplatesModal'
import { KeyboardShortcutsModal } from '@renderer/components/KeyboardShortcutsModal'
import { StatsModal } from '@renderer/components/StatsModal'
import { ReadOnlyModal } from '@renderer/components/ReadOnlyModal'
import { SnapshotsModal } from '@renderer/components/SnapshotsModal'
import { PresentationModal } from '@renderer/components/PresentationModal'
import { applyTheme, loadSavedTheme } from '@renderer/utils/themes'
import { NewSdAWizard } from '@renderer/components/NewSdAWizard'
import { GlobalSearchModal } from '@renderer/components/GlobalSearchModal'
import { SectionNotesPanel } from '@renderer/components/SectionNotesPanel'
import { ExportSectionsModal } from '@renderer/components/export/ExportSectionsModal'
import { SectionHintBanner } from '@renderer/components/SectionHintBanner'
import { SectionAIPanel } from '@renderer/components/SectionAIPanel'
import { ExportChecklistModal } from '@renderer/components/ExportChecklistModal'
import { SaveTemplateModal } from '@renderer/components/SaveTemplateModal'
import { TourOverlay } from '@renderer/components/TourOverlay'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { useAppModals } from '@renderer/hooks/useAppModals'
import { useFileOperations } from '@renderer/hooks/useFileOperations'
import { useExportOperations } from '@renderer/hooks/useExportOperations'
import { SDA_INICIAL } from '@renderer/types'

function SectionDot({ complete }: { complete: boolean }): React.ReactElement {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${complete ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
      title={complete ? 'Sección completada' : 'Sección incompleta'}
    />
  )
}

const SECTIONS = [
  { label: 'Identificación',        Component: S01Identificacion },
  { label: 'Justificación',         Component: S02Justificacion },
  { label: 'Reto / Producto Final', Component: S03Reto },
  { label: 'Vinculación Curricular',Component: S04VinculacionCurricular },
  { label: 'Metodología',           Component: S05Metodologia },
  { label: 'Secuencia Didáctica',   Component: S06SecuenciaDidactica },
  { label: 'Evaluación',            Component: S07Evaluacion },
  { label: 'Atención a la Diversidad', Component: S08DUA },
  { label: 'Interdisciplinariedad', Component: S09Interdisciplinariedad },
  { label: 'ODS',                   Component: S10ODS },
  { label: 'Cuaderno de Trabajo',   Component: S11CuadernoTrabajo },
]

export default function App(): React.ReactElement {
  const { activeSection, setActiveSection, sda, filePath, isDirty, cargar, duplicar, setDirty, setLastSaved, undo, redo } =
    useSdAStore()

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  const [showWelcome, setShowWelcome] = useState(() => !sda.titulo)
  const { m, openers, closers, open: openModal, close: closeModal, toggle: toggleModal } = useAppModals()
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const toastCounterRef = useRef(0)

  // Auto-guardado
  const [restoreData, setRestoreData] = useState<{ sda: SdA; savedAt: string } | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const diskSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const removeToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((text: string, type: ToastType = 'info', duration = 4000): void => {
    const id = String(++toastCounterRef.current)
    // Máximo 4 toasts visibles: los más antiguos se descartan para no tapar la UI
    setToasts((prev) => [...prev, { id, type, text }].slice(-4))
    setTimeout(() => removeToast(id), duration)
  }, [removeToast])

  // Startup: check native backup, then (if none) auto-reopen last file
  useEffect(() => {
    if (!window.api || !showWelcome) return
    let active = true
    void (async () => {
      try {
        // 1. Check for native backup
        const raw = await window.api.cargarBackup()
        if (!active) return
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { sda: SdA; savedAt: string }
            const ageMs = Date.now() - new Date(parsed.savedAt).getTime()
            if (ageMs > 7 * 24 * 60 * 60 * 1000) {
              await window.api.eliminarBackup()
            } else if (parsed.sda?.titulo || (parsed.sda?.sesiones?.length ?? 0) > 0) {
              setRestoreData(parsed)
              return
            }
          } catch (err) {
            console.error('[App] Error parsing backup:', err)
          }
        }

        // 2. No backup — auto-reopen last file
        const recents = await window.api.getRecentFiles()
        if (!active || !recents?.length) return
        const last = recents[0] as { filePath: string; titulo: string }
        const content = await window.api.leerArchivoPorRuta(last.filePath)
        if (!active) return
        const sdaLoaded = parseSdAFromJSON(content)
        cargar(sdaLoaded, last.filePath)
        setShowWelcome(false)
        addToast(`Reabierto: "${sdaLoaded.titulo || last.titulo || 'Sin título'}"`, 'success', 3000)
      } catch (err) {
        console.error('[App] Error during startup load:', err)
      }
    })()
    return () => { active = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  // Color theme — apply saved theme on mount
  useEffect(() => {
    applyTheme(loadSavedTheme())
  }, [])

  // Auto-guardar backup nativo 30 s después del último cambio
  useEffect(() => {
    if (!isDirty || !window.api) return
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      const data = JSON.stringify({ sda, savedAt: new Date().toISOString() })
      void window.api.guardarBackup(data)
        .then(() => addToast('Copia de seguridad guardada', 'info', 2000))
        .catch(() => addToast('No se pudo guardar la copia de seguridad', 'warning'))
    }, AUTOSAVE_DELAY)
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    }
  }, [sda, isDirty, addToast])

  // Auto-guardar en disco cada 5 min cuando ya existe filePath
  useEffect(() => {
    if (!isDirty || !filePath || !window.api) return
    if (diskSaveTimer.current) clearTimeout(diskSaveTimer.current)
    diskSaveTimer.current = setTimeout(async () => {
      try {
        await window.api.guardarArchivo(JSON.stringify(sda, null, 2), filePath)
        setDirty(false)
        setLastSaved(new Date().toISOString())
        void window.api.eliminarBackup()
      } catch { /* fallo silencioso — el usuario puede guardar manualmente */ }
    }, DISK_AUTOSAVE_DELAY)
    return () => {
      if (diskSaveTimer.current) clearTimeout(diskSaveTimer.current)
    }
  }, [sda, isDirty, filePath, setDirty, setLastSaved])

  // Update window title
  useEffect(() => {
    const name = sda.titulo || 'Sin título'
    const dirty = isDirty ? '● ' : ''
    const title = `${dirty}${name} — SdA Creator`
    document.title = title
    window.api?.setTitle(title)
  }, [sda.titulo, isDirty])

  const { handleGuardar, handleGuardarComo, handleAbrir, handleAbrirReciente, handleCompartir, handleSaveAndClose } =
    useFileOperations(addToast, setShowWelcome)

  const {
    printTemplate, setPrintTemplate,
    showExportChecklist, setShowExportChecklist,
    showExportModal, setShowExportModal,
    selectedExportSections,
    doExportarPdf, handleExportarPdf, handleExportarDocx, onConfirmExport
  } = useExportOperations(addToast, () => openModal('pdfPreview'))

  function handleRestoreBackup(): void {
    if (!restoreData) return
    try {
      const validated = parseSdAFromJSON(JSON.stringify(restoreData.sda))
      cargar(validated, '')
    } catch {
      cargar(restoreData.sda, '')
    }
    setRestoreData(null)
    setShowWelcome(false)
    addToast('Sesión restaurada desde el backup automático', 'success')
  }

  function handleDiscardBackup(): void {
    void window.api?.eliminarBackup()
    setRestoreData(null)
  }


  const handleAbrirWizard = useCallback(async () => {
    if (isDirty && window.api) {
      const ok = await window.api.confirmar(
        'Hay cambios sin guardar. ¿Deseas crear una nueva SdA y perder los cambios?'
      )
      if (!ok) return
    }
    openModal('wizard')
  }, [isDirty, openModal])

  const handleUsarPlantilla = useCallback((partial: Partial<SdA>) => {
    const now = new Date().toISOString()
    const sdaCompleta = {
      ...SDA_INICIAL,
      ...partial,
      id: crypto.randomUUID(),
      fechaCreacion: now,
      fechaModificacion: now
    }
    cargar(sdaCompleta, '')
    setShowWelcome(false)
    closeModal('templates')
    addToast(`Plantilla "${partial.titulo ?? ''}" cargada. Puedes editar todos los campos.`, 'success')
  }, [cargar, closeModal, addToast])

  const handleDuplicar = useCallback(() => {
    duplicar()
    setShowWelcome(false)
    addToast('SdA duplicada — ya puedes editarla', 'success')
  }, [duplicar, addToast])

  const handleSaveAndCloseWithModal = useCallback(async () => {
    closeModal('closeConfirm')
    await handleSaveAndClose()
  }, [closeModal, handleSaveAndClose])

  const handleCopiarPortapapeles = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(sdaToPlainText(sda))
      addToast('SdA copiada al portapapeles como texto', 'success')
    } catch (err) {
      console.error('[App] Clipboard write failed:', err)
      addToast('No se pudo acceder al portapapeles', 'error')
    }
  }, [sda, addToast])


  // Keyboard shortcuts
  useEffect(() => {
    function isEditingText(): boolean {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable
    }

    function onKeyDown(e: KeyboardEvent): void {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleGuardar()
            break
          case 'o':
            e.preventDefault()
            handleAbrir()
            break
          case 'n':
            e.preventDefault()
            void handleAbrirWizard()
            break
          case 'p':
            e.preventDefault()
            handleExportarPdf()
            break
          case 'f':
            e.preventDefault()
            openModal('search')
            break
          case 'z':
            if (!isEditingText()) {
              e.preventDefault()
              if (e.shiftKey) redo()
              else undo()
            }
            break
          case 'y':
            if (!isEditingText()) {
              e.preventDefault()
              redo()
            }
            break
          case 'c':
            if (e.shiftKey && !isEditingText()) {
              e.preventDefault()
              handleCopiarPortapapeles()
            }
            break
        }
      } else if (e.key === '?' && !isEditingText()) {
        openModal('shortcuts')
      } else if (e.altKey && !e.ctrlKey && !e.metaKey && !isEditingText()) {
        const num = parseInt(e.key, 10)
        if (!isNaN(num)) {
          const target = num === 0 ? 9 : num - 1
          if (target >= 0 && target < 10) {
            e.preventDefault()
            setActiveSection(target)
          }
        } else if (e.key === 'n') {
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('sda-notes-toggle'))
        } else if (e.key === 'c') {
          // Alt+C — Cuaderno de Trabajo (sección 11)
          e.preventDefault()
          setActiveSection(10)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleGuardar, handleAbrir, handleAbrirWizard, handleExportarPdf, handleCopiarPortapapeles, undo, redo, openModal, setActiveSection])

  // Toast cuando una sección se completa — agregando ráfagas (p. ej. al cargar
  // una plantilla se completan 8 secciones a la vez: un único toast resumen)
  const completeBufferRef = useRef<string[]>([])
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    function onComplete(e: Event): void {
      const label = (e as CustomEvent<{ sectionLabel: string }>).detail.sectionLabel
      completeBufferRef.current.push(label)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
      completeTimerRef.current = setTimeout(() => {
        const labels = completeBufferRef.current
        completeBufferRef.current = []
        if (labels.length === 1) {
          addToast(`Sección completada: ${labels[0]}`, 'success', 2500)
        } else if (labels.length > 1) {
          addToast(`${labels.length} secciones completadas ✓`, 'success', 3000)
        }
      }, 500)
    }
    window.addEventListener('sda-section-complete', onComplete)
    return () => {
      window.removeEventListener('sda-section-complete', onComplete)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    }
  }, [addToast])

  // Flash del campo encontrado en la búsqueda global
  useEffect(() => {
    function onSearchJump(e: Event): void {
      const { fieldLabel } = (e as CustomEvent<{ fieldLabel: string }>).detail
      setTimeout(() => {
        const term = fieldLabel.includes('—')
          ? (fieldLabel.split('—').pop()?.trim() ?? fieldLabel)
          : fieldLabel
        const labels = Array.from(document.querySelectorAll<HTMLElement>('label'))
        const found = labels.find((el) =>
          el.textContent?.toLowerCase().includes(term.toLowerCase())
        )
        if (!found) return
        found.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const container = (found.closest('.flex.flex-col') ?? found.parentElement) as HTMLElement | null
        if (container) {
          container.classList.add('sda-search-flash')
          setTimeout(() => container.classList.remove('sda-search-flash'), 2500)
        }
      }, 400)
    }
    window.addEventListener('sda-search-jump', onSearchJump)
    return () => window.removeEventListener('sda-search-jump', onSearchJump)
  }, [])

  // Interceptar cierre de ventana para evitar pérdida de datos
  useIpcListener('window:close-requested', () => {
    if (isDirty) {
      openModal('closeConfirm')
      return
    }
    window.api.confirmClose()
  })

  // Eventos del menú nativo de Electron
  useIpcListener('menu:nueva', handleAbrirWizard)
  useIpcListener('menu:abrir', handleAbrir)
  useIpcListener('menu:guardar', handleGuardar)
  useIpcListener('menu:guardar-como', handleGuardarComo)
  useIpcListener('menu:exportar-pdf', handleExportarPdf)

  const { completar, completarSeccion, tieneTareasSeccion, generando: completandoSdA, progreso: progresoSdA, errores: erroresCompletarSdA, completado: sdaCompletada, reset: resetCompletar } = useCompletarSdA()

  async function handleCompletarSdA(): Promise<void> {
    resetCompletar()
    await completar()
  }

  // Stable callbacks para Header (evitan invalidar React.memo en cada render)
  const handleToggleDark          = useCallback(() => setDarkMode((d) => !d), [])
  const handleNueva               = useCallback(() => openModal('onboarding'), [openModal])
  const handleToggleFocus         = useCallback(() => toggleModal('focusMode'), [toggleModal])
  const handleShowGestionDecretos = openers.gestionDecretos
  const handleShowAIConfig        = openers.aiConfig
  const handleShowShortcuts       = openers.shortcuts
  const handleShowStats           = openers.stats
  const handleShowReadOnly        = openers.readOnly
  const handleShowSnapshots       = openers.snapshots
  const handleShowPresentation    = openers.presentation
  const handleShowSaveTemplate    = openers.saveTemplate

  const { Component: ActiveSection } = SECTIONS[activeSection] ?? SECTIONS[0]
  const hasPrev = activeSection > 0
  const hasNext = activeSection < SECTIONS.length - 1
  const canAdvance = activeSection !== 0 || (!!sda.titulo && !!sda.ciclo && !!sda.ambito)

  return (
    <>
    <div id="app-shell" className={`flex h-screen flex-col overflow-hidden ${darkMode ? 'dark' : ''}`}>
      <Header
        darkMode={darkMode}
        onToggleDark={handleToggleDark}
        onNueva={handleNueva}
        onDuplicar={handleDuplicar}
        onAbrir={handleAbrir}
        onGuardar={handleGuardar}
        onCompartir={handleCompartir}
        onExportarPdf={handleExportarPdf}
        onExportarDocx={handleExportarDocx}
        onGestionDecretos={handleShowGestionDecretos}
        onAIConfig={handleShowAIConfig}
        onAtajos={handleShowShortcuts}
        onStats={handleShowStats}
        onCompletarSdA={handleCompletarSdA}
        completandoSdA={completandoSdA}
        progresoSdA={progresoSdA}
        focusMode={m.focusMode}
        onToggleFocus={handleToggleFocus}
        onReadOnly={handleShowReadOnly}
        onSnapshots={handleShowSnapshots}
        onPresentation={handleShowPresentation}
        onGuardarComoPlantilla={handleShowSaveTemplate}
      />

      {/* Banner de restauración de backup */}
      {restoreData && (
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-amber-200 bg-amber-50 px-5 py-2.5 dark:border-amber-800 dark:bg-amber-900/30">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <RotateCcw size={14} className="shrink-0" />
            <span>
              Hay una sesión sin guardar del{' '}
              <strong>
                {new Date(restoreData.savedAt).toLocaleString('es-ES', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </strong>
              {restoreData.sda.titulo ? ` — "${restoreData.sda.titulo}"` : ''}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleRestoreBackup}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Restaurar
            </button>
            <button
              onClick={handleDiscardBackup}
              className="rounded-md p-1 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className={`h-full transition-all duration-300 ${m.focusMode ? 'w-0 overflow-hidden opacity-0' : ''}`}>
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-premium bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
          {showWelcome ? (
            <WelcomeScreen
              onNueva={() => openModal('wizard')}
              onAbrir={handleAbrir}
              onAbrirReciente={handleAbrirReciente}
              onDesdePlantilla={() => openModal('templates')}
            />
          ) : (
          <div className="mx-auto max-w-5xl px-8 py-12">
            <SectionHintBanner sectionIndex={activeSection} />
            {/* Completar sección con IA — solo cuando hay campos vacíos generables */}
            {tieneTareasSeccion(activeSection) && !completandoSdA && (
              <div className="mx-4 mt-2 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800/40 dark:bg-amber-900/20">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Esta sección tiene campos vacíos que la IA puede completar automáticamente.
                </p>
                <button
                  onClick={() => completarSeccion(activeSection)}
                  className="ml-4 flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  <Loader2 size={12} className="hidden" />
                  ⚡ Completar sección
                </button>
              </div>
            )}
            {completandoSdA && progresoSdA && tieneTareasSeccion !== undefined && (
              <div className="mx-4 mt-2 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 dark:border-violet-800/40 dark:bg-violet-900/20">
                <Loader2 size={13} className="animate-spin text-violet-500" />
                <p className="text-xs text-violet-700 dark:text-violet-300">{progresoSdA}</p>
              </div>
            )}
            {/* Botón flotante Asistente IA */}
            <button
              data-tour="asistente-ia"
              onClick={() => toggleModal('aiPanel')}
              className={`fixed bottom-6 z-30 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-200 ${m.aiPanel ? 'right-[436px] bg-ai-700' : 'right-6 bg-ai-600 hover:bg-ai-700 hover:scale-105'}`}
              title="Asistente IA para esta sección"
            >
              <BrainCircuit size={18} />
              <span>{m.aiPanel ? 'Cerrar asistente' : 'Asistente IA'}</span>
            </button>
            <div key={activeSection} className="section-animate">
              <ErrorBoundary fallbackLabel={SECTIONS[activeSection].label}>
                <Suspense fallback={
                  <div className="flex h-64 flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
                    <p className="text-xs text-slate-400">Cargando sección…</p>
                  </div>
                }>
                  <ActiveSection />
                </Suspense>
              </ErrorBoundary>
              <SectionNotesPanel sdaId={sda.id} sectionIndex={activeSection} />
            </div>

            {/* Navegación Anterior / Siguiente */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700/60">
              {hasPrev ? (
                <button
                  onClick={() => setActiveSection(activeSection - 1)}
                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-primary-300 hover:text-primary-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-600 dark:hover:text-primary-400"
                >
                  <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                  <span>
                    <span className="block text-[10px] font-normal uppercase tracking-wider text-slate-400 dark:text-slate-500">Anterior</span>
                    <span className="flex items-center gap-1.5">
                      {SECTIONS[activeSection - 1].label}
                      <SectionDot complete={getSectionComplete(sda, activeSection - 1)} />
                    </span>
                  </span>
                </button>
              ) : (
                <div />
              )}

              {hasNext && (
                <button
                  onClick={() => {
                    if (!canAdvance) {
                      addToast('Completa los campos obligatorios: Título, Ciclo y Área', 'warning')
                      window.dispatchEvent(new CustomEvent('s01-validate'))
                      return
                    }
                    setActiveSection(activeSection + 1)
                  }}
                  className={`group flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 shadow-sm transition-all hover:bg-primary-100 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 ${!canAdvance ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  <span className="text-right">
                    <span className="block text-[10px] font-normal uppercase tracking-wider text-primary-400 dark:text-primary-500">Siguiente</span>
                    <span className="flex items-center justify-end gap-1.5">
                      {SECTIONS[activeSection + 1].label}
                      <SectionDot complete={getSectionComplete(sda, activeSection + 1)} />
                    </span>
                  </span>
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
    <PrintView template={printTemplate} selectedSections={selectedExportSections} />
    <CuadernoView />
    <PDFPreviewModal
      isOpen={m.pdfPreview}
      onClose={closers.pdfPreview}
      onExport={doExportarPdf}
      template={printTemplate}
      onTemplateChange={(t) => { setPrintTemplate(t); localStorage.setItem('print-template', t) }}
      selectedSections={selectedExportSections}
    />
    <ExportChecklistModal
      isOpen={showExportChecklist !== null}
      format={showExportChecklist ?? 'pdf'}
      onClose={() => setShowExportChecklist(null)}
      onConfirm={() => { setShowExportModal(showExportChecklist); setShowExportChecklist(null) }}
    />
    <ExportSectionsModal
      isOpen={showExportModal !== null}
      format={showExportModal ?? 'pdf'}
      onClose={() => setShowExportModal(null)}
      onConfirm={onConfirmExport}
    />
    <GestionDecretosModal
      isOpen={m.gestionDecretos}
      onClose={closers.gestionDecretos}
    />
    <AIConfigModal
      isOpen={m.aiConfig}
      onClose={closers.aiConfig}
    />
    <OnboardingModal
      isOpen={m.onboarding}
      hasExisting={!!sda.titulo}
      onClose={closers.onboarding}
      onNueva={() => { closeModal('onboarding'); openModal('wizard') }}
      onDesdePlantilla={() => { closeModal('onboarding'); openModal('templates') }}
      onAbrir={() => { closeModal('onboarding'); handleAbrir() }}
    />
    <NewSdAWizard
      isOpen={m.wizard}
      onClose={closers.wizard}
      onComplete={() => { closeModal('wizard'); setShowWelcome(false) }}
    />
    <TemplatesModal
      isOpen={m.templates}
      onClose={closers.templates}
      onSelect={handleUsarPlantilla}
      onGuardarPlantilla={() => { closeModal('templates'); openModal('saveTemplate') }}
    />
    <KeyboardShortcutsModal
      isOpen={m.shortcuts}
      onClose={closers.shortcuts}
    />
    <GlobalSearchModal
      isOpen={m.search}
      onClose={closers.search}
      onNavigate={(i) => { setActiveSection(i); setShowWelcome(false) }}
    />
    <StatsModal
      isOpen={m.stats}
      onClose={closers.stats}
    />
    <ReadOnlyModal
      isOpen={m.readOnly}
      onClose={closers.readOnly}
      onExportarPdf={() => { closeModal('readOnly'); handleExportarPdf() }}
    />
    <SnapshotsModal
      isOpen={m.snapshots}
      onClose={closers.snapshots}
      onRestored={(msg) => { addToast(msg, 'success'); setShowWelcome(false) }}
    />
    <PresentationModal
      isOpen={m.presentation}
      onClose={closers.presentation}
    />
    <SectionAIPanel
      key={`${sda.id}-${activeSection}`}
      isOpen={m.aiPanel}
      onClose={closers.aiPanel}
      sectionIndex={activeSection}
      onOpenAIConfig={() => openModal('aiConfig')}
    />
    <SaveTemplateModal
      isOpen={m.saveTemplate}
      onClose={closers.saveTemplate}
      onSaved={() => addToast('Plantilla guardada — accede desde Plantillas → Mis plantillas', 'success')}
    />

    {/* Tour de primera vez */}
    {m.tour && !showWelcome && <TourOverlay onDone={closers.tour} />}

    {/* Diálogo de cierre con cambios pendientes */}
    {m.closeConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Cambios sin guardar</h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              ¿Qué deseas hacer con los cambios pendientes?
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={handleSaveAndCloseWithModal}
                className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Guardar y cerrar
              </button>
              <button
                onClick={() => { closeModal('closeConfirm'); window.api.confirmClose() }}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                Salir sin guardar
              </button>
              <button
                onClick={closers.closeConfirm}
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Overlay progreso "Completar SdA con IA" */}
    {(completandoSdA || sdaCompletada) && (
      <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-3 p-4">
          {completandoSdA ? (
            <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin text-amber-500" />
          ) : erroresCompletarSdA.length > 0 ? (
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {completandoSdA ? 'Completando SdA con IA…' : 'SdA completada con IA'}
            </p>
            {completandoSdA && progresoSdA && (
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{progresoSdA}</p>
            )}
            {!completandoSdA && erroresCompletarSdA.length > 0 && (
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                No se generaron: {erroresCompletarSdA.join(', ')}
              </p>
            )}
            {!completandoSdA && erroresCompletarSdA.length === 0 && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Todas las secciones vacías han sido rellenadas.</p>
            )}
          </div>
          {!completandoSdA && (
            <button onClick={resetCompletar} className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    )}
    </>
  )
}
