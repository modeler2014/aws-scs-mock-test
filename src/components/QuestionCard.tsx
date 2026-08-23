'use client'

import { Check, X } from 'lucide-react'
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
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
        Question {questionNumber} of {totalQuestions}
        {isMulti && (
          <span className="ml-2 text-slate-500 normal-case dark:text-slate-400">
            · Select {question.correctAnswers.length}
          </span>
        )}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{question.question}</h2>
      <div className="mt-4 flex flex-col gap-2.5">
        {question.options.map((option) => {
          const checked = selectedIds.includes(option.id)
          const isCorrectOption = question.correctAnswers.includes(option.id)
          const showFeedback = feedback !== null
          const isWrongPick = showFeedback && checked && !isCorrectOption
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-2xl border-[1.5px] p-3.5 transition-colors ${
                showFeedback && isCorrectOption
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                  : isWrongPick
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40'
                    : 'border-slate-200 dark:border-slate-700 dark:bg-slate-900/40'
              }`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={question.id}
                checked={checked}
                disabled={disabled}
                onChange={() => toggleOption(option.id)}
                className="size-4 accent-indigo-600"
              />
              {showFeedback && isCorrectOption && (
                <Check aria-hidden="true" size={16} className="shrink-0 text-green-600 dark:text-green-400" />
              )}
              {isWrongPick && <X aria-hidden="true" size={16} className="shrink-0 text-red-600 dark:text-red-400" />}
              <span
                className={`text-sm ${
                  showFeedback && isCorrectOption
                    ? 'font-medium text-green-800 dark:text-green-300'
                    : isWrongPick
                      ? 'font-medium text-red-800 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {option.text}
              </span>
            </label>
          )
        })}
      </div>
      {feedback && (
        <div
          className={`mt-4 animate-fade-in rounded-2xl p-3.5 text-sm ${
            feedback.correct
              ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
          }`}
        >
          <p className="font-semibold">{feedback.correct ? 'Correct' : 'Incorrect'}</p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
