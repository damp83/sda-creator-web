import React, { useState } from 'react'
import { Settings, Pencil } from 'lucide-react'
import { RichTextEditor, SectionTitle, Card, EmptyStateGuide, Button } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getPrompt } from '@renderer/config/aiPrompts'
import type { AgrupamientoTipo } from '@renderer/types'

const AGRUPAMIENTOS: AgrupamientoTipo[] = [
  'Gran grupo',
  'Pequeño grupo',
  'Parejas',
  'Individual',
  'Grupo cooperativo'
]

const ESPACIOS_OPCIONES = [
  'Aula ordinaria',
  'Aula de informática',
  'Biblioteca',
  'Patio / exterior',
  'Aula de música',
  'Gimnasio',
  'Sala polivalente',
  'Entorno natural'
]

export function S05Metodologia(): React.ReactElement {
  const { sda, setPlanteamientoMetodologico, toggleAgrupamiento, setEspacios, setRecursos, setTiempos } =
    useSdAStore()

  const [editingMetodologia, setEditingMetodologia] = useState(false)
  const vars = {
    titulo: sda.titulo || 'sin título',
    ambito: sda.ambito || 'Educación Primaria',
    ciclo: sda.ciclo || 'Primaria',
    hilo: sda.hilo || '(no especificado)',
    situacionProblema: sda.situacionProblema || '(no especificado)',
    competenciasClave: sda.competenciasClave.length > 0 ? sda.competenciasClave.join(', ') : 'no especificadas',
    numSesiones: String(sda.numSesiones || 6),
    temporalizacion: sda.temporalizacion || 'sin temporalización definida',
  }

  function toggleEspacio(espacio: string): void {
    const current = sda.espacios
    const next = current.includes(espacio)
      ? current.filter((e) => e !== espacio)
      : [...current, espacio]
    setEspacios(next)
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={5}
        title="Planteamiento Metodológico"
        description="Describe los enfoques, estrategias y condiciones organizativas de la situación de aprendizaje."
        icon={<Settings size={22} />}
      />

      <Card
        title="Enfoque metodológico"
        subtitle="Describe los principios y estrategias metodológicas que guiarán la SdA."
      >
        {!sda.planteamientoMetodologico && !editingMetodologia ? (
          <EmptyStateGuide
            icon={<Settings size={28} />}
            title="¿Cómo van a aprender?"
            description="La metodología define el camino que seguirán los alumnos. La LOMLOE promueve metodologías activas donde el alumno es protagonista."
            tips={[
              "Menciona el modelo elegido: Aprendizaje Basado en Proyectos, Indagación, Flipped Classroom...",
              "Explica el rol que tendrá el docente (guía, facilitador) y el del alumnado (investigador, creador).",
              "Puedes usar el botón de IA para generar una propuesta adaptada a tu etapa."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingMetodologia(true)}>
                Empezar a redactar metodología
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label="Planteamiento metodológico *"
              placeholder="Describe el enfoque metodológico: aprendizaje basado en proyectos, indagación, aprendizaje cooperativo, gamificación, aprendizaje-servicio... Justifica por qué estas metodologías son adecuadas para este contexto y para el desarrollo de las competencias previstas. Menciona los principios pedagógicos que orientan el diseño (DUA, personalización, evaluación formativa...)."
              value={sda.planteamientoMetodologico}
              onChange={(html) => setPlanteamientoMetodologico(html)}
              minRows={6}
              counter
            />
            <AIGenerateButton
              mode="text"
              label="Generar planteamiento metodológico"
              prompt={getPrompt('metodologia', vars)}
              onResult={(t) => { setPlanteamientoMetodologico(t); setEditingMetodologia(true) }}
              currentValue={sda.planteamientoMetodologico}
              className="mt-3"
            />
          </>
        )}
      </Card>

      <Card title="Organización del aula">
        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Agrupamientos del alumnado
            </p>
            <div className="flex flex-wrap gap-2">
              {AGRUPAMIENTOS.map((ag) => {
                const active = sda.agrupamientos.includes(ag)
                return (
                  <button
                    key={ag}
                    onClick={() => toggleAgrupamiento(ag)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-primary-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {ag}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Espacios utilizados
            </p>
            <div className="flex flex-wrap gap-2">
              {ESPACIOS_OPCIONES.map((esp) => {
                const active = sda.espacios.includes(esp)
                return (
                  <button
                    key={esp}
                    onClick={() => toggleEspacio(esp)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary-500 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'border-slate-300 bg-white text-slate-600 hover:border-primary-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {esp}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Recursos y tiempos">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <RichTextEditor
              label="Recursos didácticos"
              placeholder="Materiales, dispositivos digitales, recursos web, bibliografía, materiales manipulativos..."
              value={sda.recursos}
              onChange={(html) => setRecursos(html)}
              minRows={4}
            />
            <AIGenerateButton
              mode="text"
              label="Generar recursos"
              prompt={getPrompt('recursos', vars)}
              onResult={(t) => setRecursos(t)}
              currentValue={sda.recursos}
              className="mt-2"
            />
          </div>
          <div>
            <RichTextEditor
              label="Distribución del tiempo"
              placeholder="Describe cómo se distribuyen las sesiones a lo largo de la unidad (por fases, semanas, etc.)..."
              value={sda.tiempos}
              onChange={(html) => setTiempos(html)}
              minRows={4}
            />
            <AIGenerateButton
              mode="text"
              label="Generar distribución"
              prompt={getPrompt('tiempos', vars)}
              onResult={(t) => setTiempos(t)}
              currentValue={sda.tiempos}
              className="mt-2"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
