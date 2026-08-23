import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewList } from './ReviewList'
import type { Question } from '@/types/quiz'

const questions: Question[] = [
  {
    id: 'q1',
    domain: 'Data Protection',
    questionType: 'single',
    question: 'Which service manages encryption keys?',
    options: [
      { id: 'a', text: 'AWS KMS' },
      { id: 'b', text: 'AWS IAM' },
    ],
    correctAnswers: ['a'],
    explanation: 'KMS manages keys.',
  },
  {
    id: 'q2',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question: 'Which service filters traffic at the edge?',
    options: [
      { id: 'a', text: 'AWS WAF' },
      { id: 'b', text: 'AWS Config' },
    ],
    correctAnswers: ['a'],
    explanation: 'WAF filters web traffic.',
  },
]

describe('ReviewList', () => {
  it('marks the wrongly-selected option and shows the explanation for an incorrect answer', () => {
    render(<ReviewList questions={questions} answers={{ q1: ['b'], q2: ['a'] }} />)
    expect(screen.getByText('AWS IAM (your answer)')).toBeInTheDocument()
    expect(screen.getByText('KMS manages keys.')).toBeInTheDocument()
    expect(screen.getByText('WAF filters web traffic.')).toBeInTheDocument()
  })
})
