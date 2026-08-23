import { describe, it, expect } from 'vitest'
import { questions } from './questions'
import { DOMAINS } from '@/types/quiz'

describe('questions data integrity', () => {
  it('contains exactly 65 questions', () => {
    expect(questions.length).toBe(65)
  })

  it('has unique ids', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every question has a valid domain', () => {
    for (const q of questions) {
      expect(DOMAINS).toContain(q.domain)
    }
  })

  it('every option id referenced in correctAnswers exists in that question\'s options', () => {
    for (const q of questions) {
      const optionIds = q.options.map((o) => o.id)
      for (const correctId of q.correctAnswers) {
        expect(optionIds).toContain(correctId)
      }
    }
  })

  it('every question has at least 3 options and no duplicate option ids', () => {
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(3)
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length)
    }
  })

  it('single questions have exactly one correct answer, multi questions have two or more', () => {
    for (const q of questions) {
      if (q.questionType === 'single') {
        expect(q.correctAnswers.length).toBe(1)
      } else {
        expect(q.correctAnswers.length).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('includes at least 10 multi-answer questions', () => {
    const multiCount = questions.filter((q) => q.questionType === 'multi').length
    expect(multiCount).toBeGreaterThanOrEqual(10)
  })

  it('matches the target per-domain question count', () => {
    const targets: Record<string, number> = {
      'Threat Detection and Incident Response': 9,
      'Security Logging and Monitoring': 12,
      'Infrastructure Security': 13,
      'Identity and Access Management': 10,
      'Data Protection': 12,
      'Management and Security Governance': 9,
    }
    for (const [domain, target] of Object.entries(targets)) {
      const count = questions.filter((q) => q.domain === domain).length
      expect(count).toBe(target)
    }
  })
})
