import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Check, Wand2, BookOpen, Baby, Sparkles, FileText } from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS, type Ciclo, SDA_INICIAL } from '@renderer/types'
import type { SdA } from '@renderer/types'
import { PLANTILLAS, type Plantilla } from '@renderer/data/templates'

interface Props {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

const CICLOS_INFANTIL: Ciclo[] = ['infantil_ciclo_1', 'infantil_ciclo_2']
const CICLOS_PRIMARIA: Ciclo[] = ['primaria_ciclo_1', 'primaria_ciclo_2', 'primaria_ciclo_3']

const AREAS_INFANTIL = [
  'Crecimiento en armonía',
  'Descubrimiento y exploración del entorno',
  'Comunicación y representación de la realidad',
]

const AREAS_PRIMARIA = [
  'Lengua Castellana y Literatura',
  'Matemáticas',
  'Ciencias de la Naturaleza',
  'Ciencias Sociales',
  'Educación Plástica y Visual',
  'Música y Danza',
  'Educación Física',
  'Lengua Extranjera (Inglés)',
  'Religión / Valores Cívicos',
  'Interdisciplinar (varias áreas)',
]

const TEMPLATE_COLOR: Record<string, string> = {
  emerald: 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 dark:border-emerald-800 dark:bg-emerald-900/20 dark:hover:border-emerald-600',
  blue:    'border-blue-200 bg-blue-50 hover:border-blue-400 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:border-blue-600',
  violet:  'border-violet-200 bg-violet-50 hover:border-violet-400 dark:border-violet-800 dark:bg-violet-900/20 dark:hover:border-violet-600',
  amber:   'border-amber-200 bg-amber-50 hover:border-amber-400 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:border-amber-600',
  rose:    'border-rose-200 bg-rose-50 hover:border-rose-400 dark:border-rose-800 dark:bg-rose-900/20 dark:hover:border-rose-600',
  teal:    'border-teal-200 bg-teal-50 hover:border-teal-400 dark:border-teal-800 dark:bg-teal-900/20 dark:hover:border-teal-600',
}

function getAreas(ciclo: Ciclo): string[] {
  return CICLOS_INFANTIL.includes(ciclo) ? AREAS_INFANTIL : AREAS_PRIMARIA
}

function getMatchingTemplates(ciclo: Ciclo, area: string): Plantilla[] {
  return PLANTILLAS.filter(
    (p) =>
      p.ciclo === ciclo &&
      (p.sda.ambito === area || (p.sda.areas as string[] | undefined)?.includes(area))
  )
}

export function NewSdAWizard({ isOpen, onClose, onComplete }: Props): React.ReactElement | null {
  const { nueva, setCiclo, setAmbito, setTitulo, setDocente, setCentro, cargar } = useSdAStore()

  const [step, setStep] = useState(1)
  const [selectedCiclo, setSelectedCiclo] = useState<Ciclo | ''>('')
  const [selectedArea, setSelectedArea] = useState('')
  const [titulo, setTituloLocal] = useState('')
  const [docente, setDocenteLocal] = useState('')
  const [centro, setCentroLocal] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setSelectedCiclo('')
      setSelectedArea('')
      setTituloLocal('')
      setDocenteLocal('')
      setCentroLocal('')
    }
  }, [isOpen])

  useEffect(() => { setSelectedArea('') }, [selectedCiclo])

  const matchingTemplates =
    selectedCiclo && selectedArea
      ? getMatchingTemplates(selectedCiclo as Ciclo, selectedArea)
      : []

  const totalSteps = matchingTemplates.length > 0 ? 4 : 3

  function handleComplete(templatePartial?: Partial<SdA>): void {
    if (templatePartial) {
      const now = new Date().toISOString()
      cargar(
        {
          ...SDA_INICIAL,
          ...templatePartial,
          id: crypto.randomUUID(),
          ciclo: (selectedCiclo || templatePartial.ciclo || SDA_INICIAL.ciclo) as Ciclo,
          ambito: selectedArea || templatePartial.ambito || SDA_INICIAL.ambito,
          areas: selectedArea ? [selectedArea] : (templatePartial.areas ?? []),
          titulo: titulo.trim() || templatePartial.titulo || '',
          docente: docente.trim() || templatePartial.docente || '',
          centro: centro.trim() || templatePartial.centro || '',
          fechaCreacion: now,
          fechaModificacion: now,
        } as SdA,
        ''
      )
    } else {
      nueva()
      if (selectedCiclo) setCiclo(selectedCiclo as Ciclo)
      if (selectedArea) setAmbito(selectedArea)
      if (titulo.trim()) setTitulo(titulo.trim())
      if (docente.trim()) setDocente(docente.trim())
      if (centro.trim()) setCentro(centro.trim())
    }
    onComplete()
  }

  if (!isOpen) return null

  const etapa = selectedCiclo
    ? CICLOS_INFANTIL.includes(selectedCiclo as Ciclo) ? 'infantil' : 'primaria'
    : null

  const canAdvanceStep3 = titulo.trim().length > 0

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Nueva situación de aprendizaje" className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                <Wand2 size={16} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Nueva Situación de Aprendizaje
                </h2>
                <p className="text-xs text-slate-400">
                  Paso {step} de {totalSteps}
                </p>
              </div>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-1.5 rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ── Paso 1: Ciclo ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ¿Para qué etapa es la SdA?
                </h3>
                <p className="text-xs text-slate-500">Selecciona el ciclo educativo al que va dirigida.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Baby size={13} /> Educación Infantil
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CICLOS_INFANTIL.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCiclo(c)}
                      className={`rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                        selectedCiclo === c
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{CICLO_LABELS[c]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <BookOpen size={13} /> Educación Primaria
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {CICLOS_PRIMARIA.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCiclo(c)}
                      className={`rounded-xl border-2 px-4 py-3 text-left text-sm transition-colors ${
                        selectedCiclo === c
                          ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-medium">{CICLO_LABELS[c]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Paso 2: Área ── */}
          {step === 2 && selectedCiclo && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  ¿Qué área o ámbito trabajas?
                </h3>
                <p className="text-xs text-slate-500">
                  Área principal para {etapa === 'infantil' ? 'Educación Infantil' : 'Educación Primaria'} —{' '}
                  {CICLO_LABELS[selectedCiclo]}.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {getAreas(selectedCiclo).map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedArea(area)}
                    className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm transition-colors ${
                      selectedArea === area
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className="font-medium">{area}</span>
                    {selectedArea === area && <Check size={14} className="float-right mt-0.5 text-primary-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Paso 3: Datos básicos ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-1 text-sm font-semibold text-slate-800 dark:text-slate-100">Datos de la SdA</h3>
                <p className="text-xs text-slate-500">Puedes modificar estos datos en cualquier momento.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTituloLocal(e.target.value)}
                    placeholder="Ej: Detectives del agua: investigamos los recursos hídricos de Murcia"
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Docente</label>
                  <input
                    type="text"
                    value={docente}
                    onChange={(e) => setDocenteLocal(e.target.value)}
                    placeholder="Nombre del docente o equipo"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">Centro educativo</label>
                  <input
                    type="text"
                    value={centro}
                    onChange={(e) => setCentroLocal(e.target.value)}
                    placeholder="Nombre del centro"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                </div>
                {selectedCiclo && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">Resumen</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        {CICLO_LABELS[selectedCiclo]}
                      </span>
                      {selectedArea && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          {selectedArea}
                        </span>
                      )}
                      {matchingTemplates.length > 0 && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          {matchingTemplates.length} plantilla{matchingTemplates.length > 1 ? 's' : ''} disponible{matchingTemplates.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Paso 4: Elegir plantilla ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    ¿Partes de una plantilla?
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Tenemos {matchingTemplates.length} plantilla{matchingTemplates.length > 1 ? 's' : ''} para{' '}
                  <strong>{selectedArea}</strong> en <strong>{selectedCiclo ? CICLO_LABELS[selectedCiclo] : ''}</strong>.
                  La plantilla rellena los campos más comunes; puedes editar todo después.
                </p>
              </div>

              <div className="space-y-2">
                {matchingTemplates.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleComplete(p.sda)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${TEMPLATE_COLOR[p.color] ?? TEMPLATE_COLOR.blue}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none">{p.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{p.nombre}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.descripcion}</p>
                        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {p.etiquetaCiclo} · {(p.sda.numSesiones ?? 0) > 0 ? `${p.sda.numSesiones} sesiones` : ''}
                        </p>
                      </div>
                      <ArrowRight size={14} className="mt-1 shrink-0 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleComplete()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
              >
                <FileText size={15} />
                Empezar en blanco
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          <button
            onClick={step === 1 ? onClose : () => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {step > 1 && <ArrowLeft size={14} />}
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>

          {/* Paso 4: los botones están en el body */}
          {step < totalSteps && step !== 4 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !selectedCiclo : step === 2 ? !selectedArea : !canAdvanceStep3}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40"
            >
              {step === 3 && totalSteps === 4 ? 'Ver plantillas' : 'Siguiente'}
              <ArrowRight size={14} />
            </button>
          )}

          {step === 3 && totalSteps === 3 && (
            <button
              onClick={() => handleComplete()}
              disabled={!canAdvanceStep3}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40"
            >
              <Wand2 size={14} />
              Crear SdA
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
