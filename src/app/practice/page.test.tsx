import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PracticePage from './page'
import type { Question } from '@/types/quiz'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const mockQuestions = vi.hoisted(
  (): Question[] => [
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
    {
      id: 'q2',
      domain: 'Infrastructure Security',
      questionType: 'single',
      question: 'Question two?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['b'],
      explanation: 'B is correct.',
    },
  ]
)

vi.mock('@/data/questions', () => ({ questions: mockQuestions }))
// mockQuestions must be declared via vi.hoisted() (not a plain const) because
// Vitest hoists vi.mock(...) calls above all other top-level statements,
// including const declarations — a plain `const mockQuestions = [...]`
// would still be in its temporal dead zone when this factory runs.

// The real pickRandom/filterByDomains shuffle order — mock them to be
// order-preserving so this test deterministically sees q1 then q2.
vi.mock('@/lib/shuffle', () => ({
  pickRandom: (items: unknown[], count: number) => items.slice(0, count),
  filterByDomains: (items: unknown[]) => items,
}))

beforeEach(() => {
  push.mockClear()
  window.localStorage.clear()
  window.sessionStorage.clear()
})

describe('PracticePage', () => {
  it('runs a full setup -> quiz -> feedback -> finish flow', async () => {
    render(<PracticePage />)

    fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }))

    expect(await screen.findByText('Question 1 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Answer A'))
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }))
    expect(screen.getByText('Correct')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Answer A'))
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }))
    expect(screen.getByText('Incorrect')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/results'))
    expect(window.localStorage.getItem('aws-scs-mock-history')).toContain('"mode":"practice"')
    // The localStorage history entry must be summary-only (HistoryEntry), never
    // the full AttemptResult — the full attempt (with per-question detail)
    // belongs only in sessionStorage, keyed off `getCurrentAttempt`.
    expect(window.localStorage.getItem('aws-scs-mock-history')).not.toContain('"questions"')
  })
})
