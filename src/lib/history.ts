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
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const entries: HistoryEntry[] = raw ? JSON.parse(raw) : []
  entries.push(entry)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}
