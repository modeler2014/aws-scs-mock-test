import type { AttemptResult } from '@/types/quiz'

interface ScoreSummaryProps {
  attempt: Pick<AttemptResult, 'mode' | 'correctCount' | 'totalCount' | 'score' | 'passed'>
}

export function ScoreSummary({ attempt }: ScoreSummaryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-500">
        {attempt.mode === 'exam' ? 'Timed Exam Result' : 'Practice Result'}
      </p>
      <p className="mt-2 text-4xl font-bold text-slate-900">{attempt.score}%</p>
      <p className="mt-1 text-slate-600">
        {attempt.correctCount} of {attempt.totalCount} correct
      </p>
      {attempt.mode === 'exam' && (
        <p
          className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
            attempt.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <span>{attempt.passed ? 'PASS' : 'FAIL'}</span> (75% required)
        </p>
      )}
    </div>
  )
}
