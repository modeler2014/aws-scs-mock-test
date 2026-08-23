import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExamPage from './page'
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

beforeEach(() => {
  push.mockClear()
  window.localStorage.clear()
  window.sessionStorage.clear()
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
    expect(window.sessionStorage.getItem('aws-scs-current-attempt')).toContain('"mode":"exam"')
  })
})
