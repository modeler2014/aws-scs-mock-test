import type { DomainResult } from '@/types/quiz'

interface DomainBreakdownProps {
  domainBreakdown: DomainResult[]
}

export function DomainBreakdown({ domainBreakdown }: DomainBreakdownProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Score by Domain</h3>
      <ul className="mt-4 space-y-3">
        {domainBreakdown.map((d) => {
          const pct = d.total === 0 ? 0 : Math.round((d.correct / d.total) * 100)
          return (
            <li key={d.domain}>
              <div className="flex justify-between text-sm text-slate-700">
                <span>{d.domain}</span>
                <span>
                  {d.correct}/{d.total} ({pct}%)
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
