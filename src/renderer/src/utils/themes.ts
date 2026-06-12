export type ThemeKey = 'azul' | 'indigo' | 'violeta' | 'esmeralda' | 'rosa'

interface ColorScale {
  50: string; 100: string; 200: string; 300: string; 400: string
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string
}

export interface Theme {
  key: ThemeKey
  label: string
  hex500: string   // representative swatch color
  scale: ColorScale
}

export const THEMES: Theme[] = [
  {
    key: 'azul',
    label: 'Azul',
    hex500: '#3b82f6',
    scale: {
      50:  '239 246 255', 100: '219 234 254', 200: '191 219 254',
      300: '147 197 253', 400: '96 165 250',  500: '59 130 246',
      600: '37 99 235',   700: '29 78 216',   800: '30 64 175',
      900: '30 58 138',   950: '23 37 84',
    },
  },
  {
    key: 'indigo',
    label: 'Índigo',
    hex500: '#6366f1',
    scale: {
      50:  '238 242 255', 100: '224 231 255', 200: '199 210 254',
      300: '165 180 252', 400: '129 140 248', 500: '99 102 241',
      600: '79 70 229',   700: '67 56 202',   800: '55 48 163',
      900: '49 46 129',   950: '30 27 75',
    },
  },
  {
    key: 'violeta',
    label: 'Violeta',
    hex500: '#8b5cf6',
    scale: {
      50:  '245 243 255', 100: '237 233 254', 200: '221 214 254',
      300: '196 181 253', 400: '167 139 250', 500: '139 92 246',
      600: '124 58 237',  700: '109 40 217',  800: '91 33 182',
      900: '76 29 149',   950: '46 16 101',
    },
  },
  {
    key: 'esmeralda',
    label: 'Esmeralda',
    hex500: '#10b981',
    scale: {
      50:  '236 253 245', 100: '209 250 229', 200: '167 243 208',
      300: '110 231 183', 400: '52 211 153',  500: '16 185 129',
      600: '5 150 105',   700: '4 120 87',    800: '6 95 70',
      900: '6 78 59',     950: '2 44 34',
    },
  },
  {
    key: 'rosa',
    label: 'Rosa',
    hex500: '#f43f5e',
    scale: {
      50:  '255 241 242', 100: '255 228 230', 200: '254 205 211',
      300: '253 164 175', 400: '251 113 133', 500: '244 63 94',
      600: '225 29 72',   700: '190 18 60',   800: '159 18 57',
      900: '136 19 55',   950: '76 5 25',
    },
  },
]

const STORAGE_KEY = 'sda-color-theme'

export function applyTheme(key: ThemeKey): void {
  const theme = THEMES.find((t) => t.key === key)
  if (!theme) return
  const root = document.documentElement
  const s = theme.scale
  root.style.setProperty('--color-primary-50',  s[50])
  root.style.setProperty('--color-primary-100', s[100])
  root.style.setProperty('--color-primary-200', s[200])
  root.style.setProperty('--color-primary-300', s[300])
  root.style.setProperty('--color-primary-400', s[400])
  root.style.setProperty('--color-primary-500', s[500])
  root.style.setProperty('--color-primary-600', s[600])
  root.style.setProperty('--color-primary-700', s[700])
  root.style.setProperty('--color-primary-800', s[800])
  root.style.setProperty('--color-primary-900', s[900])
  root.style.setProperty('--color-primary-950', s[950])
  localStorage.setItem(STORAGE_KEY, key)
}

export function loadSavedTheme(): ThemeKey {
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeKey | null
  return saved && THEMES.some((t) => t.key === saved) ? saved : 'azul'
}
