import React, { useMemo } from 'react'
import { stripHtml } from '@renderer/utils/stripHtml'
import type { Sesion } from '@renderer/types'

export function SesionPreview({ sesion }: { sesion: Sesion }): React.ReactElement {
  const preview = useMemo(
    () => stripHtml(sesion.inicio) || stripHtml(sesion.desarrollo) || stripHtml(sesion.cierre),
    [sesion.inicio, sesion.desarrollo, sesion.cierre]
  )
  const filled = [!!sesion.inicio, !!sesion.desarrollo, !!sesion.cierre]
  const labels = ['Inicio', 'Desarrollo', 'Cierre']

  return (
    <div className="mt-1 flex items-center gap-3">
      <div className="flex items-center gap-1">
        {filled.map((done, idx) => (
          <span
            key={idx}
            title={labels[idx]}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
      {preview ? (
        <span className="truncate text-xs italic text-slate-400 dark:text-slate-500">
          {preview.slice(0, 70)}{preview.length > 70 ? '…' : ''}
        </span>
      ) : (
        <span className="text-xs text-slate-400 dark:text-slate-500">Sin contenido aún</span>
      )}
    </div>
  )
}
