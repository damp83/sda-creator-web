import React, { useState } from 'react'
import { CheckCircle, Plus, Trash2, Loader2, Sparkles, X, AlertCircle, Library } from 'lucide-react'
import { RichTextEditor, SectionTitle, Card, EmptyStateGuide } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getPrompt } from '@renderer/config/aiPrompts'
import { generarConIA } from '@renderer/services/aiService'
import { MOMENTOS, INSTRUMENTOS } from './evaluacion/evaluacionConstants'
import { parseRubricaJSON, buildRubricPrompt } from './evaluacion/evaluacionUtils'
import { RubricaTemplatesPicker } from './evaluacion/RubricaTemplatesPicker'
import { RubricaTable } from './evaluacion/RubricaTable'

export function S07Evaluacion(): React.ReactElement {
  const {
    sda,
    setCriteriosCalificacion,
    toggleMomentoEvaluacion,
    toggleInstrumentoEvaluacion,
    addInstrumentoPersonalizado,
    removeInstrumentoPersonalizado,
    setCriterioInstrumento,
    setRubricaTabla,
    setRubrica
  } = useSdAStore()

  const [nuevoInstrumento, setNuevoInstrumento] = useState('')
  const [generando, setGenerando] = useState(false)
  const [errorRubrica, setErrorRubrica] = useState('')
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  function submitNuevoInstrumento(): void {
    const v = nuevoInstrumento.trim()
    if (!v) return
    addInstrumentoPersonalizado(v)
    setNuevoInstrumento('')
  }

  async function handleGenerarRubrica(): Promise<void> {
    setGenerando(true)
    setErrorRubrica('')
    try {
      const texto = await generarConIA(buildRubricPrompt(sda))
      const filas = parseRubricaJSON(texto)
      setRubricaTabla(filas)
    } catch (e) {
      setErrorRubrica(e instanceof Error ? e.message : 'Error al generar la rúbrica')
    }
    setGenerando(false)
  }

  const todosLosInstrumentos = [...INSTRUMENTOS, ...(sda.instrumentosPersonalizados ?? [])]

  const criteriosConInstrumento = sda.elementosCurriculares.flatMap((elem) =>
    elem.criterios.map((criterio, ci) => ({
      key: `${elem.id}|${ci}`,
      area: elem.area,
      criterio
    }))
  )

  return (
    <div className="space-y-6">
      <SectionTitle
        number={7}
        title="Evaluación"
        description="Define cómo, cuándo y con qué herramientas se evaluará el aprendizaje del alumnado."
        icon={<CheckCircle size={22} />}
      />

      <Card
        title="Momentos de evaluación"
        subtitle="Selecciona los momentos en que se realizará la evaluación."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {MOMENTOS.map((m) => {
            const active = sda.momentosEvaluacion.includes(m.value)
            return (
              <button
                key={m.value}
                onClick={() => toggleMomentoEvaluacion(m.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  active
                    ? 'border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                    : 'border-slate-200 bg-white hover:border-primary-200 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <p className={`text-sm font-semibold ${active ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>
                  {m.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{m.desc}</p>
              </button>
            )
          })}
        </div>
      </Card>

      <Card
        title="Instrumentos de evaluación"
        subtitle="Selecciona los instrumentos que se utilizarán para recoger evidencias."
      >
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTOS.map((inst) => {
            const active = sda.instrumentosEvaluacion.includes(inst)
            return (
              <button
                key={inst}
                onClick={() => toggleInstrumentoEvaluacion(inst)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-primary-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {inst}
              </button>
            )
          })}
          {(sda.instrumentosPersonalizados ?? []).map((inst) => (
            <button
              key={inst}
              onClick={() => removeInstrumentoPersonalizado(inst)}
              title="Clic para eliminar"
              className="flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
            >
              {inst}
              <span className="text-[11px] opacity-60">×</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={nuevoInstrumento}
            onChange={(e) => setNuevoInstrumento(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitNuevoInstrumento() }}
            placeholder="Añadir instrumento personalizado..."
            className="flex-1 rounded-full border border-dashed border-slate-300 bg-transparent px-3 py-1 text-xs text-slate-600 placeholder-slate-400 focus:border-primary-400 focus:outline-none dark:border-slate-600 dark:text-slate-300"
          />
          {nuevoInstrumento.trim() && (
            <button
              onClick={submitNuevoInstrumento}
              className="flex shrink-0 items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700"
            >
              <Plus size={11} />
              Añadir
            </button>
          )}
        </div>
      </Card>

      <Card
        title="Instrumento por criterio"
        subtitle="Asocia un instrumento de evaluación a cada criterio seleccionado."
      >
        {criteriosConInstrumento.length > 0 ? (
          <div className="space-y-2">
            {criteriosConInstrumento.map(({ key, area, criterio }) => {
              const instrumento = sda.criterioInstrumentos?.[key] ?? ''
              return (
                <div
                  key={key}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{area}</p>
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{criterio}</p>
                  </div>
                  <select
                    value={instrumento}
                    onChange={(e) => setCriterioInstrumento(key, e.target.value)}
                    className="mt-0.5 shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">— Sin instrumento —</option>
                    {todosLosInstrumentos.map((inst) => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyStateGuide
            icon={<CheckCircle size={28} />}
            title="No hay criterios de evaluación"
            description="Para poder asociar instrumentos de evaluación, primero debes seleccionar los elementos curriculares correspondientes en la Sección 4."
            tips={[
              "Ve a 'Vinculación Curricular' (Sección 4).",
              "Añade al menos una Competencia Específica con sus criterios asociados.",
              "Vuelve aquí y podrás asignar qué instrumento (rúbrica, lista de cotejo...) usarás para medir cada criterio."
            ]}
          />
        )}
      </Card>

      <Card
        title="Criterios de calificación"
        subtitle="Describe el peso de cada elemento en la calificación global."
      >
        <RichTextEditor
          label="Criterios y ponderación"
          placeholder="Describe cómo se ponderarán los distintos elementos evaluados. Ej: Producto final (50%), participación y proceso (30%), exposición oral (20%)..."
          value={sda.criteriosCalificacion}
          onChange={(html) => setCriteriosCalificacion(html)}
          minRows={5}
          counter
        />
        <AIGenerateButton
          mode="text"
          label="Generar criterios de calificación"
          prompt={getPrompt('criteriosCalificacion', { titulo: sda.titulo || 'sin título', ambito: sda.ambito || 'Educación Primaria', ciclo: sda.ciclo || 'Primaria' })}
          onResult={(t) => setCriteriosCalificacion(t)}
          currentValue={sda.criteriosCalificacion}
          className="mt-3"
        />
      </Card>

      <Card
        title="Rúbrica de evaluación"
        subtitle="Tabla de niveles de desempeño por criterio."
        action={
          <div className="flex items-center gap-2">
            {(sda.rubricaTabla ?? []).length > 0 && (
              <button
                onClick={() => setRubricaTabla([])}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Trash2 size={12} />
                Borrar tabla
              </button>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplatePicker((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                <Library size={12} />
                Plantillas
              </button>
              {showTemplatePicker && (
                <RubricaTemplatesPicker
                  onSelect={(filas) => setRubricaTabla(filas)}
                  onClose={() => setShowTemplatePicker(false)}
                />
              )}
            </div>
            <button
              type="button"
              onClick={handleGenerarRubrica}
              disabled={generando}
              className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-600 hover:bg-violet-100 disabled:opacity-60 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-400"
            >
              {generando ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generando ? 'Generando…' : 'Generar con IA'}
            </button>
          </div>
        }
      >
        {errorRubrica && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span className="flex-1">{errorRubrica}</span>
            <button onClick={() => setErrorRubrica('')}><X size={12} /></button>
          </div>
        )}
        <RubricaTable
          filas={sda.rubricaTabla ?? []}
          fallbackValue={sda.rubrica}
          onFallbackChange={(html) => setRubrica(html)}
        />
      </Card>
    </div>
  )
}
