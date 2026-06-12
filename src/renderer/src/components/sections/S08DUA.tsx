import React, { useState } from 'react'
import { Users, Pencil } from 'lucide-react'
import { RichTextEditor, SectionTitle, Card, HelpTooltip, EmptyStateGuide, Button } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getPrompt } from '@renderer/config/aiPrompts'

export function S08DUA(): React.ReactElement {
  const { sda, setDuaImplicacion, setDuaRepresentacion, setDuaAccionExpresion } = useSdAStore()
  const [editingImplicacion, setEditingImplicacion] = useState(false)
  const [editingRepresentacion, setEditingRepresentacion] = useState(false)
  const [editingAccion, setEditingAccion] = useState(false)
  const vars = { titulo: sda.titulo || 'sin título', ambito: sda.ambito || 'Educación Primaria', ciclo: sda.ciclo || 'Primaria' }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={8}
        title="Atención a la Diversidad (DUA)"
        description="Describe las medidas de diseño universal para el aprendizaje que garantizan el acceso de todo el alumnado."
        icon={<Users size={22} />}
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Diseño Universal para el Aprendizaje (DUA)
        </p>
        <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
          El DUA propone tres principios para eliminar barreras de aprendizaje: múltiples formas de{' '}
          <strong>implicación</strong> (el &ldquo;por qué&rdquo; del aprendizaje),{' '}
          <strong>representación</strong> (el &ldquo;qué&rdquo;) y{' '}
          <strong>acción y expresión</strong> (el &ldquo;cómo&rdquo;).
        </p>
      </div>

      <Card
        title="Implicación — El «por qué» del aprendizaje"
        subtitle="¿Cómo se motivará y mantendrá el interés de todo el alumnado?"
      >
        {!sda.duaImplicacion && !editingImplicacion ? (
          <EmptyStateGuide
            icon={<Users size={28} />}
            title="Redes afectivas: La motivación"
            description="Ofrece opciones para captar el interés, mantener el esfuerzo y promover la autorregulación."
            tips={[
              "Vincula el aprendizaje a sus intereses personales y la vida cotidiana.",
              "Varía el nivel de exigencia y ofrece distintos grados de apoyo.",
              "Fomenta la reflexión personal y la autoevaluación."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingImplicacion(true)}>
                Empezar a redactar implicación
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label={<span className="flex items-center gap-1.5">Múltiples formas de implicación <HelpTooltip text="Motivar al alumnado a través de la elección de temas de interés, objetivos personales, feedback frecuente y estrategias de autorregulación." /></span>}
              placeholder="Describe las medidas para despertar el interés, mantener la motivación y desarrollar la autorregulación del aprendizaje. Incluye: opciones para captar el interés (conexión con lo cotidiano, elección de temas), medidas para mantener el esfuerzo (metas graduadas, feedback frecuente), y estrategias para la autorregulación (autoevaluación, reflexión metacognitiva)..."
              value={sda.duaImplicacion}
              onChange={(html) => setDuaImplicacion(html)}
              minRows={5}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('duaImplicacion', vars)}
              onResult={(t) => { setDuaImplicacion(t); setEditingImplicacion(true) }}
              currentValue={sda.duaImplicacion}
              className="mt-3"
            />
          </>
        )}
      </Card>

      <Card
        title="Representación — El «qué» del aprendizaje"
        subtitle="¿Cómo se presentará la información para que todos puedan percibirla y comprenderla?"
      >
        {!sda.duaRepresentacion && !editingRepresentacion ? (
          <EmptyStateGuide
            icon={<Users size={28} />}
            title="Redes de reconocimiento: El acceso a la información"
            description="Presenta la información y el contenido de diferentes maneras para no limitar el acceso de ningún alumno."
            tips={[
              "Combina texto con audios, vídeos y organizadores gráficos.",
              "Destaca las ideas principales y los patrones clave.",
              "Usa herramientas como diccionarios visuales, subtítulos o lectores de pantalla."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingRepresentacion(true)}>
                Empezar a redactar representación
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label={<span className="flex items-center gap-1.5">Múltiples formas de representación <HelpTooltip text="Ofrecer la información en distintos formatos (texto, audio, imagen, vídeo) y niveles de complejidad para que todos puedan percibirla y comprenderla." /></span>}
              placeholder="Describe cómo se ofrecerá la información en diferentes formatos y niveles de complejidad. Incluye: opciones de percepción (texto + audio + imagen + vídeo), recursos para la comprensión (vocabulario visual, organizadores gráficos, esquemas), y medidas para el alumnado con necesidades específicas (adaptaciones de acceso, apoyos visuales, texto simplificado)..."
              value={sda.duaRepresentacion}
              onChange={(html) => setDuaRepresentacion(html)}
              minRows={5}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('duaRepresentacion', vars)}
              onResult={(t) => { setDuaRepresentacion(t); setEditingRepresentacion(true) }}
              currentValue={sda.duaRepresentacion}
              className="mt-3"
            />
          </>
        )}
      </Card>

      <Card
        title="Acción y expresión — El «cómo» del aprendizaje"
        subtitle="¿Cómo podrá el alumnado demostrar lo que sabe y puede hacer?"
      >
        {!sda.duaAccionExpresion && !editingAccion ? (
          <EmptyStateGuide
            icon={<Users size={28} />}
            title="Redes estratégicas: La expresión del aprendizaje"
            description="Ofrece flexibilidad en cómo los alumnos pueden responder o demostrar sus habilidades y conocimientos."
            tips={[
              "Permite entregar tareas en formato escrito, oral o visual.",
              "Proporciona plantillas, listas de cotejo o esquemas guía.",
              "Fomenta el uso de herramientas digitales para la creación."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingAccion(true)}>
                Empezar a redactar acción y expresión
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label={<span className="flex items-center gap-1.5">Múltiples formas de acción y expresión <HelpTooltip text="Dar al alumnado alternativas para demostrar lo que sabe: oral, escrito, visual, digital o manipulativo. Incluye apoyos para quienes tienen NEAE." /></span>}
              placeholder="Describe las alternativas para que el alumnado exprese y comunique su aprendizaje. Incluye: opciones de respuesta física (oral, escrita, visual, digital, manipulativa), opciones de expresión (presentación, vídeo, podcast, maqueta, infografía), medidas de apoyo para la planificación y organización (plantillas, modelos, checklist), y medidas para el alumnado NEAE (adaptaciones de acceso, apoyos tecnológicos)..."
              value={sda.duaAccionExpresion}
              onChange={(html) => setDuaAccionExpresion(html)}
              minRows={5}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('duaAccionExpresion', vars)}
              onResult={(t) => { setDuaAccionExpresion(t); setEditingAccion(true) }}
              currentValue={sda.duaAccionExpresion}
              className="mt-3"
            />
          </>
        )}
      </Card>
    </div>
  )
}

