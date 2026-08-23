'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions as questionBank } from '@/data/questions'
import { pickRandom } from '@/lib/shuffle'
import { scoreAttempt } from '@/lib/scoring'
import { saveAttempt } from '@/lib/history'
import { setCurrentAttempt } from '@/lib/currentAttempt'
import { useQuizAnswers } from '@/lib/useQuizAnswers'
import { QuestionCard } from '@/components/QuestionCard'
import { Timer } from '@/components/Timer'
import type { Question } from '@/types/quiz'

const EXAM_LENGTH = 65
const EXAM_DURATION_SECONDS = 170 * 60

export default function ExamPage() {
  const router = useRouter()
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { answers, setAnswer, isAnswered } = useQuizAnswers()
  const hasSubmitted = useRef(false)

  useEffect(() => {
    // Randomizing must happen client-side only (post-hydration) so the server-
    // rendered and client-rendered question sets don't mismatch; that's why this
    // is a one-time effect rather than a useState lazy initializer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExamQuestions(pickRandom(questionBank, EXAM_LENGTH))
  }, [])

  function handleSubmit() {
    if (hasSubmitted.current || examQuestions.length === 0) return
    hasSubmitted.current = true
    const result = scoreAttempt(examQuestions, answers, 'exam')
    saveAttempt(result)
    setCurrentAttempt(result)
    router.push('/results')
  }

  if (examQuestions.length === 0) {
    return <p>Loading exam...</p>
  }

  const question = examQuestions[currentIndex]
  const answeredCount = examQuestions.filter((q) => isAnswered(q.id)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Answered {answeredCount} of {examQuestions.length}
        </p>
        <Timer durationSeconds={EXAM_DURATION_SECONDS} onExpire={handleSubmit} />
      </div>
      <QuestionCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={examQuestions.length}
        selectedIds={answers[question.id] ?? []}
        onChange={(ids) => setAnswer(question.id, ids)}
      />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-slate-300 px-4 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        {currentIndex < examQuestions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(examQuestions.length - 1, i + 1))}
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  )
}
