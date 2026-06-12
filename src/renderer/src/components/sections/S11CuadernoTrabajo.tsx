import React, { useState, useCallback, useEffect } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { useGenerarCuaderno, checkImagenDisponible } from '@renderer/hooks/useGenerarCuaderno'
import { BLOOM_CONFIG, BLOOM_ORDEN, DISENO_DEFECTO, LAYOUTS_CUADERNO, PATRONES_FONDO, FORMAS_TARJETA, TIPOGRAFIAS_CUADERNO, DECORACIONES_CUADERNO } from '@renderer/types'
import type { MaterialSesion, TareaBloom, DisenoCuaderno } from '@renderer/types'
import { cuadernoToMarkdown } from '@renderer/utils/cuadernoToMarkdown'
import { BookOpen, Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp, Trophy, Zap, AlertTriangle, Trash2, FileDown, Image as ImageIcon, FileText, Palette } from 'lucide-react'

// ─── Editor de diseño del cuaderno ────────────────────────────────────────────

const DISENO_OPCIONES: {
  campo: keyof DisenoCuaderno
  label: string
  icono: string
  opciones: { value: string; label: string }[]
}[] = [
  {
    campo: 'layout', label: 'Disposición de tareas', icono: '📐',
    opciones: LAYOUTS_CUADERNO.map(v => ({
      value: v,
      label: v === 'rejilla' ? 'Rejilla 3×2' : v === 'mosaico' ? 'Mosaico 2 col.' : 'Fichas anchas'
    }))
  },
  {
    campo: 'patronFondo', label: 'Fondo del papel', icono: '📄',
    opciones: PATRONES_FONDO.map(v => ({
      value: v,
      label: v === 'cuadricula' ? 'Cuadrícula' : v === 'puntos' ? 'Puntos' : v === 'lineas' ? 'Líneas' : 'Liso'
    }))
  },
  {
    campo: 'formaTarjeta', label: 'Forma de las tarjetas', icono: '🃏',
    opciones: FORMAS_TARJETA.map(v => ({
      value: v,
      label: v === 'redondeada' ? 'Redondeada' : v === 'recta' ? 'Recta' : 'Sello'
    }))
  },
  {
    campo: 'tipografia', label: 'Tipografía', icono: '🔤',
    opciones: TIPOGRAFIAS_CUADERNO.map(v => ({
      value: v,
      label: v === 'redondeada' ? 'Redondeada' : v === 'clasica' ? 'Clásica' : 'Moderna'
    }))
  },
  {
    campo: 'decoracion', label: 'Decoración', icono: '✨',
    opciones: DECORACIONES_CUADERNO.map(v => ({
      value: v,
      label: v === 'minima' ? 'Mínima' : v === 'media' ? 'Media' : 'Alta'
    }))
  },
]

function DisenoEditor({ diseno, onChange }: { diseno: DisenoCuaderno; onChange: (d: DisenoCuaderno) => void }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Palette size={15} className="text-violet-500" />
          Diseño del cuaderno
          <span className="text-xs font-normal text-slate-400">— elegido por la IA, editable</span>
        </span>
        {abierto ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
      </button>
      {abierto && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-3">
          {DISENO_OPCIONES.map(({ campo, label, icono, opciones }) => (
            <div key={campo} className="flex flex-wrap items-center gap-2">
              <span className="w-44 shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
                {icono} {label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {opciones.map(op => (
                  <button
                    key={op.value}
                    onClick={() => onChange({ ...diseno, [campo]: op.value })}
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      diseno[campo] === op.value
                        ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-900/30 dark:text-violet-300'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Los cambios se aplican al exportar el PDF del alumno. La IA elige un diseño inicial al generar el marco; aquí puedes ajustarlo.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Tarjeta de una tarea Bloom ──────────────────────────────────────────────

function TareaCard({ tarea }: { tarea: TareaBloom }) {
  const [mostrarAyudas, setMostrarAyudas] = useState(false)
  const cfg = BLOOM_CONFIG[tarea.nivelBloom]

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cfg.icono}</span>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
              {cfg.label} · {tarea.verboBloom}
            </span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{tarea.titulo}</p>
          </div>
        </div>
        <span className={`shrink-0 flex items-center gap-0.5 text-xs font-bold ${cfg.color}`}>
          <Zap size={11} />
          {tarea.xp} XP
        </span>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-7">{tarea.enunciado}</p>

      {(tarea.pista || tarea.retoExtra) && (
        <div className="pl-7">
          <button
            onClick={() => setMostrarAyudas(v => !v)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {mostrarAyudas ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {mostrarAyudas ? 'Ocultar ayudas' : 'Ver ayudas y retos'}
          </button>
          {mostrarAyudas && (
            <div className="mt-2 space-y-1.5">
              {tarea.pista && (
                <div className="rounded-lg bg-white/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">💙 Pista (apoyo)</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{tarea.pista}</p>
                </div>
              )}
              {tarea.retoExtra && (
                <div className="rounded-lg bg-white/70 dark:bg-slate-800/50 border border-amber-200 dark:border-amber-800/40 px-3 py-2">
                  <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">⭐ Reto extra (ampliación)</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{tarea.retoExtra}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tarjeta de una sesión ────────────────────────────────────────────────────

function SesionCard({
  material, sesionIndex, onRegerar, onIlustrar, generando, imagenDisponible
}: {
  material: MaterialSesion
  sesionIndex: number
  onRegerar: (i: number) => void
  onIlustrar: (i: number) => void
  generando: boolean
  imagenDisponible: boolean
}) {
  const [abierta, setAbierta] = useState(sesionIndex === 0)
  const xpTotal = material.tareas.reduce((acc, t) => acc + t.xp, 0)
  const tareasOrdenadas = BLOOM_ORDEN.map(n => material.tareas.find(t => t.nivelBloom === n)).filter(Boolean) as TareaBloom[]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
      {/* Cabecera de la sesión */}
      <button
        onClick={() => setAbierta(v => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/40 text-sm font-bold text-violet-700 dark:text-violet-300">
            {material.sesionNumero}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 truncate">
              {material.misionTitulo || `Misión ${material.sesionNumero}`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {material.tareas.length} tareas · {xpTotal} XP totales
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {imagenDisponible && (
            <button
              onClick={e => { e.stopPropagation(); onIlustrar(sesionIndex) }}
              disabled={generando}
              className="flex items-center gap-1 rounded-lg border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/30 px-2.5 py-1.5 text-[11px] font-medium text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 disabled:opacity-40 transition-colors"
              title={material.ilustracion ? 'Regenerar ilustración' : 'Generar ilustración con IA'}
            >
              <ImageIcon size={11} />
              {material.ilustracion ? 'Reilustrar' : 'Ilustrar'}
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onRegerar(sesionIndex) }}
            disabled={generando}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
          >
            <RefreshCw size={11} />
            Regenerar
          </button>
          {abierta ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {abierta && (
        <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-4 space-y-4">
          {/* Ilustración generada */}
          {material.ilustracion && (
            <img
              src={material.ilustracion}
              alt={`Ilustración de la misión ${material.sesionNumero}`}
              className="mx-auto max-h-48 rounded-xl border-2 border-violet-200 dark:border-violet-800 shadow-sm"
            />
          )}

          {/* Narrativa de la misión */}
          {material.narrativa && (
            <div className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 px-4 py-3">
              <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 mb-1">📜 Contexto de la misión</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">{material.narrativa}</p>
            </div>
          )}

          {/* Escala Bloom visual */}
          <div className="flex gap-1">
            {BLOOM_ORDEN.map(nivel => {
              const cfg = BLOOM_CONFIG[nivel]
              const tiene = material.tareas.some(t => t.nivelBloom === nivel)
              return (
                <div key={nivel} className="flex-1 text-center">
                  <div className={`rounded-md py-1 text-[10px] font-semibold ${tiene ? `${cfg.bg} ${cfg.color}` : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                    {cfg.icono}
                    <div className="hidden sm:block">{cfg.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tareas */}
          <div className="space-y-3">
            {tareasOrdenadas.map(tarea => (
              <TareaCard key={tarea.id} tarea={tarea} />
            ))}
          </div>

          {/* Reflexión final */}
          {material.reflexion && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">🪞 Reflexión final</p>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">{material.reflexion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal S11 ─────────────────────────────────────────────────

export function S11CuadernoTrabajo(): React.ReactElement {
  const { sda, clearCuaderno, setCuadernoDiseno } = useSdAStore()
  const { generando, progreso, error, generarMarco, generarSesion, generarTodo, ilustrarSesion, ilustrarTodo, clearError } = useGenerarCuaderno()
  const [exportando, setExportando] = useState(false)
  const [imagenInfo, setImagenInfo] = useState<{ disponible: boolean; proveedor: string }>({ disponible: false, proveedor: 'claude' })
  const cuaderno = sda.cuaderno
  const sesiones = sda.sesiones

  useEffect(() => {
    void checkImagenDisponible().then(setImagenInfo)
  }, [cuaderno])

  const exportarParaNotebookLM = useCallback(async () => {
    if (!cuaderno || !window.api?.exportarTexto) return
    const md = cuadernoToMarkdown(sda)
    try {
      await window.api.exportarTexto({
        content: md,
        defaultName: `NotebookLM — ${sda.titulo || cuaderno.tematicaJuego}`,
        extension: 'md'
      })
    } catch (e) {
      console.error('[Cuaderno] Error exportando para NotebookLM:', e)
    }
  }, [cuaderno, sda])

  const exportarCuadernoPdf = useCallback(async () => {
    if (!cuaderno || !window.api?.exportarPDF) return
    setExportando(true)
    document.body.classList.add('cuaderno-export-mode')
    try {
      await window.api.exportarPDF({
        centro: sda.centro ?? '',
        titulo: `Cuaderno — ${sda.titulo}`,
        logoUrl: sda.logoCentro,
        landscape: true,
        sinPie: true
      })
    } catch (e) {
      console.error('[Cuaderno] Error exportando PDF:', e)
    } finally {
      document.body.classList.remove('cuaderno-export-mode')
      setExportando(false)
    }
  }, [cuaderno, sda.centro, sda.titulo, sda.logoCentro])

  // Sin sesiones diseñadas aún
  if (sesiones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen size={40} className="mb-4 text-slate-300" />
        <h3 className="text-base font-semibold text-slate-600 dark:text-slate-400">Sin sesiones diseñadas</h3>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 max-w-sm">
          Diseña primero las sesiones en <strong>S06 — Secuencia Didáctica</strong> para poder generar el cuaderno de trabajo del alumnado.
        </p>
      </div>
    )
  }

  // Sin marco gamificado aún
  if (!cuaderno) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-violet-200 bg-violet-50 dark:border-violet-800/40 dark:bg-violet-900/20 p-6">
          <div className="flex items-start gap-4">
            <Sparkles size={24} className="mt-0.5 shrink-0 text-violet-500" />
            <div>
              <h3 className="text-base font-semibold text-violet-800 dark:text-violet-300">
                Cuaderno de Trabajo con Taxonomía de Bloom
              </h3>
              <p className="mt-1.5 text-sm text-violet-700 dark:text-violet-400 leading-relaxed">
                La IA generará materiales gamificados para cada sesión con <strong>6 tareas por sesión</strong> (una por nivel de Bloom),
                adaptadas al nivel del alumnado con pistas de apoyo y retos de ampliación.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-violet-700 dark:text-violet-400">
                <li className="flex items-center gap-2"><span className="text-base">🔍</span> <strong>Recordar</strong> — accesible para todo el alumnado</li>
                <li className="flex items-center gap-2"><span className="text-base">💡</span> <strong>Comprender</strong> — comprensión profunda del contenido</li>
                <li className="flex items-center gap-2"><span className="text-base">⚙️</span> <strong>Aplicar</strong> — uso en situaciones nuevas</li>
                <li className="flex items-center gap-2"><span className="text-base">🔬</span> <strong>Analizar</strong> — relaciones y diferencias</li>
                <li className="flex items-center gap-2"><span className="text-base">⚖️</span> <strong>Evaluar</strong> — juicios razonados</li>
                <li className="flex items-center gap-2"><span className="text-base">✨</span> <strong>Crear</strong> — producción original (reto máximo)</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button onClick={clearError} className="ml-auto shrink-0 text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <button
          onClick={generarMarco}
          disabled={generando}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-violet-700 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {generando
            ? <><Loader2 size={18} className="animate-spin" /> {progreso ?? 'Generando…'}</>
            : <><Sparkles size={18} /> Generar marco gamificado · {sesiones.length} sesiones</>
          }
        </button>
      </div>
    )
  }

  // Marco ya generado — mostrar cuaderno
  const sesionesGeneradas = cuaderno.sesiones.filter(s => s.generado).length
  const xpMaximo = cuaderno.sesiones.reduce((acc, s) => acc + s.tareas.reduce((a, t) => a + t.xp, 0), 0)

  const tema = cuaderno.temaVisual
  const bannerStyle = tema
    ? { background: `linear-gradient(135deg, ${tema.colorPrimario}, ${tema.colorSecundario})` }
    : undefined

  return (
    <div className="space-y-6">
      {/* Portada del cuaderno */}
      <div
        className={`rounded-2xl p-6 text-white shadow-lg ${tema ? '' : 'bg-gradient-to-br from-violet-600 to-indigo-700'}`}
        style={bannerStyle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Trophy size={20} className="text-yellow-300" />
              <span className="text-sm font-semibold text-white/80">Cuaderno de Trabajo {tema && `· ${tema.emojiTema}`}</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{cuaderno.tematicaJuego}</h2>
            <p className="mt-1 text-sm text-white/80">{cuaderno.personaje}</p>
            <p className="mt-3 text-sm text-white/90 leading-relaxed">{cuaderno.descripcionMundo}</p>
            {cuaderno.diseno && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  `📐 ${cuaderno.diseno.layout}`,
                  `📄 fondo ${cuaderno.diseno.patronFondo}`,
                  `🃏 tarjetas ${cuaderno.diseno.formaTarjeta}`,
                  `🔤 letra ${cuaderno.diseno.tipografia}`,
                  `✨ decoración ${cuaderno.diseno.decoracion}`
                ].map(chip => (
                  <span key={chip} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/85">
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
          {tema?.mascotaSvg && (
            <div
              className="hidden sm:block shrink-0 h-20 w-20 rounded-xl bg-white/90 p-2 shadow-md [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: tema.mascotaSvg }}
            />
          )}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={exportarParaNotebookLM}
              disabled={generando}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              title="Exportar como documento Markdown para subirlo a NotebookLM"
            >
              <FileText size={13} />
              NotebookLM
            </button>
            <button
              onClick={exportarCuadernoPdf}
              disabled={exportando || generando}
              className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
              title="Exportar cuaderno como PDF"
            >
              {exportando ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
              {exportando ? 'Exportando…' : 'PDF alumno'}
            </button>
            <button
              onClick={() => { if (window.confirm('¿Eliminar el cuaderno generado?')) clearCuaderno() }}
              className="shrink-0 rounded-lg p-1.5 text-violet-300 hover:bg-white/10 transition-colors"
              title="Eliminar cuaderno"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Progreso XP */}
        <div className="mt-4 rounded-xl bg-white/10 px-4 py-3">
          <div className="flex items-center justify-between text-xs text-violet-200 mb-1.5">
            <span className="flex items-center gap-1"><Zap size={11} /> Sistema XP</span>
            <span>{sesionesGeneradas} / {sesiones.length} misiones generadas · {xpMaximo} XP máximos</span>
          </div>
          <p className="text-xs text-violet-200 leading-relaxed">{cuaderno.instruccionesHero}</p>
        </div>
      </div>

      {/* Editor de diseño */}
      <DisenoEditor
        diseno={cuaderno.diseno ?? DISENO_DEFECTO}
        onChange={setCuadernoDiseno}
      />

      {/* Leyenda Bloom */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {BLOOM_ORDEN.map(nivel => {
          const cfg = BLOOM_CONFIG[nivel]
          return (
            <div key={nivel} className={`rounded-lg ${cfg.bg} ${cfg.border} border px-2 py-1.5 text-center`}>
              <div className="text-base">{cfg.icono}</div>
              <div className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label}</div>
              <div className="text-[9px] text-slate-500">{cfg.xp} XP</div>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 px-4 py-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          <button onClick={clearError} className="ml-auto shrink-0 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Progreso de generación */}
      {generando && progreso && (
        <div className="flex items-center gap-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 px-4 py-3">
          <Loader2 size={15} className="animate-spin text-violet-500 shrink-0" />
          <p className="text-sm text-violet-700 dark:text-violet-400">{progreso}</p>
        </div>
      )}

      {/* Botón generar todas las sesiones pendientes */}
      {cuaderno.sesiones.some(s => !s.generado) && (
        <button
          onClick={generarTodo}
          disabled={generando}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-700 py-3 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50 transition-colors"
        >
          {generando
            ? <><Loader2 size={15} className="animate-spin" /> Generando sesiones…</>
            : <><Sparkles size={15} /> Generar todas las sesiones pendientes</>
          }
        </button>
      )}

      {/* Ilustraciones con IA */}
      {cuaderno.sesiones.some(s => s.generado) && (
        imagenInfo.disponible ? (
          cuaderno.sesiones.some(s => s.generado && !s.ilustracion) && (
            <button
              onClick={ilustrarTodo}
              disabled={generando}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-700 py-3 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 disabled:opacity-50 transition-colors"
            >
              {generando
                ? <><Loader2 size={15} className="animate-spin" /> Ilustrando…</>
                : <><ImageIcon size={15} /> Ilustrar misiones con IA ({cuaderno.sesiones.filter(s => s.generado && !s.ilustracion).length} pendientes)</>
              }
            </button>
          )
        ) : (
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 px-4 py-3">
            <ImageIcon size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Para ilustrar el cuaderno con imágenes generadas por IA, cambia el proveedor a <strong>OpenAI</strong> o <strong>Gemini</strong> en Ajustes → IA. El proveedor actual ({imagenInfo.proveedor === 'claude' ? 'Claude' : imagenInfo.proveedor}) no genera imágenes.
            </p>
          </div>
        )
      )}

      {/* Tarjetas de sesión */}
      <div className="space-y-4">
        {cuaderno.sesiones.map((material, idx) => {
          const sesionReal = sesiones.find(s => s.numero === material.sesionNumero)
          if (!material.generado) {
            return (
              <div key={idx} className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-bold text-slate-500">
                    {material.sesionNumero}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {sesionReal?.titulo || `Sesión ${material.sesionNumero}`}
                    </p>
                    <p className="text-xs text-slate-400">Sin generar</p>
                  </div>
                </div>
                <button
                  onClick={() => generarSesion(idx)}
                  disabled={generando}
                  className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {generando ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Generar
                </button>
              </div>
            )
          }
          return (
            <SesionCard
              key={idx}
              material={material}
              sesionIndex={idx}
              onRegerar={generarSesion}
              onIlustrar={ilustrarSesion}
              generando={generando}
              imagenDisponible={imagenInfo.disponible}
            />
          )
        })}
      </div>
    </div>
  )
}
