import React, { useState, useEffect } from 'react'
import { X, Lightbulb } from 'lucide-react'

interface Hint {
  title: string
  text: string
}

const HINTS: Record<number, Hint> = {
  0: {
    title: 'Identificación',
    text: 'Completa el título, docente, centro y ciclo. Estos datos aparecen en la portada de todos los exports. El área curricular filtra los decretos disponibles.',
  },
  1: {
    title: 'Justificación',
    text: 'Explica el porqué de esta situación de aprendizaje: qué problema real resuelve, qué intereses del alumnado conecta y qué relevancia social tiene.',
  },
  2: {
    title: 'Reto / Producto Final',
    text: 'Define el reto o producto concreto que elaborará el alumnado al final. Cuanto más tangible y auténtico, más motivadora será la SdA.',
  },
  3: {
    title: 'Vinculación Curricular',
    text: 'Selecciona las competencias clave, específicas, criterios de evaluación y saberes básicos que trabajas. Usa el buscador para filtrar por decreto.',
  },
  4: {
    title: 'Metodología',
    text: 'Describe las estrategias didácticas principales: trabajo cooperativo, ABP, gamificación, flipped classroom… y cómo se organizará el aula.',
  },
  5: {
    title: 'Secuencia Didáctica',
    text: 'Añade sesiones con su descripción detallada. Puedes reordenarlas arrastrando. Indica la duración estimada de cada una.',
  },
  6: {
    title: 'Evaluación',
    text: 'Define los instrumentos de evaluación (rúbricas, portfolios, observación…) y cómo se relacionan con los criterios seleccionados en el currículo.',
  },
  7: {
    title: 'Atención a la Diversidad (DUA)',
    text: 'Describe las medidas de acceso, participación y progreso para todo el alumnado siguiendo los principios del Diseño Universal para el Aprendizaje.',
  },
  8: {
    title: 'Interdisciplinariedad',
    text: 'Indica qué otras áreas o materias colaboran en esta SdA y cómo se coordinan los contenidos y la evaluación entre docentes.',
  },
  9: {
    title: 'ODS',
    text: 'Relaciona tu SdA con los Objetivos de Desarrollo Sostenible de la Agenda 2030. Basta con justificar brevemente la conexión de uno o dos ODS.',
  },
}

const STORAGE_KEY = 'sda-hints-dismissed'

function getDismissed(): Set<number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

function saveDismissed(set: Set<number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
}

interface Props {
  sectionIndex: number
}

export function SectionHintBanner({ sectionIndex }: Props): React.ReactElement | null {
  const [dismissed, setDismissed] = useState<Set<number>>(() => getDismissed())

  useEffect(() => {
    setDismissed(getDismissed())
  }, [sectionIndex])

  const hint = HINTS[sectionIndex]
  if (!hint || dismissed.has(sectionIndex)) return null

  function dismiss(): void {
    const next = new Set(dismissed)
    next.add(sectionIndex)
    setDismissed(next)
    saveDismissed(next)
  }

  return (
    <div className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 dark:border-primary-900/40 dark:bg-primary-950/30">
      <Lightbulb size={16} className="mt-0.5 shrink-0 text-primary-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
          {hint.title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-primary-600/80 dark:text-primary-400/80">
          {hint.text}
        </p>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 rounded-md p-0.5 text-primary-400 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/40"
        title="No volver a mostrar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
