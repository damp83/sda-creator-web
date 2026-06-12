import React, { useState } from 'react'
import { LayoutList, Plus, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button, SectionTitle, Card, EmptyStateGuide } from '@renderer/components/ui'
import { useCoherenceWarnings } from '@renderer/hooks/useCoherenceWarnings'
import { useSdAStore } from '@renderer/store/sdaStore'
import { SesionCard } from './sesiones/SesionCard'
import { SessionTemplatePicker } from './sesiones/SessionTemplatePicker'
import { GenerarSecuenciaButton } from './sesiones/GenerarSecuenciaButton'
import type { Sesion } from '@renderer/types'

export function S06SecuenciaDidactica(): React.ReactElement {
  const { sda, addSesion, updateSesion, removeSesion, moveSesion, duplicarSesion, setSesiones } = useSdAStore()
  const [expanded, setExpanded] = useState<number | null>(0)
  const [generatedOk, setGeneratedOk] = useState(false)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const warnings = useCoherenceWarnings()
  const sessionsMismatch = warnings.find((w) => w.id === 'sessions-mismatch')

  return (
    <div className="space-y-6">
      <SectionTitle
        number={6}
        title="Secuencia Didáctica"
        description="Detalla el desarrollo de cada sesión: qué se hace, cómo y con qué recursos."
        icon={<LayoutList size={22} />}
      />

      <Card
        title="Sesiones"
        subtitle={`${sda.sesiones.length} sesión${sda.sesiones.length !== 1 ? 'es' : ''} planificada${sda.sesiones.length !== 1 ? 's' : ''}`}
        action={
          <div className="relative">
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowTemplatePicker((v) => !v)}
            >
              Añadir sesión
            </Button>
            {showTemplatePicker && (
              <SessionTemplatePicker
                onSelect={(partial: Partial<Sesion>) => {
                  addSesion(partial)
                  setExpanded(sda.sesiones.length)
                }}
                onClose={() => setShowTemplatePicker(false)}
              />
            )}
          </div>
        }
      >
        {sessionsMismatch && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-900/10">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              {sessionsMismatch.message}{' '}
              <span className="font-medium">Actualiza el campo "Nº de sesiones" en Identificación.</span>
            </p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/60 p-3 dark:border-violet-900/40 dark:bg-violet-900/10">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-violet-800 dark:text-violet-300">Generación automática con IA</p>
            <p className="text-[11px] text-violet-600 dark:text-violet-400">
              Crea las {sda.numSesiones || 6} sesiones completas (inicio, desarrollo y cierre) a partir del reto y la metodología definidos.
              {sda.sesiones.length > 0 && ' Reemplazará las sesiones actuales.'}
            </p>
          </div>
          {generatedOk && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={13} /> Generado
            </span>
          )}
          <GenerarSecuenciaButton
            onGenerate={(sesiones) => {
              setSesiones(sesiones)
              setExpanded(0)
              setGeneratedOk(true)
              setTimeout(() => setGeneratedOk(false), 3000)
            }}
          />
        </div>

        {sda.sesiones.length === 0 ? (
          <EmptyStateGuide
            icon={<LayoutList size={28} />}
            title="Diseña el desarrollo de la Situación de Aprendizaje"
            description="Aquí definirás el paso a paso metodológico: las tareas, actividades y ejercicios que realizarán los alumnos para resolver el reto."
            tips={[
              "Estructura las sesiones con un inicio (activación), desarrollo y cierre (reflexión).",
              "Recuerda incluir variedad de agrupamientos (individual, por parejas, grupos heterogéneos).",
              "Puedes usar el botón 'Generar con IA' arriba para crear una propuesta inicial en segundos."
            ]}
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => setShowTemplatePicker((v) => !v)}
              >
                Añadir primera sesión
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sda.sesiones.map((sesion, i) => (
              <SesionCard
                key={`sesion-${sesion.numero}`}
                sesion={sesion}
                index={i}
                isExpanded={expanded === i}
                isDragging={dragFrom === i}
                isDragTarget={dragOver === i}
                sdaTitulo={sda.titulo}
                sdaAmbito={sda.ambito}
                sdaCiclo={sda.ciclo}
                onToggle={() => setExpanded(expanded === i ? null : i)}
                onUpdate={(field, value) => updateSesion(i, field, value)}
                onRemove={() => removeSesion(i)}
                onDuplicate={() => duplicarSesion(i)}
                onDragStart={() => setDragFrom(i)}
                onDragOver={(e) => { e.preventDefault(); setDragOver(i) }}
                onDrop={() => {
                  if (dragFrom !== null && dragFrom !== i) {
                    moveSesion(dragFrom, i)
                    setExpanded(i)
                  }
                  setDragFrom(null)
                  setDragOver(null)
                }}
                onDragEnd={() => { setDragFrom(null); setDragOver(null) }}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
