import React, { useState, useEffect } from 'react'
import { X, BookmarkPlus } from 'lucide-react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { addUserTemplate } from '@renderer/utils/userTemplates'
import { ModalShell } from '@renderer/components/ui'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export function SaveTemplateModal({ isOpen, onClose, onSaved }: Props): React.ReactElement | null {
  const { sda } = useSdAStore()
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNombre(sda.titulo || '')
      setDescripcion('')
    }
  }, [isOpen, sda.titulo])

  if (!isOpen) return null

  function handleSave(): void {
    if (!nombre.trim()) return
    addUserTemplate({ nombre: nombre.trim(), descripcion: descripcion.trim(), sda })
    onSaved()
    onClose()
  }

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Guardar como plantilla" className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <BookmarkPlus size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Guardar como plantilla
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label htmlFor="template-name" className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Nombre de la plantilla *
            </label>
            <input
              id="template-name"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Proyecto de ciencias naturales"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-600 dark:focus:ring-primary-900/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') onClose()
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Descripción{' '}
              <span className="font-normal opacity-60">(opcional)</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="En qué contexto usarías esta plantilla…"
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-600 dark:focus:ring-primary-900/30"
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Se guardará la SdA actual completa. Accede a ella desde{' '}
            <strong>Plantillas → Mis plantillas</strong>.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3 dark:border-slate-700">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!nombre.trim()}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-40"
          >
            Guardar plantilla
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
