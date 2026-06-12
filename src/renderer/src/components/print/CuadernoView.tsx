import React from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { BLOOM_CONFIG, BLOOM_ORDEN } from '@renderer/types'
import type { MaterialSesion, TareaBloom, NivelBloom } from '@renderer/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cicloTexto(ciclo: string): string {
  const map: Record<string, string> = {
    infantil_ciclo_1: 'Ed. Infantil — 1.er ciclo',
    infantil_ciclo_2: 'Ed. Infantil — 2.º ciclo',
    primaria_ciclo_1: 'Primaria — 1.er ciclo',
    primaria_ciclo_2: 'Primaria — 2.º ciclo',
    primaria_ciclo_3: 'Primaria — 3.er ciclo',
  }
  return map[ciclo] ?? ciclo
}

const GEMA_COLOR: Record<NivelBloom, string> = {
  recordar:   'linear-gradient(135deg,#cbd5e1,#94a3b8)',
  comprender: 'linear-gradient(135deg,#93c5fd,#3b82f6)',
  aplicar:    'linear-gradient(135deg,#86efac,#22c55e)',
  analizar:   'linear-gradient(135deg,#fde047,#f59e0b)',
  evaluar:    'linear-gradient(135deg,#fdba74,#f97316)',
  crear:      'linear-gradient(135deg,#c4b5fd,#8b5cf6)',
}

const FILA_BG: Record<NivelBloom, string> = {
  recordar: '#f1f5f9', comprender: '#dbeafe', aplicar: '#dcfce7',
  analizar: '#fef3c7', evaluar: '#ffedd5', crear: '#ede9fe',
}

function Hud({ etiqueta }: { etiqueta: string }) {
  return (
    <div className="cb-hud">
      <span className="cb-hud-gema">⚡ {etiqueta}</span>
      <div className="cb-hud-bar"><span /></div>
      <span className="cb-hud-gema">★</span>
    </div>
  )
}

// ─── Tarea Bloom (carta) ──────────────────────────────────────────────────────

function TareaImpresa({ tarea }: { tarea: TareaBloom }) {
  const cfg = BLOOM_CONFIG[tarea.nivelBloom]
  return (
    <div className={`cb-tarea cb-n-${tarea.nivelBloom}`}>
      <div className="cb-tarea-top">
        <span className="cb-tarea-nivel"><span className="ic">{cfg.icono}</span> {cfg.label}</span>
        <span className="cb-xp-gema">⚡ {tarea.xp} XP</span>
      </div>
      <div className="cb-tarea-cuerpo">
        <p className="cb-tarea-nombre">{tarea.titulo}</p>
        <p className="cb-tarea-enunciado">{tarea.enunciado}</p>
        <div className="cb-tarea-escribir" />
        {tarea.pista && (
          <div className="cb-tarea-ayuda cb-tarea-pista">
            <b>💙 Pista</b>{tarea.pista}
          </div>
        )}
        {tarea.retoExtra && (
          <div className="cb-tarea-ayuda cb-tarea-reto">
            <b>⭐ Reto extra</b>{tarea.retoExtra}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Página de misión ─────────────────────────────────────────────────────────

function PaginaSesion({ material, sesionTitulo }: { material: MaterialSesion; sesionTitulo: string }) {
  const xpTotal = material.tareas.reduce((acc, t) => acc + t.xp, 0)
  const tareasOrdenadas = BLOOM_ORDEN
    .map(n => material.tareas.find(t => t.nivelBloom === n))
    .filter(Boolean) as TareaBloom[]

  return (
    <div className="cb-page cb-sesion">
      <div className="cb-sesion-banner">
        <div className="cb-sesion-num">{material.sesionNumero}</div>
        <div className="cb-sesion-info">
          <p className="cb-sesion-label">Misión {material.sesionNumero}</p>
          <p className="cb-sesion-titulo">{material.misionTitulo || sesionTitulo}</p>
          {material.narrativa && <p className="cb-sesion-narrativa">{material.narrativa}</p>}
        </div>
        <div className="cb-sesion-xptotal">
          <b>{xpTotal}</b>
          <small>XP totales</small>
        </div>
        {material.ilustracion && (
          <img className="cb-sesion-ilustracion" src={material.ilustracion} alt={`Misión ${material.sesionNumero}`} />
        )}
      </div>

      <div className="cb-tareas-grid">
        {tareasOrdenadas.map(t => <TareaImpresa key={t.id} tarea={t} />)}
      </div>

      {material.reflexion && (
        <div className="cb-reflexion">
          <span className="cb-reflexion-label">🪞 Reflexiona</span>
          <span className="cb-reflexion-pregunta">{material.reflexion}</span>
          <span className="cb-reflexion-linea" />
        </div>
      )}
    </div>
  )
}

// ─── Portada ──────────────────────────────────────────────────────────────────

function Portada() {
  const { sda } = useSdAStore()
  const cuaderno = sda.cuaderno!
  return (
    <div className="cb-page cb-portada">
      <p className="cb-portada-tipo">⭐ {cuaderno.personaje || 'Cuaderno de Trabajo'}</p>
      {cuaderno.temaVisual?.mascotaSvg && (
        <div className="cb-portada-mascota" dangerouslySetInnerHTML={{ __html: cuaderno.temaVisual.mascotaSvg }} />
      )}
      <h1 className="cb-portada-titulo">{cuaderno.tematicaJuego}</h1>
      <p className="cb-portada-subtitulo">{sda.titulo || 'Situación de Aprendizaje'}</p>
      <span className="cb-portada-cta">🚀 ¡A la aventura!</span>
      <div className="cb-portada-meta">
        {sda.ambito && <span>📚 {sda.ambito}</span>}
        {sda.ciclo && <span>🎓 {cicloTexto(sda.ciclo)}</span>}
        {sda.curso && <span>📅 {sda.curso}</span>}
      </div>
    </div>
  )
}

// ─── Página de datos del alumno + datapad ─────────────────────────────────────

function PaginaDatos() {
  const { sda } = useSdAStore()
  const cuaderno = sda.cuaderno!
  return (
    <div className="cb-page">
      <Hud etiqueta="Inicio de misión" />
      <div className="cb-datos-wrap">
        <div className="cb-card">
          <p className="cb-card-titulo">✏️ Mis datos</p>
          {[
            'Nombre y apellidos', 'Clase / Curso', 'Centro escolar', 'Fecha de inicio'
          ].map(label => (
            <div key={label} className="cb-datos-campo">
              <p className="cb-datos-label">{label}</p>
              <div className="cb-datos-linea" />
            </div>
          ))}
        </div>
        <div className="cb-card">
          <p className="cb-card-titulo">📡 {cuaderno.personaje ? 'Tu misión' : 'Bienvenida'}</p>
          <p className="cb-datapad-texto">{cuaderno.descripcionMundo}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Página guía + pirámide Bloom ─────────────────────────────────────────────

function PaginaGuia({ instruccionesHero }: { instruccionesHero: string }) {
  // Pirámide: Crear arriba (6) … Recordar abajo (1)
  const ordenPiramide: { nivel: NivelBloom; n: number }[] =
    [...BLOOM_ORDEN].reverse().map((nivel, i) => ({ nivel, n: 6 - i }))

  return (
    <div className="cb-page">
      <span className="cb-titulo-pill">⚡ Tu guía de juego</span>
      <div className="cb-guia-grid">
        <div className="cb-guia-reglas">{instruccionesHero}</div>
        <div className="cb-piramide">
          {ordenPiramide.map(({ nivel, n }) => {
            const cfg = BLOOM_CONFIG[nivel]
            return (
              <div key={nivel} className="cb-piramide-fila" data-n={n} style={{ background: FILA_BG[nivel] }}>
                <span className="cb-piramide-gema" style={{ background: GEMA_COLOR[nivel] }}>
                  <span>{cfg.icono}</span>
                </span>
                <div className="cb-piramide-info">
                  <div className="cb-piramide-nivel">{cfg.label} · {cfg.xp} XP</div>
                  <div className="cb-piramide-desc">{cfg.descripcion} — {cfg.verbos.slice(0, 3).join(', ')}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Página registro de misiones ──────────────────────────────────────────────

function PaginaRegistro({ sesiones }: { sesiones: MaterialSesion[] }) {
  const xpMax = sesiones.reduce((acc, s) => acc + s.tareas.reduce((a, t) => a + t.xp, 0), 0)
  return (
    <div className="cb-page">
      <Hud etiqueta={`XP máximo: ${xpMax}`} />
      <span className="cb-titulo-pill">🗺️ Mi registro de misiones</span>
      <div className="cb-mapa">
        {sesiones.map(s => {
          const xp = s.tareas.reduce((a, t) => a + t.xp, 0)
          return (
            <div key={s.sesionNumero} className="cb-mapa-nodo">
              <div className="cb-mapa-num">{s.sesionNumero}</div>
              <div className="cb-mapa-info">
                <div className="cb-mapa-titulo">{s.misionTitulo || `Misión ${s.sesionNumero}`}</div>
                <div className="cb-mapa-xp">⚡ {xp} XP · _____ conseguidos</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Página final ─────────────────────────────────────────────────────────────

function PaginaFinal({ tematicaJuego, emoji }: { tematicaJuego: string; emoji: string }) {
  return (
    <div className="cb-page cb-final">
      <p className="cb-final-trofeo">{emoji} 🏆</p>
      <h2 className="cb-final-titulo">¡Misión completada!</h2>
      <p className="cb-final-sub">Has terminado tu cuaderno de «{tematicaJuego}». ¡Eres un experto!</p>
      <div className="cb-final-auto">
        <span className="cb-titulo-pill" style={{ fontSize: '13pt' }}>🌟 Autoevaluación final</span>
        <div style={{ marginTop: '12pt' }}>
          {[
            '¿Qué es lo más importante que has aprendido en esta aventura?',
            '¿Cuál ha sido la misión más difícil para ti? ¿Por qué?',
            '¿Qué utilizarías de lo aprendido en tu vida diaria?',
          ].map((q, i) => (
            <div key={i} className="cb-final-q">
              <p>{i + 1}. {q}</p>
              <div className="cb-final-q-linea" />
              <div className="cb-final-q-linea" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CuadernoView(): React.ReactElement {
  const { sda } = useSdAStore()
  const cuaderno = sda.cuaderno
  if (!cuaderno) return <></>

  const sesionesGeneradas = cuaderno.sesiones.filter(s => s.generado)
  const tema = cuaderno.temaVisual
  const diseno = cuaderno.diseno

  const temaVars = tema
    ? ({
        '--cb-primario':    tema.colorPrimario,
        '--cb-secundario':  tema.colorSecundario,
        '--cb-acento':      tema.colorAcento,
        '--cb-fondo-suave': tema.colorFondoSuave,
      } as React.CSSProperties)
    : ({
        '--cb-primario':    '#4c1d95',
        '--cb-secundario':  '#5b21b6',
        '--cb-acento':      '#7c3aed',
        '--cb-fondo-suave': '#f5f3ff',
      } as React.CSSProperties)

  return (
    <div
      id="cuaderno-view"
      style={temaVars}
      data-layout={diseno?.layout ?? 'rejilla'}
      data-patron={diseno?.patronFondo ?? 'cuadricula'}
      data-forma={diseno?.formaTarjeta ?? 'redondeada'}
      data-tipografia={diseno?.tipografia ?? 'moderna'}
      data-decoracion={diseno?.decoracion ?? 'media'}
    >
      <Portada />
      <PaginaDatos />
      <PaginaGuia instruccionesHero={cuaderno.instruccionesHero} />
      {sesionesGeneradas.length > 0 && <PaginaRegistro sesiones={sesionesGeneradas} />}
      {sesionesGeneradas.map((material, idx) => {
        const sesionReal = sda.sesiones.find(s => s.numero === material.sesionNumero)
        return (
          <PaginaSesion
            key={idx}
            material={material}
            sesionTitulo={sesionReal?.titulo || `Sesión ${material.sesionNumero}`}
          />
        )
      })}
      <PaginaFinal tematicaJuego={cuaderno.tematicaJuego} emoji={tema?.emojiTema ?? '🏆'} />
    </div>
  )
}
