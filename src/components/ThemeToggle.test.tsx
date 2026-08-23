import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import * as theme from '@/lib/theme'

beforeEach(() => {
  vi.spyOn(theme, 'resolveInitialTheme').mockReturnValue('light')
  vi.spyOn(theme, 'setStoredTheme').mockImplementation(() => {})
  vi.spyOn(theme, 'applyTheme').mockImplementation(() => {})
})

describe('ThemeToggle', () => {
  it('starts labeled for switching to dark mode when the resolved theme is light', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
  })

  it('switches to dark mode on click: persists and applies the new theme, flips the label', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(theme.setStoredTheme).toHaveBeenCalledWith('dark')
    expect(theme.applyTheme).toHaveBeenCalledWith('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })

  it('starts labeled for switching to light mode when the resolved theme is dark', () => {
    vi.spyOn(theme, 'resolveInitialTheme').mockReturnValue('dark')
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })
})
