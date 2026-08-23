import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ExamPage from './page'
import type { Question } from '@/types/quiz'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const baseMockQuestions = vi.hoisted(
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

// A mutable array the `@/data/questions` mock always points at. Individual
// tests that need a different-sized bank (e.g. to exercise EXAM_LENGTH or
// EXAM_DURATION_SECONDS against a bank bigger than 2 questions) mutate its
// contents in place before rendering; beforeEach resets it back to the
// 2-question default so tests don't leak state into each other.
const mockQuestions = vi.hoisted((): Question[] => [])

vi.mock('@/data/questions', () => ({ questions: mockQuestions }))
// mockQuestions must be declared via vi.hoisted() (not a plain const) because
// Vitest hoists vi.mock(...) calls above all other top-level statements,
// including const declarations — a plain `const mockQuestions = [...]`
// would still be in its temporal dead zone when this factory runs.

function buildQuestionBank(count: number): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    domain: 'Data Protection',
    questionType: 'single',
    question: `Question ${i + 1}?`,
    options: [
      { id: 'a', text: 'Answer A' },
      { id: 'b', text: 'Answer B' },
    ],
    correctAnswers: ['a'],
    explanation: 'A is correct.',
  }))
}

beforeEach(() => {
  push.mockClear()
  window.localStorage.clear()
  window.sessionStorage.clear()
  mockQuestions.length = 0
  mockQuestions.push(...baseMockQuestions)
})

afterEach(() => {
  // Safety net in case a fake-timers test throws before reaching its own
  // `finally { vi.useRealTimers() }`, which would otherwise leak fake timers
  // into subsequent tests.
  vi.useRealTimers()
})

describe('ExamPage', () => {
  it('lets the user answer both questions and submit, saving the attempt and navigating to /results', async () => {
    render(<ExamPage />)

    await waitFor(() => expect(screen.getByText('Question 1 of 2')).toBeInTheDocument())

    fireEvent.click(screen.getByLabelText('Answer A'))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Answer B'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/results'))
    expect(window.localStorage.getItem('aws-scs-mock-history')).toContain('"mode":"exam"')
    // The localStorage history entry must be summary-only (HistoryEntry), never
    // the full AttemptResult — the full attempt (with per-question detail)
    // belongs only in sessionStorage, keyed off `getCurrentAttempt`.
    expect(window.localStorage.getItem('aws-scs-mock-history')).not.toContain('"questions"')
    expect(window.sessionStorage.getItem('aws-scs-current-attempt')).toContain('"mode":"exam"')
  })

  it('draws exactly EXAM_LENGTH questions from a larger bank and starts the timer at EXAM_DURATION_SECONDS', async () => {
    mockQuestions.length = 0
    mockQuestions.push(...buildQuestionBank(70))

    render(<ExamPage />)

    await waitFor(() => expect(screen.getByText('Question 1 of 65')).toBeInTheDocument())
    expect(screen.getByText('170:00')).toBeInTheDocument()
  })

  it('auto-submits and navigates to /results when the timer expires, without any button click', () => {
    vi.useFakeTimers()
    try {
      render(<ExamPage />)
      // With fake timers active, `waitFor`'s real-time polling can't resolve,
      // so flush the mount effect (which sets examQuestions and re-renders)
      // synchronously via `act` instead of awaiting `waitFor`.
      act(() => {})

      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument()
      expect(push).not.toHaveBeenCalled()

      // EXAM_DURATION_SECONDS = 170 * 60. Advance past it entirely via fake
      // timers -- no Submit/Next button is ever clicked.
      act(() => {
        vi.advanceTimersByTime(170 * 60 * 1000)
      })

      expect(push).toHaveBeenCalledWith('/results')
      expect(window.localStorage.getItem('aws-scs-mock-history')).toContain('"mode":"exam"')
    } finally {
      vi.useRealTimers()
    }
  })
})
