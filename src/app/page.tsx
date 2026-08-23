import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AWS Certified Security – Specialty</h1>
        <p className="mt-2 text-slate-600">
          Practice for the SCS-C02 exam with a timed full-length simulation or flexible practice sessions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/exam"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold">Timed Exam Simulation</h2>
          <p className="mt-2 text-sm text-slate-600">
            65 questions, 170 minutes, scored against the 75% pass mark.
          </p>
        </Link>
        <Link
          href="/practice"
          className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400"
        >
          <h2 className="text-lg font-semibold">Practice Mode</h2>
          <p className="mt-2 text-sm text-slate-600">
            Choose your question count and domains, with instant feedback.
          </p>
        </Link>
      </div>
      <Link href="/history" className="inline-block text-sm text-blue-600 underline">
        View past attempts
      </Link>
    </div>
  )
}
