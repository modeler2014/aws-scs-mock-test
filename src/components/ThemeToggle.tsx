'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, resolveInitialTheme, setStoredTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // The real initial theme was already applied synchronously by the
    // no-flash script in layout.tsx before React ever mounted; this just
    // brings this component's own state in sync with what's already true.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveInitialTheme())
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setStoredTheme(next)
    applyTheme(next)
  }

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
    >
      {theme === 'dark' ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  )
}
