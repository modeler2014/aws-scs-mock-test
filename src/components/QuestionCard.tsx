'use client'

import type { Question } from '@/types/quiz'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  disabled?: boolean
  feedback?: { correct: boolean } | null
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIds,
  onChange,
  disabled = false,
  feedback = null,
}: QuestionCardProps) {
  const isMulti = question.questionType === 'multi'

  function toggleOption(optionId: string) {
    if (disabled) return
    if (isMulti) {
      const next = selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId]
      onChange(next)
    } else {
      onChange([optionId])
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        Question {questionNumber} of {totalQuestions}
        {isMulti && ` — Select ${question.correctAnswers.length}`}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-900">{question.question}</h2>
      <div className="mt-4 space-y-2">
        {question.options.map((option) => {
          const checked = selectedIds.includes(option.id)
          const isCorrectOption = question.correctAnswers.includes(option.id)
          const showFeedback = feedback !== null
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-md border p-3 ${
                showFeedback && isCorrectOption
                  ? 'border-green-500 bg-green-50'
                  : showFeedback && checked && !isCorrectOption
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200'
              }`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={question.id}
                checked={checked}
                disabled={disabled}
                onChange={() => toggleOption(option.id)}
              />
              <span>{option.text}</span>
            </label>
          )
        })}
      </div>
      {feedback && (
        <div
          className={`mt-4 rounded-md p-3 text-sm ${
            feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <p className="font-semibold">{feedback.correct ? 'Correct' : 'Incorrect'}</p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
