import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCard } from './QuestionCard'
import type { Question } from '@/types/quiz'

const singleQ: Question = {
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
}

const multiQ: Question = {
  id: 'q2',
  domain: 'Identity and Access Management',
  questionType: 'multi',
  question: 'Select TWO valid options.',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
  ],
  correctAnswers: ['a', 'b'],
  explanation: 'A and B are correct.',
}

describe('QuestionCard', () => {
  it('renders the question text and options', () => {
    render(
      <QuestionCard
        question={singleQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={[]}
        onChange={() => {}}
      />
    )
    expect(screen.getByText(singleQ.question)).toBeInTheDocument()
    expect(screen.getByText('AWS KMS')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  })

  it('calls onChange with a single selection for single-answer questions', () => {
    const onChange = vi.fn()
    render(
      <QuestionCard
        question={singleQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={[]}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByLabelText('AWS KMS'))
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('toggles selections for multi-answer questions', () => {
    const onChange = vi.fn()
    render(
      <QuestionCard
        question={multiQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={['a']}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByLabelText('Option B'))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('shows the explanation when feedback is provided', () => {
    render(
      <QuestionCard
        question={singleQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={['a']}
        onChange={() => {}}
        disabled
        feedback={{ correct: true }}
      />
    )
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('KMS manages keys.')).toBeInTheDocument()
  })
})
