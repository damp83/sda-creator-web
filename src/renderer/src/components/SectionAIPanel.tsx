import React, { useRef, useEffect, useState } from 'react'
import { X, Sparkles, Send, Loader2, CheckCircle2, RotateCcw, BrainCircuit } from 'lucide-react'
import { useSectionAI, type ChatMessage, type Chip } from '@renderer/hooks/useSectionAI'
import { isAIAvailable } from '@renderer/services/aiService'

interface Props {
  isOpen: boolean
  onClose: () => void
  sectionIndex: number
  onOpenAIConfig: () => void
}

export function SectionAIPanel({ isOpen, onClose, sectionIndex, onOpenAIConfig }: Props): React.ReactElement | null {
  const { messages, isGenerating, send, clear, chips, sectionName } = useSectionAI(sectionIndex)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const aiAvailable = isAIAvailable()

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  function handleSend(): void {
    const text = input.trim()
    if (!text || isGenerating) return
    setInput('')
    void send(text)
  }

  function handleChip(chip: Chip): void {
    void send(chip.label, chip)
  }

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Backdrop semitransparente solo en móvil / pantallas pequeñas */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-[74px] z-40 flex h-[calc(100vh-74px)] w-full max-w-[420px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-slate-700 dark:bg-slate-900 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
              <BrainCircuit size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Asistente IA</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{sectionName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clear}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                title="Limpiar conversación"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              title="Cerrar (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chips de acción rápida */}
        {chips.length > 0 && aiAvailable && (
          <div className="shrink-0 border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Acciones rápidas</p>
            <div className="flex max-h-[72px] flex-wrap gap-1.5 overflow-y-auto">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChip(chip)}
                  disabled={isGenerating}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-violet-700 dark:hover:bg-violet-900/20 dark:hover:text-violet-300"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {!aiAvailable ? (
            <NoAIState onConfigure={onOpenAIConfig} onClose={onClose} />
          ) : messages.length === 0 ? (
            <EmptyState sectionName={sectionName} />
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={`msg-${i}`} message={msg} />
              ))}
              {isGenerating && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 size={14} className="animate-spin text-violet-500" />
                  <span className="text-xs">Generando…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {aiAvailable && (
          <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Describe qué quieres para "${sectionName}"…`}
                rows={2}
                disabled={isGenerating}
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-violet-600 dark:focus:ring-violet-900/30"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:opacity-40"
                title="Enviar (Enter)"
              >
                {isGenerating
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Send size={15} />
                }
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              Enter para enviar · Shift+Enter nueva línea · El asistente conoce tu SdA
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function EmptyState({ sectionName }: { sectionName: string }): React.ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
        <Sparkles size={26} className="text-violet-500" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Asistente de redacción</p>
        <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-slate-400">
          Usa los accesos rápidos o escribe qué quieres generar para <span className="font-medium text-slate-500">"{sectionName}"</span>.
          El asistente conoce el contexto completo de tu SdA.
        </p>
      </div>
      <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Ejemplo: <span className="italic">"Genera una justificación basada en aprendizaje por proyectos, conectando con los intereses del alumnado de primaria"</span>
        </p>
      </div>
    </div>
  )
}

function NoAIState({ onConfigure, onClose }: { onConfigure: () => void; onClose: () => void }): React.ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <BrainCircuit size={26} className="text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">IA no configurada</p>
        <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-slate-400">
          Configura tu clave de API para empezar a usar el asistente de redacción.
        </p>
      </div>
      <button
        onClick={() => { onConfigure(); onClose() }}
        className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        Configurar IA
      </button>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }): React.ReactElement {
  const [inserted, setInserted] = useState<Set<number>>(new Set())

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] rounded-2xl rounded-tr-sm bg-violet-600 px-3 py-2 text-xs leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`rounded-2xl rounded-tl-sm px-3 py-2.5 text-xs leading-relaxed ${
          message.error
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
      </div>

      {message.insertActions && message.insertActions.length > 0 && !message.error && (
        <div className="flex flex-wrap gap-1.5">
          {message.insertActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                action.fn()
                setInserted((prev) => new Set([...prev, idx]))
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                inserted.has(idx)
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50'
              }`}
            >
              {inserted.has(idx) && <CheckCircle2 size={11} />}
              {inserted.has(idx) ? 'Insertado' : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
