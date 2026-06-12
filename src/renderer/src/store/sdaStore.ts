import { create } from 'zustand'
import type { SdA, ElementoCurricular, Sesion, Conexion, CompetenciaClave, AgrupamientoTipo, MomentoEvaluacion, InstrumentoEvaluacion, RubricaFila, CuadernoTrabajo, MaterialSesion, DisenoCuaderno } from '@renderer/types'
import { SDA_INICIAL } from '@renderer/types'

function newId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

const MAX_UNDO = 50

export interface SdAStore {
  sda: SdA
  filePath: string | null
  isDirty: boolean
  activeSection: number
  lastSaved: string | null
  curriculoVersion: number
  undoStack: SdA[]
  redoStack: SdA[]

  // Acciones generales
  nueva: () => void
  duplicar: () => void
  cargar: (sda: SdA, filePath: string) => void
  undo: () => void
  redo: () => void
  setFilePath: (path: string) => void
  setDirty: (dirty: boolean) => void
  setLastSaved: (ts: string) => void
  setActiveSection: (n: number) => void
  refreshCurriculo: () => void

  // Sección 1 — Identificación
  setComunidadCurriculo: (v: string) => void
  setTitulo: (v: string) => void
  setCiclo: (v: SdA['ciclo']) => void
  setAmbito: (v: string) => void
  setAreas: (v: string[]) => void
  setCurso: (v: string) => void
  setNumSesiones: (v: number) => void
  setTemporalizacion: (v: string) => void
  setDocente: (v: string) => void
  setCentro: (v: string) => void
  setLogoCentro: (v: string) => void

  // Sección 2 — Justificación
  setJustificacion: (v: string) => void
  setContexto: (v: string) => void

  // Sección 3 — Reto
  setSituacionProblema: (v: string) => void
  setProductoFinal: (v: string) => void
  setHilo: (v: string) => void

  // Sección 4 — Currículo
  toggleCompetenciaClave: (cc: CompetenciaClave) => void
  addElementoCurricular: (elem: Omit<ElementoCurricular, 'id'>) => void
  removeElementoCurricular: (id: string) => void
  addCriterioToElemento: (elemId: string, criterio: string) => void
  removeCriterioFromElemento: (elemId: string, criterio: string) => void
  addSaberToElemento: (elemId: string, saber: string) => void
  removeSaberFromElemento: (elemId: string, saber: string) => void

  // Sección 5 — Metodología
  setPlanteamientoMetodologico: (v: string) => void
  toggleAgrupamiento: (a: AgrupamientoTipo) => void
  setEspacios: (v: string[]) => void
  setRecursos: (v: string) => void
  setTiempos: (v: string) => void

  // Sección 6 — Secuencia
  addSesion: (template?: Partial<Sesion>) => void
  updateSesion: (index: number, field: keyof Sesion, value: string | number) => void
  removeSesion: (index: number) => void
  moveSesion: (from: number, to: number) => void
  duplicarSesion: (index: number) => void
  setSesiones: (sesiones: Sesion[]) => void

  // Sección 7 — Evaluación
  setCriteriosCalificacion: (v: string) => void
  toggleMomentoEvaluacion: (m: MomentoEvaluacion) => void
  toggleInstrumentoEvaluacion: (i: InstrumentoEvaluacion) => void
  addInstrumentoPersonalizado: (v: string) => void
  removeInstrumentoPersonalizado: (v: string) => void
  setCriterioInstrumento: (key: string, instrument: string) => void
  setRubricaTabla: (rows: RubricaFila[]) => void
  setRubrica: (v: string) => void

  // Sección 8 — DUA
  setDuaImplicacion: (v: string) => void
  setDuaRepresentacion: (v: string) => void
  setDuaAccionExpresion: (v: string) => void

  // Sección 9 — Interdisciplinariedad
  addConexion: () => void
  updateConexion: (index: number, field: keyof Conexion, value: string) => void
  removeConexion: (index: number) => void
  setTransversales: (v: string) => void

  // Sección 10 — ODS
  toggleOds: (num: number) => void
  setJustificacionOds: (v: string) => void

  // Sección 11 — Cuaderno de Trabajo
  setCuadernoMarco: (marco: Omit<CuadernoTrabajo, 'sesiones' | 'generadoEn'>) => void
  setCuadernoSesion: (index: number, material: MaterialSesion) => void
  setCuadernoIlustracion: (index: number, ilustracion: string) => void
  setCuadernoDiseno: (diseno: DisenoCuaderno) => void
  clearCuaderno: () => void

  // Serialización
  toJSON: () => string
}

function dirty(state: SdAStore, patch: Partial<SdA>): Partial<SdAStore> {
  const newSda = { ...state.sda, ...patch, fechaModificacion: now() }
  const undoStack = [...state.undoStack.slice(-(MAX_UNDO - 1)), state.sda]
  return { isDirty: true, sda: newSda, undoStack, redoStack: [] }
}

export const useSdAStore = create<SdAStore>((set, get) => ({
  sda: { ...SDA_INICIAL },
  filePath: null,
  isDirty: false,
  activeSection: (() => {
    const n = parseInt(localStorage.getItem('sda-last-section') ?? '0', 10)
    return isNaN(n) || n < 0 || n > 9 ? 0 : n
  })(),
  lastSaved: null,
  curriculoVersion: 0,
  undoStack: [],
  redoStack: [],

  nueva: () =>
    set({
      sda: { ...SDA_INICIAL, id: newId(), fechaCreacion: now(), fechaModificacion: now() },
      filePath: null,
      isDirty: false,
      activeSection: 0,
      lastSaved: null,
      undoStack: [],
      redoStack: []
    }),

  duplicar: () =>
    set((s) => ({
      sda: {
        ...s.sda,
        id: newId(),
        titulo: s.sda.titulo ? `${s.sda.titulo} (Copia)` : 'Sin título (Copia)',
        fechaCreacion: now(),
        fechaModificacion: now()
      },
      filePath: null,
      isDirty: true,
      activeSection: 0,
      lastSaved: null,
      undoStack: [],
      redoStack: []
    })),

  cargar: (sda, filePath) =>
    set({ sda: { ...SDA_INICIAL, ...sda }, filePath, isDirty: false, activeSection: 0, lastSaved: now(), undoStack: [], redoStack: [] }),

  undo: () =>
    set((s) => {
      if (s.undoStack.length === 0) return s
      const prev = s.undoStack[s.undoStack.length - 1]
      return {
        sda: prev,
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [s.sda, ...s.redoStack.slice(0, MAX_UNDO - 1)],
        isDirty: true
      }
    }),

  redo: () =>
    set((s) => {
      if (s.redoStack.length === 0) return s
      const next = s.redoStack[0]
      return {
        sda: next,
        undoStack: [...s.undoStack.slice(-(MAX_UNDO - 1)), s.sda],
        redoStack: s.redoStack.slice(1),
        isDirty: true
      }
    }),

  setFilePath: (path) => set({ filePath: path }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setLastSaved: (ts) => set({ lastSaved: ts }),
  setActiveSection: (n) => { localStorage.setItem('sda-last-section', String(n)); set({ activeSection: n }) },
  refreshCurriculo: () => set((s) => ({ curriculoVersion: s.curriculoVersion + 1 })),

  // Sección 1
  setComunidadCurriculo: (v) => set((s) => dirty(s, { comunidadCurriculo: v })),
  setTitulo: (v) => set((s) => dirty(s, { titulo: v })),
  setCiclo: (v) => set((s) => dirty(s, { ciclo: v })),
  setAmbito: (v) => set((s) => dirty(s, { ambito: v })),
  setAreas: (v) => set((s) => dirty(s, { areas: v })),
  setCurso: (v) => set((s) => dirty(s, { curso: v })),
  setNumSesiones: (v) => set((s) => dirty(s, { numSesiones: v })),
  setTemporalizacion: (v) => set((s) => dirty(s, { temporalizacion: v })),
  setDocente: (v) => set((s) => dirty(s, { docente: v })),
  setCentro: (v) => set((s) => dirty(s, { centro: v })),
  setLogoCentro: (v) => set((s) => dirty(s, { logoCentro: v })),

  // Sección 2
  setJustificacion: (v) => set((s) => dirty(s, { justificacion: v })),
  setContexto: (v) => set((s) => dirty(s, { contexto: v })),

  // Sección 3
  setSituacionProblema: (v) => set((s) => dirty(s, { situacionProblema: v })),
  setProductoFinal: (v) => set((s) => dirty(s, { productoFinal: v })),
  setHilo: (v) => set((s) => dirty(s, { hilo: v })),

  // Sección 4
  toggleCompetenciaClave: (cc) =>
    set((s) => {
      const cur = s.sda.competenciasClave
      const next = cur.includes(cc) ? cur.filter((x) => x !== cc) : [...cur, cc]
      return dirty(s, { competenciasClave: next })
    }),

  addElementoCurricular: (elem) =>
    set((s) => {
      if (s.sda.elementosCurriculares.some((e) => e.area === elem.area && e.ce === elem.ce))
        return s
      const nuevo: ElementoCurricular = { ...elem, id: newId() }
      return dirty(s, { elementosCurriculares: [...s.sda.elementosCurriculares, nuevo] })
    }),

  removeElementoCurricular: (id) =>
    set((s) =>
      dirty(s, {
        elementosCurriculares: s.sda.elementosCurriculares.filter((e) => e.id !== id)
      })
    ),

  addCriterioToElemento: (elemId, criterio) =>
    set((s) =>
      dirty(s, {
        elementosCurriculares: s.sda.elementosCurriculares.map((e) =>
          e.id === elemId && !e.criterios.includes(criterio)
            ? { ...e, criterios: [...e.criterios, criterio] }
            : e
        )
      })
    ),

  removeCriterioFromElemento: (elemId, criterio) =>
    set((s) =>
      dirty(s, {
        elementosCurriculares: s.sda.elementosCurriculares.map((e) =>
          e.id === elemId ? { ...e, criterios: e.criterios.filter((c) => c !== criterio) } : e
        )
      })
    ),

  addSaberToElemento: (elemId, saber) =>
    set((s) =>
      dirty(s, {
        elementosCurriculares: s.sda.elementosCurriculares.map((e) =>
          e.id === elemId && !e.saberes.includes(saber)
            ? { ...e, saberes: [...e.saberes, saber] }
            : e
        )
      })
    ),

  removeSaberFromElemento: (elemId, saber) =>
    set((s) =>
      dirty(s, {
        elementosCurriculares: s.sda.elementosCurriculares.map((e) =>
          e.id === elemId ? { ...e, saberes: e.saberes.filter((sb) => sb !== saber) } : e
        )
      })
    ),

  // Sección 5
  setPlanteamientoMetodologico: (v) => set((s) => dirty(s, { planteamientoMetodologico: v })),
  toggleAgrupamiento: (a) =>
    set((s) => {
      const cur = s.sda.agrupamientos
      const next = cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]
      return dirty(s, { agrupamientos: next })
    }),
  setEspacios: (v) => set((s) => dirty(s, { espacios: v })),
  setRecursos: (v) => set((s) => dirty(s, { recursos: v })),
  setTiempos: (v) => set((s) => dirty(s, { tiempos: v })),

  // Sección 6
  addSesion: (template) =>
    set((s) => {
      const n = s.sda.sesiones.length + 1
      const nueva: Sesion = {
        numero: n,
        titulo: `Sesión ${n}`,
        duracion: '55 min',
        inicio: '',
        desarrollo: '',
        cierre: '',
        recursos: '',
        agrupamiento: '',
        ...template
      }
      return dirty(s, { sesiones: [...s.sda.sesiones, nueva] })
    }),

  updateSesion: (index, field, value) =>
    set((s) => {
      const sesiones = [...s.sda.sesiones]
      sesiones[index] = { ...sesiones[index], [field]: value }
      return dirty(s, { sesiones })
    }),

  removeSesion: (index) =>
    set((s) => {
      const sesiones = s.sda.sesiones
        .filter((_, i) => i !== index)
        .map((ses, i) => ({ ...ses, numero: i + 1 }))
      return dirty(s, { sesiones })
    }),

  moveSesion: (from, to) =>
    set((s) => {
      const sesiones = [...s.sda.sesiones]
      const [item] = sesiones.splice(from, 1)
      sesiones.splice(to, 0, item)
      return dirty(s, { sesiones: sesiones.map((ses, i) => ({ ...ses, numero: i + 1 })) })
    }),

  duplicarSesion: (index) =>
    set((s) => {
      const original = s.sda.sesiones[index]
      if (!original) return s
      const copy = { ...original, titulo: original.titulo ? `${original.titulo} (Copia)` : 'Sesión (Copia)' }
      const sesiones = [
        ...s.sda.sesiones.slice(0, index + 1),
        copy,
        ...s.sda.sesiones.slice(index + 1)
      ].map((ses, i) => ({ ...ses, numero: i + 1 }))
      return dirty(s, { sesiones })
    }),

  setSesiones: (sesiones) =>
    set((s) => dirty(s, { sesiones: sesiones.map((ses, i) => ({ ...ses, numero: i + 1 })) })),

  // Sección 7
  setCriteriosCalificacion: (v) => set((s) => dirty(s, { criteriosCalificacion: v })),
  toggleMomentoEvaluacion: (m) =>
    set((s) => {
      const cur = s.sda.momentosEvaluacion
      const next = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]
      return dirty(s, { momentosEvaluacion: next })
    }),
  toggleInstrumentoEvaluacion: (i) =>
    set((s) => {
      const cur = s.sda.instrumentosEvaluacion
      const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]
      return dirty(s, { instrumentosEvaluacion: next })
    }),
  addInstrumentoPersonalizado: (v) =>
    set((s) => {
      const cur = s.sda.instrumentosPersonalizados ?? []
      if (cur.includes(v)) return s
      return dirty(s, { instrumentosPersonalizados: [...cur, v] })
    }),
  removeInstrumentoPersonalizado: (v) =>
    set((s) =>
      dirty(s, {
        instrumentosPersonalizados: (s.sda.instrumentosPersonalizados ?? []).filter((x) => x !== v)
      })
    ),
  setCriterioInstrumento: (key, instrument) =>
    set((s) =>
      dirty(s, {
        criterioInstrumentos: { ...(s.sda.criterioInstrumentos ?? {}), [key]: instrument }
      })
    ),
  setRubricaTabla: (rows) => set((s) => dirty(s, { rubricaTabla: rows })),
  setRubrica: (v) => set((s) => dirty(s, { rubrica: v })),

  // Sección 8
  setDuaImplicacion: (v) => set((s) => dirty(s, { duaImplicacion: v })),
  setDuaRepresentacion: (v) => set((s) => dirty(s, { duaRepresentacion: v })),
  setDuaAccionExpresion: (v) => set((s) => dirty(s, { duaAccionExpresion: v })),

  // Sección 9
  addConexion: () =>
    set((s) => dirty(s, { conexiones: [...s.sda.conexiones, { area: '', descripcion: '' }] })),
  updateConexion: (index, field, value) =>
    set((s) => {
      const conexiones = [...s.sda.conexiones]
      conexiones[index] = { ...conexiones[index], [field]: value }
      return dirty(s, { conexiones })
    }),
  removeConexion: (index) =>
    set((s) => dirty(s, { conexiones: s.sda.conexiones.filter((_, i) => i !== index) })),
  setTransversales: (v) => set((s) => dirty(s, { transversales: v })),

  // Sección 10
  toggleOds: (num) =>
    set((s) => {
      const cur = s.sda.ods
      const next = cur.includes(num) ? cur.filter((x) => x !== num) : [...cur, num]
      return dirty(s, { ods: next })
    }),
  setJustificacionOds: (v) => set((s) => dirty(s, { justificacionOds: v })),

  // Sección 11
  setCuadernoMarco: (marco) =>
    set((s) => {
      const sesionesBase: MaterialSesion[] = s.sda.sesiones.map((ses) => ({
        sesionNumero: ses.numero,
        misionTitulo: '',
        narrativa: '',
        tareas: [],
        reflexion: '',
        generado: false
      }))
      const cuaderno: CuadernoTrabajo = {
        ...marco,
        sesiones: s.sda.cuaderno?.sesiones ?? sesionesBase,
        generadoEn: now()
      }
      return dirty(s, { cuaderno })
    }),

  setCuadernoSesion: (index, material) =>
    set((s) => {
      if (!s.sda.cuaderno) return s
      const sesiones = [...s.sda.cuaderno.sesiones]
      sesiones[index] = { ...material, generado: true }
      return dirty(s, { cuaderno: { ...s.sda.cuaderno, sesiones } })
    }),

  // Las ilustraciones (imágenes pesadas) NO entran en el historial de undo:
  // evita acumular copias del base64 y que un Ctrl+Z borre una imagen recién generada.
  setCuadernoIlustracion: (index, ilustracion) =>
    set((s) => {
      if (!s.sda.cuaderno) return s
      const sesiones = [...s.sda.cuaderno.sesiones]
      if (!sesiones[index]) return s
      sesiones[index] = { ...sesiones[index], ilustracion }
      return {
        isDirty: true,
        sda: { ...s.sda, cuaderno: { ...s.sda.cuaderno, sesiones }, fechaModificacion: now() }
      }
    }),

  setCuadernoDiseno: (diseno) =>
    set((s) => {
      if (!s.sda.cuaderno) return s
      return dirty(s, { cuaderno: { ...s.sda.cuaderno, diseno } })
    }),

  clearCuaderno: () =>
    set((s) => dirty(s, { cuaderno: undefined })),

  toJSON: () => JSON.stringify(get().sda, null, 2)
}))
