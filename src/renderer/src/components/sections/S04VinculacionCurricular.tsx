import React, { useState } from 'react'
import { BookMarked, Trash2, ChevronDown, ChevronRight, Plus, X } from 'lucide-react'
import { Button, SectionTitle, Card, Chip, EmptyStateGuide } from '@renderer/components/ui'
import { useSdAStore } from '@renderer/store/sdaStore'
import { COMPETENCIAS_CLAVE, type CompetenciaClave } from '@renderer/types'
import { CurriculoSelector } from '@renderer/components/curriculo/CurriculoSelector'
import type { CicloKey } from '@renderer/types'

const CC_LIST = Object.entries(COMPETENCIAS_CLAVE) as [CompetenciaClave, string][]

export function S04VinculacionCurricular(): React.ReactElement {
  const {
    sda,
    curriculoVersion,
    toggleCompetenciaClave,
    removeElementoCurricular,
    removeCriterioFromElemento,
    removeSaberFromElemento
  } = useSdAStore()

  const [showSelector, setShowSelector] = useState(false)
  const [expandedElem, setExpandedElem] = useState<string | null>(null)

  const cicloKey = sda.ciclo as CicloKey | ''

  function toggleElem(id: string): void {
    setExpandedElem(expandedElem === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={4}
        title="Vinculación Curricular"
        description="Selecciona las competencias clave, competencias específicas, criterios de evaluación y saberes básicos que se trabajarán."
        icon={<BookMarked size={22} />}
      />

      {!cicloKey && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Primero debes seleccionar el <strong>ciclo</strong> en la Sección 1 (Identificación) para ver los criterios de evaluación correspondientes.
        </div>
      )}

      {/* Competencias clave */}
      <Card title="Competencias clave" subtitle="Selecciona las competencias clave del perfil de salida que se trabajan.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CC_LIST.map(([key, label]) => {
            const active = sda.competenciasClave.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleCompetenciaClave(key)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  active
                    ? 'border-purple-400 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
                    : 'border-slate-200 bg-white hover:border-purple-200 dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                    active
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                  }`}
                >
                  {key}
                </span>
                <span
                  className={`text-xs leading-tight ${
                    active
                      ? 'font-medium text-purple-700 dark:text-purple-300'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Elementos curriculares seleccionados */}
      <Card
        title="Elementos curriculares seleccionados"
        subtitle={`${sda.elementosCurriculares.length} competencia${sda.elementosCurriculares.length !== 1 ? 's' : ''} específica${sda.elementosCurriculares.length !== 1 ? 's' : ''} añadida${sda.elementosCurriculares.length !== 1 ? 's' : ''}`}
        action={
          <Button
            variant={showSelector ? 'secondary' : 'primary'}
            size="sm"
            icon={showSelector ? <X size={14} /> : <Plus size={14} />}
            onClick={() => setShowSelector(!showSelector)}
          >
            {showSelector ? 'Cerrar' : 'Añadir CE'}
          </Button>
        }
      >
        {/* Selector curricular */}
        {showSelector && (
          <div className="mb-6 rounded-lg border border-primary-200 bg-primary-50/50 p-4 dark:border-primary-800 dark:bg-primary-900/10">
            <p className="mb-3 text-sm font-semibold text-primary-700 dark:text-primary-300">
              Seleccionar competencia específica
            </p>
            {cicloKey ? (
              <CurriculoSelector key={curriculoVersion} cicloKey={cicloKey} />
            ) : (
              <p className="text-sm text-slate-500">
                Selecciona el ciclo en la Sección 1 primero.
              </p>
            )}
          </div>
        )}

        {sda.elementosCurriculares.length === 0 ? (
          <EmptyStateGuide
            icon={<BookMarked size={28} />}
            title="Aún no has añadido elementos curriculares"
            description="La vinculación curricular garantiza que tu Situación de Aprendizaje está alineada con la normativa vigente y contribuye al perfil de salida del alumnado."
            tips={[
              "Selecciona primero una Competencia Específica.",
              "Al desplegarla, se mostrarán sus Criterios de Evaluación y Saberes Básicos asociados.",
              "Si tienes ciclo seleccionado, los criterios se filtrarán automáticamente a ese ciclo."
            ]}
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => setShowSelector(true)}
              >
                Añadir competencia específica
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sda.elementosCurriculares.map((elem) => (
              <div
                key={elem.id}
                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
              >
                {/* Cabecera del elemento */}
                <div className="flex items-start gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-700/50">
                  <button
                    onClick={() => toggleElem(elem.id)}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-600"
                  >
                    {expandedElem === elem.id ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {elem.ambito}
                      </span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                        {elem.area}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                      {elem.ce}
                    </p>
                    <div className="mt-1 flex gap-3 text-xs text-slate-400">
                      <span>{elem.criterios.length} criterio{elem.criterios.length !== 1 ? 's' : ''}</span>
                      <span>{elem.saberes.length} saber{elem.saberes.length !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeElementoCurricular(elem.id)}
                    className="shrink-0 rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Detalle expandido */}
                {expandedElem === elem.id && (
                  <div className="border-t border-slate-200 p-4 dark:border-slate-700 space-y-4">
                    {elem.criterios.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Criterios de evaluación
                        </p>
                        <div className="space-y-1">
                          {elem.criterios.map((criterio) => (
                            <div
                              key={criterio}
                              className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-700/50"
                            >
                              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                                {criterio}
                              </span>
                              <button
                                onClick={() => removeCriterioFromElemento(elem.id, criterio)}
                                className="shrink-0 text-slate-400 hover:text-red-500"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {elem.saberes.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Saberes básicos
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {elem.saberes.map((saber) => (
                            <Chip
                              key={saber}
                              label={saber}
                              onRemove={() => removeSaberFromElemento(elem.id, saber)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {elem.criterios.length === 0 && elem.saberes.length === 0 && (
                      <p className="text-sm text-slate-400">
                        No se han seleccionado criterios ni saberes para esta competencia.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
