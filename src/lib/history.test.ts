import { describe, it, expect, beforeEach } from 'vitest'
import { getAttempts, saveAttempt } from './history'
import type { HistoryEntry } from '@/types/quiz'

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'id-1',
    mode: 'practice',
    completedAt: '2026-01-01T00:00:00.000Z',
    correctCount: 8,
    totalCount: 10,
    score: 80,
    passed: false,
    domainBreakdown: [],
    ...overrides,
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('getAttempts', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getAttempts()).toEqual([])
  })
})

describe('saveAttempt', () => {
  it('persists an attempt and returns it from getAttempts', () => {
    saveAttempt(makeEntry({ id: 'id-1' }))
    expect(getAttempts()).toEqual([makeEntry({ id: 'id-1' })])
  })

  it('returns attempts most-recent-first', () => {
    saveAttempt(makeEntry({ id: 'older', completedAt: '2026-01-01T00:00:00.000Z' }))
    saveAttempt(makeEntry({ id: 'newer', completedAt: '2026-02-01T00:00:00.000Z' }))
    const attempts = getAttempts()
    expect(attempts.map((a) => a.id)).toEqual(['newer', 'older'])
  })
})
