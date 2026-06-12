/**
 * Comprime una imagen (data URL) redimensionándola y recodificándola a JPEG.
 * Reduce drásticamente el tamaño para que quepa cómodamente en el .sda.json.
 *
 * @param dataUrl  Imagen original en data URL (p. ej. PNG de la IA)
 * @param maxSize  Lado máximo en píxeles (se mantiene la proporción)
 * @param quality  Calidad JPEG 0–1
 * @returns        data URL JPEG comprimida; si falla, devuelve la original
 */
export function compressImage(dataUrl: string, maxSize = 512, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { resolve(dataUrl); return }
        // Fondo blanco para evitar transparencias negras al pasar a JPEG
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
