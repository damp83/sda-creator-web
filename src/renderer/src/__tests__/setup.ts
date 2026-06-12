import '@testing-library/jest-dom'

// Stub window.api — no existe fuera de Electron
Object.defineProperty(window, 'api', { value: undefined, writable: true })
