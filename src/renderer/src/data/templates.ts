import type { SdA, Ciclo } from '@renderer/types'

export type PlantillaColor = 'emerald' | 'blue' | 'violet' | 'amber' | 'rose' | 'teal'

export type PlantillaEtapa = 'Infantil' | 'Primaria'

export interface Plantilla {
  id: string
  nombre: string
  descripcion: string
  etapa: PlantillaEtapa
  etiquetaCiclo: string
  ciclo: Ciclo
  emoji: string
  color: PlantillaColor
  sda: Partial<SdA>
}

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'cientificos-accion',
    nombre: 'Científicos en acción',
    descripcion: 'El alumnado investiga un problema científico del entorno y presenta sus conclusiones a la comunidad educativa.',
    etapa: 'Primaria',
    etiquetaCiclo: '2º Ciclo (3º-4º)',
    ciclo: 'primaria_ciclo_2',
    emoji: '🔬',
    color: 'emerald',
    sda: {
      titulo: 'Científicos en acción',
      ciclo: 'primaria_ciclo_2',
      ambito: 'Ciencias de la Naturaleza',
      areas: ['Ciencias de la Naturaleza'],
      numSesiones: 8,
      temporalizacion: '2ª evaluación',
      hilo: '¿Cómo podemos investigar los fenómenos naturales de nuestro entorno y proponer soluciones basadas en evidencias?',
      situacionProblema:
        'Los estudiantes se convierten en pequeños científicos que deben investigar un problema ambiental real detectado en el entorno escolar (contaminación, erosión, pérdida de biodiversidad, etc.). Para ello, aplicarán el método científico: observación, hipótesis, experimentación, análisis y comunicación de resultados.',
      productoFinal:
        'Póster científico en formato A1 + exposición oral ante el resto del centro en la Feria de la Ciencia del cole.',
      justificacion:
        'La metodología de indagación científica fomenta el pensamiento crítico, la curiosidad innata del alumnado y la capacidad de enfrentarse a problemas reales. Conectar la ciencia con el entorno inmediato da sentido y contextualización a los aprendizajes, aumentando la motivación y la transferencia de conocimientos.',
      competenciasClave: ['STEM', 'CCL', 'CPSAA', 'CD'],
      planteamientoMetodologico:
        'Aprendizaje Basado en Proyectos (ABP) con enfoque STEM. Las sesiones combinan trabajo en equipos de investigación, experimentación en el aula/patio y puestas en común. Se utilizará la rutina de pensamiento "Veo-Pienso-Me pregunto" al inicio y "Antes pensaba / Ahora pienso" al cierre.',
      agrupamientos: ['Pequeño grupo', 'Gran grupo', 'Individual'],
      espacios: ['Aula', 'Patio', 'Sala de informática'],
      recursos:
        'Lupas, recipientes graduados, tierra, semillas, material de laboratorio básico, tablets/ordenadores para la recogida de datos, fichas de registro científico.',
      tiempos: 'Sesiones de 60 minutos. Investigación repartida en 3 semanas con 2-3 sesiones semanales.',
      momentosEvaluacion: ['Diagnóstica', 'Formativa', 'Sumativa'],
      instrumentosEvaluacion: ['Rúbrica', 'Observación directa', 'Exposición oral'],
      duaImplicacion:
        'Se ofrecen roles diferenciados dentro del equipo científico (investigador, secretario, portavoz, diseñador) para que cada alumno contribuya desde sus fortalezas. Se emplean apoyos visuales y manipulativos.',
      duaRepresentacion:
        'La información se presenta en múltiples formatos: textos, infografías, vídeos cortos y experimentación directa. Los materiales se adaptan al nivel lector de cada alumno.',
      duaAccionExpresion:
        'El producto final admite distintos formatos de presentación: póster, presentación digital, maqueta o vídeo explicativo.',
      conexiones: [
        { area: 'Matemáticas', descripcion: 'Recogida, organización y representación gráfica de datos estadísticos.' },
        { area: 'Lengua Castellana y Literatura', descripcion: 'Redacción del informe científico y comunicación oral de resultados.' },
        { area: 'Competencia Digital', descripcion: 'Uso de herramientas digitales para búsqueda de información y presentación.' }
      ],
      transversales: 'Educación ambiental y sostenibilidad. Cultura científica y pensamiento crítico.',
      ods: [4, 13, 15]
    }
  },

  {
    id: 'periodico-cole',
    nombre: 'El periódico del cole',
    descripcion: 'El alumnado crea un periódico escolar digital con noticias, entrevistas y reportajes sobre su entorno.',
    etapa: 'Primaria',
    etiquetaCiclo: '2º Ciclo (3º-4º)',
    ciclo: 'primaria_ciclo_2',
    emoji: '📰',
    color: 'blue',
    sda: {
      titulo: 'El periódico del cole',
      ciclo: 'primaria_ciclo_2',
      ambito: 'Lengua Castellana y Literatura',
      areas: ['Lengua Castellana y Literatura'],
      numSesiones: 10,
      temporalizacion: '1ª evaluación',
      hilo: '¿Cómo podemos informar a nuestra comunidad educativa sobre lo que ocurre en nuestro entorno de forma rigurosa y atractiva?',
      situacionProblema:
        'El colegio no tiene un medio de comunicación propio. El alumnado asume el reto de crear la primera redacción del periódico escolar, asignándose roles periodísticos (redactor, editor, fotógrafo, maquetador) para producir un número que llegue a todas las familias.',
      productoFinal:
        'Número 0 del periódico escolar en formato PDF digital + ejemplar impreso expuesto en el corcho del centro y enviado a las familias.',
      justificacion:
        'La creación de un periódico escolar integra de forma natural todos los géneros textuales del currículo (noticia, crónica, entrevista, opinión), desarrollando la competencia comunicativa en situaciones reales y auténticas con audiencia real fuera del aula.',
      competenciasClave: ['CCL', 'CD', 'CPSAA', 'CE', 'CC'],
      planteamientoMetodologico:
        'Aprendizaje Cooperativo con estructura de redacción periodística real. Cada sesión simula el trabajo de una redacción: reunión de redacción, asignación de coberturas, escritura, revisión editorial y maquetación. Se usa la metodología de "escritura en proceso" con borradores y revisiones por pares.',
      agrupamientos: ['Pequeño grupo', 'Parejas', 'Individual'],
      espacios: ['Aula', 'Sala de informática'],
      recursos:
        'Ordenadores o tablets, procesador de texto, herramienta de maquetación (Canva o similar), cámara o móvil para fotografías, acceso a noticias de ejemplo.',
      tiempos: 'Sesiones de 55 minutos. Proyecto distribuido en 5 semanas con 2 sesiones semanales.',
      momentosEvaluacion: ['Diagnóstica', 'Formativa', 'Sumativa'],
      instrumentosEvaluacion: ['Rúbrica', 'Portafolio', 'Observación directa'],
      duaImplicacion:
        'La asignación de roles periodísticos permite que cada alumno encuentre su mejor forma de contribuir (escritura, fotografía, diseño, locución). El producto con audiencia real eleva la motivación.',
      duaRepresentacion:
        'Se estudian periódicos reales en papel y digital. Se proporcionan plantillas de los distintos géneros periodísticos y ejemplos adaptados al nivel.',
      duaAccionExpresion:
        'Los artículos pueden presentarse en formato escrito, audio o vídeo (para la versión digital). Se acepta el uso de herramientas de predicción de texto y dictado por voz.',
      conexiones: [
        { area: 'Ciencias Sociales', descripcion: 'Análisis de noticias y medios de comunicación como instituciones sociales.' },
        { area: 'Competencia Digital', descripcion: 'Maquetación digital, búsqueda de información fiable y gestión de imágenes.' },
        { area: 'Educación Artística', descripcion: 'Diseño visual, tipografía y composición fotográfica.' }
      ],
      transversales: 'Educación en valores democráticos. Uso responsable de los medios de comunicación y las redes sociales.',
      ods: [4, 16]
    }
  },

  {
    id: 'comunidad-sostenible',
    nombre: 'Mi comunidad sostenible',
    descripcion: 'El alumnado diseña un plan de mejora sostenible para su barrio y lo presenta ante representantes municipales.',
    etapa: 'Primaria',
    etiquetaCiclo: '3er Ciclo (5º-6º)',
    ciclo: 'primaria_ciclo_3',
    emoji: '🌱',
    color: 'teal',
    sda: {
      titulo: 'Mi comunidad sostenible',
      ciclo: 'primaria_ciclo_3',
      ambito: 'Ciencias Sociales',
      areas: ['Ciencias Sociales', 'Ciencias de la Naturaleza'],
      numSesiones: 12,
      temporalizacion: '3ª evaluación',
      hilo: '¿Qué podemos hacer desde nuestro colegio para construir una comunidad más justa, verde y sostenible?',
      situacionProblema:
        'El alumnado analiza los problemas medioambientales y sociales de su barrio o municipio (residuos, zonas verdes, accesibilidad, energía, etc.) y elabora propuestas de mejora concretas y fundamentadas, que presentará al Ayuntamiento o a la AMPA del centro como proyecto ciudadano real.',
      productoFinal:
        'Propuesta de mejora sostenible documentada + presentación ante representantes del Ayuntamiento o la comunidad educativa.',
      justificacion:
        'Conectar el aprendizaje con la transformación real del entorno próximo desarrolla la competencia ciudadana y el pensamiento crítico. Trabajar los ODS en contextos auténticos dota de significado a los contenidos curriculares de Ciencias Sociales y Naturales.',
      competenciasClave: ['CC', 'STEM', 'CCL', 'CPSAA', 'CE', 'CD'],
      planteamientoMetodologico:
        'Aprendizaje-Servicio (ApS) con fases de análisis de la realidad, diseño de la propuesta, acción y reflexión. Se combina el trabajo de campo (salida al barrio), la investigación documental y el trabajo colaborativo en equipos de proyecto.',
      agrupamientos: ['Pequeño grupo', 'Gran grupo'],
      espacios: ['Aula', 'Sala de informática', 'Salidas al entorno'],
      recursos:
        'Plano del barrio/municipio, datos estadísticos locales (Ayuntamiento), tablets para fotografía y trabajo de campo, materiales de presentación.',
      tiempos: 'Sesiones de 60 minutos. Proyecto trimestral con 3-4 sesiones semanales en el último mes.',
      momentosEvaluacion: ['Diagnóstica', 'Formativa', 'Sumativa'],
      instrumentosEvaluacion: ['Rúbrica', 'Exposición oral', 'Portafolio', 'Observación directa'],
      duaImplicacion:
        'La conexión con la realidad local y el impacto real de las propuestas actúan como poderoso motivador intrínseco. Los equipos son heterogéneos y los roles rotan.',
      duaRepresentacion:
        'Se trabajan los datos locales en distintos formatos (mapas, gráficas, fotografías, testimonios). Los textos de apoyo se adaptan al nivel lector.',
      duaAccionExpresion:
        'La propuesta final puede presentarse como informe escrito, presentación de diapositivas, maqueta, vídeo o combinación de formatos.',
      conexiones: [
        { area: 'Matemáticas', descripcion: 'Análisis estadístico de datos locales, escalas en planos y gestión de presupuestos.' },
        { area: 'Lengua Castellana', descripcion: 'Redacción de la propuesta formal y presentación oral argumentada.' },
        { area: 'Competencia Digital', descripcion: 'Búsqueda de información, creación de presentaciones y uso de herramientas de mapas.' }
      ],
      transversales: 'Educación para la sostenibilidad y ciudadanía global. Participación democrática y compromiso cívico.',
      ods: [11, 13, 3, 17]
    }
  },

  {
    id: 'cuentacuentos-digitales',
    nombre: 'Cuentacuentos digitales',
    descripcion: 'El alumnado crea un cuento ilustrado de forma colaborativa para presentar en la festividad del centro.',
    etapa: 'Infantil',
    etiquetaCiclo: '2º Ciclo (3-6 años)',
    ciclo: 'infantil_ciclo_2',
    emoji: '📖',
    color: 'violet',
    sda: {
      titulo: 'Cuentacuentos digitales',
      ciclo: 'infantil_ciclo_2',
      ambito: 'Comunicación y Representación de la Realidad',
      areas: ['Comunicación y Representación de la Realidad'],
      numSesiones: 6,
      temporalizacion: '2ª evaluación',
      hilo: '¿Cómo podemos crear y contar historias propias que emocionen a nuestras familias?',
      situacionProblema:
        'Los niños y niñas reciben una "caja misteriosa" con tres objetos al azar (un sombrero, una llave y un animal de juguete). A partir de esos elementos, deben crear juntos un cuento original, ilustrarlo y narrarlo ante sus familias en la Semana Cultural.',
      productoFinal:
        'Cuento ilustrado digital en formato presentación + libro impreso para la biblioteca del aula + narración en vivo ante las familias.',
      justificacion:
        'La creación de narrativas propias desarrolla el lenguaje oral y escrito emergente, la imaginación y la expresión emocional. Trabajar con un producto real para una audiencia significativa (las familias) eleva el sentido de la tarea y la motivación del alumnado de Infantil.',
      competenciasClave: ['CCL', 'CCEC', 'CPSAA', 'CD'],
      planteamientoMetodologico:
        'Talleres creativos con metodología de asamblea de aula para la construcción colectiva del relato. Se alternan momentos de creación conjunta, ilustración individual/en parejas y ensayo de la narración oral con apoyo de imágenes.',
      agrupamientos: ['Gran grupo', 'Pequeño grupo', 'Parejas'],
      espacios: ['Aula', 'Biblioteca'],
      recursos:
        'Caja misteriosa con objetos disparadores, materiales plásticos (acuarelas, ceras, collage), tablet o pizarra digital, aplicación de presentaciones, impresora.',
      tiempos: 'Sesiones de 45-50 minutos integradas en las rutinas de aula durante 3 semanas.',
      momentosEvaluacion: ['Diagnóstica', 'Formativa', 'Sumativa'],
      instrumentosEvaluacion: ['Observación directa', 'Rúbrica', 'Diario del alumno'],
      duaImplicacion:
        'El elemento sorpresa de la caja misteriosa y la creación para las familias generan alta motivación. Los roles (narrador, ilustrador, editor) permiten participación desde distintas fortalezas.',
      duaRepresentacion:
        'El cuento se construye con apoyo visual constante (imágenes, pictogramas). Se leen cuentos de referencia en distintos formatos (papel, digital, kamishibai).',
      duaAccionExpresion:
        'Las ilustraciones pueden realizarse en distintas técnicas según las capacidades (pintura, collage, fotografía, dibujo digital). La narración puede apoyarse en imágenes proyectadas.',
      conexiones: [
        { area: 'Descubrimiento de sí mismo y del entorno', descripcion: 'Exploración de emociones a través de los personajes del cuento.' },
        { area: 'Expresión Artística', descripcion: 'Ilustración con distintas técnicas plásticas y experimentación con materiales.' }
      ],
      transversales: 'Educación emocional. Fomento de la lectura y la creatividad.',
      ods: [4]
    }
  },

  {
    id: 'matematicas-mercado',
    nombre: 'Matemáticas en el mercado',
    descripcion: 'El alumnado monta un mercado en el aula donde practica conteo, operaciones básicas y el valor del dinero.',
    etapa: 'Primaria',
    etiquetaCiclo: '1er Ciclo (1º-2º)',
    ciclo: 'primaria_ciclo_1',
    emoji: '🛒',
    color: 'amber',
    sda: {
      titulo: 'Matemáticas en el mercado',
      ciclo: 'primaria_ciclo_1',
      ambito: 'Matemáticas',
      areas: ['Matemáticas'],
      numSesiones: 7,
      temporalizacion: '2ª evaluación',
      hilo: '¿Para qué sirven los números en nuestra vida cotidiana y cómo los usamos cuando compramos y vendemos?',
      situacionProblema:
        'El aula se transforma en un mercado donde los alumnos asumen roles de vendedores y compradores. Deben preparar sus puestos, etiquetar los productos con precios, realizar operaciones de compra-venta y rendir cuentas al final del día de mercado.',
      productoFinal:
        'Mercado del aula en funcionamiento durante una sesión abierta a otras clases + cuaderno de cuentas personal con registro de todas las operaciones.',
      justificacion:
        'La matematización de situaciones cotidianas reales es el camino más eficaz para que el alumnado de primer ciclo construya el sentido numérico de forma significativa. El mercado escolar crea un contexto auténtico donde el error forma parte del aprendizaje.',
      competenciasClave: ['STEM', 'CCL', 'CPSAA', 'CE'],
      planteamientoMetodologico:
        'Aprendizaje Experiencial con manipulación y juego simbólico. Las primeras sesiones se dedican a explorar el dinero y las operaciones básicas con material concreto (monedas, billetes de juguete, ábaco, regletas Cuisenaire). Las últimas sesiones se destinan a la preparación y celebración del mercado.',
      agrupamientos: ['Parejas', 'Pequeño grupo', 'Gran grupo'],
      espacios: ['Aula'],
      recursos:
        'Dinero de plástico/papel, etiquetas de precios, productos (reales o de juguete), fichas de registro, ábaco, regletas Cuisenaire, calculadora (para comprobación).',
      tiempos: 'Sesiones de 50 minutos. Proyecto de 3 semanas con 2-3 sesiones semanales.',
      momentosEvaluacion: ['Diagnóstica', 'Formativa', 'Sumativa'],
      instrumentosEvaluacion: ['Observación directa', 'Lista de cotejo', 'Rúbrica'],
      duaImplicacion:
        'El juego simbólico del mercado es intrínsecamente motivador para el alumnado de primer ciclo. La asignación de roles (vendedor, comprador, cajero, supervisor) permite ajustar el nivel de demanda cognitiva.',
      duaRepresentacion:
        'Las operaciones se presentan con manipulativos concretos antes de pasar a la representación simbólica. Los enunciados se apoyan con imágenes y se leen en voz alta.',
      duaAccionExpresion:
        'El registro de operaciones puede realizarse con dibujos, números, calculadora o dictado al compañero según el nivel de cada alumno.',
      conexiones: [
        { area: 'Lengua Castellana y Literatura', descripcion: 'Escritura de carteles y etiquetas; lectura de precios y listas de la compra.' },
        { area: 'Ciencias Sociales', descripcion: 'Introducción al comercio como actividad económica básica de la sociedad.' },
        { area: 'Educación en Valores', descripcion: 'Cooperación, honestidad y responsabilidad en las transacciones comerciales.' }
      ],
      transversales: 'Educación financiera básica. Consumo responsable y sostenible.',
      ods: [4, 8]
    }
  },

  {
    id: 'artistas-tierra',
    nombre: 'Artistas de nuestra tierra',
    descripcion: 'El alumnado descubre el patrimonio cultural y artístico local y crea una exposición para el centro.',
    etapa: 'Primaria',
    etiquetaCiclo: '1er Ciclo (1º-2º)',
    ciclo: 'primaria_ciclo_1',
    emoji: '🎨',
    color: 'rose',
    sda: {
      titulo: 'Artistas de nuestra tierra',
      ciclo: 'primaria_ciclo_1',
      ambito: 'Educación Artística',
      areas: ['Educación Artística', 'Ciencias Sociales'],
      numSesiones: 8,
      temporalizacion: '1ª evaluación',
      hilo: '¿Quiénes son los artistas de nuestra tierra y cómo podemos inspirarnos en ellos para crear nuestra propia obra?',
      situacionProblema:
        'El alumnado recibe el encargo de organizar la primera exposición de arte del colegio. Para ello, investiga artistas locales o regionales (pintores, escultores, fotógrafos), se inspira en sus técnicas y estilos, y crea sus propias obras para exhibirlas en los pasillos del centro.',
      productoFinal:
        'Exposición de arte en los pasillos del colegio con obras propias + catálogo ilustrado de la exposición para las familias.',
      justificacion:
        'Conectar la expresión plástica con el patrimonio cultural próximo desarrolla la identidad cultural del alumnado y la competencia en conciencia y expresión culturales. La exposición real para una audiencia auténtica aporta propósito y calidad al trabajo artístico.',
      competenciasClave: ['CCEC', 'CCL', 'CPSAA', 'CD'],
      planteamientoMetodologico:
        'Itinerario de creación artística estructurado en tres fases: (1) Investigación y descubrimiento del artista de referencia, (2) Taller de técnica e inspiración, (3) Creación de la obra propia y comisariado de la exposición. Se utiliza el cuaderno de artista como hilo conductor.',
      agrupamientos: ['Individual', 'Pequeño grupo', 'Gran grupo'],
      espacios: ['Aula'],
      recursos:
        'Láminas y reproducciones de obras de artistas locales/regionales, materiales plásticos variados (acuarelas, témpera, collage, arcilla), cuaderno de artista, cámara/tablet para documentar el proceso.',
      tiempos: 'Sesiones de 60 minutos (sesiones de Educación Artística). Proyecto de 4 semanas.',
      momentosEvaluacion: ['Diagnóstica', 'Formativa', 'Sumativa'],
      instrumentosEvaluacion: ['Portafolio', 'Rúbrica', 'Observación directa'],
      duaImplicacion:
        'La libre elección de técnica artística y del artista de referencia (dentro de los propuestos) aumenta la autonomía y la motivación. Cada alumno tiene un cuaderno de artista personal donde recoger su proceso creativo.',
      duaRepresentacion:
        'Las obras de los artistas se presentan en gran formato y se analizan con preguntas guiadas accesibles. La información biográfica se adapta al nivel lector.',
      duaAccionExpresion:
        'Se ofrecen al menos tres técnicas plásticas distintas para que el alumnado elija la más adaptada a sus posibilidades motoras y creativas.',
      conexiones: [
        { area: 'Ciencias Sociales', descripcion: 'Patrimonio cultural de la Región de Murcia: arte, historia y tradiciones locales.' },
        { area: 'Lengua Castellana', descripcion: 'Redacción de la ficha del artista y del texto de presentación de la obra propia.' },
        { area: 'Competencia Digital', descripcion: 'Búsqueda de información sobre artistas y documentación fotográfica del proceso.' }
      ],
      transversales: 'Educación patrimonial. Identidad cultural y valoración de la diversidad artística.',
      ods: [4, 11]
    }
  }
]
