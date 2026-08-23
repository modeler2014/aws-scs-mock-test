import type { AttemptResult } from '@/types/quiz'

const SESSION_KEY = 'aws-scs-current-attempt'

export function setCurrentAttempt(attempt: AttemptResult): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(attempt))
}

export function getCurrentAttempt(): AttemptResult | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AttemptResult
  } catch {
    return null
  }
}

export function clearCurrentAttempt(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SESSION_KEY)
}
