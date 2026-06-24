# Publicación de versiones y firma de código

Esta guía explica cómo publicar una nueva versión (con auto-actualización) y cómo
activar la firma de código cuando dispongas de los certificados.

## 1. Publicar una nueva versión (auto-actualización)

La app se auto-actualiza desde **GitHub Releases** (`damp83/sda-creator-web`, el mismo
repositorio que aloja la web y los instaladores). El flujo es:

1. Sube el número de versión en `package.json` (campo `"version"`), por ejemplo `2.1.0`.
2. Haz commit y crea una etiqueta `v` + versión:
   ```bash
   git commit -am "Versión 2.1.0"
   git tag v2.1.0
   git push origin master --tags
   ```
3. GitHub Actions (`.github/workflows/build.yml`) detecta la etiqueta, compila los
   instaladores de Windows y macOS y los **publica automáticamente** en una Release
   (incluyendo los ficheros `latest.yml` / `latest-mac.yml` que necesita el updater).
4. Las instalaciones existentes detectarán la nueva versión al arrancar, la
   descargarán en segundo plano y ofrecerán reiniciar para instalarla.

> En `push`/`pull_request` normales (sin etiqueta) la CI solo compila los instaladores
> como _artefactos_, **no** publica Release.

## 2. Firma de código (Windows)

Sin firma, Windows muestra avisos de SmartScreen y "editor desconocido". Para firmar:

1. Consigue un certificado de firma de código (**OV** o, mejor, **EV**) de una CA
   reconocida (DigiCert, Sectigo, etc.) en formato `.pfx`.
2. Conviértelo a base64 y añádelo como **secretos** del repositorio en GitHub
   (_Settings → Secrets and variables → Actions_):
   - `WIN_CSC_LINK` = contenido del `.pfx` en base64
   - `WIN_CSC_KEY_PASSWORD` = contraseña del `.pfx`
3. No hace falta tocar el workflow: ya pasa esos secretos como `CSC_LINK` /
   `CSC_KEY_PASSWORD`, que electron-builder usa automáticamente para firmar.

> Los certificados EV suelen vivir en un token hardware/HSM; en ese caso se firma con
> un servicio en la nube (Azure Trusted Signing, SignPath…) y la configuración cambia.

## 3. Firma y notarización (macOS)

Para distribuir en macOS sin avisos de Gatekeeper hace falta firmar **y** notarizar.

1. Certificado "Developer ID Application" de Apple en `.p12`.
2. Secretos del repositorio:
   - `MAC_CSC_LINK` = `.p12` en base64
   - `MAC_CSC_KEY_PASSWORD` = contraseña del `.p12`
   - `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` = credenciales de notarización
3. Para la notarización automática hay que añadir `@electron/notarize` y un hook
   `afterSign` en la configuración de electron-builder (pendiente de añadir cuando se
   disponga de cuenta de desarrollador de Apple).

## 4. Verificación local rápida

```bash
npm run typecheck && npm run lint && npm test   # comprobaciones
npm run dist:win                                 # instalador Windows en dist/ (sin publicar)
```
