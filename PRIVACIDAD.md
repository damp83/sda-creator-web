# Política de privacidad y tratamiento de datos — SdA Creator

_Última actualización: 2026-06_

SdA Creator es una aplicación de escritorio que se ejecuta **en el equipo del docente**. No dispone de servidores propios ni recopila datos de uso. Este documento explica qué datos maneja la aplicación y hacia dónde salen.

## 1. Datos que se almacenan en tu equipo

Todo se guarda **localmente**, en la carpeta de datos de usuario de la aplicación:

- **Situaciones de Aprendizaje** (archivos `.sda.json` que tú eliges dónde guardar) y sus copias de seguridad automáticas.
- **Claves de API de IA**, cifradas con el almacén seguro del sistema operativo (`safeStorage` de Electron). No se guardan en texto plano y no salen del equipo salvo hacia el proveedor que configures.
- **Preferencias** (tema, plantillas, archivos recientes).
- **Registros de la aplicación** (logs), para diagnóstico de errores. Se guardan localmente con rotación automática y no se envían a ningún sitio.
  - Windows: `%APPDATA%/sda-creator/logs/`
  - macOS: `~/Library/Logs/sda-creator/`

La aplicación **no incorpora telemetría** ni reporte automático de errores a terceros.

## 2. Datos que salen del equipo (funciones de IA)

Las funciones de generación con IA son **opcionales** y solo se activan si configuras una clave de API. Cuando las usas:

- El **texto de la Situación de Aprendizaje** (y, en su caso, el del cuaderno) se envía al proveedor que hayas seleccionado para generar el contenido:
  - **Anthropic (Claude)** — https://www.anthropic.com/legal/privacy
  - **OpenAI (ChatGPT)** — https://openai.com/policies/privacy-policy
  - **Google (Gemini)** — https://policies.google.com/privacy
- La comunicación se realiza directamente entre tu equipo y el proveedor, usando **tu propia clave de API**. La aplicación no actúa como intermediario ni conserva copia de esos envíos.

## 3. Recomendación sobre datos personales del alumnado (RGPD)

> **No introduzcas datos personales identificativos del alumnado** (nombres, apellidos, diagnósticos médicos, situaciones familiares, etc.) en los campos que se procesan con IA.

Usa descripciones **genéricas y no identificativas** (por ejemplo, «un alumno con TDAH» en lugar de nombres o datos concretos). El docente es responsable del tratamiento de los datos que introduce, conforme al RGPD (Reglamento (UE) 2016/679) y la LOPDGDD.

## 4. Sin IA, sin envíos

Si no configuras ninguna clave de API, la aplicación funciona **100 % en local** y ningún dato sale de tu equipo.

## 5. Contacto

Responsable: Diego Alberto Moya Puerta — Maestro de Educación Primaria, Región de Murcia.
