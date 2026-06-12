import React from 'react'
import { RichTextEditor } from '@renderer/components/ui'
import { NIVEL_COLS } from './evaluacionConstants'
import type { RubricaFila } from '@renderer/types'

interface RubricaTableProps {
  filas: RubricaFila[]
  fallbackValue: string
  onFallbackChange: (html: string) => void
}

export function RubricaTable({ filas, fallbackValue, onFallbackChange }: RubricaTableProps): React.ReactElement {
  if (filas.length === 0) {
    return (
      <RichTextEditor
        label="Rúbrica / Descripción de niveles (texto libre)"
        placeholder="Describe aquí la rúbrica manualmente, o usa el botón 'Generar con IA' para crear una tabla automática a partir de los criterios seleccionados..."
        value={fallbackValue}
        onChange={onFallbackChange}
        minRows={8}
        counter
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[700px] border-collapse text-xs">
        <thead>
          <tr>
            <th
              className="border-b border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-left font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              style={{ width: '30%' }}
            >
              Criterio de evaluación
            </th>
            {NIVEL_COLS.map((col) => (
              <th
                key={col.key}
                className={`border-b border-r border-slate-200 px-3 py-2.5 text-center font-semibold last:border-r-0 dark:border-slate-700 ${col.bg} ${col.text}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={`fila-${i}`} className="group">
              <td className="border-b border-r border-slate-100 bg-slate-50/50 px-3 py-3 align-top dark:border-slate-700/50 dark:bg-slate-800/30">
                <p className="font-medium leading-relaxed text-slate-800 dark:text-slate-200">{fila.criterio}</p>
                {fila.area && (
                  <p className="mt-0.5 text-[10px] text-slate-400">{fila.area}</p>
                )}
                {fila.instrumento && (
                  <span className="mt-1 inline-block rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500 dark:border-slate-600 dark:bg-slate-700">
                    {fila.instrumento}
                  </span>
                )}
              </td>
              {NIVEL_COLS.map((col) => (
                <td
                  key={col.key}
                  className={`border-b border-r border-slate-100 px-3 py-3 align-top leading-relaxed last:border-r-0 dark:border-slate-700/50 ${col.bg} text-slate-700 dark:text-slate-300`}
                >
                  {fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
