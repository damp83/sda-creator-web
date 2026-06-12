import React from 'react'
import { Trash2, ChevronDown, Clock, Users, GripVertical, Copy } from 'lucide-react'
import { Input, RichTextEditor } from '@renderer/components/ui'
import { AIGenerateButton } from '@renderer/components/ai/AIGenerateButton'
import { InputWithAI } from '@renderer/components/ai/InputWithAI'
import { getPrompt } from '@renderer/config/aiPrompts'
import { SesionPreview } from './SesionPreview'
import type { Sesion } from '@renderer/types'

interface SesionCardProps {
  sesion: Sesion
  index: number
  isExpanded: boolean
  isDragging: boolean
  isDragTarget: boolean
  sdaTitulo: string
  sdaAmbito: string
  sdaCiclo: string
  onToggle: () => void
  onUpdate: (field: keyof Sesion, value: string) => void
  onRemove: () => void
  onDuplicate: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
}

export function SesionCard({
  sesion, index, isExpanded, isDragging, isDragTarget,
  sdaTitulo, sdaAmbito, sdaCiclo,
  onToggle, onUpdate, onRemove, onDuplicate,
  onDragStart, onDragOver, onDrop, onDragEnd
}: SesionCardProps): React.ReactElement {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`overflow-hidden rounded-lg border transition-all ${
        isDragging
          ? 'opacity-40'
          : isDragTarget
            ? 'border-primary-400 border-dashed shadow-md'
            : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      {/* Cabecera */}
      <div
        className="flex cursor-pointer items-start gap-3 bg-slate-50 px-4 py-3 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700"
        onClick={onToggle}
      >
        <button
          className="mt-0.5 shrink-0 cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:text-slate-400"
          title="Arrastra para reordenar"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </button>
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-300">
          {sesion.numero}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {sesion.titulo || `Sesión ${sesion.numero}`}
            </p>
            {sesion.duracion && (
              <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-slate-600 dark:text-slate-300">
                <Clock size={10} />
                {sesion.duracion}
              </span>
            )}
            {sesion.agrupamiento && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400">
                <Users size={10} />
                {sesion.agrupamiento}
              </span>
            )}
          </div>
          {!isExpanded && <SesionPreview sesion={sesion} />}
        </div>
        <div className="mt-0.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onDuplicate}
            className="rounded p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
            title="Duplicar sesión"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={async (e) => {
              e.stopPropagation()
              const nombre = sesion.titulo || `Sesión ${sesion.numero}`
              const ok = window.api
                ? await window.api.confirmar(`¿Eliminar "${nombre}"? Puedes recuperarla con Ctrl+Z.`)
                : window.confirm(`¿Eliminar "${nombre}"?`)
              if (ok) onRemove()
            }}
            className="rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            title="Eliminar sesión"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <ChevronDown
          size={16}
          className={`mt-1 shrink-0 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="border-t border-slate-200 p-4 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputWithAI
              label="Título de la sesión"
              placeholder="Ej: Exploramos el ciclo del agua"
              value={sesion.titulo}
              onChange={(e) => onUpdate('titulo', (e.target as HTMLInputElement).value)}
              aiPrompt={`Sugiere 5 títulos creativos y concisos para una sesión (sesión ${index + 1}) de la Situación de Aprendizaje "${sdaTitulo || 'sin título'}" (${sdaAmbito || 'Educación Primaria'}, ${sdaCiclo || 'Primaria'}). Los títulos deben ser motivadores, orientados a la acción y coherentes con la metodología activa. Devuelve solo la lista numerada, sin explicaciones.`}
              onAIResult={(text) => onUpdate('titulo', text)}
            />
            <Input
              label="Duración"
              placeholder="Ej: 55 min, 2 × 45 min"
              value={sesion.duracion}
              onChange={(e) => onUpdate('duracion', e.target.value)}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <RichTextEditor
                label="Inicio / Activación"
                placeholder="Describe cómo se inicia la sesión: rutina de pensamiento, pregunta detonadora, revisión de la sesión anterior, motivación inicial..."
                value={sesion.inicio}
                onChange={(html) => onUpdate('inicio', html)}
                minRows={3}
              />
              <AIGenerateButton
                mode="text"
                label="Generar inicio"
                prompt={getPrompt('sesionInicio', { titulo: sdaTitulo || 'sin título', ambito: sdaAmbito || 'Educación Primaria', ciclo: sdaCiclo || 'Primaria', sesionTitulo: sesion.titulo || `Sesión ${sesion.numero}` })}
                onResult={(t) => onUpdate('inicio', t)}
                className="mt-2"
              />
            </div>
            <div>
              <RichTextEditor
                label="Desarrollo"
                placeholder="Describe las actividades principales de la sesión: qué hace el alumnado, qué hace el docente, cómo se organizan, qué recursos usan..."
                value={sesion.desarrollo}
                onChange={(html) => onUpdate('desarrollo', html)}
                minRows={4}
              />
              <AIGenerateButton
                mode="text"
                label="Generar desarrollo"
                prompt={getPrompt('sesionDesarrollo', { titulo: sdaTitulo || 'sin título', ambito: sdaAmbito || 'Educación Primaria', ciclo: sdaCiclo || 'Primaria', sesionTitulo: sesion.titulo || `Sesión ${sesion.numero}` })}
                onResult={(t) => onUpdate('desarrollo', t)}
                className="mt-2"
              />
            </div>
            <div>
              <RichTextEditor
                label="Cierre / Reflexión"
                placeholder="Describe cómo termina la sesión: síntesis, reflexión metacognitiva, puesta en común, conexión con la siguiente sesión..."
                value={sesion.cierre}
                onChange={(html) => onUpdate('cierre', html)}
                minRows={3}
              />
              <AIGenerateButton
                mode="text"
                label="Generar cierre"
                prompt={getPrompt('sesionCierre', { titulo: sdaTitulo || 'sin título', ambito: sdaAmbito || 'Educación Primaria', ciclo: sdaCiclo || 'Primaria', sesionTitulo: sesion.titulo || `Sesión ${sesion.numero}` })}
                onResult={(t) => onUpdate('cierre', t)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputWithAI
              label="Recursos específicos"
              placeholder="Materiales, ficha, enlace, app..."
              value={sesion.recursos}
              onChange={(e) => onUpdate('recursos', (e.target as HTMLInputElement).value)}
              aiPrompt={`Sugiere 5 opciones de recursos didácticos concretos para la sesión "${sesion.titulo || `Sesión ${sesion.numero}`}" de la SdA "${sdaTitulo || 'sin título'}" (${sdaAmbito || 'Educación Primaria'}). Cada opción debe ser una lista breve y específica: materiales físicos, recursos digitales, fichas o apps. Devuelve solo la lista numerada.`}
              onAIResult={(text) => onUpdate('recursos', text)}
            />
            <Input
              label="Agrupamiento"
              placeholder="Individual, parejas, grupo de 4..."
              value={sesion.agrupamiento}
              onChange={(e) => onUpdate('agrupamiento', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
