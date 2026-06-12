import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Table, TableRow, TableCell, WidthType,
  BorderStyle, ShadingType
} from 'docx'

// ─── Tipos mínimos ─────────────────────────────────────────────────────────────

interface SesionData {
  numero: number; titulo: string; duracion: string
  agrupamiento: string; inicio: string; desarrollo: string
  cierre: string; recursos: string
}

interface ElemCurr { area: string; ce: string; criterios: string[] }

interface RubricaFilaData {
  criterio: string; area: string; instrumento: string
  iniciado: string; enProceso: string; conseguido: string; avanzado: string
}

export interface SdADocxData {
  titulo: string; ciclo: string; ambito: string; areas: string[]
  curso: string; numSesiones: number; temporalizacion: string
  docente: string; centro: string
  justificacion: string; contexto: string
  situacionProblema: string; productoFinal: string; hilo: string
  competenciasClave: string[]
  elementosCurriculares: ElemCurr[]
  planteamientoMetodologico: string
  agrupamientos: string[]; espacios: string[]; recursos: string; tiempos: string
  sesiones: SesionData[]
  criteriosCalificacion: string
  momentosEvaluacion: string[]; instrumentosEvaluacion: string[]
  rubricaTabla: RubricaFilaData[]; rubrica: string
  duaImplicacion: string; duaRepresentacion: string; duaAccionExpresion: string
  conexiones: { area: string; descripcion: string }[]
  transversales: string
  ods: number[]; justificacionOds: string
  cuaderno?: {
    tematicaJuego: string; personaje: string; descripcionMundo: string
    sesiones: {
      sesionNumero: number; misionTitulo: string; narrativa: string
      reflexion: string; generado: boolean
      tareas: { nivelBloom: string; titulo: string; enunciado: string; xp: number }[]
    }[]
  }
}

// ─── HTML → DOCX ──────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ''))
}

function htmlToRuns(html: string): TextRun[] {
  if (!html) return []
  const clean = decodeEntities(html.replace(/<br\s*\/?>/gi, ' '))
  const runs: TextRun[] = []
  const RE = /<strong[^>]*>(.*?)<\/strong>|<b[^>]*>(.*?)<\/b>|<em[^>]*>(.*?)<\/em>|<i[^>]*>(.*?)<\/i>|<u[^>]*>(.*?)<\/u>|([^<]+)/gis
  let m: RegExpExecArray | null
  while ((m = RE.exec(clean)) !== null) {
    const bold = m[1] ?? m[2]
    const italic = m[3] ?? m[4]
    const under = m[5]
    const plain = m[6]
    if (bold !== undefined) { const t = stripTags(bold); if (t.trim()) runs.push(new TextRun({ text: t, bold: true })) }
    else if (italic !== undefined) { const t = stripTags(italic); if (t.trim()) runs.push(new TextRun({ text: t, italics: true })) }
    else if (under !== undefined) { const t = stripTags(under); if (t.trim()) runs.push(new TextRun({ text: t, underline: {} })) }
    else if (plain) { const t = decodeEntities(plain); if (t.trim()) runs.push(new TextRun(t)) }
  }
  return runs.length ? runs : [new TextRun('')]
}

function htmlToParas(html: string): Paragraph[] {
  if (!html) return []
  const paras: Paragraph[] = []
  const BLOCK_RE = /<p[^>]*>([\s\S]*?)<\/p>|<ul[^>]*>([\s\S]*?)<\/ul>|<ol[^>]*>([\s\S]*?)<\/ol>/gi
  let m: RegExpExecArray | null
  let any = false
  while ((m = BLOCK_RE.exec(html)) !== null) {
    any = true
    if (m[1] !== undefined) {
      const parts = m[1].split(/<br\s*\/?>/gi)
      for (const part of parts) {
        const runs = htmlToRuns(part)
        if (runs.some((r) => {
          const t = (r as unknown as { options?: { text?: string } }).options?.text
          return t && t.trim()
        })) {
          paras.push(new Paragraph({ children: runs, spacing: { after: 120 } }))
        }
      }
    } else {
      const list = m[2] ?? m[3]
      const ordered = m[2] === undefined
      const LI_RE = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let li: RegExpExecArray | null
      let n = 1
      while ((li = LI_RE.exec(list)) !== null) {
        const text = stripTags(li[1]).trim()
        if (text) paras.push(new Paragraph({
          text: ordered ? `${n++}. ${text}` : `• ${text}`,
          spacing: { after: 60 }
        }))
      }
    }
  }
  if (!any) {
    const text = stripTags(html).trim()
    if (text) paras.push(new Paragraph({ text, spacing: { after: 120 } }))
  }
  return paras
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '2563EB',
  heading: '1E3A5F',
  muted: '64748B',
  amber: 'D97706',
  cell: 'EFF6FF',
}

function h2(text: string, pageBreak = false): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, color: 'FFFFFF', size: 24 })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 480, after: 120 },
    shading: { fill: COLORS.heading, type: ShadingType.SOLID },
    pageBreakBefore: pageBreak
  })
}

function h3(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: COLORS.primary, size: 22 })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 300, after: 80 }
  })
}

function label(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: COLORS.muted, size: 18 })],
    spacing: { before: 160, after: 40 }
  })
}

function metaLine(key: string, value: string): Paragraph {
  if (!value) return new Paragraph({ text: '' })
  return new Paragraph({
    children: [
      new TextRun({ text: `${key}: `, bold: true, size: 20 }),
      new TextRun({ text: value, size: 20 })
    ],
    spacing: { after: 80 }
  })
}

function bulletItem(text: string): Paragraph {
  return new Paragraph({ text: `• ${text}`, spacing: { after: 60 } })
}

function divider(): Paragraph {
  return new Paragraph({ text: '', spacing: { after: 40 } })
}

function infoRow(cols: { text: string; width: number; header?: boolean }[]): TableRow {
  return new TableRow({
    children: cols.map(
      (col) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: col.text, bold: !!col.header, color: col.header ? COLORS.heading : '1E293B', size: 18 })]
          })],
          width: { size: col.width, type: WidthType.PERCENTAGE },
          shading: col.header ? { fill: 'DBEAFE', type: ShadingType.SOLID } : { fill: 'F8FAFC', type: ShadingType.SOLID },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          }
        })
    )
  })
}

function rubricaTable(filas: RubricaFilaData[]): Table {
  const COLS = [
    { header: 'Criterio', key: 'criterio' as const, width: 30 },
    { header: 'Iniciado', key: 'iniciado' as const, width: 17 },
    { header: 'En proceso', key: 'enProceso' as const, width: 18 },
    { header: 'Conseguido', key: 'conseguido' as const, width: 18 },
    { header: 'Avanzado', key: 'avanzado' as const, width: 17 },
  ]
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: COLS.map((c) => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: c.header, bold: true, size: 18 })] })],
          width: { size: c.width, type: WidthType.PERCENTAGE },
          shading: { fill: '1E3A5F', type: ShadingType.SOLID },
          borders,
        }))
      }),
      ...filas.map((fila, rowIdx) => new TableRow({
        children: COLS.map((c) => new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: fila[c.key], size: 17 })] })],
          width: { size: c.width, type: WidthType.PERCENTAGE },
          shading: rowIdx % 2 === 1 ? { fill: 'F1F5F9', type: ShadingType.SOLID } : undefined,
          borders,
        }))
      }))
    ]
  })
}

// ─── Generador principal ──────────────────────────────────────────────────────

const ODS_NOMBRES: Record<number, string> = {
  1: 'Fin de la pobreza', 2: 'Hambre cero', 3: 'Salud y bienestar',
  4: 'Educación de calidad', 5: 'Igualdad de género', 6: 'Agua limpia y saneamiento',
  7: 'Energía asequible y no contaminante', 8: 'Trabajo decente y crecimiento económico',
  9: 'Industria, innovación e infraestructura', 10: 'Reducción de las desigualdades',
  11: 'Ciudades y comunidades sostenibles', 12: 'Producción y consumo responsables',
  13: 'Acción por el clima', 14: 'Vida submarina', 15: 'Vida de ecosistemas terrestres',
  16: 'Paz, justicia e instituciones sólidas', 17: 'Alianzas para lograr los objetivos'
}

export async function generarDocx(sda: SdADocxData): Promise<Buffer> {
  const CICLO_MAP: Record<string, string> = {
    infantil_ciclo_1: 'Infantil — 1er Ciclo (0-3 años)',
    infantil_ciclo_2: 'Infantil — 2º Ciclo (3-6 años)',
    primaria_ciclo_1: 'Primaria — 1er Ciclo (1º-2º)',
    primaria_ciclo_2: 'Primaria — 2º Ciclo (3º-4º)',
    primaria_ciclo_3: 'Primaria — 3er Ciclo (5º-6º)',
  }

  const children: (Paragraph | Table)[] = []

  // ── Portada ────────────────────────────────────────────────────────────────
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const allNoBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'SITUACIÓN DE APRENDIZAJE · LOMLOE', bold: true, color: 'BFD4F2', size: 18 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 160 }
                }),
                new Paragraph({
                  children: [new TextRun({ text: sda.titulo || '(Sin título)', bold: true, color: 'FFFFFF', size: 44 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 0 }
                }),
              ],
              shading: { fill: COLORS.heading, type: ShadingType.SOLID },
              borders: allNoBorders,
              margins: { top: 480, bottom: 480, left: 560, right: 560 }
            })
          ]
        })
      ]
    }),
    new Paragraph({ text: '', spacing: { after: 240 } })
  )

  // Tabla de metadatos
  const metaRows: { k: string; v: string }[] = [
    { k: 'Etapa / Ciclo', v: CICLO_MAP[sda.ciclo] ?? sda.ciclo },
    { k: 'Área / Asignatura', v: sda.ambito || (sda.areas ?? []).join(', ') },
    { k: 'Curso / Grupo', v: sda.curso },
    { k: 'Nº de sesiones', v: sda.numSesiones ? String(sda.numSesiones) : '' },
    { k: 'Temporalización', v: sda.temporalizacion },
    { k: 'Docente', v: sda.docente },
    { k: 'Centro', v: sda.centro },
  ].filter((r) => r.v)

  if (metaRows.length) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: metaRows.map((r) => infoRow([
          { text: r.k, width: 35, header: true },
          { text: r.v, width: 65 }
        ]))
      }),
      divider()
    )
  }

  // ── Secciones de contenido ────────────────────────────────────────────────
  function addSection(title: string, html: string): void {
    const paras = htmlToParas(html)
    if (!paras.length) return
    children.push(h2(title), ...paras)
  }

  addSection('Justificación', sda.justificacion)
  addSection('Contextualización', sda.contexto)
  addSection('Situación problema / Reto', sda.situacionProblema)
  addSection('Producto final', sda.productoFinal)

  if (sda.hilo) {
    children.push(h2('Hilo conductor'), new Paragraph({ text: sda.hilo, spacing: { after: 120 } }))
  }

  // ── Vinculación curricular ────────────────────────────────────────────────
  if (sda.competenciasClave.length || sda.elementosCurriculares.length) {
    children.push(h2('Vinculación Curricular', true))

    if (sda.competenciasClave.length) {
      children.push(label('Competencias clave'))
      sda.competenciasClave.forEach((cc) => children.push(bulletItem(cc)))
    }

    if (sda.elementosCurriculares.length) {
      children.push(label('Elementos curriculares'))
      sda.elementosCurriculares.forEach((ec) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `[${ec.area}] `, bold: true, color: COLORS.primary, size: 19 }),
              new TextRun({ text: ec.ce, size: 19 })
            ],
            spacing: { before: 100, after: 40 }
          })
        )
        if (ec.criterios.length) {
          ec.criterios.forEach((cr) => children.push(new Paragraph({ text: `   · ${cr}`, spacing: { after: 40 } })))
        }
      })
    }
  }

  // ── Metodología ───────────────────────────────────────────────────────────
  const hasMetodologia = sda.planteamientoMetodologico || sda.agrupamientos.length || sda.espacios.length || sda.recursos || sda.tiempos
  if (hasMetodologia) {
    children.push(h2('Planteamiento Metodológico'))
    if (sda.planteamientoMetodologico) children.push(...htmlToParas(sda.planteamientoMetodologico))
    if (sda.agrupamientos.length) children.push(metaLine('Agrupamientos', sda.agrupamientos.join(', ')))
    if (sda.espacios.length) children.push(metaLine('Espacios', sda.espacios.join(', ')))
    if (sda.recursos) children.push(label('Recursos didácticos'), ...htmlToParas(sda.recursos))
    if (sda.tiempos) children.push(label('Distribución del tiempo'), ...htmlToParas(sda.tiempos))
  }

  // ── Secuencia didáctica ───────────────────────────────────────────────────
  if (sda.sesiones.length) {
    children.push(h2('Secuencia Didáctica', true))
    sda.sesiones.forEach((s) => {
      children.push(h3(`Sesión ${s.numero}${s.titulo ? ': ' + s.titulo : ''}`))
      const meta: string[] = []
      if (s.duracion) meta.push(`Duración: ${s.duracion}`)
      if (s.agrupamiento) meta.push(`Agrupamiento: ${s.agrupamiento}`)
      if (meta.length) children.push(new Paragraph({ children: [new TextRun({ text: meta.join(' · '), color: COLORS.muted, italics: true, size: 19 })], spacing: { after: 80 } }))
      if (s.inicio) { children.push(label('Inicio / Activación')); children.push(...htmlToParas(s.inicio)) }
      if (s.desarrollo) { children.push(label('Desarrollo')); children.push(...htmlToParas(s.desarrollo)) }
      if (s.cierre) { children.push(label('Cierre / Reflexión')); children.push(...htmlToParas(s.cierre)) }
      if (s.recursos) children.push(metaLine('Recursos', s.recursos))
    })
  }

  // ── Evaluación ────────────────────────────────────────────────────────────
  const hasEval = sda.criteriosCalificacion || sda.instrumentosEvaluacion.length || sda.rubricaTabla.length || sda.rubrica
  if (hasEval) {
    children.push(h2('Evaluación', true))
    if (sda.momentosEvaluacion.length) children.push(metaLine('Momentos', sda.momentosEvaluacion.join(', ')))
    if (sda.instrumentosEvaluacion.length) children.push(metaLine('Instrumentos', sda.instrumentosEvaluacion.join(', ')))
    if (sda.criteriosCalificacion) { children.push(label('Criterios de calificación')); children.push(...htmlToParas(sda.criteriosCalificacion)) }
    if (sda.rubricaTabla.length) {
      children.push(label('Rúbrica de evaluación'))
      children.push(rubricaTable(sda.rubricaTabla))
      children.push(divider())
    } else if (sda.rubrica) {
      children.push(label('Rúbrica'))
      children.push(...htmlToParas(sda.rubrica))
    }
  }

  // ── DUA ───────────────────────────────────────────────────────────────────
  const hasDua = sda.duaImplicacion || sda.duaRepresentacion || sda.duaAccionExpresion
  if (hasDua) {
    children.push(h2('Atención a la Diversidad (DUA)'))
    if (sda.duaImplicacion) { children.push(label('Implicación y motivación')); children.push(...htmlToParas(sda.duaImplicacion)) }
    if (sda.duaRepresentacion) { children.push(label('Representación')); children.push(...htmlToParas(sda.duaRepresentacion)) }
    if (sda.duaAccionExpresion) { children.push(label('Acción y expresión')); children.push(...htmlToParas(sda.duaAccionExpresion)) }
  }

  // ── Interdisciplinariedad ─────────────────────────────────────────────────
  if (sda.conexiones.length || sda.transversales) {
    children.push(h2('Interdisciplinariedad'))
    if (sda.conexiones.length) {
      children.push(label('Conexiones interdisciplinares'))
      sda.conexiones.forEach((c) => children.push(new Paragraph({
        children: [
          new TextRun({ text: `${c.area}: `, bold: true, size: 19 }),
          new TextRun({ text: c.descripcion, size: 19 })
        ],
        spacing: { after: 80 }
      })))
    }
    if (sda.transversales) { children.push(label('Elementos transversales')); children.push(...htmlToParas(sda.transversales)) }
  }

  // ── ODS ───────────────────────────────────────────────────────────────────
  if (sda.ods.length) {
    children.push(h2('Objetivos de Desarrollo Sostenible (ODS)'))
    sda.ods.forEach((num) => {
      const nombre = ODS_NOMBRES[num]
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `ODS ${num}`, bold: true, color: COLORS.primary, size: 19 }),
          new TextRun({ text: nombre ? ` — ${nombre}` : '', size: 19 })
        ],
        spacing: { after: 60 }
      }))
    })
    if (sda.justificacionOds) { children.push(divider()); children.push(...htmlToParas(sda.justificacionOds)) }
  }

  // ── Cuaderno de Trabajo del alumnado (resumen) ────────────────────────────
  const misionesCuaderno = sda.cuaderno?.sesiones.filter((m) => m.generado) ?? []
  if (sda.cuaderno && misionesCuaderno.length > 0) {
    children.push(h2('Cuaderno de Trabajo del alumnado (resumen)'))
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Temática: ', bold: true, size: 19 }),
        new TextRun({ text: sda.cuaderno.tematicaJuego, size: 19 })
      ],
      spacing: { after: 40 }
    }))
    if (sda.cuaderno.personaje) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Rol del alumnado: ', bold: true, size: 19 }),
          new TextRun({ text: sda.cuaderno.personaje, size: 19 })
        ],
        spacing: { after: 80 }
      }))
    }
    misionesCuaderno.forEach((m) => {
      const xpTotal = m.tareas.reduce((acc, t) => acc + t.xp, 0)
      children.push(new Paragraph({
        children: [new TextRun({
          text: `Misión ${m.sesionNumero}: ${m.misionTitulo || `Misión ${m.sesionNumero}`} (${xpTotal} XP)`,
          bold: true, color: COLORS.primary, size: 20
        })],
        spacing: { before: 140, after: 50 }
      }))
      m.tareas.forEach((t) => {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `• [${t.nivelBloom} · ${t.xp} XP] `, bold: true, size: 18 }),
            new TextRun({ text: `${t.titulo}: ${t.enunciado}`, size: 18 })
          ],
          spacing: { after: 30 }
        }))
      })
      if (m.reflexion) {
        children.push(new Paragraph({
          children: [new TextRun({ text: `Reflexión final: ${m.reflexion}`, italics: true, size: 18, color: COLORS.muted })],
          spacing: { after: 60 }
        }))
      }
    })
  }

  // ── Pie de página ─────────────────────────────────────────────────────────
  children.push(
    new Paragraph({ text: '', spacing: { before: 600 } }),
    new Paragraph({
      children: [new TextRun({ text: `Generado con SdA Creator · ${new Date().toLocaleDateString('es-ES')}`, color: COLORS.muted, size: 16, italics: true })],
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' } }
    })
  )

  const doc = new Document({
    creator: sda.docente || 'SdA Creator',
    title: sda.titulo || 'Situación de Aprendizaje',
    description: `SdA: ${sda.titulo}`,
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: '1E293B' },
          paragraph: { spacing: { line: 276 } }
        }
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          run: { color: COLORS.heading, bold: true, size: 40 },
          paragraph: { spacing: { after: 200 } }
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          run: { color: COLORS.heading, bold: true, size: 24 },
          paragraph: { spacing: { before: 480, after: 120 } }
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          run: { color: COLORS.primary, bold: true, size: 22 },
          paragraph: { spacing: { before: 240, after: 80 } }
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 }
          }
        },
        children
      }
    ]
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
