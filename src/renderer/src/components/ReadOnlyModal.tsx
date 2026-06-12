import React, { useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { useFocusTrap } from '@renderer/hooks/useFocusTrap'
import { X, Printer } from 'lucide-react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS, COMPETENCIAS_CLAVE, ODS_LIST, type Ciclo } from '@renderer/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onExportarPdf: () => void
}

function HtmlBlock({ html, empty }: { html: string; empty?: string }): React.ReactElement {
  const stripped = html?.replace(/<[^>]+>/g, '').trim()
  if (!stripped) return <p className="text-xs italic text-slate-400">{empty ?? '(sin contenido)'}</p>
  return (
    <div
      className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:my-1 [&_strong]:font-semibold [&_em]:italic"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  )
}

function SeccionHeader({ num, title }: { num: number; title: string }): React.ReactElement {
  return (
    <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-700">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500 text-[10px] font-black text-white">
        {num}
      </span>
      <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {title}
      </h2>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="mb-3">
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <div>{children}</div>
    </div>
  )
}

function Chip({ text, color }: { text: string; color?: string }): React.ReactElement {
  return (
    <span
      className={color
        ? 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
        : 'inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300'}
      style={color ? { backgroundColor: `${color}25`, color } : undefined}
    >
      {text}
    </span>
  )
}

export function ReadOnlyModal({ isOpen, onClose, onExportarPdf }: Props): React.ReactElement | null {
  const { sda } = useSdAStore()
  const containerRef = useRef<HTMLDivElement>(null)
  useFocusTrap(containerRef, isOpen)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const cicloLabel = sda.ciclo ? CICLO_LABELS[sda.ciclo as Ciclo] : null

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" aria-label="Vista de lectura" tabIndex={-1} className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950 outline-none">
      {/* Barra superior */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Vista de lectura</span>
          {sda.titulo && (
            <span className="hidden text-sm text-slate-400 sm:inline">— {sda.titulo}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExportarPdf}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Printer size={13} />
            Exportar PDF
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {/* Portada */}
          <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h1 className="mb-3 text-2xl font-black text-slate-900 dark:text-slate-50">
              {sda.titulo || 'Sin título'}
            </h1>
            <div className="flex flex-wrap gap-2">
              {cicloLabel && <Chip text={cicloLabel} />}
              {sda.ambito && <Chip text={sda.ambito} />}
              {sda.areas.map((a) => <Chip key={a} text={a} />)}
              {sda.numSesiones > 0 && <Chip text={`${sda.numSesiones} sesiones`} />}
            </div>
            {(sda.docente || sda.centro) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                {sda.docente && <span><strong>Docente:</strong> {sda.docente}</span>}
                {sda.centro && <span><strong>Centro:</strong> {sda.centro}</span>}
                {sda.curso && <span><strong>Curso:</strong> {sda.curso}</span>}
                {sda.temporalizacion && <span><strong>Temporalización:</strong> {sda.temporalizacion}</span>}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* S02 Justificación */}
            {(sda.justificacion || sda.contexto) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={2} title="Justificación y contextualización" />
                {sda.justificacion && <Campo label="Justificación"><HtmlBlock html={sda.justificacion} /></Campo>}
                {sda.contexto && <Campo label="Contexto del aula"><HtmlBlock html={sda.contexto} /></Campo>}
              </section>
            )}

            {/* S03 Reto */}
            {(sda.situacionProblema || sda.productoFinal || sda.hilo) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={3} title="Reto / Producto Final" />
                {sda.situacionProblema && <Campo label="Situación-problema"><HtmlBlock html={sda.situacionProblema} /></Campo>}
                {sda.productoFinal && <Campo label="Producto final"><HtmlBlock html={sda.productoFinal} /></Campo>}
                {sda.hilo && <Campo label="Hilo conductor"><HtmlBlock html={sda.hilo} /></Campo>}
              </section>
            )}

            {/* S04 Vinculación curricular */}
            {(sda.competenciasClave.length > 0 || sda.elementosCurriculares.length > 0) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={4} title="Vinculación Curricular" />
                {sda.competenciasClave.length > 0 && (
                  <Campo label="Competencias clave">
                    <div className="flex flex-wrap gap-1.5">
                      {sda.competenciasClave.map((cc) => (
                        <span key={cc} className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-900/20 dark:text-primary-400" title={COMPETENCIAS_CLAVE[cc]}>
                          {cc}
                        </span>
                      ))}
                    </div>
                  </Campo>
                )}
                {sda.elementosCurriculares.length > 0 && (
                  <Campo label={`Elementos curriculares (${sda.elementosCurriculares.length})`}>
                    <div className="space-y-2">
                      {sda.elementosCurriculares.map((el) => (
                        <div key={el.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/50">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{el.area} — {el.ce}</p>
                          {el.criterios.length > 0 && (
                            <ul className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                              {el.criterios.map((c, i) => <li key={`criterio-${i}`} className="truncate">· {c}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </Campo>
                )}
              </section>
            )}

            {/* S05 Metodología */}
            {(sda.planteamientoMetodologico || sda.agrupamientos.length > 0 || sda.espacios.length > 0 || sda.recursos || sda.tiempos) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={5} title="Metodología" />
                {sda.planteamientoMetodologico && <Campo label="Planteamiento metodológico"><HtmlBlock html={sda.planteamientoMetodologico} /></Campo>}
                {sda.agrupamientos.length > 0 && (
                  <Campo label="Agrupamientos">
                    <div className="flex flex-wrap gap-1.5">{sda.agrupamientos.map((a) => <Chip key={a} text={a} />)}</div>
                  </Campo>
                )}
                {sda.espacios.length > 0 && (
                  <Campo label="Espacios">
                    <div className="flex flex-wrap gap-1.5">{sda.espacios.map((e) => <Chip key={e} text={e} />)}</div>
                  </Campo>
                )}
                {sda.recursos && <Campo label="Recursos"><HtmlBlock html={sda.recursos} /></Campo>}
                {sda.tiempos && <Campo label="Tiempos"><p className="text-sm text-slate-700 dark:text-slate-300">{sda.tiempos}</p></Campo>}
              </section>
            )}

            {/* S06 Secuencia didáctica */}
            {sda.sesiones.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={6} title={`Secuencia Didáctica (${sda.sesiones.length} sesiones)`} />
                <div className="space-y-4">
                  {sda.sesiones.map((s) => (
                    <div key={s.numero} className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white">{s.numero}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{s.titulo || `Sesión ${s.numero}`}</span>
                        {s.duracion && <span className="ml-auto text-xs text-slate-400">{s.duracion}</span>}
                      </div>
                      {s.inicio && <div className="mb-2"><p className="mb-0.5 text-[10px] font-bold uppercase text-slate-400">Inicio</p><HtmlBlock html={s.inicio} /></div>}
                      {s.desarrollo && <div className="mb-2"><p className="mb-0.5 text-[10px] font-bold uppercase text-slate-400">Desarrollo</p><HtmlBlock html={s.desarrollo} /></div>}
                      {s.cierre && <div><p className="mb-0.5 text-[10px] font-bold uppercase text-slate-400">Cierre</p><HtmlBlock html={s.cierre} /></div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* S07 Evaluación */}
            {(sda.criteriosCalificacion || sda.momentosEvaluacion.length > 0 || sda.instrumentosEvaluacion.length > 0 || sda.rubricaTabla.length > 0 || sda.rubrica) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={7} title="Evaluación" />
                {sda.momentosEvaluacion.length > 0 && (
                  <Campo label="Momentos">
                    <div className="flex flex-wrap gap-1.5">{sda.momentosEvaluacion.map((m) => <Chip key={m} text={m} />)}</div>
                  </Campo>
                )}
                {sda.instrumentosEvaluacion.length > 0 && (
                  <Campo label="Instrumentos">
                    <div className="flex flex-wrap gap-1.5">{sda.instrumentosEvaluacion.map((i) => <Chip key={i} text={i} />)}</div>
                  </Campo>
                )}
                {sda.criteriosCalificacion && <Campo label="Criterios de calificación"><HtmlBlock html={sda.criteriosCalificacion} /></Campo>}
                {sda.rubricaTabla.length > 0 && (
                  <Campo label={`Rúbrica (${sda.rubricaTabla.length} criterios)`}>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800">
                            <th className="border border-slate-200 px-2 py-1.5 text-left font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Criterio</th>
                            <th className="border border-slate-200 px-2 py-1.5 text-center font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Iniciado</th>
                            <th className="border border-slate-200 px-2 py-1.5 text-center font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">En proceso</th>
                            <th className="border border-slate-200 px-2 py-1.5 text-center font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Conseguido</th>
                            <th className="border border-slate-200 px-2 py-1.5 text-center font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">Avanzado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sda.rubricaTabla.map((fila, i) => (
                            <tr key={`fila-${i}`} className="even:bg-slate-50 dark:even:bg-slate-800/30">
                              <td className="border border-slate-200 px-2 py-2 font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">{fila.criterio}</td>
                              <td className="border border-slate-200 px-2 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-400">{fila.iniciado}</td>
                              <td className="border border-slate-200 px-2 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-400">{fila.enProceso}</td>
                              <td className="border border-slate-200 px-2 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-400">{fila.conseguido}</td>
                              <td className="border border-slate-200 px-2 py-2 text-slate-600 dark:border-slate-700 dark:text-slate-400">{fila.avanzado}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Campo>
                )}
                {sda.rubrica && <Campo label="Rúbrica descriptiva"><HtmlBlock html={sda.rubrica} /></Campo>}
              </section>
            )}

            {/* S08 DUA */}
            {(sda.duaImplicacion || sda.duaRepresentacion || sda.duaAccionExpresion) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={8} title="Atención a la Diversidad (DUA)" />
                {sda.duaImplicacion && <Campo label="Redes de implicación y motivación"><HtmlBlock html={sda.duaImplicacion} /></Campo>}
                {sda.duaRepresentacion && <Campo label="Redes de representación"><HtmlBlock html={sda.duaRepresentacion} /></Campo>}
                {sda.duaAccionExpresion && <Campo label="Redes de acción y expresión"><HtmlBlock html={sda.duaAccionExpresion} /></Campo>}
              </section>
            )}

            {/* S09 Interdisciplinariedad */}
            {(sda.conexiones.length > 0 || sda.transversales) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={9} title="Interdisciplinariedad" />
                {sda.conexiones.length > 0 && (
                  <Campo label="Conexiones con otras áreas">
                    <div className="space-y-1.5">
                      {sda.conexiones.map((c, i) => (
                        <div key={`conexion-${i}`} className="flex items-start gap-2 text-sm">
                          <span className="shrink-0 rounded bg-cyan-100 px-1.5 py-0.5 text-xs font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">{c.area}</span>
                          <span className="text-slate-600 dark:text-slate-400">{c.descripcion}</span>
                        </div>
                      ))}
                    </div>
                  </Campo>
                )}
                {sda.transversales && <Campo label="Temas transversales"><HtmlBlock html={sda.transversales} /></Campo>}
              </section>
            )}

            {/* S10 ODS */}
            {(sda.ods.length > 0 || sda.justificacionOds) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <SeccionHeader num={10} title="ODS" />
                {sda.ods.length > 0 && (
                  <Campo label="Objetivos de Desarrollo Sostenible seleccionados">
                    <div className="flex flex-wrap gap-2">
                      {sda.ods.map((num) => {
                        const ods = ODS_LIST.find((o) => o.num === num)
                        return ods ? (
                          <span
                            key={num}
                            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
                            style={{ backgroundColor: ods.color }}
                          >
                            <span className="font-black">{num}</span>
                            <span className="hidden sm:inline">{ods.titulo}</span>
                          </span>
                        ) : null
                      })}
                    </div>
                  </Campo>
                )}
                {sda.justificacionOds && <Campo label="Justificación"><HtmlBlock html={sda.justificacionOds} /></Campo>}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
