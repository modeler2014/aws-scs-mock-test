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
            className={`rounded-lg border p-4 ${correct ? 'border-green-300' : 'border-red-300'}`}
          >
            <p className="text-sm text-slate-500">Question {index + 1}</p>
            <p className="mt-1 font-medium text-slate-900">{question.question}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {question.options.map((option) => {
                const wasSelected = selected.includes(option.id)
                const isCorrectOption = question.correctAnswers.includes(option.id)
                return (
                  <li
                    key={option.id}
                    className={
                      isCorrectOption
                        ? 'font-semibold text-green-700'
                        : wasSelected
                          ? 'text-red-700 line-through'
                          : 'text-slate-600'
                    }
                  >
                    {option.text}
                    {wasSelected && !isCorrectOption && ' (your answer)'}
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-sm text-slate-600">{question.explanation}</p>
          </div>
        )
      })}
    </div>
  )
}
