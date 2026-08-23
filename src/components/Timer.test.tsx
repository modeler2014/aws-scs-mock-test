import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Timer } from './Timer'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the initial duration as mm:ss', () => {
    render(<Timer durationSeconds={125} onExpire={() => {}} />)
    expect(screen.getByText('02:05')).toBeInTheDocument()
  })

  it('counts down every second', () => {
    render(<Timer durationSeconds={5} onExpire={() => {}} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('00:04')).toBeInTheDocument()
  })

  it('calls onExpire exactly once when the countdown reaches zero', () => {
    const onExpire = vi.fn()
    render(<Timer durationSeconds={2} onExpire={onExpire} />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })
})
