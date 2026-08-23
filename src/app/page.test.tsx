import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

describe('HomePage', () => {
  it('links to the exam, practice, and history pages', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: /timed exam simulation/i })).toHaveAttribute('href', '/exam')
    expect(screen.getByRole('link', { name: /practice mode/i })).toHaveAttribute('href', '/practice')
    expect(screen.getByRole('link', { name: /view past attempts/i })).toHaveAttribute('href', '/history')
  })
})
