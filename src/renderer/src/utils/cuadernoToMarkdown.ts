import type { SdA } from '@renderer/types'
import { BLOOM_CONFIG, BLOOM_ORDEN } from '@renderer/types'

function cicloTexto(ciclo: string): string {
  const map: Record<string, string> = {
    infantil_ciclo_1: 'Educación Infantil — 1.er ciclo (0-3 años)',
    infantil_ciclo_2: 'Educación Infantil — 2.º ciclo (3-6 años)',
    primaria_ciclo_1: 'Primaria — 1.er ciclo (6-8 años)',
    primaria_ciclo_2: 'Primaria — 2.º ciclo (8-10 años)',
    primaria_ciclo_3: 'Primaria — 3.er ciclo (10-12 años)',
  }
  return map[ciclo] ?? ciclo
}

/**
 * Serializa el cuaderno de trabajo a un documento Markdown estructurado,
 * pensado para subirse como fuente a NotebookLM y pedirle el material visual.
 */
export function cuadernoToMarkdown(sda: SdA): string {
  const c = sda.cuaderno
  if (!c) return ''

  const L: string[] = []
  const sesiones = c.sesiones.filter(s => s.generado)
  const xpMax = sesiones.reduce((acc, s) => acc + s.tareas.reduce((a, t) => a + t.xp, 0), 0)

  // ── Cabecera ──
  L.push(`# Cuaderno de Trabajo del Alumnado: ${c.tematicaJuego}`)
  L.push('')
  L.push(`**Situación de Aprendizaje:** ${sda.titulo || 'Sin título'}`)
  if (sda.ambito) L.push(`**Área / Ámbito:** ${sda.ambito}`)
  if (sda.ciclo) L.push(`**Ciclo:** ${cicloTexto(sda.ciclo)}`)
  L.push('')
  L.push('---')
  L.push('')

  // ── Marco gamificado ──
  L.push('## Marco del juego')
  L.push('')
  L.push(`- **Temática:** ${c.tematicaJuego}`)
  L.push(`- **Rol del alumnado:** ${c.personaje}`)
  L.push(`- **Universo narrativo:** ${c.descripcionMundo}`)
  L.push(`- **Sistema de puntos (XP):** ${c.instruccionesHero}`)
  L.push(`- **XP máximo alcanzable:** ${xpMax} XP`)
  L.push('')

  // ── Niveles de Bloom ──
  L.push('## Niveles de la Taxonomía de Bloom (escala de dificultad y XP)')
  L.push('')
  L.push('| Nivel | Qué se hace | Verbos | XP |')
  L.push('|-------|-------------|--------|----|')
  for (const nivel of BLOOM_ORDEN) {
    const b = BLOOM_CONFIG[nivel]
    L.push(`| ${b.label} | ${b.descripcion} | ${b.verbos.slice(0, 3).join(', ')} | ${b.xp} XP |`)
  }
  L.push('')
  L.push('---')
  L.push('')

  // ── Misiones ──
  L.push('## Misiones')
  L.push('')
  sesiones.forEach((s) => {
    const xpSesion = s.tareas.reduce((a, t) => a + t.xp, 0)
    L.push(`### Misión ${s.sesionNumero}: ${s.misionTitulo || `Misión ${s.sesionNumero}`} (${xpSesion} XP)`)
    L.push('')
    if (s.narrativa) { L.push(`> ${s.narrativa}`); L.push('') }

    const ordenadas = BLOOM_ORDEN
      .map(n => s.tareas.find(t => t.nivelBloom === n))
      .filter(Boolean) as NonNullable<(typeof s.tareas)[number]>[]

    ordenadas.forEach((t) => {
      const b = BLOOM_CONFIG[t.nivelBloom]
      L.push(`#### ${b.label} · ${t.verboBloom} — ${t.titulo} (${t.xp} XP)`)
      L.push('')
      L.push(t.enunciado)
      if (t.pista) { L.push(''); L.push(`*Pista (apoyo):* ${t.pista}`) }
      if (t.retoExtra) { L.push(''); L.push(`*Reto extra (ampliación):* ${t.retoExtra}`) }
      L.push('')
    })

    if (s.reflexion) {
      L.push(`**Reflexión final de la misión:** ${s.reflexion}`)
      L.push('')
    }
    L.push('---')
    L.push('')
  })

  // ── Instrucciones para NotebookLM ──
  L.push('## Cómo generar el cuaderno visual en NotebookLM')
  L.push('')
  L.push('1. Sube este documento como fuente en un cuaderno nuevo de NotebookLM.')
  L.push('2. Pídele que cree un **cuaderno de trabajo gamificado e ilustrado** para el alumnado, con una página por misión.')
  L.push('3. Sugerencia de instrucción:')
  L.push('')
  L.push('> Crea un cuaderno de trabajo visual y motivador para el alumnado a partir de estas misiones. ' +
    `Usa la temática "${c.tematicaJuego}", con el alumno como "${c.personaje}". ` +
    'Diseña una portada, una guía del sistema de XP con la pirámide de Bloom, una página por misión con sus tareas, ' +
    'e incluye ilustraciones temáticas infantiles. Mantén un tono alegre y educativo.')
  L.push('')

  return L.join('\n')
}
