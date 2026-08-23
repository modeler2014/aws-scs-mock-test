export const DOMAINS = [
  'Threat Detection and Incident Response',
  'Security Logging and Monitoring',
  'Infrastructure Security',
  'Identity and Access Management',
  'Data Protection',
  'Management and Security Governance',
] as const

export type Domain = (typeof DOMAINS)[number]

export type QuestionType = 'single' | 'multi'

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  domain: Domain
  questionType: QuestionType
  question: string
  options: Option[]
  correctAnswers: string[]
  explanation: string
}

export type QuizMode = 'exam' | 'practice'

export type Answers = Record<string, string[]>

export interface DomainResult {
  domain: Domain
  correct: number
  total: number
}

export interface AttemptResult {
  id: string
  mode: QuizMode
  completedAt: string
  questions: Question[]
  answers: Answers
  correctCount: number
  totalCount: number
  score: number
  passed: boolean
  domainBreakdown: DomainResult[]
}

export interface HistoryEntry {
  id: string
  mode: QuizMode
  completedAt: string
  correctCount: number
  totalCount: number
  score: number
  passed: boolean
  domainBreakdown: DomainResult[]
}
