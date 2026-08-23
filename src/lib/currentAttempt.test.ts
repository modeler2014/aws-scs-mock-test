import { describe, it, expect, beforeEach } from 'vitest'
import { setCurrentAttempt, getCurrentAttempt, clearCurrentAttempt } from './currentAttempt'
import type { AttemptResult } from '@/types/quiz'

const attempt: AttemptResult = {
  id: 'a1',
  mode: 'exam',
  completedAt: '2026-01-01T00:00:00.000Z',
  questions: [],
  answers: {},
  correctCount: 0,
  totalCount: 0,
  score: 0,
  passed: false,
  domainBreakdown: [],
}

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('currentAttempt', () => {
  it('returns null when nothing is stored', () => {
    expect(getCurrentAttempt()).toBeNull()
  })

  it('stores and retrieves the current attempt', () => {
    setCurrentAttempt(attempt)
    expect(getCurrentAttempt()).toEqual(attempt)
  })

  it('clears the current attempt', () => {
    setCurrentAttempt(attempt)
    clearCurrentAttempt()
    expect(getCurrentAttempt()).toBeNull()
  })
})
