'use client'

import { useEffect, useState } from 'react'
import { getAttempts } from '@/lib/history'
import type { HistoryEntry } from '@/types/quiz'

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<HistoryEntry[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttempts(getAttempts())
  }, [])

  if (attempts.length === 0) {
    return <p className="text-slate-600">No past attempts yet.</p>
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Past Attempts</h1>
      <ul className="space-y-2">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium capitalize">{attempt.mode}</p>
              <p className="text-sm text-slate-500">{new Date(attempt.completedAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{attempt.score}%</p>
              {attempt.mode === 'exam' && (
                <p className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                  {attempt.passed ? 'PASS' : 'FAIL'}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
