import React from 'react'
import { X, Keyboard } from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  {
    category: 'Archivo',
    items: [
      { keys: ['Ctrl', 'N'], desc: 'Nueva SdA' },
      { keys: ['Ctrl', 'O'], desc: 'Abrir archivo' },
      { keys: ['Ctrl', 'S'], desc: 'Guardar' },
      { keys: ['Ctrl', 'P'], desc: 'Vista previa PDF' },
      { keys: ['Ctrl', 'F'], desc: 'Buscar en toda la SdA' },
      { keys: ['Ctrl', 'Mayús', 'C'], desc: 'Copiar SdA al portapapeles como texto' },
    ]
  },
  {
    category: 'Edición',
    items: [
      { keys: ['Ctrl', 'Z'], desc: 'Deshacer' },
      { keys: ['Ctrl', 'Y'], desc: 'Rehacer' },
      { keys: ['Ctrl', 'Mayús', 'Z'], desc: 'Rehacer (alternativo)' },
    ]
  },
  {
    category: 'Navegación de secciones',
    items: [
      { keys: ['Alt', '1'], desc: 'Ir a Identificación' },
      { keys: ['Alt', '2'], desc: 'Ir a Justificación' },
      { keys: ['Alt', '3'], desc: 'Ir a Reto / Producto Final' },
      { keys: ['Alt', '4'], desc: 'Ir a Vinculación Curricular' },
      { keys: ['Alt', '5'], desc: 'Ir a Metodología' },
      { keys: ['Alt', '6'], desc: 'Ir a Secuencia Didáctica' },
      { keys: ['Alt', '7'], desc: 'Ir a Evaluación' },
      { keys: ['Alt', '8'], desc: 'Ir a Atención a la Diversidad' },
      { keys: ['Alt', '9'], desc: 'Ir a Interdisciplinariedad' },
      { keys: ['Alt', '0'], desc: 'Ir a ODS' },
      { keys: ['Alt', 'C'], desc: 'Ir a Cuaderno de Trabajo' },
    ]
  },
  {
    category: 'Aplicación',
    items: [
      { keys: ['Alt', 'N'], desc: 'Abrir / cerrar notas privadas de la sección' },
      { keys: ['?'], desc: 'Mostrar atajos de teclado' },
      { keys: ['Esc'], desc: 'Cerrar modal / diálogo' },
    ]
  },
]

const TOOLS_V2 = [
  { icon: '🔍', label: 'Búsqueda global', desc: 'Ctrl+F · Busca en toda la SdA y salta al campo exacto' },
  { icon: '✨', label: 'Asistente IA', desc: 'Botón flotante · Historial por sección, preguntas y generación de contenido' },
  { icon: '⚡', label: 'Completar SdA', desc: 'Cabecera · Rellena todos los campos vacíos con IA en un clic' },
  { icon: '📚', label: 'Plantillas', desc: 'Cabecera · Plantillas base y tus propias plantillas guardadas' },
  { icon: '🕒', label: 'Historial de versiones', desc: 'Cabecera · Guarda snapshots y compara cambios entre versiones' },
  { icon: '📊', label: 'Estadísticas + resumen IA', desc: 'Cabecera · Progreso, coherencia y resumen ejecutivo generado por IA' },
  { icon: '💾', label: 'Autoguardado nativo', desc: 'Automático · Copia de seguridad en disco cada 30 s, sin límite de tamaño' },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps): React.ReactElement | null {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Atajos de teclado"
      className="flex w-full max-w-md max-h-[85vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
    >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Keyboard size={17} className="text-primary-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Atajos de teclado</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {SHORTCUTS.map((group) => (
            <div key={group.category}>
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {group.category}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.desc} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, i) => (
                        <React.Fragment key={k}>
                          <kbd className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {k}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="text-xs text-slate-400">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Herramientas v2.0 */}
          <div>
            <p className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Herramientas v2.0
            </p>
            <div className="space-y-2">
              {TOOLS_V2.map((tool) => (
                <div key={tool.label} className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-700/40">
                  <span className="mt-px shrink-0 text-sm leading-none">{tool.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{tool.label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </ModalShell>
  )
}
