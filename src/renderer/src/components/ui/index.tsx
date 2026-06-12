import React from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle, X as XIcon } from 'lucide-react'
export { RichTextEditor } from './RichTextEditor'
export { AutocompleteInput } from './AutocompleteInput'
export { ModalShell } from './ModalShell'

// ─── Campo de texto ───────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className = '', ...props }: InputProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-shadow focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-slate-100 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/50'
            : 'border-slate-200 focus:border-primary-400 focus:ring-primary-100 dark:border-slate-600 dark:focus:border-primary-500 dark:focus:ring-primary-900/50'
        } ${className}`}
      />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

// ─── Área de texto ────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode
  hint?: string
  counter?: boolean
}

export function Textarea({
  label,
  hint,
  counter,
  className = '',
  ...props
}: TextareaProps): React.ReactElement {
  const value = props.value as string | undefined
  const charLen = value?.length ?? 0
  const counterColor =
    charLen > 1200 ? 'text-red-500 font-semibold' : charLen > 800 ? 'text-amber-500' : 'text-slate-400'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        {counter && value !== undefined && (
          <span className={`text-xs transition-colors ${counterColor}`}>{charLen} car.</span>
        )}
      </div>
      <textarea
        {...props}
        className={`w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-shadow focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-900/50 ${className}`}
      />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  options,
  placeholder,
  className = '',
  ...props
}: SelectProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <select
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 transition-shadow focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Botón ────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-sm hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 focus:ring-primary-300',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-700',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 focus:ring-red-200'
}

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base'
}

export function Button({
  variant = 'secondary',
  icon,
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

// ─── Chip / Badge ─────────────────────────────────────────────────────────────

interface ChipProps {
  label: string
  onRemove?: () => void
  color?: string
}

export function Chip({ label, onRemove, color }: ChipProps): React.ReactElement {
  const base = 'inline-flex max-w-[280px] items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium'
  const defaultCls = `${base} bg-primary-100 text-primary-700 border border-primary-200`
  return (
    <span
      className={color ? base : defaultCls}
      style={color ? { backgroundColor: color + '20', color, border: `1px solid ${color}40` } : undefined}
      title={label}
    >
      <span className="truncate">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 shrink-0 rounded-full p-0.5 hover:bg-black/10 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

type CardStatus = 'pending' | 'complete' | 'error'

interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  action?: React.ReactNode
  status?: CardStatus
}

const CARD_STATUS_BORDER: Record<CardStatus, string> = {
  pending: 'border-l-4 border-l-amber-400',
  complete: 'border-l-4 border-l-emerald-400',
  error: 'border-l-4 border-l-red-400',
}

export function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
  status
}: CardProps): React.ReactElement {
  const statusCls = status ? CARD_STATUS_BORDER[status] : ''
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${statusCls} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700/60">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastMessage {
  id: string
  type: ToastType
  text: string
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-primary-600 text-white',
  warning: 'bg-amber-500 text-white'
}

const TOAST_ICONS: Record<ToastType, React.ReactElement> = {
  success: <CheckCircle2 size={15} />,
  error: <XCircle size={15} />,
  info: <Info size={15} />,
  warning: <AlertTriangle size={15} />
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps): React.ReactElement {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium ${TOAST_STYLES[t.type]}`}
        >
          <span className="shrink-0 opacity-90">{TOAST_ICONS[t.type]}</span>
          <span className="flex-1">{t.text}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 shrink-0 opacity-75 hover:opacity-100">
            <XIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────

interface SectionTitleProps {
  number: number
  title: string
  description: string
  icon: React.ReactNode
}

export function SectionTitle({
  number,
  title,
  description,
  icon
}: SectionTitleProps): React.ReactElement {
  return (
    <div className="mb-8 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-500">
          Sección {number}
        </p>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
    </div>
  )
}

// ─── Tooltip pedagógico ───────────────────────────────────────────────────────

interface HelpTooltipProps {
  text: string
}

export function HelpTooltip({ text }: HelpTooltipProps): React.ReactElement {
  return (
    <span className="group relative inline-flex items-center">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-primary-900 dark:hover:text-primary-400">
        ?
      </span>
      <span className="invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-xs leading-relaxed text-slate-100 shadow-xl group-hover:visible dark:bg-slate-900">
        {text}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-900" />
      </span>
    </span>
  )
}

// ─── Empty State con Guía ─────────────────────────────────────────────────────

interface EmptyStateGuideProps {
  icon: React.ReactNode
  title: string
  description: string
  tips?: string[]
  example?: string
  action?: React.ReactNode
}

export function EmptyStateGuide({
  icon,
  title,
  description,
  tips,
  example,
  action
}: EmptyStateGuideProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-primary-50/50 p-8 text-center transition-colors dark:border-primary-900/50 dark:bg-primary-900/10">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 shadow-sm dark:bg-primary-900/40 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mb-6 max-w-lg text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {((tips && tips.length > 0) || example) && (
        <div className="mb-6 w-full max-w-lg space-y-3 text-left">
          {tips && tips.length > 0 && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/10">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">
                Consejos
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-amber-700 dark:text-amber-400">
                {tips.map((tip, i) => (
                  <li key={`tip-${i}`}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {example && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-500">
                Ejemplo práctico
              </p>
              <p className="text-sm italic text-emerald-700 dark:text-emerald-400">"{example}"</p>
            </div>
          )}
        </div>
      )}

      {action && <div>{action}</div>}
    </div>
  )
}

