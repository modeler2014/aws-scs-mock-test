import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStoredTheme,
  getSystemTheme,
  setStoredTheme,
  resolveInitialTheme,
  applyTheme,
} from './theme'

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('getStoredTheme', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredTheme()).toBeNull()
  })

  it('returns the stored theme when valid', () => {
    window.localStorage.setItem('aws-scs-theme', 'dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('returns null for a corrupted/invalid stored value', () => {
    window.localStorage.setItem('aws-scs-theme', 'purple')
    expect(getStoredTheme()).toBeNull()
  })
})

describe('getSystemTheme', () => {
  it('returns dark when the system prefers dark', () => {
    mockMatchMedia(true)
    expect(getSystemTheme()).toBe('dark')
  })

  it('returns light when the system does not prefer dark', () => {
    mockMatchMedia(false)
    expect(getSystemTheme()).toBe('light')
  })
})

describe('setStoredTheme', () => {
  it('persists the theme to localStorage', () => {
    setStoredTheme('dark')
    expect(window.localStorage.getItem('aws-scs-theme')).toBe('dark')
  })
})

describe('resolveInitialTheme', () => {
  it('prefers the stored theme over the system preference', () => {
    mockMatchMedia(false)
    window.localStorage.setItem('aws-scs-theme', 'dark')
    expect(resolveInitialTheme()).toBe('dark')
  })

  it('falls back to the system preference when nothing is stored', () => {
    mockMatchMedia(true)
    expect(resolveInitialTheme()).toBe('dark')
  })
})

describe('applyTheme', () => {
  it('adds the dark class to the document root for dark theme', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class from the document root for light theme', () => {
    document.documentElement.classList.add('dark')
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
