import { useState, useCallback } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import type { SdA } from '@renderer/types'
import type { PrintTemplate } from '@renderer/components/print/PrintView'
import type { ToastType } from '@renderer/components/ui'

type AddToast = (text: string, type?: ToastType, duration?: number) => void

const VALID_PRINT_TEMPLATES: PrintTemplate[] = ['institucional', 'verde', 'gris', 'ambar']

export function useExportOperations(addToast: AddToast, openPdfPreview: () => void) {
  const { sda } = useSdAStore()

  const [printTemplate, setPrintTemplateState] = useState<PrintTemplate>(() => {
    const saved = localStorage.getItem('print-template')
    return VALID_PRINT_TEMPLATES.includes(saved as PrintTemplate) ? (saved as PrintTemplate) : 'institucional'
  })

  const [showExportChecklist, setShowExportChecklist] = useState<'pdf' | 'docx' | null>(null)
  const [showExportModal, setShowExportModal] = useState<'pdf' | 'docx' | null>(null)
  const [selectedExportSections, setSelectedExportSections] = useState<Record<string, boolean>>({})

  const setPrintTemplate = useCallback((t: PrintTemplate) => {
    setPrintTemplateState(t)
    localStorage.setItem('print-template', t)
  }, [])

  const doExportarPdf = useCallback(async () => {
    if (!window.api?.exportarPDF) { window.print(); return }
    document.body.classList.add('pdf-export-mode')
    try {
      const path = await window.api.exportarPDF({ centro: sda.centro, logoUrl: sda.logoCentro, titulo: sda.titulo })
      if (path) addToast('PDF exportado correctamente', 'success')
      else addToast('Exportación cancelada', 'info')
    } catch (err) {
      console.error('[Export] PDF export failed:', err)
      addToast('Error al exportar el PDF', 'error')
    } finally {
      document.body.classList.remove('pdf-export-mode')
    }
  }, [sda.centro, sda.logoCentro, sda.titulo, addToast])

  const handleExportarPdf = useCallback(() => setShowExportChecklist('pdf'), [])
  const handleExportarDocx = useCallback(() => setShowExportChecklist('docx'), [])

  const onConfirmExport = useCallback(async (sections: Record<string, boolean>) => {
    setSelectedExportSections(sections)
    const format = showExportModal
    setShowExportModal(null)

    if (format === 'pdf') {
      openPdfPreview()
    } else if (format === 'docx') {
      try {
        const sdaClone = JSON.parse(JSON.stringify(sda)) as SdA
        if (!sections['S01']) {
          sdaClone.titulo = ''; sdaClone.ciclo = ''; sdaClone.ambito = ''; sdaClone.areas = []
          sdaClone.curso = ''; sdaClone.numSesiones = 0; sdaClone.temporalizacion = ''
          sdaClone.docente = ''; sdaClone.centro = ''
        }
        if (!sections['S02']) { sdaClone.justificacion = ''; sdaClone.contexto = '' }
        if (!sections['S03']) { sdaClone.situacionProblema = ''; sdaClone.productoFinal = ''; sdaClone.hilo = '' }
        if (!sections['S04']) { sdaClone.competenciasClave = []; sdaClone.elementosCurriculares = [] }
        if (!sections['S05']) {
          sdaClone.planteamientoMetodologico = ''; sdaClone.agrupamientos = []
          sdaClone.espacios = []; sdaClone.recursos = ''; sdaClone.tiempos = ''
        }
        if (!sections['S06']) { sdaClone.sesiones = [] }
        if (!sections['S07']) {
          sdaClone.criteriosCalificacion = ''; sdaClone.momentosEvaluacion = []
          sdaClone.instrumentosEvaluacion = []; sdaClone.rubricaTabla = []; sdaClone.rubrica = ''
        }
        if (!sections['S08']) { sdaClone.duaImplicacion = ''; sdaClone.duaRepresentacion = ''; sdaClone.duaAccionExpresion = '' }
        if (!sections['S09']) { sdaClone.conexiones = []; sdaClone.transversales = '' }
        if (!sections['S10']) { sdaClone.ods = []; sdaClone.justificacionOds = '' }
        if (!sections['S11']) { sdaClone.cuaderno = undefined }

        const path = await window.api!.exportarDocx(sdaClone)
        if (path) addToast('Documento Word exportado correctamente', 'success')
        else addToast('Exportación cancelada', 'info')
      } catch (err) {
        console.error('[Export] DOCX export failed:', err)
        addToast('Error al exportar el documento Word', 'error')
      }
    }
  }, [showExportModal, sda, openPdfPreview, addToast])

  return {
    printTemplate, setPrintTemplate,
    showExportChecklist, setShowExportChecklist,
    showExportModal, setShowExportModal,
    selectedExportSections,
    doExportarPdf, handleExportarPdf, handleExportarDocx, onConfirmExport
  }
}
