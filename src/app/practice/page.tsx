'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions as questionBank } from '@/data/questions'
import { pickRandom, filterByDomains } from '@/lib/shuffle'
import { isAnswerCorrect, scoreAttempt } from '@/lib/scoring'
import { saveAttempt } from '@/lib/history'
import { setCurrentAttempt } from '@/lib/currentAttempt'
import { useQuizAnswers } from '@/lib/useQuizAnswers'
import { QuestionCard } from '@/components/QuestionCard'
import { DOMAINS, type Question } from '@/types/quiz'

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 65]

export default function PracticePage() {
  const router = useRouter()
  const [stage, setStage] = useState<'setup' | 'quiz'>('setup')
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [checked, setChecked] = useState(false)
  const { answers, setAnswer } = useQuizAnswers()

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    )
  }

  function startPractice() {
    const pool = filterByDomains(questionBank, selectedDomains)
    setPracticeQuestions(pickRandom(pool, questionCount))
    setCurrentIndex(0)
    setChecked(false)
    setStage('quiz')
  }

  function finishPractice() {
    const result = scoreAttempt(practiceQuestions, answers, 'practice')
    saveAttempt({
      id: result.id,
      mode: result.mode,
      completedAt: result.completedAt,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      score: result.score,
      passed: result.passed,
      domainBreakdown: result.domainBreakdown,
    })
    setCurrentAttempt(result)
    router.push('/results')
  }

  function handleNext() {
    if (currentIndex === practiceQuestions.length - 1) {
      finishPractice()
      return
    }
    setCurrentIndex((i) => i + 1)
    setChecked(false)
  }

  if (stage === 'setup') {
    return (
      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Practice Mode</h1>
        <div>
          <label className="block text-sm font-medium">Number of questions</label>
          <select
            className="mt-1 rounded-md border border-slate-300 p-2"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          >
            {QUESTION_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm font-medium">Domains (leave unchecked for all)</p>
          <div className="mt-2 space-y-1">
            {DOMAINS.map((domain) => (
              <label key={domain} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                />
                {domain}
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={startPractice}
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Start Practice
        </button>
      </div>
    )
  }

  const question = practiceQuestions[currentIndex]
  const selectedIds = answers[question.id] ?? []
  const feedback = checked ? { correct: isAnswerCorrect(question, selectedIds) } : null

  return (
    <div className="space-y-4">
      <QuestionCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={practiceQuestions.length}
        selectedIds={selectedIds}
        onChange={(ids) => setAnswer(question.id, ids)}
        disabled={checked}
        feedback={feedback}
      />
      <div className="flex justify-end gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={selectedIds.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
          >
            Check Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-green-600 px-4 py-2 text-white"
          >
            {currentIndex === practiceQuestions.length - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
