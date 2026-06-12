import type { MomentoEvaluacion, InstrumentoEvaluacion, RubricaFila } from '@renderer/types'

export const MOMENTOS: { value: MomentoEvaluacion; label: string; desc: string }[] = [
  { value: 'Diagnóstica', label: 'Evaluación diagnóstica', desc: 'Diagnóstico de conocimientos previos' },
  { value: 'Formativa', label: 'Evaluación formativa', desc: 'Seguimiento continuo durante el proceso' },
  { value: 'Sumativa', label: 'Evaluación sumativa', desc: 'Valoración del producto y los aprendizajes' }
]

export const INSTRUMENTOS: InstrumentoEvaluacion[] = [
  'Rúbrica',
  'Lista de cotejo',
  'Diana de autoevaluación',
  'Portafolio',
  'Prueba escrita',
  'Observación directa',
  'Diario del alumno',
  'Exposición oral'
]

export const NIVEL_COLS = [
  { key: 'iniciado' as const, label: 'Iniciado', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  { key: 'enProceso' as const, label: 'En proceso', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  { key: 'conseguido' as const, label: 'Conseguido', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  { key: 'avanzado' as const, label: 'Avanzado', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' }
]

export interface RubricaTemplate {
  id: string
  label: string
  desc: string
  emoji: string
  filas: RubricaFila[]
}

export const RUBRICA_TEMPLATES: RubricaTemplate[] = [
  {
    id: 'exposicion-oral',
    label: 'Exposición oral',
    desc: 'Presentaciones, debates y puestas en común',
    emoji: '🎤',
    filas: [
      { criterio: 'Claridad y estructura del discurso', area: 'Comunicación oral', instrumento: 'Rúbrica',
        iniciado: 'El discurso es confuso, sin estructura aparente y difícil de seguir.',
        enProceso: 'La exposición tiene cierta estructura, pero le faltan transiciones claras entre ideas.',
        conseguido: 'El discurso está bien organizado, es claro y fácil de seguir.',
        avanzado: 'El discurso es excelente: perfectamente estructurado, fluido y muy fácil de seguir.' },
      { criterio: 'Contenido e información', area: 'Comunicación oral', instrumento: 'Rúbrica',
        iniciado: 'La información es escasa, inexacta o no guarda relación con el tema.',
        enProceso: 'La información es básica y algo incompleta, con algunos errores menores.',
        conseguido: 'El contenido es correcto, relevante y suficientemente desarrollado.',
        avanzado: 'El contenido es exhaustivo, preciso y enriquecido con datos o ejemplos adicionales.' },
      { criterio: 'Uso de soportes y recursos visuales', area: 'Comunicación oral', instrumento: 'Rúbrica',
        iniciado: 'No usa soportes, o estos son ilegibles o no están relacionados con el contenido.',
        enProceso: 'Utiliza soportes, aunque son poco claros o no complementan bien la exposición.',
        conseguido: 'Los soportes son claros, pertinentes y complementan adecuadamente el discurso.',
        avanzado: 'Los soportes son creativos, muy bien elaborados y potencian significativamente la exposición.' },
      { criterio: 'Interacción con el público y gestión del espacio', area: 'Comunicación oral', instrumento: 'Rúbrica',
        iniciado: 'Evita el contacto visual, habla muy bajo y no interactúa con los oyentes.',
        enProceso: 'Mantiene contacto visual esporádico y la voz es perceptible, aunque con poca interacción.',
        conseguido: 'Mantiene buen contacto visual, voz audible y responde adecuadamente las preguntas.',
        avanzado: 'Domina completamente el espacio, mantiene excelente contacto visual y gestiona el diálogo con soltura.' },
    ]
  },
  {
    id: 'trabajo-colaborativo',
    label: 'Trabajo colaborativo',
    desc: 'Proyectos y actividades en equipo',
    emoji: '🤝',
    filas: [
      { criterio: 'Contribución activa al grupo', area: 'Competencia social', instrumento: 'Rúbrica',
        iniciado: 'Participa muy poco o se limita a lo mínimo, dejando la mayor parte del trabajo a otros.',
        enProceso: 'Participa de forma irregular; contribuye en algunos momentos pero no de manera sostenida.',
        conseguido: 'Contribuye de forma constante y aporta ideas y esfuerzo al trabajo del grupo.',
        avanzado: 'Lidera y dinamiza al grupo, reparte tareas de forma equitativa y motiva a los demás.' },
      { criterio: 'Comunicación y escucha activa', area: 'Competencia social', instrumento: 'Rúbrica',
        iniciado: 'No escucha a los compañeros, interrumpe o se niega a comunicarse.',
        enProceso: 'Escucha parcialmente y comunica sus ideas, aunque con dificultades para llegar a acuerdos.',
        conseguido: 'Escucha activamente, expresa sus ideas con respeto y llega a acuerdos con los demás.',
        avanzado: 'Facilita la comunicación del grupo, gestiona conflictos con eficacia y promueve el consenso.' },
      { criterio: 'Cumplimiento de responsabilidades', area: 'Competencia social', instrumento: 'Rúbrica',
        iniciado: 'No cumple las tareas asignadas ni los plazos establecidos.',
        enProceso: 'Cumple algunas tareas o con retraso, y a veces necesita recordatorio.',
        conseguido: 'Cumple sus responsabilidades puntualmente y con la calidad esperada.',
        avanzado: 'Supera las expectativas: entrega antes de plazo, con alta calidad y ayuda a otros a cumplir.' },
      { criterio: 'Calidad del producto final', area: 'Competencia social', instrumento: 'Rúbrica',
        iniciado: 'El producto es incompleto, con errores importantes y escasa elaboración.',
        enProceso: 'El producto está terminado pero presenta algunas carencias en calidad o presentación.',
        conseguido: 'El producto es completo, correcto y está bien presentado.',
        avanzado: 'El producto es excelente: creativo, muy bien elaborado y supera los criterios establecidos.' },
    ]
  },
  {
    id: 'producto-digital',
    label: 'Producto digital',
    desc: 'Presentaciones, vídeos, podcasts, infografías…',
    emoji: '💻',
    filas: [
      { criterio: 'Contenido y rigor informativo', area: 'Competencia digital', instrumento: 'Rúbrica',
        iniciado: 'La información es escasa, errónea o copiada sin selección ni criterio.',
        enProceso: 'La información es básica y en parte correcta, pero poco elaborada o sin contrastar.',
        conseguido: 'El contenido es correcto, bien seleccionado y presenta la información con claridad.',
        avanzado: 'El contenido es exhaustivo, contrastado, original y aportado con criterio propio.' },
      { criterio: 'Diseño, estética y creatividad', area: 'Competencia digital', instrumento: 'Rúbrica',
        iniciado: 'El diseño es descuidado, recargado o hace difícil acceder al contenido.',
        enProceso: 'El diseño es funcional pero poco cuidado; la creatividad es escasa.',
        conseguido: 'El diseño es limpio, coherente y favorece la comprensión del contenido.',
        avanzado: 'El diseño es original, muy cuidado y enriquece significativamente la experiencia del usuario.' },
      { criterio: 'Uso ético y adecuado de la tecnología', area: 'Competencia digital', instrumento: 'Rúbrica',
        iniciado: 'Usa recursos ajenos sin citar, o emplea la tecnología de forma inapropiada.',
        enProceso: 'Cita algunos recursos, pero de forma incompleta o con algún uso inadecuado de la tecnología.',
        conseguido: 'Cita correctamente las fuentes y hace un uso apropiado y responsable de las herramientas.',
        avanzado: 'Cita impecablemente, usa licencias abiertas y refleja plena conciencia del uso ético digital.' },
      { criterio: 'Adecuación al objetivo y a la audiencia', area: 'Competencia digital', instrumento: 'Rúbrica',
        iniciado: 'El producto no se adecúa al objetivo planteado ni a la audiencia prevista.',
        enProceso: 'Se ajusta parcialmente al objetivo, pero no tiene en cuenta suficientemente la audiencia.',
        conseguido: 'El producto responde al objetivo y está bien adaptado a la audiencia prevista.',
        avanzado: 'El producto supera el objetivo, está perfectamente adaptado a la audiencia e impacta positivamente.' },
    ]
  },
  {
    id: 'produccion-escrita',
    label: 'Producción escrita',
    desc: 'Textos, informes, narraciones y composiciones',
    emoji: '✍️',
    filas: [
      { criterio: 'Adecuación y coherencia temática', area: 'Comunicación escrita', instrumento: 'Rúbrica',
        iniciado: 'El texto no se ajusta al tema o tipo textual solicitado.',
        enProceso: 'El texto se ajusta parcialmente, aunque con alguna desviación del tema central.',
        conseguido: 'El texto se adecúa correctamente al tema y al tipo textual requerido.',
        avanzado: 'El texto es ejemplar en adecuación: domina el tipo textual y desarrolla el tema con profundidad.' },
      { criterio: 'Cohesión y estructura', area: 'Comunicación escrita', instrumento: 'Rúbrica',
        iniciado: 'El texto carece de estructura; las ideas están desconectadas o no tienen orden.',
        enProceso: 'El texto tiene estructura básica, pero las ideas no siempre se conectan bien.',
        conseguido: 'El texto está bien estructurado y las ideas se conectan con conectores adecuados.',
        avanzado: 'El texto es muy cohesionado: usa variedad de conectores y la progresión temática es excelente.' },
      { criterio: 'Corrección lingüística', area: 'Comunicación escrita', instrumento: 'Rúbrica',
        iniciado: 'Presenta numerosos errores ortográficos, morfosintácticos o de puntuación.',
        enProceso: 'Hay algunos errores que no impiden la comprensión, pero son notorios.',
        conseguido: 'El texto es mayoritariamente correcto, con errores mínimos y no sistemáticos.',
        avanzado: 'El texto es impecable desde el punto de vista lingüístico.' },
      { criterio: 'Riqueza léxica y estilo', area: 'Comunicación escrita', instrumento: 'Rúbrica',
        iniciado: 'El léxico es muy limitado y repetitivo; el estilo es monótono.',
        enProceso: 'El léxico es básico; hay cierta variedad pero con frecuentes repeticiones.',
        conseguido: 'El léxico es variado y adecuado; el estilo es fluido y apropiado.',
        avanzado: 'El léxico es muy rico y preciso; el estilo es elaborado, personal y expresivo.' },
    ]
  },
  {
    id: 'investigacion',
    label: 'Investigación científica',
    desc: 'Proyectos de indagación, experimentos y estudios',
    emoji: '🔬',
    filas: [
      { criterio: 'Formulación de preguntas e hipótesis', area: 'Ciencias', instrumento: 'Rúbrica',
        iniciado: 'No plantea preguntas o hipótesis, o estas no guardan relación con el tema.',
        enProceso: 'Formula preguntas o hipótesis, aunque son imprecisas o difíciles de verificar.',
        conseguido: 'Formula preguntas claras e hipótesis contrastables y coherentes con el tema.',
        avanzado: 'Formula preguntas originales e hipótesis precisas que demuestran comprensión profunda del tema.' },
      { criterio: 'Metodología y proceso de investigación', area: 'Ciencias', instrumento: 'Rúbrica',
        iniciado: 'La metodología es inexistente o inadecuada; no sigue un proceso estructurado.',
        enProceso: 'Sigue algunos pasos del método científico, pero de forma incompleta.',
        conseguido: 'Aplica correctamente los pasos del método científico y registra los datos con orden.',
        avanzado: 'Aplica una metodología rigurosa, anticipa variables y registra los datos de forma sistemática y precisa.' },
      { criterio: 'Análisis e interpretación de resultados', area: 'Ciencias', instrumento: 'Rúbrica',
        iniciado: 'No analiza los datos o los interpreta de forma incorrecta.',
        enProceso: 'Realiza un análisis básico, pero la interpretación es superficial o parcialmente incorrecta.',
        conseguido: 'Analiza los datos correctamente y extrae conclusiones coherentes con los resultados.',
        avanzado: 'El análisis es profundo y crítico; relaciona los resultados con el contexto y la bibliografía.' },
      { criterio: 'Presentación de conclusiones', area: 'Ciencias', instrumento: 'Rúbrica',
        iniciado: 'No presenta conclusiones o estas no se derivan de los datos obtenidos.',
        enProceso: 'Las conclusiones son básicas y no siempre se fundamentan en los datos.',
        conseguido: 'Las conclusiones son claras, fundamentadas y responden a la hipótesis inicial.',
        avanzado: 'Las conclusiones son rigurosas, originales y proponen nuevas líneas de investigación.' },
    ]
  },
  {
    id: 'creacion-artistica',
    label: 'Creación artística',
    desc: 'Proyectos plásticos, musicales o de expresión corporal',
    emoji: '🎨',
    filas: [
      { criterio: 'Originalidad y creatividad', area: 'Expresión artística', instrumento: 'Rúbrica',
        iniciado: 'El trabajo es una copia o reproducción sin aportación personal.',
        enProceso: 'Hay alguna aportación personal, aunque el trabajo es poco original.',
        conseguido: 'El trabajo refleja creatividad y una visión personal reconocible.',
        avanzado: 'El trabajo es altamente original, sorprendente y refleja una voz artística propia muy desarrollada.' },
      { criterio: 'Dominio técnico y uso de materiales', area: 'Expresión artística', instrumento: 'Rúbrica',
        iniciado: 'El uso de la técnica o los materiales es incorrecto o muy limitado.',
        enProceso: 'Usa la técnica y los materiales de forma básica, con dificultades notorias.',
        conseguido: 'Demuestra un dominio correcto de la técnica y usa los materiales con habilidad.',
        avanzado: 'Domina la técnica con maestría y experimenta con los materiales de forma innovadora.' },
      { criterio: 'Proceso de creación y planificación', area: 'Expresión artística', instrumento: 'Rúbrica',
        iniciado: 'No planifica ni reflexiona; trabaja sin orden ni proceso reconocible.',
        enProceso: 'Hay cierta planificación, aunque el proceso es irregular o poco reflexionado.',
        conseguido: 'Planifica el proceso, reflexiona sobre las decisiones y mejora a partir del feedback.',
        avanzado: 'El proceso es muy reflexivo y documentado; aprende de los errores con autonomía y criterio.' },
      { criterio: 'Intención comunicativa y presentación', area: 'Expresión artística', instrumento: 'Rúbrica',
        iniciado: 'La obra no transmite ninguna intención clara ni está cuidada en su presentación.',
        enProceso: 'La intención es difusa; la presentación es básica.',
        conseguido: 'La obra transmite claramente una intención y está bien presentada.',
        avanzado: 'La obra impacta al receptor, transmite la intención con intensidad y la presentación es impecable.' },
    ]
  },
]
