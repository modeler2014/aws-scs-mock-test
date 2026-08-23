'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentAttempt } from '@/lib/currentAttempt'
import { ScoreSummary } from '@/components/ScoreSummary'
import { DomainBreakdown } from '@/components/DomainBreakdown'
import { ReviewList } from '@/components/ReviewList'
import type { AttemptResult } from '@/types/quiz'

export default function ResultsPage() {
  const router = useRouter()
  const [attempt, setAttempt] = useState<AttemptResult | null>(null)

  useEffect(() => {
    const current = getCurrentAttempt()
    if (!current) {
      router.replace('/')
      return
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAttempt(current)
  }, [router])

  if (!attempt) {
    return <p>Loading results...</p>
  }

  return (
    <div className="space-y-6">
      <ScoreSummary attempt={attempt} />
      <DomainBreakdown domainBreakdown={attempt.domainBreakdown} />
      <h2 className="text-lg font-semibold">Review</h2>
      <ReviewList questions={attempt.questions} answers={attempt.answers} />
    </div>
  )
}
