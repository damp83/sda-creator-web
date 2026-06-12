import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Loader2, AlertCircle, Search } from 'lucide-react'
import { Button } from '@renderer/components/ui'
import { cargarAmbitosPorComunidad, cargarAmbitos, getSaberesConBloque } from '@renderer/services/curriculoService'
import type { AmbitoCurriculo, AreaCurriculo, CompetenciaEspecifica, CicloKey } from '@renderer/types'
import { useSdAStore } from '@renderer/store/sdaStore'

interface Props {
  cicloKey: CicloKey
}

export function CurriculoSelector({ cicloKey }: Props): React.ReactElement {
  const { addElementoCurricular, sda } = useSdAStore()
  const comunidad = sda.comunidadCurriculo

  const [ambitos, setAmbitos] = useState<AmbitoCurriculo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selAmbito, setSelAmbito] = useState('')
  const [selArea, setSelArea] = useState('')
  const [selCE, setSelCE] = useState('')
  const [searchCE, setSearchCE] = useState('')
  const [selectedCriterios, setSelectedCriterios] = useState<string[]>([])
  const [selectedSaberes, setSelectedSaberes] = useState<string[]>([])

  const preseleccionarDesdeS01 = useCallback(
    (ambitosData: AmbitoCurriculo[]) => {
      if (!sda.ambito) return
      for (const amb of ambitosData) {
        for (const area of amb.areas) {
          if (area.nombre.includes(sda.ambito)) {
            setSelAmbito(amb.ambito)
            setSelArea(area.nombre)
            return
          }
        }
      }
    },
    [sda.ambito]
  )

  useEffect(() => {
    setLoading(true)
    setError(null)
    const loadFn = comunidad
      ? cargarAmbitosPorComunidad(comunidad)
      : cargarAmbitos()
    loadFn
      .then((data) => {
        setAmbitos(data)
        preseleccionarDesdeS01(data)
      })
      .catch(() => setError('No se pudieron cargar los datos del currículo.'))
      .finally(() => setLoading(false))
  }, [comunidad, preseleccionarDesdeS01])

  const ambitoObj = ambitos.find((a) => a.ambito === selAmbito)
  const areaObj: AreaCurriculo | undefined = ambitoObj?.areas.find((ar) => ar.nombre === selArea)
  const ceObj: CompetenciaEspecifica | undefined = areaObj?.competencias_especificas.find(
    (ce) => ce.ce === selCE
  )

  const criteriosDisponibles: string[] = ceObj?.criterios_evaluacion?.[cicloKey] ?? []

  const saberesConBloque = areaObj
    ? getSaberesConBloque(areaObj.saberes_basicos as Record<string, unknown>, cicloKey)
    : []

  const saberesDisponibles = saberesConBloque.flatMap((b) =>
    b.items.map((item) => ({ bloque: b.bloque, subbloque: b.subbloque, item }))
  )

  function resetSelection(): void {
    setSelCE('')
    setSelectedCriterios([])
    setSelectedSaberes([])
  }

  function handleAmbitoChange(v: string): void {
    setSelAmbito(v)
    setSelArea('')
    resetSelection()
  }

  function handleAreaChange(v: string): void {
    setSelArea(v)
    resetSelection()
    setSearchCE('')
  }

  function handleCEChange(v: string): void {
    setSelCE(v)
    setSelectedCriterios([])
    setSelectedSaberes([])
  }

  function toggleCriterio(c: string): void {
    setSelectedCriterios((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    )
  }

  function toggleSaber(s: string): void {
    setSelectedSaberes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const filteredCEs = searchCE
    ? (areaObj?.competencias_especificas ?? []).filter((ce) =>
        ce.ce.toLowerCase().includes(searchCE.toLowerCase())
      )
    : (areaObj?.competencias_especificas ?? [])

  const alreadyAdded = sda.elementosCurriculares.some(
    (e) => e.area === selArea && e.ce === selCE
  )

  function handleAdd(): void {
    if (!selAmbito || !selArea || !selCE) return
    addElementoCurricular({
      ambito: selAmbito,
      area: selArea,
      ce: selCE,
      criterios: selectedCriterios,
      saberes: selectedSaberes
    })
    resetSelection()
    setSelCE('')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Cargando currículo...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <AlertCircle size={16} />
        <span className="text-sm">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Paso 1: Ámbito */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Ámbito curricular
          </label>
          <select
            value={selAmbito}
            onChange={(e) => handleAmbitoChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-shadow focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Selecciona ámbito...</option>
            {ambitos.map((a) => (
              <option key={a.ambito} value={a.ambito}>
                {a.ambito}
              </option>
            ))}
          </select>
        </div>

        {/* Paso 2: Área */}
        {ambitoObj && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Área</label>
            <select
              value={selArea}
              onChange={(e) => handleAreaChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-shadow focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">Selecciona área...</option>
              {ambitoObj.areas.map((ar) => (
                <option key={ar.nombre} value={ar.nombre}>
                  {ar.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Paso 3: Competencia específica */}
      {areaObj && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Competencia específica
          </label>
          {areaObj.competencias_especificas.length > 4 && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchCE}
                onChange={(e) => setSearchCE(e.target.value)}
                placeholder="Buscar competencia..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3.5 text-sm text-slate-800 placeholder-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          )}
          <div className="space-y-2">
            {filteredCEs.length === 0 && (
              <p className="py-3 text-center text-xs text-slate-400">
                Sin resultados para &ldquo;{searchCE}&rdquo;
              </p>
            )}
            {filteredCEs.map((ce) => {
              const yaAñadida = sda.elementosCurriculares.some(
                (e) => e.area === selArea && e.ce === ce.ce
              )
              return (
                <button
                  key={ce.ce}
                  onClick={() => !yaAñadida && handleCEChange(ce.ce)}
                  disabled={yaAñadida}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                    selCE === ce.ce
                      ? 'border-primary-500 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20'
                      : yaAñadida
                        ? 'cursor-default border-emerald-200 bg-emerald-50 text-slate-400 dark:border-emerald-800 dark:bg-emerald-900/10'
                        : 'border-slate-200 bg-white hover:border-primary-300 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <span
                    className={`leading-snug ${selCE === ce.ce ? 'text-primary-700 dark:text-primary-300' : yaAñadida ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {ce.ce}
                  </span>
                  {yaAñadida && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      Ya añadida
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Paso 4: Criterios de evaluación */}
      {selCE && criteriosDisponibles.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Criterios de evaluación para {cicloKey.replace('_', ' ').replace('_', ' ')}
          </p>
          <div className="space-y-2">
            {criteriosDisponibles.map((criterio) => (
              <label
                key={criterio}
                className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <input
                  type="checkbox"
                  checked={selectedCriterios.includes(criterio)}
                  onChange={() => toggleCriterio(criterio)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{criterio}</span>
              </label>
            ))}
          </div>
          {criteriosDisponibles.length === 0 && (
            <p className="text-xs text-slate-400">
              No hay criterios definidos para este ciclo.
            </p>
          )}
        </div>
      )}

      {selCE && criteriosDisponibles.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          No hay criterios de evaluación definidos para este ciclo en esta competencia.
        </div>
      )}

      {/* Paso 5: Saberes básicos */}
      {selCE && saberesDisponibles.length > 0 && (
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Saberes básicos para {cicloKey.replace('_', ' ').replace('_', ' ')} (opcional)
          </p>
          <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
            {saberesConBloque.map((bloque) => (
              <div key={bloque.bloque + (bloque.subbloque ?? '')}>
                <p className="mb-1 mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {bloque.bloque}
                  {bloque.subbloque && ` › ${bloque.subbloque}`}
                </p>
                {bloque.items.map((item) => (
                  <label
                    key={item}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSaberes.includes(item)}
                      onChange={() => toggleSaber(item)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón añadir */}
      {selCE && !alreadyAdded && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={<Plus size={14} />}
            onClick={handleAdd}
          >
            Añadir al currículo
          </Button>
        </div>
      )}
    </div>
  )
}
