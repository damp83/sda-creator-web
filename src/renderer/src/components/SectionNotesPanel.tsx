import React, { useState, useCallback, useEffect } from 'react'
import { StickyNote } from 'lucide-react'

interface SectionNotesPanelProps {
  sdaId: string
  sectionIndex: number
}

function storageKey(sdaId: string, sectionIndex: number): string {
  return `sda-notes-${sdaId}-${sectionIndex}`
}

export function SectionNotesPanel({ sdaId, sectionIndex }: SectionNotesPanelProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false)
  const [value, setValue] = useState(() => localStorage.getItem(storageKey(sdaId, sectionIndex)) ?? '')

  useEffect(() => {
    setValue(localStorage.getItem(storageKey(sdaId, sectionIndex)) ?? '')
    setExpanded(false)
  }, [sdaId, sectionIndex])

  useEffect(() => {
    function onToggle(): void { setExpanded((e) => !e) }
    window.addEventListener('sda-notes-toggle', onToggle)
    return () => window.removeEventListener('sda-notes-toggle', onToggle)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setValue(v)
    if (v.trim()) {
      localStorage.setItem(storageKey(sdaId, sectionIndex), v)
    } else {
      localStorage.removeItem(storageKey(sdaId, sectionIndex))
    }
  }, [sdaId, sectionIndex])

  const hasNotes = !!value.trim()

  return (
    <div className="mt-8 border-t border-slate-100 pt-4 dark:border-slate-800">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
      >
        <StickyNote size={13} className={hasNotes ? 'text-amber-400' : ''} />
        <span>Notas privadas</span>
        {hasNotes && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
        <span className="text-[10px] text-slate-300 dark:text-slate-600">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <textarea
            value={value}
            onChange={handleChange}
            placeholder="Notas para ti mismo sobre esta sección. No aparecen en el PDF ni en el archivo guardado."
            rows={4}
            className="w-full resize-y rounded-xl border border-amber-200 bg-amber-50/60 px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-amber-800/50 dark:bg-amber-900/10 dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-amber-700 dark:focus:ring-amber-900/20"
          />
          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
            Solo visibles en este equipo · No se exportan ni comparten
          </p>
        </div>
      )}
    </div>
  )
}
