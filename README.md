# SdA Creator

Aplicación de escritorio para crear **Situaciones de Aprendizaje (SdA)** siguiendo el marco curricular **LOMLOE** de la Región de Murcia. Guía al docente a través de 10 secciones estructuradas y ofrece generación automática de contenido mediante IA.

---

## ¿Qué es una Situación de Aprendizaje?

Una Situación de Aprendizaje (SdA) es la unidad de programación didáctica del currículo LOMLOE. SdA Creator facilita su redacción estructurando el documento en 10 apartados:

| # | Sección | Descripción |
|---|---------|-------------|
| 1 | Identificación | Título, ciclo, área, duración, centro y docente |
| 2 | Justificación | Contextualización y justificación pedagógica |
| 3 | Reto / Producto Final | Situación-problema y producto esperado |
| 4 | Vinculación Curricular | Competencias clave y elementos curriculares |
| 5 | Metodología | Enfoque, agrupamientos, espacios y recursos |
| 6 | Secuencia Didáctica | Sesiones detalladas con intro, desarrollo y cierre |
| 7 | Evaluación | Criterios, instrumentos y rúbricas de calificación |
| 8 | Atención a la Diversidad (DUA) | Medidas de implicación, representación y acción/expresión |
| 9 | Interdisciplinariedad | Conexiones transversales entre áreas |
| 10 | ODS | Alineación con los Objetivos de Desarrollo Sostenible |

---

## Características principales

- **Asistente IA integrado** — Generación automática de secciones usando Claude (Anthropic), OpenAI (ChatGPT) o Gemini (Google). Incluye mejora de texto inline al seleccionar cualquier fragmento en el editor
- **Cuaderno de Trabajo del alumno** — Genera un cuaderno gamificado imprimible (misiones, tareas por niveles de Bloom, XP) a partir de las sesiones de la SdA
- **Completar SdA con un clic** — Rellena todas las secciones vacías de forma secuencial con un solo botón
- **Editor de texto enriquecido** — TipTap con negrita, cursiva, listas y más
- **Exportar a PDF** — Impresión directa con 4 plantillas de color prediseñadas (Azul LOMLOE, Verde, Gris, Ámbar)
- **Datos curriculares integrados** — Currículo oficial de la Región de Murcia incorporado en la aplicación
- **Plantillas de SdA** — Punto de partida con ejemplos ya redactados
- **Guardado automático** — Copia de seguridad local cada 30 segundos, recuperable al reiniciar
- **Deshacer / Rehacer** — Historial de 50 acciones
- **Modo oscuro** — Tema claro u oscuro con persistencia
- **Atajos de teclado** — Ctrl+S guardar, Ctrl+O abrir, Ctrl+N nueva, Ctrl+P exportar PDF
- **Actualización automática** — La app detecta nuevas versiones publicadas y se actualiza en segundo plano (ver [docs/RELEASE-Y-FIRMA.md](docs/RELEASE-Y-FIRMA.md))

---

## Requisitos del sistema

| | Mínimo |
|---|---|
| **SO** | Windows 10 / 11 (64 bits) |
| **RAM** | 4 GB |
| **Disco** | 300 MB libres |
| **Conexión** | Necesaria solo para la generación con IA |

---

## Instalación

### Instalador (recomendado)

1. Descarga el archivo `SdA Creator Setup x.x.x.exe` desde la sección de [Releases](https://github.com/damp83/sda-creator-web/releases)
2. Ejecuta el instalador y sigue los pasos del asistente
3. Elige la carpeta de instalación y haz clic en **Instalar**
4. Al terminar, accede desde el acceso directo del escritorio o el menú Inicio

### Desde el código fuente

Requiere [Node.js 20+](https://nodejs.org) y [Git](https://git-scm.com).

```bash
# Clonar el repositorio
git clone https://github.com/damp83/sda-creator-web.git
cd sda-creator-web

# Instalar dependencias
npm install

# Arrancar en modo desarrollo
npm run dev

# Generar instalador para Windows
npm run dist
```

El instalador se genera en la carpeta `dist/`.

---

## Configuración de la IA

Para usar las funciones de generación automática necesitas una clave de API de un proveedor compatible:

1. Abre **Ajustes → Configuración de IA** (icono de llave en la barra superior)
2. Selecciona el proveedor: **Anthropic (Claude)** u **OpenAI**
3. Pega tu clave de API y guarda

Las claves se almacenan de forma cifrada en el equipo y nunca se envían a ningún servidor externo. Consulta el tratamiento de datos en [PRIVACIDAD.md](PRIVACIDAD.md).

### Obtener una clave de API

- **Anthropic Claude:** [console.anthropic.com](https://console.anthropic.com)
- **OpenAI:** [platform.openai.com](https://platform.openai.com)
- **Google Gemini:** [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

## Flujo de trabajo típico

```
Abrir la app → Crear nueva SdA (o usar plantilla)
    → Completar Identificación (título, ciclo, área — campos obligatorios)
    → Usar "Completar SdA con IA" para un borrador automático
    → Revisar y ajustar cada sección
    → Exportar a PDF con la plantilla de color deseada
    → Guardar el archivo .sda para ediciones futuras
```

---

## Tecnología

| Capa | Tecnología |
|---|---|
| Runtime de escritorio | Electron 42 |
| Interfaz | React 18 + TypeScript |
| Bundler | Vite + electron-vite |
| Estilos | Tailwind CSS 3 |
| Editor de texto | TipTap 3 |
| Estado | Zustand 5 |
| Empaquetado | electron-builder (NSIS) |

---

## Licencia

Proyecto de uso interno educativo — Región de Murcia.
