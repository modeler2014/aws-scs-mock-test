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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Past Attempts</h1>
      <ul className="space-y-2">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
          >
            <div>
              <p className="font-medium text-slate-900 capitalize dark:text-slate-100">{attempt.mode}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(attempt.completedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{attempt.score}%</p>
              {attempt.mode === 'exam' && (
                <p
                  className={
                    attempt.passed
                      ? 'text-sm font-medium text-green-600 dark:text-green-400'
                      : 'text-sm font-medium text-red-600 dark:text-red-400'
                  }
                >
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
