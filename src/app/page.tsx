import Link from 'next/link'
import { CheckCircle2, Clock, History } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="-mx-4 -mt-8 bg-slate-950 px-4 py-10 sm:mx-0 sm:mt-0 sm:rounded-2xl">
        <h1 className="text-2xl font-bold text-white">AWS Certified Security – Specialty</h1>
        <p className="mt-2 text-sm text-slate-300">
          Practice for the SCS-C02 exam with a timed full-length simulation or flexible practice sessions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/exam"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
        >
          <Clock aria-hidden="true" size={22} className="mb-3 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Timed Exam Simulation</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            65 questions, 170 minutes, scored against the 75% pass mark.
          </p>
        </Link>
        <Link
          href="/practice"
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md dark:bg-slate-800 dark:ring-slate-700"
        >
          <CheckCircle2 aria-hidden="true" size={22} className="mb-3 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Practice Mode</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Choose your question count and domains, with instant feedback.
          </p>
        </Link>
      </div>
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        <History aria-hidden="true" size={16} />
        View past attempts
      </Link>
    </div>
  )
}
