import { useEffect, useRef } from 'react'

export function useIpcListener(channel: string, cb: (...args: unknown[]) => void): void {
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    if (!window.api) return
    const handler = (...args: unknown[]): void => cbRef.current(...args)
    // on() devuelve unsubscribe específico para este handler (no elimina otros listeners del canal)
    const unsubscribe = window.api.on(channel, handler)
    return unsubscribe
  }, [channel])
}
