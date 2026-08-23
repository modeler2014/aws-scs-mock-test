import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreSummary } from './ScoreSummary'

describe('ScoreSummary', () => {
  it('shows the score and correct/total counts', () => {
    render(
      <ScoreSummary attempt={{ mode: 'practice', correctCount: 8, totalCount: 10, score: 80, passed: true }} />
    )
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('8 of 10 correct')).toBeInTheDocument()
  })

  it('shows a PASS badge for a passed exam attempt', () => {
    render(
      <ScoreSummary attempt={{ mode: 'exam', correctCount: 50, totalCount: 65, score: 77, passed: true }} />
    )
    expect(screen.getByText('PASS')).toBeInTheDocument()
  })

  it('shows a FAIL badge for a failed exam attempt', () => {
    render(
      <ScoreSummary attempt={{ mode: 'exam', correctCount: 30, totalCount: 65, score: 46, passed: false }} />
    )
    expect(screen.getByText('FAIL')).toBeInTheDocument()
  })

  it('does not show a pass/fail badge for practice mode', () => {
    render(
      <ScoreSummary attempt={{ mode: 'practice', correctCount: 30, totalCount: 65, score: 46, passed: false }} />
    )
    expect(screen.queryByText('FAIL')).not.toBeInTheDocument()
  })
})
