import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import HistoryPage from './page'
import type { HistoryEntry } from '@/types/quiz'

const getAttempts = vi.fn()

vi.mock('@/lib/history', () => ({
  getAttempts: () => getAttempts(),
}))

beforeEach(() => {
  getAttempts.mockReset()
})

describe('HistoryPage', () => {
  it('shows a message when there are no past attempts', () => {
    getAttempts.mockReturnValue([])
    render(<HistoryPage />)
    expect(screen.getByText('No past attempts yet.')).toBeInTheDocument()
  })

  it('lists past attempts with mode, score, and pass/fail for exam mode', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'a1',
        mode: 'exam',
        completedAt: '2026-01-01T00:00:00.000Z',
        correctCount: 50,
        totalCount: 65,
        score: 77,
        passed: true,
        domainBreakdown: [],
      },
    ]
    getAttempts.mockReturnValue(entries)
    render(<HistoryPage />)
    expect(screen.getByText('77%')).toBeInTheDocument()
    expect(screen.getByText('PASS')).toBeInTheDocument()
  })
})
