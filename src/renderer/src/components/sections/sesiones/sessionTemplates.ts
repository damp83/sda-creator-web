import type { Sesion } from '@renderer/types'

export const SESSION_TEMPLATES: Array<{ id: string; label: string; desc: string; emoji: string; partial: Partial<Sesion> }> = [
  {
    id: 'blank',
    label: 'En blanco',
    desc: 'Sesión vacía para rellenar libremente',
    emoji: '📄',
    partial: {}
  },
  {
    id: 'launch',
    label: 'Lanzamiento',
    desc: 'Presentación del reto y motivación inicial',
    emoji: '🚀',
    partial: {
      titulo: 'Sesión de lanzamiento',
      inicio: '<p>Rutina de pensamiento <em>Veo / Pienso / Me pregunto</em> a partir de una imagen o vídeo relacionado con el reto. Recogida de ideas previas del alumnado en la pizarra colaborativa.</p>',
      desarrollo: '<p>Presentación del <strong>reto global</strong> de la SdA: contexto, producto final esperado y criterios de éxito. El alumnado, en grupos, genera preguntas de investigación y las clasifica por categorías. Negociación y consenso del plan de trabajo.</p>',
      cierre: '<p>Puesta en común de las preguntas de investigación. El alumnado completa la ficha <em>KWL</em> (Sé / Quiero saber / He aprendido). Anticipo de la próxima sesión.</p>'
    }
  },
  {
    id: 'research',
    label: 'Exploración',
    desc: 'Investigación, observación y recogida de datos',
    emoji: '🔍',
    partial: {
      titulo: 'Sesión de exploración',
      inicio: '<p>Revisión de las preguntas de investigación pendientes. Activación con una pregunta abierta o experimento de anticipación. Organización de los grupos de trabajo.</p>',
      desarrollo: '<p>El alumnado investiga en fuentes seleccionadas (libros, webs fiables, experimentos) y recoge los datos en su cuaderno de campo. El docente realiza rondas de acompañamiento y formula preguntas que profundizan el pensamiento.</p>',
      cierre: '<p>Los grupos comparten un hallazgo relevante con el resto de la clase (<em>galería de aprendizajes</em>). Reflexión individual: ¿qué he aprendido hoy? ¿qué me sigue generando dudas?</p>'
    }
  },
  {
    id: 'workshop',
    label: 'Taller / Creación',
    desc: 'Construcción activa del producto o artefacto',
    emoji: '🛠️',
    partial: {
      titulo: 'Sesión de taller',
      inicio: '<p>Revisión del avance del producto final: ¿dónde estamos? ¿qué nos falta? Breve modelado del docente de la técnica o habilidad que se va a practicar.</p>',
      desarrollo: '<p>Trabajo en grupos o individual sobre el <strong>producto final</strong>: elaboración, construcción, edición o diseño según la fase del proyecto. El docente circula y ofrece retroalimentación formativa.</p>',
      cierre: '<p>Autoevaluación del trabajo realizado mediante lista de cotejo o diana. Los grupos identifican un punto fuerte y una mejora pendiente para la próxima sesión.</p>'
    }
  },
  {
    id: 'sharing',
    label: 'Puesta en común',
    desc: 'Presentación y debate de resultados',
    emoji: '💬',
    partial: {
      titulo: 'Puesta en común',
      inicio: '<p>Asignación de roles: ponente, moderador, tomador de notas, evaluador par. Revisión de los criterios de evaluación acordados.</p>',
      desarrollo: '<p>Cada grupo presenta sus resultados (3-5 min). El resto ofrece retroalimentación constructiva con la estructura <em>Dos estrellas y un deseo</em>. Registro colectivo de conclusiones.</p>',
      cierre: '<p>Síntesis de los aprendizajes clave. El alumnado actualiza su <em>KWL</em> y señala nuevas preguntas surgidas. El docente cierra con una pregunta de transferencia.</p>'
    }
  },
  {
    id: 'evaluation',
    label: 'Evaluación / Cierre',
    desc: 'Presentación del producto final y reflexión',
    emoji: '🏁',
    partial: {
      titulo: 'Sesión de cierre y evaluación',
      inicio: '<p>Repaso visual de todas las sesiones (línea del tiempo del proyecto). Recordatorio de los criterios de evaluación acordados al inicio.</p>',
      desarrollo: '<p>Presentación del <strong>producto final</strong> ante la audiencia real. Rúbrica de coevaluación y heteroevaluación. Recogida de evidencias para el portafolio.</p>',
      cierre: '<p>Reflexión metacognitiva: ¿qué he aprendido? ¿cómo lo he aprendido? ¿qué cambiaría? Cumplimentación del <em>KWL</em>. Cierre emocional del proyecto.</p>'
    }
  },
]
