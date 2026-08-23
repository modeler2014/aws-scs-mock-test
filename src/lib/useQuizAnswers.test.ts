import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuizAnswers } from './useQuizAnswers'

describe('useQuizAnswers', () => {
  it('starts with no answers', () => {
    const { result } = renderHook(() => useQuizAnswers())
    expect(result.current.answers).toEqual({})
    expect(result.current.isAnswered('q1')).toBe(false)
  })

  it('records and reports an answer for a question', () => {
    const { result } = renderHook(() => useQuizAnswers())
    act(() => {
      result.current.setAnswer('q1', ['a', 'b'])
    })
    expect(result.current.answers).toEqual({ q1: ['a', 'b'] })
    expect(result.current.isAnswered('q1')).toBe(true)
  })

  it('overwrites a previous answer for the same question', () => {
    const { result } = renderHook(() => useQuizAnswers())
    act(() => {
      result.current.setAnswer('q1', ['a'])
    })
    act(() => {
      result.current.setAnswer('q1', ['b'])
    })
    expect(result.current.answers).toEqual({ q1: ['b'] })
  })
})
