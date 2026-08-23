import type { AttemptResult } from '@/types/quiz'

interface ScoreSummaryProps {
  attempt: Pick<AttemptResult, 'mode' | 'correctCount' | 'totalCount' | 'score' | 'passed'>
}

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ScoreSummary({ attempt }: ScoreSummaryProps) {
  const ringColor =
    attempt.mode === 'exam' ? (attempt.passed ? 'stroke-green-500' : 'stroke-red-500') : 'stroke-indigo-500'
  const offset = CIRCUMFERENCE - (attempt.score / 100) * CIRCUMFERENCE

  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <div className="relative shrink-0">
        <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-700" />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={`${ringColor} transition-[stroke-dashoffset] duration-700 ease-out`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900 dark:text-slate-100">
          {attempt.score}%
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
          {attempt.mode === 'exam' ? 'Timed Exam Result' : 'Practice Result'}
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {attempt.correctCount} of {attempt.totalCount} correct
        </p>
        {attempt.mode === 'exam' && (
          <p
            className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
              attempt.passed
                ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
            }`}
          >
            <span>{attempt.passed ? 'PASS' : 'FAIL'}</span> (75% required)
          </p>
        )}
      </div>
    </div>
  )
}
