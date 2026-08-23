import type { HistoryEntry } from '@/types/quiz'

const STORAGE_KEY = 'aws-scs-mock-history'

export function getAttempts(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const entries: HistoryEntry[] = JSON.parse(raw)
    return [...entries].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  } catch {
    return []
  }
}

export function saveAttempt(entry: HistoryEntry): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    const entries: HistoryEntry[] = Array.isArray(parsed) ? parsed : []
    entries.push(entry)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // A corrupted or quota-exceeded history write should never block the
    // user from seeing their just-completed attempt's results.
  }
}
