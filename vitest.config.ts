import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/renderer/src/__tests__/setup.ts'],
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: [
        'src/renderer/src/utils/**',
        'src/renderer/src/store/**',
        'src/renderer/src/hooks/**',
        'src/renderer/src/components/ui/ModalShell.tsx',
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 20,
        branches: 30,
        functions: 18,
        lines: 22,
      },
    },
  },
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src'),
    },
  },
})
