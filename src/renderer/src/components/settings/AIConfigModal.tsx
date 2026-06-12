import React, { useEffect, useState } from 'react'
import { X, Sparkles, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ChevronDown, FileText, RotateCcw } from 'lucide-react'
import { ModalShell } from '@renderer/components/ui'
import { getAISettings, saveAISettings, testConexionIA } from '@renderer/services/aiService'
import { PROMPT_DEFINITIONS, loadCustomPrompts, saveCustomPrompts, resetPrompt, type PromptKey } from '@renderer/config/aiPrompts'

type Provider = AIProvider

interface ProviderState {
  model: string
  apiKey: string
  hasKey: boolean
  showKey: boolean
  testStatus: 'idle' | 'testing' | 'ok' | 'error'
  testMsg: string
}

const PROVIDERS: { id: Provider; name: string; color: string; keyUrl: string }[] = [
  { id: 'claude', name: 'Claude (Anthropic)', color: 'text-orange-600 dark:text-orange-400', keyUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'openai', name: 'ChatGPT (OpenAI)', color: 'text-emerald-600 dark:text-emerald-400', keyUrl: 'https://platform.openai.com/api-keys' },
  { id: 'gemini', name: 'Gemini (Google)', color: 'text-blue-600 dark:text-blue-400', keyUrl: 'https://aistudio.google.com/app/apikey' }
]

const MODELS: Record<Provider, { value: string; label: string }[]> = {
  claude: [
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 — rápido y económico' },
    { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 — calidad equilibrada' },
    { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 — máxima calidad' }
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o mini — rápido y económico' },
    { value: 'gpt-4o', label: 'GPT-4o — calidad equilibrada' }
  ],
  gemini: [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash — tier gratuito' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite — tier gratuito' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash — equilibrado' },
    { value: 'gemini-2.5-flash-preview-04-17', label: 'Gemini 2.5 Flash Preview — máxima calidad' }
  ]
}

const DEFAULT_STATE: ProviderState = {
  model: '',
  apiKey: '',
  hasKey: false,
  showKey: false,
  testStatus: 'idle',
  testMsg: ''
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function AIConfigModal({ isOpen, onClose }: Props): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<'providers' | 'prompts'>('providers')
  const [activeProvider, setActiveProvider] = useState<Provider>('claude')
  const [providers, setProviders] = useState<Record<Provider, ProviderState>>({
    claude: { ...DEFAULT_STATE, model: MODELS.claude[0].value },
    openai: { ...DEFAULT_STATE, model: MODELS.openai[0].value },
    gemini: { ...DEFAULT_STATE, model: MODELS.gemini[0].value }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [customPrompts, setCustomPrompts] = useState<Partial<Record<PromptKey, string>>>({})

  useEffect(() => {
    if (!isOpen) return
    setCustomPrompts(loadCustomPrompts())
    getAISettings().then((s) => {
      if (!s) return
      setActiveProvider(s.activeProvider)
      setProviders((prev) => ({
        claude: { ...prev.claude, model: s.providers.claude.model, hasKey: s.providers.claude.hasKey },
        openai: { ...prev.openai, model: s.providers.openai.model, hasKey: s.providers.openai.hasKey },
        gemini: { ...prev.gemini, model: s.providers.gemini.model, hasKey: s.providers.gemini.hasKey }
      }))
      // Auto-comprobar el proveedor activo si tiene clave guardada
      if (s.providers[s.activeProvider].hasKey) {
        const { model } = s.providers[s.activeProvider]
        setProviders((prev) => ({ ...prev, [s.activeProvider]: { ...prev[s.activeProvider], testStatus: 'testing', testMsg: '' } }))
        testConexionIA(s.activeProvider, '', model)
          .then(() => setProviders((prev) => ({ ...prev, [s.activeProvider]: { ...prev[s.activeProvider], testStatus: 'ok', testMsg: 'Conexión activa ✓' } })))
          .catch((e: unknown) => setProviders((prev) => ({
            ...prev,
            [s.activeProvider]: {
              ...prev[s.activeProvider],
              testStatus: 'error',
              testMsg: e instanceof Error ? e.message : 'Error de conexión'
            }
          })))
      }
    }).catch(() => {})
  }, [isOpen])

  function updateProvider(id: Provider, patch: Partial<ProviderState>): void {
    setProviders((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  async function handleTest(id: Provider): Promise<void> {
    updateProvider(id, { testStatus: 'testing', testMsg: '' })
    try {
      await testConexionIA(id, providers[id].apiKey, providers[id].model)
      updateProvider(id, { testStatus: 'ok', testMsg: 'Conexión correcta ✓' })
    } catch (e) {
      updateProvider(id, { testStatus: 'error', testMsg: e instanceof Error ? e.message : 'Error de conexión' })
    }
  }

  async function handleSave(): Promise<void> {
    setSaving(true)
    try {
      await saveAISettings({
        activeProvider,
        providers: {
          claude: { model: providers.claude.model, apiKey: providers.claude.apiKey },
          openai: { model: providers.openai.model, apiKey: providers.openai.apiKey },
          gemini: { model: providers.gemini.model, apiKey: providers.gemini.apiKey }
        }
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      // Update hasKey flags for keys that were just set
      setProviders((prev) => ({
        claude: { ...prev.claude, hasKey: prev.claude.hasKey || !!prev.claude.apiKey, apiKey: '' },
        openai: { ...prev.openai, hasKey: prev.openai.hasKey || !!prev.openai.apiKey, apiKey: '' },
        gemini: { ...prev.gemini, hasKey: prev.gemini.hasKey || !!prev.gemini.apiKey, apiKey: '' }
      }))
    } catch {}
    setSaving(false)
  }

  function handlePromptChange(key: PromptKey, value: string): void {
    const next = { ...customPrompts, [key]: value }
    setCustomPrompts(next)
    saveCustomPrompts(next)
  }

  function handleResetPrompt(key: PromptKey): void {
    resetPrompt(key)
    const next = { ...customPrompts }
    delete next[key]
    setCustomPrompts(next)
  }

  if (!isOpen) return null

  const promptSections = [...new Set(PROMPT_DEFINITIONS.map((d) => d.section))]

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} title="Configuración de IA" className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-6 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
                <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Configuración de IA</h2>
                <p className="text-xs text-slate-400">Conecta tu proveedor de inteligencia artificial</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
              <X size={18} />
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('providers')}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-medium transition-colors ${activeTab === 'providers' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <Sparkles size={12} />
              Proveedores
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-medium transition-colors ${activeTab === 'prompts' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              <FileText size={12} />
              Prompts de IA
              {Object.keys(customPrompts).length > 0 && (
                <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
                  {Object.keys(customPrompts).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-8 space-y-4">

          {activeTab === 'providers' ? (
            <>
              {/* Proveedor activo */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Proveedor activo</p>
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveProvider(p.id)}
                      className={`rounded-xl border px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                        activeProvider === p.id
                          ? 'border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-600 dark:bg-violet-900/30 dark:text-violet-300'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <span className={activeProvider === p.id ? '' : p.color}>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuración de cada proveedor */}
              {PROVIDERS.map((p) => {
                const prov = providers[p.id]
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-4 transition-colors ${
                      activeProvider === p.id
                        ? 'border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-900/10'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`text-sm font-semibold ${p.color}`}>{p.name}</span>
                      {prov.hasKey && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Clave guardada
                        </span>
                      )}
                    </div>

                    {/* Clave API */}
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Clave API
                        </label>
                        <a
                          href={p.keyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-violet-500 hover:underline"
                        >
                          Obtener clave →
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={prov.showKey ? 'text' : 'password'}
                            value={prov.apiKey}
                            onChange={(e) => updateProvider(p.id, { apiKey: e.target.value, testStatus: 'idle' })}
                            placeholder={prov.hasKey ? '••••••••  (clave ya guardada)' : 'Pega tu clave API aquí…'}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-900/30"
                          />
                          <button
                            type="button"
                            onClick={() => updateProvider(p.id, { showKey: !prov.showKey })}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {prov.showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTest(p.id)}
                          disabled={prov.testStatus === 'testing' || (!prov.apiKey && !prov.hasKey)}
                          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:border-violet-300 hover:text-violet-700 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {prov.testStatus === 'testing'
                            ? <Loader2 size={12} className="animate-spin" />
                            : prov.testStatus === 'ok'
                              ? <CheckCircle2 size={12} className="text-emerald-500" />
                              : prov.testStatus === 'error'
                                ? <AlertCircle size={12} className="text-red-500" />
                                : null
                          }
                          Probar
                        </button>
                      </div>
                      {prov.testMsg && (
                        <p className={`mt-1 text-[11px] ${prov.testStatus === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {prov.testMsg}
                        </p>
                      )}
                    </div>

                    {/* Modelo */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Modelo</label>
                      <div className="relative">
                        <select
                          value={prov.model}
                          onChange={(e) => updateProvider(p.id, { model: e.target.value })}
                          className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-violet-500 dark:focus:ring-violet-900/30"
                        >
                          {MODELS[p.id].map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Nota de privacidad */}
              <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                Las claves se guardan cifradas en tu equipo con el sistema de seguridad del SO. Nunca se envían a servidores externos salvo al proveedor de IA que hayas configurado.
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personaliza los textos de instrucción que se envían a la IA. Los cambios se guardan automáticamente. Usa <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{'{{variable}}'}</code> para insertar datos de la SdA.
              </p>
              {promptSections.map((section) => (
                <div key={section} className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section}
                  </p>
                  {PROMPT_DEFINITIONS.filter((d) => d.section === section).map((def) => {
                    const isEdited = def.key in customPrompts
                    const currentValue = customPrompts[def.key] ?? def.default
                    return (
                      <div key={def.key} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                        <div className="mb-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{def.label}</span>
                            {isEdited && (
                              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                personalizado
                              </span>
                            )}
                          </div>
                          {isEdited && (
                            <button
                              onClick={() => handleResetPrompt(def.key)}
                              className="flex items-center gap-1 rounded text-[11px] text-slate-400 hover:text-red-500"
                              title="Restaurar prompt por defecto"
                            >
                              <RotateCcw size={11} />
                              Restaurar
                            </button>
                          )}
                        </div>
                        <textarea
                          value={currentValue}
                          onChange={(e) => handlePromptChange(def.key, e.target.value)}
                          rows={4}
                          className="w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-[11px] leading-relaxed text-slate-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:focus:border-violet-500 dark:focus:ring-violet-900/30"
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {activeTab === 'prompts' ? 'Cerrar' : 'Cancelar'}
          </button>
          {activeTab === 'providers' && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {saving
                ? <Loader2 size={14} className="animate-spin" />
                : saved
                  ? <CheckCircle2 size={14} />
                  : <Sparkles size={14} />
              }
              {saved ? 'Guardado' : 'Guardar'}
            </button>
          )}
        </div>
    </ModalShell>
  )
}
