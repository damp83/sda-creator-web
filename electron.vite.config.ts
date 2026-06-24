import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

// Separa las librerías de terceros en chunks propios para reducir el tamaño del
// bundle principal del renderer y mejorar el cacheado entre versiones. Se extrae a
// una constante para evitar la comprobación de propiedades excedentes del literal.
const rendererBuild = {
  isolatedEntries: false,
  rollupOptions: {
    output: {
      manualChunks: {
        react: ['react', 'react-dom'],
        icons: ['lucide-react'],
        sanitize: ['dompurify']
      }
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    build: rendererBuild
  }
})
