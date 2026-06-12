module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  ignorePatterns: ['out/', 'dist/', 'node_modules/', '*.config.js', '*.config.ts', 'scripts/'],
  rules: {
    // Las aserciones no nulas se usan deliberadamente tras guards verificados
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Variables intencionalmente descartadas con prefijo _
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    // El proyecto usa funciones sin tipo de retorno explícito en callbacks
    '@typescript-eslint/explicit-function-return-type': 'off',
    // while(true) con break es un patrón legítimo de bucle de extracción
    'no-constant-condition': ['error', { checkLoops: false }]
  },
  overrides: [
    {
      files: ['src/renderer/src/__tests__/**'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
}
