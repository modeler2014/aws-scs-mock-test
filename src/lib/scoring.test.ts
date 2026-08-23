import { describe, it, expect } from 'vitest'
import { isAnswerCorrect, scoreAttempt } from './scoring'
import type { Question } from '@/types/quiz'

const singleQ: Question = {
  id: 'q1',
  domain: 'Data Protection',
  questionType: 'single',
  question: 'Which service provides managed encryption key storage?',
  options: [
    { id: 'a', text: 'AWS KMS' },
    { id: 'b', text: 'AWS IAM' },
  ],
  correctAnswers: ['a'],
  explanation: 'AWS KMS manages encryption keys.',
}

const multiQ: Question = {
  id: 'q2',
  domain: 'Identity and Access Management',
  questionType: 'multi',
  question: 'Select TWO ways to grant cross-account access.',
  options: [
    { id: 'a', text: 'IAM role with trust policy' },
    { id: 'b', text: 'Resource-based policy' },
    { id: 'c', text: 'Root account password sharing' },
  ],
  correctAnswers: ['a', 'b'],
  explanation: 'Cross-account access uses roles or resource policies, never shared credentials.',
}

describe('isAnswerCorrect', () => {
  it('returns true for an exact single-answer match', () => {
    expect(isAnswerCorrect(singleQ, ['a'])).toBe(true)
  })

  it('returns false for a wrong single answer', () => {
    expect(isAnswerCorrect(singleQ, ['b'])).toBe(false)
  })

  it('returns true for a multi-answer match regardless of selection order', () => {
    expect(isAnswerCorrect(multiQ, ['b', 'a'])).toBe(true)
  })

  it('returns false when the multi-answer selection is a partial subset', () => {
    expect(isAnswerCorrect(multiQ, ['a'])).toBe(false)
  })

  it('returns false when the multi-answer selection includes an extra wrong option', () => {
    expect(isAnswerCorrect(multiQ, ['a', 'b', 'c'])).toBe(false)
  })
})

describe('scoreAttempt', () => {
  it('computes correct count, score, pass/fail, and domain breakdown', () => {
    const result = scoreAttempt(
      [singleQ, multiQ],
      { q1: ['a'], q2: ['a', 'b'] },
      'practice'
    )
    expect(result.correctCount).toBe(2)
    expect(result.totalCount).toBe(2)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.mode).toBe('practice')
    expect(result.domainBreakdown).toEqual(
      expect.arrayContaining([
        { domain: 'Data Protection', correct: 1, total: 1 },
        { domain: 'Identity and Access Management', correct: 1, total: 1 },
      ])
    )
  })

  it('marks an attempt below 75% as not passed', () => {
    const result = scoreAttempt([singleQ, multiQ], { q1: ['b'], q2: ['a'] }, 'exam')
    expect(result.correctCount).toBe(0)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('treats an unanswered question as incorrect', () => {
    const result = scoreAttempt([singleQ], {}, 'exam')
    expect(result.correctCount).toBe(0)
    expect(result.totalCount).toBe(1)
  })
})
