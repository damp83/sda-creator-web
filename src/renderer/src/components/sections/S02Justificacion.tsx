import React, { useState } from 'react'
import { BookOpen, Pencil } from 'lucide-react'
import { RichTextEditor, SectionTitle, Card, EmptyStateGuide, Button } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getPrompt } from '@renderer/config/aiPrompts'

export function S02Justificacion(): React.ReactElement {
  const { sda, setJustificacion, setContexto } = useSdAStore()
  const [editingJustificacion, setEditingJustificacion] = useState(false)
  const [editingContexto, setEditingContexto] = useState(false)
  const vars = { titulo: sda.titulo || 'sin título', ambito: sda.ambito || 'Educación Primaria', ciclo: sda.ciclo || 'Primaria' }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={2}
        title="Justificación y Contextualización"
        description="Explica el porqué de esta situación de aprendizaje y el contexto en el que se desarrollará."
        icon={<BookOpen size={22} />}
      />

      <Card
        title="Justificación pedagógica"
        subtitle="¿Por qué es relevante y significativa esta SdA para el alumnado?"
      >
        {!sda.justificacion && !editingJustificacion ? (
          <EmptyStateGuide
            icon={<BookOpen size={28} />}
            title="¿Por qué esta Situación de Aprendizaje?"
            description="La justificación explica el sentido y la necesidad pedagógica de lo que van a aprender tus alumnos."
            tips={[
              "Explica el interés y pertinencia del tema para el alumnado.",
              "Conecta la SdA con la realidad de los alumnos y el mundo actual.",
              "Menciona brevemente cómo contribuye al desarrollo de competencias clave."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingJustificacion(true)}>
                Empezar a redactar justificación
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label="Justificación *"
              placeholder="Describe por qué esta situación de aprendizaje es relevante, pertinente y significativa para el alumnado. Justifica la elección del tema, su conexión con la realidad del entorno y los intereses del grupo..."
              value={sda.justificacion}
              onChange={(html) => setJustificacion(html)}
              minRows={6}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('justificacion', vars)}
              onResult={(t) => { setJustificacion(t); setEditingJustificacion(true) }}
              currentValue={sda.justificacion}
              className="mt-3"
            />
          </>
        )}
      </Card>

      <Card
        title="Contextualización"
        subtitle="Describe el contexto del centro, el aula y las características del grupo."
      >
        {!sda.contexto && !editingContexto ? (
          <EmptyStateGuide
            icon={<BookOpen size={28} />}
            title="Conoce a tu alumnado"
            description="La contextualización permite adaptar el currículo a la realidad específica de tu centro y tu aula."
            tips={[
              "Describe brevemente el entorno socioeconómico y cultural del centro.",
              "Detalla las características del grupo: número de alumnos, intereses predominantes, dinámicas...",
              "Menciona las posibles necesidades específicas de apoyo educativo (NEAE)."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingContexto(true)}>
                Empezar a redactar contexto
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label="Contexto del aula y del centro"
              placeholder="Describe las características del centro educativo, el entorno sociocultural, las particularidades del grupo-clase, el nivel de competencia del alumnado y cualquier otro factor contextual relevante para el diseño de la SdA..."
              value={sda.contexto}
              onChange={(html) => setContexto(html)}
              minRows={6}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('contexto', vars)}
              onResult={(t) => { setContexto(t); setEditingContexto(true) }}
              currentValue={sda.contexto}
              className="mt-3"
            />
          </>
        )}
      </Card>
    </div>
  )
}
