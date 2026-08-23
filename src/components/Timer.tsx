'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  durationSeconds: number
  onExpire: () => void
}

export function Timer({ durationSeconds, onExpire }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire()
      return
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft, onExpire])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isLow = secondsLeft <= 300

  return (
    <div className={`font-mono text-lg ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
