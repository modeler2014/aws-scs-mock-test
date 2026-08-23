import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DomainBreakdown } from './DomainBreakdown'

describe('DomainBreakdown', () => {
  it('renders each domain with its correct/total counts and percentage', () => {
    render(
      <DomainBreakdown
        domainBreakdown={[
          { domain: 'Data Protection', correct: 3, total: 4 },
          { domain: 'Infrastructure Security', correct: 1, total: 2 },
        ]}
      />
    )
    expect(screen.getByText('Data Protection')).toBeInTheDocument()
    expect(screen.getByText('3/4 (75%)')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure Security')).toBeInTheDocument()
    expect(screen.getByText('1/2 (50%)')).toBeInTheDocument()
  })
})
