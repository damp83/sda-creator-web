import React, { useState } from 'react'
import { Globe, Pencil } from 'lucide-react'
import { RichTextEditor, SectionTitle, Card, EmptyStateGuide, Button } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { useSdAStore } from '@renderer/store/sdaStore'
import { ODS_LIST } from '@renderer/types'
import { getPrompt } from '@renderer/config/aiPrompts'

export function S10ODS(): React.ReactElement {
  const { sda, toggleOds, setJustificacionOds } = useSdAStore()
  const [editingJustificacion, setEditingJustificacion] = useState(false)
  const odsVars = {
    titulo: sda.titulo || 'sin título',
    ambito: sda.ambito || 'Primaria',
    ciclo: sda.ciclo || 'Primaria',
    situacionProblema: sda.situacionProblema || '(no especificado)',
    odsNombres: ODS_LIST.filter((o) => sda.ods.includes(o.num)).map((o) => `ODS ${o.num}: ${o.titulo}`).join(', ') || 'no especificados',
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        number={10}
        title="Objetivos de Desarrollo Sostenible"
        description="Relaciona la situación de aprendizaje con los ODS de la Agenda 2030."
        icon={<Globe size={22} />}
      />

      <Card
        title="ODS relacionados"
        subtitle="Selecciona los Objetivos de Desarrollo Sostenible que se trabajan en esta SdA."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {ODS_LIST.map((ods) => {
            const active = sda.ods.includes(ods.num)
            return (
              <button
                key={ods.num}
                onClick={() => toggleOds(ods.num)}
                className={`relative flex flex-col items-center rounded-lg border-2 p-3 text-center transition-colors ${
                  active
                    ? ''
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                }`}
                style={
                  active
                    ? {
                        borderColor: ods.color,
                        backgroundColor: ods.color + '15',
                        boxShadow: `0 0 0 2px white, 0 0 0 4px ${ods.color}`
                      }
                    : undefined
                }
                title={ods.titulo}
              >
                <span
                  className="mb-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: ods.color }}
                >
                  {ods.num}
                </span>
                <span
                  className={`text-xs leading-tight ${active ? 'font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
                  style={active ? { color: ods.color } : undefined}
                >
                  {ods.titulo}
                </span>
              </button>
            )
          })}
        </div>

        {sda.ods.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <p className="w-full text-xs text-slate-500">
              {sda.ods.length} ODS seleccionado{sda.ods.length !== 1 ? 's' : ''}:
            </p>
            {sda.ods
              .slice()
              .sort((a, b) => a - b)
              .map((num) => {
                const ods = ODS_LIST.find((o) => o.num === num)!
                return (
                  <span
                    key={num}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: ods.color + '20',
                      color: ods.color,
                      border: `1px solid ${ods.color}40`
                    }}
                  >
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: ods.color, fontSize: '10px' }}
                    >
                      {num}
                    </span>
                    {ods.titulo}
                  </span>
                )
              })}
          </div>
        )}
      </Card>

      <Card
        title="Justificación de los ODS seleccionados"
        subtitle="Explica cómo esta SdA contribuye a los ODS seleccionados."
      >
        {!sda.justificacionOds && !editingJustificacion ? (
          <EmptyStateGuide
            icon={<Globe size={28} />}
            title="Conexión con la Agenda 2030"
            description="La LOMLOE establece la necesidad de conectar los aprendizajes con los desafíos globales y locales del siglo XXI."
            tips={[
              "Identifica cómo el producto final o el proceso ayuda a resolver problemas reales (Ej: Acción por el clima).",
              "Menciona cómo los alumnos toman conciencia sobre desigualdades, sostenibilidad o paz.",
              "Puedes seleccionar varios ODS arriba y usar la IA para justificar su conexión."
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
              label="Justificación"
              placeholder="Describe cómo esta situación de aprendizaje conecta con los ODS seleccionados. Explica qué aprendizajes, actitudes o acciones concretas de los alumnos contribuyen a los objetivos de la Agenda 2030. Si hay un ODS principal y otros secundarios, justifica la relación con cada uno..."
              value={sda.justificacionOds}
              onChange={(html) => setJustificacionOds(html)}
              minRows={6}
              counter
            />
            <AIGenerateButton
              mode="text"
              label="Generar justificación ODS"
              prompt={getPrompt('justificacionOds', odsVars)}
              onResult={(t) => { setJustificacionOds(t); setEditingJustificacion(true) }}
              currentValue={sda.justificacionOds}
              className="mt-3"
            />
          </>
        )}
      </Card>
    </div>
  )
}
