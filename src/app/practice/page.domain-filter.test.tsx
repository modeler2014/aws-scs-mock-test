import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PracticePage from './page'
import type { Question } from '@/types/quiz'

// This file deliberately does NOT mock `@/lib/shuffle` — the point of these
// tests is to exercise the real `filterByDomains`/`pickRandom` wiring between
// the setup screen's domain checkboxes and the questions that actually get
// rendered, which `practice/page.test.tsx` mocks away entirely.

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const mockQuestions = vi.hoisted(
  (): Question[] => [
    {
      id: 'dp1',
      domain: 'Data Protection',
      questionType: 'single',
      question: 'DP Question One?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['a'],
      explanation: 'A is correct.',
    },
    {
      id: 'dp2',
      domain: 'Data Protection',
      questionType: 'single',
      question: 'DP Question Two?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['a'],
      explanation: 'A is correct.',
    },
    {
      id: 'is1',
      domain: 'Infrastructure Security',
      questionType: 'single',
      question: 'IS Question One?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['a'],
      explanation: 'A is correct.',
    },
    {
      id: 'is2',
      domain: 'Infrastructure Security',
      questionType: 'single',
      question: 'IS Question Two?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['a'],
      explanation: 'A is correct.',
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

describe('PracticePage domain filter', () => {
  it('restricts the session to only the checked domain, using the real filterByDomains/pickRandom', async () => {
    render(<PracticePage />)

    // Only check "Data Protection" — "Infrastructure Security" (and the
    // other unused domains) stay unchecked.
    fireEvent.click(screen.getByLabelText('Data Protection'))
    fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }))

    const seenQuestions: string[] = []

    // The filtered pool has exactly 2 Data Protection questions, so the
    // session is exactly 2 questions long regardless of shuffle order.
    for (let i = 0; i < 2; i++) {
      const heading = await screen.findByRole('heading', { level: 2 })
      seenQuestions.push(heading.textContent ?? '')

      fireEvent.click(screen.getByLabelText('Answer A'))
      fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }))

      const isLast = i === 1
      fireEvent.click(screen.getByRole('button', { name: isLast ? 'Finish' : 'Next' }))
    }

    expect(seenQuestions).toHaveLength(2)
    expect(seenQuestions.sort()).toEqual(['DP Question One?', 'DP Question Two?'])
    // The unchecked domain's questions must never have appeared.
    expect(seenQuestions).not.toContain('IS Question One?')
    expect(seenQuestions).not.toContain('IS Question Two?')

    expect(push).toHaveBeenCalledWith('/results')
  })
})
