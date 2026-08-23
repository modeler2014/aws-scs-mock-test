'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  durationSeconds: number
  onExpire: () => void
}

export function Timer({ durationSeconds, onExpire }: TimerProps) {
  // Lazy useState initializer (not useRef(Date.now() + ...)) so the impure
  // Date.now() read happens inside React's documented one-time-init escape
  // hatch rather than as a plain argument expression evaluated on every
  // render — the latter trips the react-hooks/purity lint rule even though
  // useRef only consumes the value on mount.
  const [deadline] = useState(() => Date.now() + durationSeconds * 1000)
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onExpire()
      }
    }
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [deadline, onExpire])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isLow = secondsLeft <= 300

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-semibold ${
        isLow
          ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      <Clock aria-hidden="true" size={14} />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
