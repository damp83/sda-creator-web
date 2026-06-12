import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallbackLabel?: string
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Uncaught error in', this.props.fallbackLabel ?? 'component', error, info.componentStack)
  }

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/10">
        <AlertTriangle size={32} className="text-red-400" />
        <div>
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Error en {this.props.fallbackLabel ?? 'esta sección'}
          </p>
          <p className="mt-1 text-xs text-red-500 dark:text-red-500">
            {this.state.error.message}
          </p>
        </div>
        <button
          onClick={() => this.setState({ error: null })}
          className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          <RotateCcw size={13} />
          Reintentar
        </button>
      </div>
    )
  }
}
