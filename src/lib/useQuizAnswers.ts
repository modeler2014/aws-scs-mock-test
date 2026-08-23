'use client'

import { useCallback, useState } from 'react'
import type { Answers } from '@/types/quiz'

export function useQuizAnswers() {
  const [answers, setAnswers] = useState<Answers>({})

  const setAnswer = useCallback((questionId: string, selectedIds: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIds }))
  }, [])

  const isAnswered = useCallback(
    (questionId: string) => (answers[questionId]?.length ?? 0) > 0,
    [answers]
  )

  return { answers, setAnswer, isAnswered }
}
