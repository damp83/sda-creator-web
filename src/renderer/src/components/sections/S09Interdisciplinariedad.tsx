import React from 'react'
import { Link, Plus, Trash2 } from 'lucide-react'
import { Input, RichTextEditor, Button, SectionTitle, Card, EmptyStateGuide } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { getPrompt } from '@renderer/config/aiPrompts'

export function S09Interdisciplinariedad(): React.ReactElement {
  const { sda, addConexion, updateConexion, removeConexion, setTransversales } = useSdAStore()
  const s09vars = { titulo: sda.titulo || 'sin título', ambito: sda.ambito || 'Primaria', ciclo: sda.ciclo || 'Primaria', situacionProblema: sda.situacionProblema || '(no especificado)', odsNumeros: sda.ods.length > 0 ? sda.ods.join(', ') : 'no especificados' }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={9}
        title="Interdisciplinariedad y Transversalidad"
        description="Identifica las conexiones con otras áreas y los temas transversales que atraviesan la SdA."
        icon={<Link size={22} />}
      />

      <Card
        title="Conexiones interdisciplinares"
        subtitle="¿Con qué otras áreas o ámbitos se relaciona esta situación de aprendizaje?"
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={addConexion}
          >
            Añadir conexión
          </Button>
        }
      >
        {sda.conexiones.length === 0 ? (
          <EmptyStateGuide
            icon={<Link size={28} />}
            title="Conecta aprendizajes"
            description="La LOMLOE promueve el aprendizaje competencial y significativo, lo cual se ve favorecido cuando relacionamos conceptos de distintas asignaturas."
            tips={[
              "Identifica al menos un área o materia adicional que encaje de forma natural con tu reto.",
              "Por ejemplo, si la SdA es de Ciencias sobre el reciclaje, puedes conectar con Matemáticas para hacer estadísticas de residuos.",
              "Describe brevemente qué se va a trabajar de esa otra área."
            ]}
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={addConexion}
              >
                Añadir primera conexión
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {sda.conexiones.map((conexion, i) => (
              <div
                key={`conexion-${i}`}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                  {i + 1}
                </div>
                <div className="flex-1 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Input
                    label="Área / Ámbito"
                    placeholder="Ej: Matemáticas, Educación Física, Inglés..."
                    value={conexion.area}
                    onChange={(e) => updateConexion(i, 'area', e.target.value)}
                  />
                  <Input
                    label="Descripción de la conexión"
                    placeholder="Describe cómo se conecta con esta área..."
                    value={conexion.descripcion}
                    onChange={(e) => updateConexion(i, 'descripcion', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeConexion(i)}
                  className="mt-6 shrink-0 rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  title="Eliminar conexión"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card
        title="Temas transversales"
        subtitle="Elementos transversales del currículo que se trabajan en esta SdA."
      >
        <RichTextEditor
          label="Temas transversales y su tratamiento"
          placeholder="Describe cómo se integran los temas transversales del currículo LOMLOE: educación para el desarrollo sostenible, ciudadanía digital, educación afectivo-sexual, igualdad de género, convivencia y respeto, espíritu emprendedor, valores cívicos y democráticos, etc. Para cada tema transversal presente, indica cómo se trabaja en la SdA..."
          value={sda.transversales}
          onChange={(html) => setTransversales(html)}
          minRows={6}
          counter
        />
        <AIGenerateButton
          mode="text"
          label="Generar temas transversales"
          prompt={getPrompt('transversales', s09vars)}
          onResult={(t) => setTransversales(t)}
          currentValue={sda.transversales}
          className="mt-3"
        />
      </Card>
    </div>
  )
}
