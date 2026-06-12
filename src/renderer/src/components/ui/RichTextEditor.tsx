import React, { useRef, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Eraser } from 'lucide-react'
import { stripHtml } from '@renderer/utils/stripHtml'
import { InlineAIMenu } from '@renderer/components/ai/InlineAIMenu'

interface RichTextEditorProps {
  label?: React.ReactNode
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minRows?: number
  counter?: boolean
  className?: string
}

function toHtml(value: string): string {
  if (!value) return ''
  if (value.trimStart().startsWith('<')) return value
  return value
    .split('\n')
    .map((line) => `<p>${line || ''}</p>`)
    .join('')
}


function ToolBtn({
  active,
  onClick,
  title,
  children
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}): React.ReactElement {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`flex h-6 w-6 items-center justify-center rounded transition-colors ${
        active
          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
          : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  minRows = 4,
  counter = false,
  className = ''
}: RichTextEditorProps): React.ReactElement {
  const lastSetRef = useRef<string>('')

  const editor = useEditor({
    extensions: [StarterKit],
    content: toHtml(value) || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      const result = html === '<p></p>' ? '' : html
      lastSetRef.current = html
      onChange(result)
    }
  })

  useEffect(() => {
    if (!editor || editor.isFocused) return
    const incoming = toHtml(value)
    const incomingNorm = incoming || '<p></p>'
    if (incomingNorm !== lastSetRef.current && incomingNorm !== editor.getHTML()) {
      lastSetRef.current = incomingNorm
      editor.commands.setContent(incoming || '', { emitUpdate: false })
    }
  }, [value, editor])

  const minHeight = `${(minRows || 4) * 1.625}rem`
  const plainText = counter ? stripHtml(value) : ''
  const textLen = plainText.length
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  const counterColor =
    textLen > 1200 ? 'text-red-500 font-semibold' : textLen > 800 ? 'text-amber-500' : 'text-slate-400'

  const isEmpty = !value || value === '<p></p>'

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        )}
        {counter && (
          <span className={`text-xs transition-colors ${counterColor}`}>
            {wordCount} pal. · {textLen} car.
          </span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:focus-within:border-primary-500 dark:focus-within:ring-primary-900/50">
        {/* Barra de herramientas */}
        <div className="flex items-center gap-0.5 border-b border-slate-100 px-2 py-1 dark:border-slate-700">
          <ToolBtn
            active={editor?.isActive('bold')}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            title="Negrita (Ctrl+B)"
          >
            <Bold size={13} />
          </ToolBtn>
          <ToolBtn
            active={editor?.isActive('italic')}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            title="Cursiva (Ctrl+I)"
          >
            <Italic size={13} />
          </ToolBtn>
          <ToolBtn
            active={editor?.isActive('underline')}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            title="Subrayado (Ctrl+U)"
          >
            <UnderlineIcon size={13} />
          </ToolBtn>
          <ToolBtn
            active={editor?.isActive('strike')}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            title="Tachado"
          >
            <Strikethrough size={13} />
          </ToolBtn>
          <span className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-600" />
          <ToolBtn
            active={editor?.isActive('bulletList')}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            title="Lista con viñetas"
          >
            <List size={13} />
          </ToolBtn>
          <ToolBtn
            active={editor?.isActive('orderedList')}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            title="Lista numerada"
          >
            <ListOrdered size={13} />
          </ToolBtn>
          <span className="mx-1 h-3.5 w-px bg-slate-200 dark:bg-slate-600" />
          <ToolBtn
            onClick={() => {
              editor?.chain().focus().clearContent().run()
              onChange('')
            }}
            title="Borrar contenido (deshacible con Ctrl+Z)"
          >
            <Eraser size={13} />
          </ToolBtn>
        </div>

        {/* Área de texto con placeholder superpuesto */}
        <div className="relative" style={{ minHeight }}>
          {isEmpty && placeholder && (
            <p className="pointer-events-none absolute left-0 right-0 top-0 select-none px-3.5 py-2.5 text-sm text-slate-400">
              {placeholder}
            </p>
          )}
          <EditorContent
            editor={editor}
            className="rte-content px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100"
            style={{ minHeight }}
          />
        </div>
      </div>

      {editor && <InlineAIMenu editor={editor} />}
    </div>
  )
}
