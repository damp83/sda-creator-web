import React from 'react'
import { THEMES, type ThemeKey } from '@renderer/utils/themes'

interface Props {
  current: ThemeKey
  onChange: (key: ThemeKey) => void
}

export function ThemePicker({ current, onChange }: Props): React.ReactElement {
  return (
    <div className="flex items-center gap-1" title="Color de la interfaz">
      {THEMES.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          title={t.label}
          className={`h-4 w-4 rounded-full transition-all duration-150 ${
            current === t.key
              ? 'scale-125 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
              : 'opacity-50 hover:opacity-90 hover:scale-110'
          }`}
          style={{
            backgroundColor: t.hex500,
            ...(current === t.key ? { ringColor: t.hex500 } : {}),
          }}
        />
      ))}
    </div>
  )
}
