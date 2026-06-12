import { useCallback } from 'react'
import { useSdAStore } from '@renderer/store/sdaStore'
import { parseSdAFromJSON } from '@renderer/utils/validateSda'
import { getSdAProgress } from '@renderer/utils/sdaProgress'
import type { ToastType } from '@renderer/components/ui'

type AddToast = (text: string, type?: ToastType, duration?: number) => void

export function useFileOperations(addToast: AddToast, setShowWelcome: (v: boolean) => void) {
  const { sda, filePath, isDirty, cargar, setFilePath, setDirty, setLastSaved } = useSdAStore()

  const handleGuardar = useCallback(async () => {
    if (!window.api) return null
    try {
      const json = JSON.stringify(sda, null, 2)
      const savedPath = filePath
        ? await window.api.guardarArchivo(json, filePath)
        : await window.api.guardarComo(json)
      if (savedPath) {
        setFilePath(savedPath)
        setDirty(false)
        setLastSaved(new Date().toISOString())
        void window.api.eliminarBackup?.()
        window.api.addRecentFile?.({ filePath: savedPath, titulo: sda.titulo, ciclo: sda.ciclo, ambito: sda.ambito, pct: getSdAProgress(sda).pct })
        addToast('Guardado correctamente', 'success')
      }
      return savedPath ?? null
    } catch (err) {
      console.error('[File] Error saving:', err)
      addToast('Error al guardar el archivo', 'error')
      return null
    }
  }, [sda, filePath, setFilePath, setDirty, setLastSaved, addToast])

  const handleGuardarComo = useCallback(async () => {
    if (!window.api) return null
    try {
      const json = JSON.stringify(sda, null, 2)
      const savedPath = await window.api.guardarComo(json)
      if (savedPath) {
        setFilePath(savedPath)
        setDirty(false)
        setLastSaved(new Date().toISOString())
        window.api.addRecentFile?.({ filePath: savedPath, titulo: sda.titulo, ciclo: sda.ciclo, ambito: sda.ambito, pct: getSdAProgress(sda).pct })
        addToast('Guardado como nuevo archivo', 'success')
      }
      return savedPath ?? null
    } catch (err) {
      console.error('[File] Error saving as:', err)
      addToast('Error al guardar el archivo', 'error')
      return null
    }
  }, [sda, setFilePath, setDirty, setLastSaved, addToast])

  const handleAbrir = useCallback(async () => {
    if (!window.api) return
    if (isDirty) {
      const ok = await window.api.confirmar('Hay cambios sin guardar. ¿Deseas continuar y perder los cambios?')
      if (!ok) return
    }
    try {
      const result = await window.api.abrirArchivo()
      if (result) {
        const sdaLoaded = parseSdAFromJSON(result.content)
        cargar(sdaLoaded, result.filePath)
        window.api.addRecentFile?.({ filePath: result.filePath, titulo: sdaLoaded.titulo, ciclo: sdaLoaded.ciclo, ambito: sdaLoaded.ambito, pct: getSdAProgress(sdaLoaded).pct })
        setShowWelcome(false)
        addToast('Archivo abierto correctamente', 'success')
      }
    } catch (err) {
      console.error('[File] Error opening:', err)
      addToast('Error al abrir el archivo', 'error')
    }
  }, [isDirty, cargar, setShowWelcome, addToast])

  const handleAbrirReciente = useCallback(async (recentPath: string) => {
    if (isDirty) {
      const ok = await window.api.confirmar('Hay cambios sin guardar. ¿Deseas continuar y perder los cambios?')
      if (!ok) return
    }
    try {
      const content = await window.api.leerArchivoPorRuta(recentPath)
      const sdaLoaded = parseSdAFromJSON(content)
      cargar(sdaLoaded, recentPath)
      window.api.addRecentFile?.({ filePath: recentPath, titulo: sdaLoaded.titulo, ciclo: sdaLoaded.ciclo, ambito: sdaLoaded.ambito, pct: getSdAProgress(sdaLoaded).pct })
      setShowWelcome(false)
      addToast(`Reabierto: "${sdaLoaded.titulo || 'Sin título'}"`, 'success', 3000)
    } catch (err) {
      console.error('[File] Error opening recent:', err)
      addToast('No se pudo abrir el archivo reciente. Puede que haya sido movido o eliminado.', 'error')
    }
  }, [isDirty, cargar, setShowWelcome, addToast])

  const handleCompartir = useCallback(async () => {
    if (!window.api) return
    let pathToReveal = filePath
    if (!pathToReveal) {
      const savedPath = await handleGuardarComo()
      if (!savedPath) return
      pathToReveal = savedPath
    } else if (isDirty) {
      try {
        await window.api.guardarArchivo(JSON.stringify(sda, null, 2), pathToReveal)
        setDirty(false)
        setLastSaved(new Date().toISOString())
      } catch (err) {
        console.error('[File] Error saving before share:', err)
        addToast('Error al guardar antes de compartir', 'error')
        return
      }
    }
    window.api.mostrarEnExplorador(pathToReveal)
    addToast('Archivo listo para compartir — cópialo a Teams, correo o Drive', 'success')
  }, [filePath, isDirty, sda, setDirty, setLastSaved, handleGuardarComo, addToast])

  const handleSaveAndClose = useCallback(async () => {
    if (!window.api) return false
    try {
      const json = JSON.stringify(sda, null, 2)
      const savedPath = filePath
        ? await window.api.guardarArchivo(json, filePath)
        : await window.api.guardarComo(json)
      if (savedPath) {
        setFilePath(savedPath)
        setDirty(false)
        setLastSaved(new Date().toISOString())
        window.api.addRecentFile?.({ filePath: savedPath, titulo: sda.titulo, ciclo: sda.ciclo, ambito: sda.ambito, pct: getSdAProgress(sda).pct })
        window.api.confirmClose()
        return true
      }
    } catch (err) {
      console.error('[File] Error on save-and-close:', err)
      addToast('Error al guardar el archivo', 'error')
    }
    return false
  }, [sda, filePath, setFilePath, setDirty, setLastSaved, addToast])

  return { handleGuardar, handleGuardarComo, handleAbrir, handleAbrirReciente, handleCompartir, handleSaveAndClose }
}
