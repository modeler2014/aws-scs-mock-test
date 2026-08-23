import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ResultsPage from './page'
import type { AttemptResult } from '@/types/quiz'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

const getCurrentAttempt = vi.fn()

vi.mock('@/lib/currentAttempt', () => ({
  getCurrentAttempt: () => getCurrentAttempt(),
}))

const attempt: AttemptResult = {
  id: 'a1',
  mode: 'practice',
  completedAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'q1',
      domain: 'Data Protection',
      questionType: 'single',
      question: 'Question one?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['a'],
      explanation: 'A is correct.',
    },
  ],
  answers: { q1: ['a'] },
  correctCount: 1,
  totalCount: 1,
  score: 100,
  passed: true,
  domainBreakdown: [{ domain: 'Data Protection', correct: 1, total: 1 }],
}

beforeEach(() => {
  replace.mockClear()
  getCurrentAttempt.mockReset()
})

describe('ResultsPage', () => {
  it('renders the score summary, domain breakdown, and review for the current attempt', async () => {
    getCurrentAttempt.mockReturnValue(attempt)
    render(<ResultsPage />)
    expect(await screen.findByText('100%')).toBeInTheDocument()
    expect(screen.getByText('1 of 1 correct')).toBeInTheDocument()
    expect(screen.getByText('Question one?')).toBeInTheDocument()
  })

  it('redirects home when there is no current attempt', async () => {
    getCurrentAttempt.mockReturnValue(null)
    render(<ResultsPage />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
  })
})
