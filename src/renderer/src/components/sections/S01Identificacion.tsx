import React, { useState, useRef, useEffect } from 'react'
import { FileText, ImagePlus, X, MapPin } from 'lucide-react'
import { Input, SectionTitle, Card, AutocompleteInput } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS, type Ciclo } from '@renderer/types'
import { listarComunidades } from '@renderer/services/curriculoService'

const CICLO_OPTIONS = Object.entries(CICLO_LABELS).map(([value, label]) => ({ value, label }))

const ASIGNATURAS = [
  'Lengua Castellana y Literatura',
  'Matemáticas',
  'Ciencias de la Naturaleza',
  'Ciencias Sociales',
  'Educación Plástica y Visual',
  'Música y Danza',
  'Educación Física',
]

export function S01Identificacion(): React.ReactElement {
  const {
    sda,
    setTitulo,
    setCiclo,
    setAmbito,
    setCurso,
    setNumSesiones,
    setTemporalizacion,
    setDocente,
    setCentro,
    setLogoCentro,
    setComunidadCurriculo
  } = useSdAStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [logoError, setLogoError] = useState('')
  const [comunidades, setComunidades] = useState<string[]>([])
  const [loadingComunidades, setLoadingComunidades] = useState(true)

  function processFile(file: File): void {
    setLogoError('')
    if (!file.type.startsWith('image/')) {
      setLogoError('Solo se admiten imágenes (PNG, JPG, SVG, WebP).')
      return
    }
    if (file.size > 1_500_000) {
      setLogoError('El archivo es demasiado grande (máx. 1,5 MB).')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => setLogoCentro(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const tituloRef = useRef<HTMLDivElement>(null)
  const [touched, setTouched] = useState({ titulo: false, ciclo: false, ambito: false })

  function touch(field: 'titulo' | 'ciclo' | 'ambito'): void {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  useEffect(() => {
    function onValidate(): void {
      setTouched({ titulo: true, ciclo: true, ambito: true })
      tituloRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    window.addEventListener('s01-validate', onValidate)
    return () => window.removeEventListener('s01-validate', onValidate)
  }, [])

  // Cargar la lista de comunidades disponibles
  const curriculoVersion = useSdAStore((s) => s.curriculoVersion)
  useEffect(() => {
    setLoadingComunidades(true)
    listarComunidades()
      .then(setComunidades)
      .catch(console.error)
      .finally(() => setLoadingComunidades(false))
  }, [curriculoVersion])

  const errorTitulo = touched.titulo && !sda.titulo ? 'Este campo es obligatorio' : undefined
  const errorCiclo = touched.ciclo && !sda.ciclo ? 'Selecciona un ciclo' : undefined
  const errorAmbito = touched.ambito && !sda.ambito ? 'Selecciona un área' : undefined

  const selectErrorCls = (hasError: boolean): string =>
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/50'
      : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100 dark:border-slate-600 dark:focus:border-primary-500 dark:focus:ring-primary-900/50'

  return (
    <div className="space-y-6">
      <SectionTitle
        number={1}
        title="Identificación"
        description="Datos generales que identifican la Situación de Aprendizaje."
        icon={<FileText size={22} />}
      />

      <Card title="Datos de la SdA">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2" ref={tituloRef}>
            <Input
              label={<>Título de la Situación de Aprendizaje <span className="text-red-500">*</span></>}
              placeholder="Ej: Detectives del agua: investigamos los recursos hídricos de Murcia"
              value={sda.titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={() => touch('titulo')}
              error={errorTitulo}
            />
            <AIGenerateButton
              mode="suggestions"
              label="Ideas de título"
              prompt={`Sugiere 5 títulos creativos y motivadores para una Situación de Aprendizaje de "${sda.ambito || 'Educación Primaria'}" para el ciclo "${sda.ciclo || 'Primaria'}". Los títulos deben ser atractivos, conectar con la vida real y despertar la curiosidad del alumnado. Devuelve solo la lista numerada, sin explicaciones.`}
              onResult={(t) => setTitulo(t)}
              currentValue={sda.titulo}
              className="mt-2"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              <MapPin size={14} className="text-primary-500" />
              Comunidad Autónoma
            </label>
            <select
              value={sda.comunidadCurriculo}
              onChange={(e) => setComunidadCurriculo(e.target.value)}
              disabled={loadingComunidades}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-shadow focus:outline-none focus:ring-2 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 ${selectErrorCls(false)}`}
            >
              {loadingComunidades && (
                <option value="">Cargando comunidades...</option>
              )}
              {comunidades.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Determina qué currículo se usará en la vinculación curricular
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Etapa / Ciclo <span className="text-red-500">*</span>
            </label>
            <select
              value={sda.ciclo}
              onChange={(e) => setCiclo(e.target.value as Ciclo)}
              onBlur={() => touch('ciclo')}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-shadow focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${selectErrorCls(!!errorCiclo)}`}
            >
              <option value="">Selecciona ciclo...</option>
              {CICLO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errorCiclo && <p className="text-xs text-red-500">{errorCiclo}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Área / Asignatura <span className="text-red-500">*</span>
            </label>
            <select
              value={sda.ambito}
              onChange={(e) => setAmbito(e.target.value)}
              onBlur={() => touch('ambito')}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-shadow focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${selectErrorCls(!!errorAmbito)}`}
            >
              <option value="">Selecciona asignatura...</option>
              {ASIGNATURAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            {errorAmbito && <p className="text-xs text-red-500">{errorAmbito}</p>}
          </div>

          <Input
            label="Curso / Grupo"
            placeholder="Ej: 3º A"
            value={sda.curso}
            onChange={(e) => setCurso(e.target.value)}
          />

          <Input
            label="Número de sesiones"
            type="number"
            min={1}
            max={40}
            value={sda.numSesiones}
            onChange={(e) => setNumSesiones(Number(e.target.value))}
          />

          <Input
            label="Temporalización"
            placeholder="Ej: 2ª quincena de octubre (3 semanas)"
            value={sda.temporalizacion}
            onChange={(e) => setTemporalizacion(e.target.value)}
          />
        </div>
      </Card>

      <Card title="Datos del centro">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AutocompleteInput
            storageKey="sda-autocomplete-docente"
            label="Docente responsable"
            placeholder="Nombre y apellidos"
            value={sda.docente}
            onChange={setDocente}
          />
          <AutocompleteInput
            storageKey="sda-autocomplete-centro"
            label="Centro educativo"
            placeholder="Nombre del colegio"
            value={sda.centro}
            onChange={setCentro}
          />
        </div>

        {/* Logo del centro */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Logo del centro (opcional)
          </label>

          {sda.logoCentro ? (
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-36 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                <img
                  src={sda.logoCentro}
                  alt="Logo del centro"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-primary-300 hover:text-primary-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ImagePlus size={13} />
                  Cambiar logo
                </button>
                <button
                  onClick={() => setLogoCentro('')}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-red-800 dark:bg-slate-800 dark:hover:bg-red-900/20"
                >
                  <X size={13} />
                  Eliminar logo
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors ${
                dragOver
                  ? 'border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/10'
                  : 'border-slate-200 bg-slate-50 hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-700 dark:bg-slate-800/50'
              }`}
            >
              <ImagePlus size={22} className="text-slate-300 dark:text-slate-600" />
              <p className="text-xs text-slate-400">
                Arrastra una imagen o <span className="font-medium text-primary-600 dark:text-primary-400">haz clic para seleccionar</span>
              </p>
              <p className="text-[11px] text-slate-300 dark:text-slate-600">PNG, JPG, SVG, WebP · máx. 1,5 MB</p>
            </div>
          )}

          {logoError && (
            <p className="mt-1.5 text-xs text-red-500">{logoError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </Card>
    </div>
  )
}
