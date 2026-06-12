import type { SdA, Ciclo } from '@renderer/types'
import { CICLO_LABELS } from '@renderer/types'
import { stripHtml } from './stripHtml'

function section(title: string, content: string): string[] {
  if (!content.trim()) return []
  return [`\n${title.toUpperCase()}`, '─'.repeat(title.length), content.trim(), '']
}

function richSection(title: string, html: string): string[] {
  return section(title, stripHtml(html))
}

export function sdaToPlainText(sda: SdA): string {
  const lines: string[] = []

  const heading = `SITUACIÓN DE APRENDIZAJE: ${sda.titulo || '(Sin título)'}`
  lines.push(heading, '='.repeat(heading.length), '')

  if (sda.ciclo) lines.push(`Ciclo: ${CICLO_LABELS[sda.ciclo as Ciclo] ?? sda.ciclo}`)
  if (sda.ambito) lines.push(`Ámbito: ${sda.ambito}`)
  if (sda.areas.length) lines.push(`Áreas: ${sda.areas.join(', ')}`)
  if (sda.curso) lines.push(`Curso: ${sda.curso}`)
  if (sda.numSesiones) lines.push(`Nº sesiones: ${sda.numSesiones}`)
  if (sda.temporalizacion) lines.push(`Temporalización: ${sda.temporalizacion}`)
  if (sda.docente) lines.push(`Docente: ${sda.docente}`)
  if (sda.centro) lines.push(`Centro: ${sda.centro}`)

  lines.push(...richSection('Justificación', sda.justificacion))
  lines.push(...richSection('Contextualización', sda.contexto))
  lines.push(...richSection('Situación problema / Reto', sda.situacionProblema))
  lines.push(...richSection('Producto final', sda.productoFinal))
  lines.push(...section('Hilo conductor', sda.hilo))

  if (sda.competenciasClave.length) {
    lines.push('\nCOMPETENCIAS CLAVE', '─'.repeat(18))
    sda.competenciasClave.forEach((cc) => lines.push(`· ${cc}`))
    lines.push('')
  }

  if (sda.elementosCurriculares.length) {
    lines.push('\nELEMENTOS CURRICULARES', '─'.repeat(22))
    sda.elementosCurriculares.forEach((ec) => {
      lines.push(`[${ec.ambito}] ${ec.area} — ${ec.ce}`)
      if (ec.criterios.length) lines.push(`  Criterios: ${ec.criterios.join(', ')}`)
    })
    lines.push('')
  }

  lines.push(...richSection('Planteamiento metodológico', sda.planteamientoMetodologico))
  if (sda.agrupamientos.length) lines.push(`Agrupamientos: ${sda.agrupamientos.join(', ')}`)
  if (sda.recursos) lines.push(`Recursos: ${sda.recursos}`)
  if (sda.tiempos) lines.push(`Tiempos: ${sda.tiempos}`)

  if (sda.sesiones.length) {
    lines.push('\nSECUENCIA DIDÁCTICA', '─'.repeat(19))
    sda.sesiones.forEach((s) => {
      lines.push(`\nSesión ${s.numero}: ${s.titulo || '(sin título)'}`)
      if (s.duracion) lines.push(`  Duración: ${s.duracion}`)
      if (s.agrupamiento) lines.push(`  Agrupamiento: ${s.agrupamiento}`)
      if (s.inicio) lines.push(`  Inicio: ${stripHtml(s.inicio)}`)
      if (s.desarrollo) lines.push(`  Desarrollo: ${stripHtml(s.desarrollo)}`)
      if (s.cierre) lines.push(`  Cierre: ${stripHtml(s.cierre)}`)
      if (s.recursos) lines.push(`  Recursos: ${s.recursos}`)
    })
    lines.push('')
  }

  lines.push(...section('Criterios de calificación', sda.criteriosCalificacion))
  if (sda.instrumentosEvaluacion.length) lines.push(`Instrumentos de evaluación: ${sda.instrumentosEvaluacion.join(', ')}`)

  lines.push(...richSection('DUA — Implicación y motivación', sda.duaImplicacion))
  lines.push(...richSection('DUA — Representación', sda.duaRepresentacion))
  lines.push(...richSection('DUA — Acción y expresión', sda.duaAccionExpresion))

  if (sda.conexiones.length) {
    lines.push('\nCONEXIONES INTERDISCIPLINARES', '─'.repeat(29))
    sda.conexiones.forEach((c) => lines.push(`· ${c.area}: ${c.descripcion}`))
    lines.push('')
  }
  lines.push(...richSection('Elementos transversales', sda.transversales))

  if (sda.ods.length) lines.push(`ODS asignados: ${sda.ods.join(', ')}`)
  lines.push(...richSection('Justificación ODS', sda.justificacionOds))

  // S11 — Cuaderno de Trabajo del alumnado
  const cuad = sda.cuaderno
  if (cuad) {
    const misiones = cuad.sesiones.filter((m) => m.generado)
    lines.push('\nCUADERNO DE TRABAJO DEL ALUMNADO', '─'.repeat(32))
    lines.push(`Temática: ${cuad.tematicaJuego}`)
    if (cuad.personaje) lines.push(`Rol del alumnado: ${cuad.personaje}`)
    if (cuad.descripcionMundo) lines.push(`Mundo narrativo: ${cuad.descripcionMundo}`)
    misiones.forEach((m) => {
      lines.push(`\nMisión ${m.sesionNumero}: ${m.misionTitulo || '(sin título)'}`)
      if (m.narrativa) lines.push(`  ${m.narrativa}`)
      m.tareas.forEach((t) => {
        lines.push(`  · [${t.nivelBloom} — ${t.xp} XP] ${t.titulo}: ${t.enunciado}`)
      })
      if (m.reflexion) lines.push(`  Reflexión: ${m.reflexion}`)
    })
    lines.push('')
  }

  return lines.join('\n').trim()
}
