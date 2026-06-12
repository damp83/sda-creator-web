import React, { useRef, useState } from 'react'
import { BubbleMenu } from '@tiptap/react/menus'
import type { Editor } from '@tiptap/react'
import { Wand2, Maximize2, Minimize2, GraduationCap, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { generarConIA } from '@renderer/services/aiService'
import { useSdAStore } from '@renderer/store/sdaStore'
import { CICLO_LABELS } from '@renderer/types'

type Action = 'mejorar' | 'ampliar' | 'simplificar' | 'adaptar'
type MenuState = 'idle' | 'loading' | 'result' | 'error'

interface SavedSelection {
  from: number
  to: number
}

function buildPrompt(action: Action, text: string, cicloLabel: string): string {
  const base = `Devuelve únicamente el texto resultante, sin explicaciones ni comentarios adicionales.\n\nTexto original:\n${text}`
  switch (action) {
    case 'mejorar':
      return `Mejora la redacción del siguiente fragmento de texto educativo. Hazlo más claro, preciso y pedagógicamente adecuado, manteniendo el significado original y el mismo idioma.\n\n${base}`
    case 'ampliar':
      return `Amplía el siguiente fragmento de texto educativo añadiendo más detalle y contexto pedagógico relevante, sin perder el hilo del original. Mantén el mismo idioma.\n\n${base}`
    case 'simplificar':
      return `Simplifica el siguiente fragmento de texto educativo haciéndolo más breve y directo, conservando los puntos esenciales. Mantén el mismo idioma.\n\n${base}`
    case 'adaptar':
      return `Adapta el siguiente fragmento de texto educativo al nivel de vocabulario y comprensión del ciclo "${cicloLabel}" según el currículo español LOMLOE. Mantén el mismo idioma.\n\n${base}`
  }
}

interface InlineAIMenuProps {
  editor: Editor
}

export function InlineAIMenu({ editor }: InlineAIMenuProps): React.ReactElement {
  const ciclo = useSdAStore((s) => s.sda.ciclo)
  const cicloLabel = ciclo ? CICLO_LABELS[ciclo] : 'Primaria - 1er Ciclo (1º-2º)'

  const [menuState, setMenuState] = useState<MenuState>('idle')
  const [result, setResult] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const menuStateRef = useRef<MenuState>('idle')
  const selectionRef = useRef<SavedSelection | null>(null)

  function transition(s: MenuState): void {
    menuStateRef.current = s
    setMenuState(s)
  }

  async function handleAction(action: Action): Promise<void> {
    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to, ' ').trim()
    if (!text) return

    selectionRef.current = { from, to }
    transition('loading')
    setErrorMsg('')

    try {
      const aiResult = await generarConIA(buildPrompt(action, text, cicloLabel))
      setResult(aiResult.trim())
      transition('result')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Error al contactar con la IA')
      transition('error')
    }
  }

  function handleAccept(): void {
    if (!selectionRef.current) return
    const { from, to } = selectionRef.current
    editor.chain().focus().insertContentAt({ from, to }, result).run()
    reset()
  }

  function reset(): void {
    transition('idle')
    setResult('')
    setErrorMsg('')
    selectionRef.current = null
  }

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'top-start', offset: 8 }}
      shouldShow={({ state }) => {
        if (menuStateRef.current !== 'idle') return true
        const { from, to } = state.selection
        return from !== to && state.doc.textBetween(from, to, ' ').trim().length > 0
      }}
    >
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
        {menuState === 'idle' && (
          <div className="flex items-center gap-0.5 p-1">
            <ActionBtn icon={<Wand2 size={12} />} label="Mejorar" onClick={() => handleAction('mejorar')} />
            <ActionBtn icon={<Maximize2 size={12} />} label="Ampliar" onClick={() => handleAction('ampliar')} />
            <ActionBtn icon={<Minimize2 size={12} />} label="Simplificar" onClick={() => handleAction('simplificar')} />
            <span className="mx-0.5 h-4 w-px bg-slate-200 dark:bg-slate-600" />
            <ActionBtn
              icon={<GraduationCap size={12} />}
              label={`Adaptar al ciclo`}
              title={cicloLabel}
              onClick={() => handleAction('adaptar')}
              accent
            />
          </div>
        )}

        {menuState === 'loading' && (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <Loader2 size={13} className="animate-spin text-violet-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Generando con IA…</span>
          </div>
        )}

        {menuState === 'result' && (
          <div className="w-72 p-3 space-y-2.5">
            <div className="max-h-28 overflow-y-auto rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                {result}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAccept}
                className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 dark:hover:bg-emerald-400"
              >
                <Check size={11} />
                Aceptar
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={11} />
                Descartar
              </button>
            </div>
          </div>
        )}

        {menuState === 'error' && (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <AlertCircle size={13} className="shrink-0 text-red-500" />
            <span className="text-xs text-red-600 dark:text-red-400">{errorMsg}</span>
            <button onClick={reset} className="ml-auto shrink-0 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </BubbleMenu>
  )
}

function ActionBtn({
  icon,
  label,
  title,
  onClick,
  accent = false
}: {
  icon: React.ReactNode
  label: string
  title?: string
  onClick: () => void
  accent?: boolean
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title ?? label}
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
        accent
          ? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
