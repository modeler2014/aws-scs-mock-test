import { Check, X } from 'lucide-react'
import type { Answers, Question } from '@/types/quiz'
import { isAnswerCorrect } from '@/lib/scoring'

interface ReviewListProps {
  questions: Question[]
  answers: Answers
}

export function ReviewList({ questions, answers }: ReviewListProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        const selected = answers[question.id] ?? []
        const correct = isAnswerCorrect(question, selected)
        return (
          <div
            key={question.id}
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 dark:bg-slate-800 ${
              correct ? 'ring-green-300 dark:ring-green-800' : 'ring-red-300 dark:ring-red-800'
            }`}
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {correct ? (
                <Check aria-hidden="true" size={14} className="text-green-600 dark:text-green-400" />
              ) : (
                <X aria-hidden="true" size={14} className="text-red-600 dark:text-red-400" />
              )}
              Question {index + 1}
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{question.question}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {question.options.map((option) => {
                const wasSelected = selected.includes(option.id)
                const isCorrectOption = question.correctAnswers.includes(option.id)
                return (
                  <li
                    key={option.id}
                    className={
                      isCorrectOption
                        ? 'font-semibold text-green-700 dark:text-green-400'
                        : wasSelected
                          ? 'text-red-700 line-through dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-400'
                    }
                  >
                    {option.text}
                    {wasSelected && !isCorrectOption && ' (your answer)'}
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{question.explanation}</p>
          </div>
        )
      })}
    </div>
  )
}
