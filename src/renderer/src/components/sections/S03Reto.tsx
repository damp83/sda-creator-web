import React, { useState } from 'react'
import { Target, Pencil } from 'lucide-react'
import { RichTextEditor, Input, SectionTitle, Card, EmptyStateGuide, Button } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getPrompt } from '@renderer/config/aiPrompts'

export function S03Reto(): React.ReactElement {
  const { sda, setSituacionProblema, setProductoFinal, setHilo } = useSdAStore()
  const [editingReto, setEditingReto] = useState(false)
  const [editingProducto, setEditingProducto] = useState(false)
  const vars = { titulo: sda.titulo || 'sin título', ambito: sda.ambito || 'Educación Primaria', ciclo: sda.ciclo || 'Primaria' }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={3}
        title="Reto / Producto Final"
        description="Define el desafío que motivará al alumnado y el producto que demostrará su aprendizaje."
        icon={<Target size={22} />}
      />

      <Card
        title="Situación-problema o reto"
        subtitle="Describe el desafío auténtico que da sentido y motivación a toda la SdA."
      >
        {!sda.situacionProblema && !editingReto ? (
          <EmptyStateGuide
            icon={<Target size={28} />}
            title="¿Cuál es el desafío inicial?"
            description="Toda Situación de Aprendizaje debe partir de un problema, reto o pregunta que despierte la curiosidad del alumnado y le dé un propósito real a lo que van a aprender."
            example="¿Cómo podemos reducir la cantidad de plásticos en nuestro colegio y concienciar al barrio?"
            tips={[
              "Debe ser relevante y cercano a su realidad (contextualizado).",
              "Debe ser abierto, no tener una única respuesta correcta.",
              "Debe conectar los saberes con un problema social, ambiental o cultural."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingReto(true)}>
                Empezar a redactar el reto
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label="Situación-problema / Reto *"
              placeholder="Describe la situación-problema, el reto o el desafío que se plantea al alumnado..."
              value={sda.situacionProblema}
              onChange={(html) => setSituacionProblema(html)}
              minRows={5}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('situacionProblema', vars)}
              onResult={(t) => { setSituacionProblema(t); setEditingReto(true) }}
              currentValue={sda.situacionProblema}
              className="mt-3"
            />
          </>
        )}
      </Card>

      <Card
        title="Producto final"
        subtitle="¿Qué creará, hará o demostrará el alumnado al concluir la SdA?"
      >
        {!sda.productoFinal && !editingProducto ? (
          <EmptyStateGuide
            icon={<Target size={28} />}
            title="Diseña la meta de aprendizaje"
            description="El producto final es la resolución del reto planteado. Es el resultado tangible (o actuación) donde el alumnado aplica todo lo aprendido."
            example="Una campaña de concienciación en vídeo para el Ayuntamiento, una exposición en el centro o un mercadillo solidario."
            tips={[
              "Especifica claramente el formato (folleto, podcast, exposición, maqueta...).",
              "Define una audiencia real, no solo el profesor o la clase.",
              "Debe requerir la aplicación de los saberes aprendidos durante las sesiones."
            ]}
            action={
              <Button variant="primary" icon={<Pencil size={14} />} onClick={() => setEditingProducto(true)}>
                Empezar a redactar el producto
              </Button>
            }
          />
        ) : (
          <>
            <RichTextEditor
              label="Producto final / Tarea integradora *"
              placeholder="Describe el producto, la tarea o la actuación final que el alumnado debe realizar..."
              value={sda.productoFinal}
              onChange={(html) => setProductoFinal(html)}
              minRows={5}
              counter
            />
            <AIGenerateButton
              mode="text"
              prompt={getPrompt('productoFinal', vars)}
              onResult={(t) => { setProductoFinal(t); setEditingProducto(true) }}
              currentValue={sda.productoFinal}
              className="mt-3"
            />
          </>
        )}
      </Card>

      <Card
        title="Hilo conductor"
        subtitle="La narrativa o metáfora que da coherencia a todas las sesiones (opcional)."
      >
        <Input
          label="Hilo conductor / Narrativa"
          placeholder="Ej: Somos investigadores del agua, Somos periodistas locales, Somos arquitectos del futuro..."
          value={sda.hilo}
          onChange={(e) => setHilo(e.target.value)}
        />
        <AIGenerateButton
          mode="suggestions"
          label="Ideas de hilo conductor"
          prompt={getPrompt('hilo', vars)}
          onResult={(t) => setHilo(t)}
          className="mt-2"
        />
      </Card>
    </div>
  )
}
