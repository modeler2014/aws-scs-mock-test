import type { DomainResult } from '@/types/quiz'

interface DomainBreakdownProps {
  domainBreakdown: DomainResult[]
}

export function DomainBreakdown({ domainBreakdown }: DomainBreakdownProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        Score by Domain
      </h3>
      <ul className="mt-4 space-y-4">
        {domainBreakdown.map((d) => {
          const pct = d.total === 0 ? 0 : Math.round((d.correct / d.total) * 100)
          return (
            <li key={d.domain}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{d.domain}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {d.correct}/{d.total} ({pct}%)
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
