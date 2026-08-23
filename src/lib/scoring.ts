import { DOMAINS, type Answers, type AttemptResult, type Domain, type DomainResult, type Question, type QuizMode } from '@/types/quiz'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function isAnswerCorrect(question: Question, selectedIds: string[]): boolean {
  const selected = [...selectedIds].sort()
  const correct = [...question.correctAnswers].sort()
  if (selected.length !== correct.length) return false
  return selected.every((id, i) => id === correct[i])
}

export function scoreAttempt(questions: Question[], answers: Answers, mode: QuizMode): AttemptResult {
  const domainTotals = new Map<Domain, { correct: number; total: number }>()
  for (const domain of DOMAINS) domainTotals.set(domain, { correct: 0, total: 0 })

  let correctCount = 0
  for (const question of questions) {
    const selected = answers[question.id] ?? []
    const correct = isAnswerCorrect(question, selected)
    if (correct) correctCount++
    const bucket = domainTotals.get(question.domain)!
    bucket.total++
    if (correct) bucket.correct++
  }

  const domainBreakdown: DomainResult[] = DOMAINS.map((domain) => ({
    domain,
    ...domainTotals.get(domain)!,
  })).filter((d) => d.total > 0)

  const totalCount = questions.length
  const score = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100)

  return {
    id: generateId(),
    mode,
    completedAt: new Date().toISOString(),
    questions,
    answers,
    correctCount,
    totalCount,
    score,
    passed: score >= 75,
    domainBreakdown,
  }
}
