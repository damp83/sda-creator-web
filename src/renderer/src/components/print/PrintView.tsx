import React from 'react'
import DOMPurify from 'dompurify'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS, COMPETENCIAS_CLAVE, ODS_LIST } from '@renderer/types'

function safeHtml(raw: string): string {
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote'],
    ALLOWED_ATTR: []
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function LongField({ label, value }: { label: string; value?: string }): React.ReactElement | null {
  if (!value?.trim()) return null
  const isHtml = value.trimStart().startsWith('<')
  return (
    <div className="print-long-field">
      <p className="print-label">{label}</p>
      {isHtml ? (
        <div className="print-html-value" dangerouslySetInnerHTML={{ __html: safeHtml(value) }} />
      ) : (
        <p className="print-long-value">{value}</p>
      )}
    </div>
  )
}

function SectionHeader({ number, title }: { number: number; title: string }): React.ReactElement {
  return (
    <div className="print-section-header">
      <span className="print-section-number">{number}</span>
      <h2 className="print-section-title">{title}</h2>
    </div>
  )
}

function EmptyNotice({ text }: { text: string }): React.ReactElement {
  return <p className="print-empty">{text}</p>
}

// ─── Secciones ────────────────────────────────────────────────────────────────

function PrintPortada(): React.ReactElement {
  const { sda } = useSdAStore()
  const cicloLabel = sda.ciclo ? CICLO_LABELS[sda.ciclo] : '—'
  const fecha = sda.fechaModificacion
    ? new Date(sda.fechaModificacion).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : ''

  return (
    <div className="print-portada">
      <div className="print-portada-header">
        <div>
          <p className="print-portada-region">Consejería de Educación — Región de Murcia</p>
          <p className="print-portada-tipo">Situación de Aprendizaje · LOMLOE</p>
        </div>
      </div>

      <div className="print-portada-title-block">
        <h1 className="print-portada-titulo">{sda.titulo || 'Sin título'}</h1>
      </div>

      <div className="print-portada-meta-grid">
        <div className="print-portada-meta-item">
          <span className="print-portada-meta-label">Etapa / Ciclo</span>
          <span className="print-portada-meta-value">{cicloLabel}</span>
        </div>
        <div className="print-portada-meta-item">
          <span className="print-portada-meta-label">Área / Asignatura</span>
          <span className="print-portada-meta-value">{sda.ambito || '—'}</span>
        </div>
        <div className="print-portada-meta-item">
          <span className="print-portada-meta-label">Curso / Grupo</span>
          <span className="print-portada-meta-value">{sda.curso || '—'}</span>
        </div>
        <div className="print-portada-meta-item">
          <span className="print-portada-meta-label">Número de sesiones</span>
          <span className="print-portada-meta-value">{sda.numSesiones}</span>
        </div>
        <div className="print-portada-meta-item">
          <span className="print-portada-meta-label">Temporalización</span>
          <span className="print-portada-meta-value">{sda.temporalizacion || '—'}</span>
        </div>
        <div className="print-portada-meta-item">
          <span className="print-portada-meta-label">Docente</span>
          <span className="print-portada-meta-value">{sda.docente || '—'}</span>
        </div>
        <div className="print-portada-meta-item print-portada-meta-item--wide">
          <span className="print-portada-meta-label">Centro educativo</span>
          <span className="print-portada-meta-value">{sda.centro || '—'}</span>
        </div>
      </div>

      {fecha && <p className="print-portada-fecha">Última modificación: {fecha}</p>}
    </div>
  )
}

function PrintS02(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section">
      <SectionHeader number={2} title="Justificación y contextualización" />
      <LongField label="Justificación" value={sda.justificacion} />
      <LongField label="Contexto del aula" value={sda.contexto} />
      {!sda.justificacion && !sda.contexto && <EmptyNotice text="Sección sin cumplimentar." />}
    </div>
  )
}

function PrintS03(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section">
      <SectionHeader number={3} title="Reto / Situación-problema" />
      <LongField label="Situación-problema" value={sda.situacionProblema} />
      <LongField label="Producto final" value={sda.productoFinal} />
      {sda.hilo && <LongField label="Hilo conductor" value={sda.hilo} />}
    </div>
  )
}

function PrintS04(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section print-page-break-before">
      <SectionHeader number={4} title="Vinculación curricular" />

      {sda.competenciasClave.length > 0 && (
        <div className="print-block">
          <p className="print-label">Competencias clave</p>
          <div className="print-chips-wrap">
            {sda.competenciasClave.map((cc) => (
              <span key={cc} className="print-chip">
                <strong>{cc}</strong> — {COMPETENCIAS_CLAVE[cc]}
              </span>
            ))}
          </div>
        </div>
      )}

      {sda.elementosCurriculares.length === 0 ? (
        <EmptyNotice text="No se han añadido elementos curriculares." />
      ) : (
        sda.elementosCurriculares.map((elem) => (
          <div key={elem.id} className="print-curriculo-card">
            <div className="print-curriculo-header">
              <span className="print-curriculo-ambito">{elem.ambito}</span>
              <span className="print-curriculo-area">{elem.area}</span>
            </div>
            <p className="print-curriculo-ce">{elem.ce}</p>
            {elem.criterios.length > 0 && (
              <div className="print-curriculo-list">
                <p className="print-label">Criterios de evaluación</p>
                <ul className="print-ul">
                  {elem.criterios.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {elem.saberes.length > 0 && (
              <div className="print-curriculo-list">
                <p className="print-label">Saberes básicos</p>
                <ul className="print-ul">
                  {elem.saberes.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function PrintS05(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section">
      <SectionHeader number={5} title="Metodología" />
      <LongField label="Planteamiento metodológico" value={sda.planteamientoMetodologico} />
      {sda.agrupamientos.length > 0 && (
        <div className="print-block">
          <p className="print-label">Agrupamientos</p>
          <div className="print-chips-wrap">
            {sda.agrupamientos.map((a) => (
              <span key={a} className="print-chip">{a}</span>
            ))}
          </div>
        </div>
      )}
      {sda.espacios.length > 0 && (
        <div className="print-block">
          <p className="print-label">Espacios</p>
          <div className="print-chips-wrap">
            {sda.espacios.map((e) => (
              <span key={e} className="print-chip">{e}</span>
            ))}
          </div>
        </div>
      )}
      <LongField label="Recursos" value={sda.recursos} />
      <LongField label="Tiempos" value={sda.tiempos} />
    </div>
  )
}

function PrintS06(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section print-page-break-before">
      <SectionHeader number={6} title="Secuencia didáctica" />
      {sda.sesiones.length === 0 ? (
        <EmptyNotice text="No se han definido sesiones." />
      ) : (
        sda.sesiones.map((ses) => (
          <div key={ses.numero} className="print-sesion-card">
            <div className="print-sesion-header">
              <span className="print-sesion-num">{ses.numero}</span>
              <span className="print-sesion-titulo">{ses.titulo}</span>
              {ses.duracion && (
                <span className="print-sesion-duracion">{ses.duracion}</span>
              )}
              {ses.agrupamiento && (
                <span className="print-sesion-agrup">{ses.agrupamiento}</span>
              )}
            </div>
            <div className="print-sesion-body">
              {ses.inicio && (
                <div className="print-sesion-moment">
                  <span className="print-sesion-moment-label">Inicio</span>
                  {ses.inicio.trimStart().startsWith('<') ? (
                    <div className="print-html-value" dangerouslySetInnerHTML={{ __html: safeHtml(ses.inicio) }} />
                  ) : (
                    <p>{ses.inicio}</p>
                  )}
                </div>
              )}
              {ses.desarrollo && (
                <div className="print-sesion-moment">
                  <span className="print-sesion-moment-label">Desarrollo</span>
                  {ses.desarrollo.trimStart().startsWith('<') ? (
                    <div className="print-html-value" dangerouslySetInnerHTML={{ __html: safeHtml(ses.desarrollo) }} />
                  ) : (
                    <p>{ses.desarrollo}</p>
                  )}
                </div>
              )}
              {ses.cierre && (
                <div className="print-sesion-moment">
                  <span className="print-sesion-moment-label">Cierre</span>
                  {ses.cierre.trimStart().startsWith('<') ? (
                    <div className="print-html-value" dangerouslySetInnerHTML={{ __html: safeHtml(ses.cierre) }} />
                  ) : (
                    <p>{ses.cierre}</p>
                  )}
                </div>
              )}
              {ses.recursos && (
                <div className="print-sesion-moment">
                  <span className="print-sesion-moment-label">Recursos</span>
                  <p>{ses.recursos}</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function PrintS07(): React.ReactElement {
  const { sda } = useSdAStore()

  const criteriosConInstrumento = sda.elementosCurriculares.flatMap((elem) =>
    elem.criterios.map((criterio, ci) => ({
      key: `${elem.id}|${ci}`,
      area: elem.area,
      criterio,
      instrumento: sda.criterioInstrumentos?.[`${elem.id}|${ci}`] || ''
    }))
  ).filter((c) => c.instrumento)

  const tieneTabla = (sda.rubricaTabla ?? []).length > 0

  const thStyle: React.CSSProperties = {
    border: '1px solid var(--pt-content-border)',
    padding: '4pt 6pt',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '8pt',
    backgroundColor: 'var(--pt-chip-bg)',
    color: '#475569'
  }
  const tdStyle: React.CSSProperties = {
    border: '1px solid var(--pt-content-border)',
    padding: '5pt 6pt',
    verticalAlign: 'top',
    fontSize: '8.5pt',
    lineHeight: 1.4
  }
  const nivelColors: Record<string, React.CSSProperties> = {
    iniciado:   { backgroundColor: '#fef2f2', color: '#991b1b' },
    enProceso:  { backgroundColor: '#fffbeb', color: '#92400e' },
    conseguido: { backgroundColor: '#f0fdf4', color: '#14532d' },
    avanzado:   { backgroundColor: '#eff6ff', color: '#1e3a8a' }
  }

  return (
    <div className="print-section print-page-break-before">
      <SectionHeader number={7} title="Evaluación" />
      {sda.momentosEvaluacion.length > 0 && (
        <div className="print-block">
          <p className="print-label">Momentos de evaluación</p>
          <div className="print-chips-wrap">
            {sda.momentosEvaluacion.map((m) => (
              <span key={m} className="print-chip">{m}</span>
            ))}
          </div>
        </div>
      )}
      {sda.instrumentosEvaluacion.length > 0 && (
        <div className="print-block">
          <p className="print-label">Instrumentos de evaluación</p>
          <div className="print-chips-wrap">
            {sda.instrumentosEvaluacion.map((i) => (
              <span key={i} className="print-chip">{i}</span>
            ))}
          </div>
        </div>
      )}
      {criteriosConInstrumento.length > 0 && (
        <div className="print-block">
          <p className="print-label">Instrumento por criterio</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4pt' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '18%' }}>Área</th>
                <th style={thStyle}>Criterio de evaluación</th>
                <th style={{ ...thStyle, width: '20%' }}>Instrumento</th>
              </tr>
            </thead>
            <tbody>
              {criteriosConInstrumento.map(({ key, area, criterio, instrumento }) => (
                <tr key={key}>
                  <td style={{ ...tdStyle, color: '#64748b' }}>{area}</td>
                  <td style={tdStyle}>{criterio}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{instrumento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <LongField label="Criterios de calificación" value={sda.criteriosCalificacion} />
      {tieneTabla ? (
        <div className="print-block">
          <p className="print-label">Rúbrica de evaluación</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4pt' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '26%', backgroundColor: 'var(--pt-primary)', color: 'var(--pt-on-primary)' }}>Criterio</th>
                <th style={{ ...thStyle, ...nivelColors.iniciado, width: '18.5%' }}>Iniciado (1)</th>
                <th style={{ ...thStyle, ...nivelColors.enProceso, width: '18.5%' }}>En proceso (2)</th>
                <th style={{ ...thStyle, ...nivelColors.conseguido, width: '18.5%' }}>Conseguido (3)</th>
                <th style={{ ...thStyle, ...nivelColors.avanzado, width: '18.5%' }}>Avanzado (4)</th>
              </tr>
            </thead>
            <tbody>
              {(sda.rubricaTabla ?? []).map((fila, i) => (
                <tr key={`fila-${i}`}>
                  <td style={{ ...tdStyle, backgroundColor: '#f8fafc', fontWeight: 500 }}>
                    {fila.criterio}
                    {fila.area && <span style={{ display: 'block', fontSize: '7pt', color: '#94a3b8', marginTop: '2pt' }}>{fila.area}</span>}
                    {fila.instrumento && <span style={{ display: 'block', fontSize: '7pt', color: '#64748b', marginTop: '2pt', fontStyle: 'italic' }}>{fila.instrumento}</span>}
                  </td>
                  <td style={{ ...tdStyle, ...nivelColors.iniciado }}>{fila.iniciado}</td>
                  <td style={{ ...tdStyle, ...nivelColors.enProceso }}>{fila.enProceso}</td>
                  <td style={{ ...tdStyle, ...nivelColors.conseguido }}>{fila.conseguido}</td>
                  <td style={{ ...tdStyle, ...nivelColors.avanzado }}>{fila.avanzado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <LongField label="Rúbrica / Indicadores de logro" value={sda.rubrica} />
      )}
    </div>
  )
}

function PrintS08(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section print-page-break-before">
      <SectionHeader number={8} title="Atención a la diversidad (DUA)" />
      <LongField label="Múltiples formas de implicación" value={sda.duaImplicacion} />
      <LongField label="Múltiples formas de representación" value={sda.duaRepresentacion} />
      <LongField label="Múltiples formas de acción y expresión" value={sda.duaAccionExpresion} />
      {!sda.duaImplicacion && !sda.duaRepresentacion && !sda.duaAccionExpresion && (
        <EmptyNotice text="Sección sin cumplimentar." />
      )}
    </div>
  )
}

function PrintS09(): React.ReactElement {
  const { sda } = useSdAStore()
  return (
    <div className="print-section">
      <SectionHeader number={9} title="Interdisciplinariedad" />
      {sda.conexiones.filter((c) => c.area || c.descripcion).length > 0 && (
        <div className="print-block">
          <p className="print-label">Conexiones con otras áreas</p>
          {sda.conexiones
            .filter((c) => c.area || c.descripcion)
            .map((c, i) => (
              <div key={`conexion-${i}`} className="print-conexion">
                {c.area && <strong>{c.area}: </strong>}
                {c.descripcion}
              </div>
            ))}
        </div>
      )}
      <LongField label="Temas transversales" value={sda.transversales} />
      {sda.conexiones.length === 0 && !sda.transversales && (
        <EmptyNotice text="Sección sin cumplimentar." />
      )}
    </div>
  )
}

function PrintS10(): React.ReactElement {
  const { sda } = useSdAStore()
  const odsSeleccionados = ODS_LIST.filter((o) => sda.ods.includes(o.num))
  return (
    <div className="print-section">
      <SectionHeader number={10} title="Objetivos de Desarrollo Sostenible (ODS)" />
      {odsSeleccionados.length === 0 ? (
        <EmptyNotice text="No se han seleccionado ODS." />
      ) : (
        <div className="print-block">
          <div className="print-ods-list">
            {odsSeleccionados.map((o) => (
              <div key={o.num} className="print-ods-item">
                <span
                  className="print-ods-badge"
                  style={{ backgroundColor: o.color, color: '#fff' }}
                >
                  {o.num}
                </span>
                <span className="print-ods-titulo">{o.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <LongField label="Justificación" value={sda.justificacionOds} />
    </div>
  )
}

function PrintS11(): React.ReactElement | null {
  const { sda } = useSdAStore()
  const cuaderno = sda.cuaderno
  const misiones = cuaderno?.sesiones.filter((m) => m.generado) ?? []
  if (!cuaderno || misiones.length === 0) return null
  return (
    <div className="print-section print-page-break-before">
      <SectionHeader number={11} title="Cuaderno de Trabajo del alumnado (resumen)" />
      <div className="print-block">
        <div className="print-field">
          <p className="print-label">Temática gamificada</p>
          <p className="print-value">{cuaderno.tematicaJuego}</p>
        </div>
        {cuaderno.personaje && (
          <div className="print-field">
            <p className="print-label">Rol del alumnado</p>
            <p className="print-value">{cuaderno.personaje}</p>
          </div>
        )}
        {cuaderno.descripcionMundo && (
          <div className="print-field">
            <p className="print-label">Mundo narrativo</p>
            <p className="print-value">{cuaderno.descripcionMundo}</p>
          </div>
        )}
      </div>
      {misiones.map((m) => (
        <div key={m.sesionNumero} className="print-sesion-card">
          <div className="print-sesion-header">
            <span className="print-sesion-num">{m.sesionNumero}</span>
            <span className="print-sesion-titulo">{m.misionTitulo || `Misión ${m.sesionNumero}`}</span>
            <span className="print-sesion-duracion">
              {m.tareas.reduce((acc, t) => acc + t.xp, 0)} XP
            </span>
          </div>
          <div className="print-sesion-body">
            <ul className="print-ul">
              {m.tareas.map((t) => (
                <li key={t.id}>
                  <strong>[{t.nivelBloom} · {t.xp} XP]</strong> {t.titulo}: {t.enunciado}
                </li>
              ))}
            </ul>
            {m.reflexion && (
              <p style={{ fontSize: '9pt', fontStyle: 'italic', color: '#475569', margin: '4pt 0 0' }}>
                Reflexión final: {m.reflexion}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export type PrintTemplate = 'institucional' | 'verde' | 'gris' | 'ambar'

export function PrintView({
  forPreview = false,
  template = 'institucional',
  selectedSections
}: {
  forPreview?: boolean
  template?: PrintTemplate
  selectedSections?: Record<string, boolean>
}): React.ReactElement {
  // Por defecto, mostrar todas si no se especifica
  const show = (sec: string) => !selectedSections || selectedSections[sec]

  return (
    <div
      id={forPreview ? undefined : 'print-view'}
      className={forPreview ? 'print-view-preview' : undefined}
      data-print-template={template}
    >
      {show('S01') && <PrintPortada />}
      {show('S02') && <PrintS02 />}
      {show('S03') && <PrintS03 />}
      {show('S04') && <PrintS04 />}
      {show('S05') && <PrintS05 />}
      {show('S06') && <PrintS06 />}
      {show('S07') && <PrintS07 />}
      {show('S08') && <PrintS08 />}
      {show('S09') && <PrintS09 />}
      {show('S10') && <PrintS10 />}
      {show('S11') && <PrintS11 />}
    </div>
  )
}

