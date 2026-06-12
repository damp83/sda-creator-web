import React, { useState } from 'react'
import { X, BarChart2, CheckCircle2, Circle, AlertTriangle, Info, Copy, Check, Sparkles, Loader2 } from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getSectionComplete, getSdAProgress } from '@renderer/utils/sdaProgress'
import { stripHtml } from '@renderer/utils/stripHtml'
import { useCoherenceWarnings } from '@renderer/hooks/useCoherenceWarnings'
import { generarConIA } from '@renderer/services/aiService'
import { CICLO_LABELS, type Ciclo } from '@renderer/types'
import type { SdA } from '@renderer/types'

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SECTION_NAMES = [
  'Identificación',
  'Justificación',
  'Reto / Producto Final',
  'Vinculación Curricular',
  'Metodología',
  'Secuencia Didáctica',
  'Evaluación',
  'Atención a la Diversidad',
  'Interdisciplinariedad',
  'ODS',
]

function getSectionDetail(sda: SdA, id: number): string {
  switch (id) {
    case 0:
      return sda.titulo ? `"${sda.titulo.slice(0, 30)}${sda.titulo.length > 30 ? '…' : ''}"` : '—'
    case 1: {
      const w = words(sda.justificacion) + words(sda.contexto)
      return w > 0 ? `${w} pal.` : '—'
    }
    case 2: {
      const w = words(sda.situacionProblema) + words(sda.productoFinal)
      return w > 0 ? `${w} pal.` : '—'
    }
    case 3:
      return sda.elementosCurriculares.length > 0
        ? `${sda.elementosCurriculares.length} elem. curricular${sda.elementosCurriculares.length > 1 ? 'es' : ''}`
        : '—'
    case 4: {
      const w = words(sda.planteamientoMetodologico)
      return w > 0 ? `${w} pal.` : '—'
    }
    case 5:
      return sda.sesiones.length > 0 ? `${sda.sesiones.length} sesión${sda.sesiones.length > 1 ? 'es' : ''}` : '—'
    case 6: {
      const w = words(sda.criteriosCalificacion) + words(sda.rubrica)
      return w > 0 ? `${w} pal.` : (sda.instrumentosEvaluacion.length > 0 ? `${sda.instrumentosEvaluacion.length} instrumentos` : '—')
    }
    case 7: {
      const w = words(sda.duaImplicacion) + words(sda.duaRepresentacion) + words(sda.duaAccionExpresion)
      return w > 0 ? `${w} pal.` : '—'
    }
    case 8:
      return sda.conexiones.length > 0 ? `${sda.conexiones.length} conexión${sda.conexiones.length > 1 ? 'es' : ''}` : '—'
    case 9:
      return sda.ods.length > 0 ? `${sda.ods.length} ODS` : '—'
    default:
      return '—'
  }
}

function words(text: string): number {
  const plain = stripHtml(text ?? '').trim()
  return plain ? plain.split(/\s+/).length : 0
}

function totalWords(sda: SdA): number {
  return (
    words(sda.justificacion) + words(sda.contexto) +
    words(sda.situacionProblema) + words(sda.productoFinal) + words(sda.hilo) +
    words(sda.planteamientoMetodologico) + words(sda.recursos) + words(sda.tiempos) +
    words(sda.criteriosCalificacion) + words(sda.rubrica) +
    words(sda.duaImplicacion) + words(sda.duaRepresentacion) + words(sda.duaAccionExpresion) +
    words(sda.transversales) + words(sda.justificacionOds) +
    sda.sesiones.reduce((acc, s) => acc + words(s.inicio) + words(s.desarrollo) + words(s.cierre), 0)
  )
}

function readingTime(totalW: number): string {
  const min = Math.ceil(totalW / 200)
  if (min < 1) return '< 1 min'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const rem = min % 60
  return rem > 0 ? `${h} h ${rem} min` : `${h} h`
}

interface SectionWordCount { label: string; w: number }

function getSectionWords(sda: SdA): SectionWordCount[] {
  return [
    { label: 'Identificación',         w: words(sda.titulo) },
    { label: 'Justificación',           w: words(sda.justificacion) + words(sda.contexto) },
    { label: 'Reto / Producto Final',   w: words(sda.hilo) + words(sda.situacionProblema) + words(sda.productoFinal) },
    { label: 'Vinculación Curricular',  w: 0 },
    { label: 'Metodología',             w: words(sda.planteamientoMetodologico) + words(sda.recursos) + words(sda.tiempos) },
    { label: 'Secuencia Didáctica',     w: sda.sesiones.reduce((acc, s) => acc + words(s.inicio) + words(s.desarrollo) + words(s.cierre), 0) },
    { label: 'Evaluación',              w: words(sda.criteriosCalificacion) + words(sda.rubrica) },
    { label: 'Atención a la Diversidad',w: words(sda.duaImplicacion) + words(sda.duaRepresentacion) + words(sda.duaAccionExpresion) },
    { label: 'Interdisciplinariedad',   w: words(sda.transversales) },
    { label: 'ODS',                     w: words(sda.justificacionOds) },
  ]
}

function buildResumen(sda: SdA): string {
  const { done, total, pct } = getSdAProgress(sda)
  const lines: string[] = [
    'SdA Creator — Estadísticas',
    '═'.repeat(36),
    `SdA: ${sda.titulo || '(sin título)'}`,
    `Progreso: ${pct}% — ${done} de ${total} secciones completadas`,
    `Palabras totales: ${totalWords(sda).toLocaleString('es-ES')} (lectura estimada: ${readingTime(totalWords(sda))})`,
    '',
    'Por sección:',
  ]
  SECTION_NAMES.forEach((name, i) => {
    const ok = getSectionComplete(sda, i) ? '✓' : '✗'
    const detail = getSectionDetail(sda, i)
    lines.push(`  ${ok} ${String(i + 1).padStart(2)}. ${name.padEnd(26)} ${detail}`)
  })
  return lines.join('\n')
}

export function StatsModal({ isOpen, onClose }: StatsModalProps): React.ReactElement | null {
  const { sda } = useSdAStore()
  const { done, total, pct } = getSdAProgress(sda)
  const coherenceWarnings = useCoherenceWarnings()
  const [copied, setCopied] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  async function handleCopiar(): Promise<void> {
    await navigator.clipboard.writeText(buildResumen(sda))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleGenerarResumen(): Promise<void> {
    setGeneratingSummary(true)
    setSummaryError(null)
    try {
      const competencias = sda.competenciasClave.slice(0, 4).join(', ') || '(no especificadas)'
      const odsStr = sda.ods.length > 0 ? sda.ods.join(', ') : '(ninguno)'
      const producto = stripHtml(sda.productoFinal || '').slice(0, 120) || '(no especificado)'
      const metod = stripHtml(sda.planteamientoMetodologico || '').slice(0, 100) || '(no especificado)'
      const prompt = `Eres experto en educación LOMLOE. Redacta un resumen ejecutivo profesional de esta Situación de Aprendizaje en un párrafo de 4-6 líneas, en tercera persona, destacando su valor pedagógico.

TÍTULO: ${sda.titulo || '(sin título)'}
CICLO/ETAPA: ${sda.ciclo ? (CICLO_LABELS[sda.ciclo as Ciclo] ?? sda.ciclo) : '(no especificado)'}
ÁREA: ${sda.ambito || sda.areas?.[0] || '(no especificado)'}
CURSO: ${sda.curso || '(no especificado)'}
SESIONES: ${sda.sesiones.length || sda.numSesiones || 0}
PROGRESO: ${pct}% completado (${done}/${total} secciones)
COMPETENCIAS CLAVE: ${competencias}
ODS: ${odsStr}
PRODUCTO FINAL: ${producto}
METODOLOGÍA: ${metod}

Solo el párrafo, en español, tono formal. Sin títulos ni encabezados.`
      const result = await generarConIA(prompt, 30_000)
      setAiSummary(result.trim())
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Error al generar el resumen')
    } finally {
      setGeneratingSummary(false)
    }
  }

  async function handleCopiarSummary(): Promise<void> {
    if (!aiSummary) return
    await navigator.clipboard.writeText(aiSummary)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  if (!isOpen) return null

  const tw = totalWords(sda)
  const sectionWords = getSectionWords(sda)
  const topSections = [...sectionWords]
    .filter((s) => s.w > 0)
    .sort((a, b) => b.w - a.w)
    .slice(0, 3)
  const wordsPerSession =
    sda.sesiones.length > 0
      ? Math.round(sda.sesiones.reduce((acc, s) => acc + words(s.inicio) + words(s.desarrollo) + words(s.cierre), 0) / sda.sesiones.length)
      : 0

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Estadísticas de la SdA" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <BarChart2 size={17} className="text-primary-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Estadísticas de la SdA</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopiar}
              title="Copiar resumen al portapapeles"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar resumen'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-premium">
          {/* Progreso global */}
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progreso global</span>
              <span className="text-sm font-black text-primary-500">{pct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">{done} de {total} secciones completadas · {tw.toLocaleString('es-ES')} palabras en total</p>
          </div>

          {/* Tabla de secciones */}
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Por sección</p>
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {SECTION_NAMES.map((name, i) => {
                const complete = getSectionComplete(sda, i)
                const detail = getSectionDetail(sda, i)
                return (
                  <div key={name} className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {name}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 mr-2">{detail}</span>
                    {complete
                      ? <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
                      : <Circle size={14} className="shrink-0 text-slate-300 dark:text-slate-600" />
                    }
                  </div>
                )
              })}
            </div>
          </div>

          {/* Verificador de coherencia */}
          {coherenceWarnings.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Coherencia ({coherenceWarnings.length})
              </p>
              <div className="space-y-2">
                {coherenceWarnings.map((w) => (
                  <div
                    key={w.id}
                    className={`flex items-start gap-2.5 rounded-xl px-3.5 py-2.5 text-xs ${
                      w.severity === 'warning'
                        ? 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-900/10 dark:text-amber-300'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400'
                    }`}
                  >
                    {w.severity === 'warning'
                      ? <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" />
                      : <Info size={13} className="mt-0.5 shrink-0 text-slate-400" />
                    }
                    <div className="min-w-0">
                      <p className="font-semibold leading-none mb-0.5">{w.sectionLabel}</p>
                      <p className="leading-relaxed opacity-90">{w.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lectura y escritura */}
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Lectura y escritura</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tiempo de lectura',  value: readingTime(tw) },
                { label: 'Palabras totales',    value: tw.toLocaleString('es-ES') },
                ...(wordsPerSession > 0 ? [{ label: 'Palabras/sesión', value: wordsPerSession.toLocaleString('es-ES') }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top secciones por contenido */}
          {topSections.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Secciones con más contenido
              </p>
              <div className="space-y-1.5">
                {topSections.map(({ label, w }, i) => {
                  const pctBar = tw > 0 ? Math.round((w / tw) * 100) : 0
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="w-4 text-[10px] font-black text-slate-400">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="truncate text-xs text-slate-600 dark:text-slate-300">{label}</span>
                          <span className="ml-2 shrink-0 text-[10px] font-semibold text-slate-400">{w.toLocaleString('es-ES')} pal.</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full rounded-full bg-primary-400 transition-all duration-500"
                            style={{ width: `${pctBar}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Totales estructurados */}
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Totales</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Sesiones', value: sda.sesiones.length },
                { label: 'Elem. curriculares', value: sda.elementosCurriculares.length },
                { label: 'Competencias clave', value: sda.competenciasClave.length },
                { label: 'ODS asignados', value: sda.ods.length },
                { label: 'Conexiones inter.', value: sda.conexiones.length },
                { label: 'Instrumentos eval.', value: sda.instrumentosEvaluacion.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/50">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen ejecutivo IA */}
          <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-violet-900/30 dark:bg-violet-900/10">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-violet-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400">
                  Resumen ejecutivo IA
                </p>
              </div>
              {aiSummary && (
                <button
                  onClick={handleCopiarSummary}
                  className="flex items-center gap-1 rounded-lg border border-violet-200 bg-white px-2 py-0.5 text-[10px] font-medium text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-800 dark:text-violet-400"
                >
                  {copiedSummary ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                  {copiedSummary ? 'Copiado' : 'Copiar'}
                </button>
              )}
            </div>

            {aiSummary ? (
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{aiSummary}</p>
            ) : summaryError ? (
              <p className="text-xs text-red-500">{summaryError}</p>
            ) : (
              <p className="mb-3 text-xs text-slate-400 dark:text-slate-500">
                Genera un párrafo profesional que resume la SdA, ideal para memorias o presentaciones a la comunidad educativa.
              </p>
            )}

            {!aiSummary && (
              <button
                onClick={handleGenerarResumen}
                disabled={generatingSummary}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {generatingSummary
                  ? <><Loader2 size={12} className="animate-spin" />Generando…</>
                  : <><Sparkles size={12} />Generar resumen ejecutivo</>
                }
              </button>
            )}
            {aiSummary && (
              <button
                onClick={() => { setAiSummary(null); setSummaryError(null) }}
                className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                Regenerar
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
