import { useMemo } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { stripHtml } from '@renderer/utils/stripHtml'

export type WarningSeverity = 'warning' | 'info'

export interface CoherenceWarning {
  id: string
  sectionIndex: number
  sectionLabel: string
  message: string
  severity: WarningSeverity
}

export function useCoherenceWarnings(): CoherenceWarning[] {
  const { sda } = useSdAStore()

  return useMemo(() => {
    if (!sda.titulo) return []

    const w: CoherenceWarning[] = []

    // S01 vs S06: número de sesiones declarado ≠ sesiones reales
    if (sda.numSesiones > 0 && sda.sesiones.length > 0 && sda.numSesiones !== sda.sesiones.length) {
      w.push({
        id: 'sessions-mismatch',
        sectionIndex: 0,
        sectionLabel: 'Identificación / Secuencia Didáctica',
        message: `Nº de sesiones declarado (${sda.numSesiones}) no coincide con las sesiones diseñadas (${sda.sesiones.length}).`,
        severity: 'warning'
      })
    }

    // numSesiones no definido pero ya hay sesiones
    if (!sda.numSesiones && sda.sesiones.length > 0) {
      w.push({
        id: 'num-sesiones-vacio',
        sectionIndex: 0,
        sectionLabel: 'Identificación',
        message: `Hay ${sda.sesiones.length} sesiones diseñadas pero el campo "Nº de sesiones" está vacío.`,
        severity: 'info'
      })
    }

    // S04: sin competencias clave
    if (sda.competenciasClave.length === 0) {
      w.push({
        id: 'no-competencias-clave',
        sectionIndex: 3,
        sectionLabel: 'Vinculación Curricular',
        message: 'No se han seleccionado competencias clave.',
        severity: 'info'
      })
    }

    // S04: elementos curriculares sin criterios de evaluación
    const elemsSinCriterios = sda.elementosCurriculares.filter((ec) => ec.criterios.length === 0)
    if (elemsSinCriterios.length > 0) {
      w.push({
        id: 'elems-sin-criterios',
        sectionIndex: 3,
        sectionLabel: 'Vinculación Curricular',
        message: `${elemsSinCriterios.length} elemento${elemsSinCriterios.length > 1 ? 's' : ''} curricular${elemsSinCriterios.length > 1 ? 'es' : ''} sin criterios de evaluación asignados.`,
        severity: 'warning'
      })
    }

    // S07: rúbrica seleccionada pero sin contenido
    if (
      sda.instrumentosEvaluacion.includes('Rúbrica') &&
      (sda.rubricaTabla ?? []).length === 0 &&
      !stripHtml(sda.rubrica ?? '').trim()
    ) {
      w.push({
        id: 'rubrica-vacia',
        sectionIndex: 6,
        sectionLabel: 'Evaluación',
        message: '"Rúbrica" seleccionada como instrumento pero no hay rúbrica definida.',
        severity: 'warning'
      })
    }

    // S10: ODS seleccionados sin justificación
    if (sda.ods.length > 0 && !stripHtml(sda.justificacionOds ?? '').trim()) {
      w.push({
        id: 'ods-sin-justificacion',
        sectionIndex: 9,
        sectionLabel: 'ODS',
        message: `${sda.ods.length} ODS seleccionado${sda.ods.length > 1 ? 's' : ''} sin justificación redactada.`,
        severity: 'info'
      })
    }

    // S09: conexiones interdisciplinares sin descripción
    const conexionesSinDesc = sda.conexiones.filter((c) => !c.descripcion.trim())
    if (conexionesSinDesc.length > 0) {
      w.push({
        id: 'conexiones-sin-desc',
        sectionIndex: 8,
        sectionLabel: 'Interdisciplinariedad',
        message: `${conexionesSinDesc.length} conexión${conexionesSinDesc.length > 1 ? 'es' : ''} interdisciplinar${conexionesSinDesc.length > 1 ? 'es' : ''} sin descripción.`,
        severity: 'info'
      })
    }

    return w
  }, [sda])
}
