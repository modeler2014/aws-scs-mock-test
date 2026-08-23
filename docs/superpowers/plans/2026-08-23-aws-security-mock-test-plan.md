# AWS Security Specialty Mock Test — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a Next.js + Tailwind web app for practicing the AWS Certified Security – Specialty (SCS-C02) exam, with a timed exam simulation, an untimed practice mode (including multi-answer "select N" questions), and localStorage-backed history — no backend, no database.

**Architecture:** Next.js (latest stable, App Router) client app. A pure-function scoring/data layer (`src/lib`, `src/types`) is unit-tested in isolation with Vitest. Presentational components (`src/components`) are tested with React Testing Library. Route pages (`src/app/**/page.tsx`) wire the lib and components together and are the thinnest, least-tested layer (covered with focused RTL tests using mocked routing/storage).

**Tech Stack:** Next.js (latest stable, App Router, TypeScript), Tailwind CSS (v4, CSS-first config via `globals.css` — no `tailwind.config.ts` needed), Vitest + @testing-library/react for tests, `localStorage` for attempt history, `sessionStorage` to pass the just-completed attempt to the results page. Deployed on Vercel.

## Global Constraints

- No backend, no database, no auth — client-only app (from spec).
- Node.js LTS, npm as the package manager.
- Next.js (latest stable, `create-next-app@latest`) App Router + TypeScript (strict mode, from `create-next-app` default). Confirmed via Task 1 review (2026-08-23): scaffolded as Next.js 16 / Tailwind v4 — no dynamic route segments or Next-14-specific APIs appear anywhere in this plan, so the later tasks are unaffected by the newer major version.
- Tailwind CSS for all styling.
- Vitest + `@testing-library/react` (jsdom environment) for all automated tests.
- Exam mode: exactly 65 questions, 170-minute timer, pass threshold 75% (from spec).
- Practice mode: user-selectable question count and domain filter, untimed, instant per-question feedback (from spec).
- Question domains (exactly these 6, from spec): Threat Detection and Incident Response, Security Logging and Monitoring, Infrastructure Security, Identity and Access Management, Data Protection, Management and Security Governance.
- Question bank: exactly 65 questions total, distributed across domains as: Threat Detection and Incident Response = 9, Security Logging and Monitoring = 12, Infrastructure Security = 13, Identity and Access Management = 10, Data Protection = 12, Management and Security Governance = 9 (mirrors real SCS-C02 domain weighting).
- Multi-answer questions ("select TWO/THREE") score all-or-nothing: correct only if the selected option set exactly matches `correctAnswers` (from spec — no partial credit).
- History stored in `localStorage`; only summary fields (mode, date, score, pass/fail, domain breakdown) are persisted, not full question/answer detail (from spec).

---

### Task 1: Project Scaffolding

**Files:**
- Create: entire Next.js project structure (`package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`, etc.) via `create-next-app` (Tailwind v4 configures itself via `globals.css`, not a `tailwind.config.ts` file)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add `test`/`test:watch` scripts)
- Test: `src/lib/smoke.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a working Next.js + TypeScript + Tailwind project with a Vitest test pipeline (`npm test`) that later tasks add tests into

- [ ] **Step 1: Scaffold the Next.js app**

Run from the project root (`/Users/deepakpandit/Documents/aws-security-specialty-mock-test`, which currently only contains `.git/` and `docs/`):

```bash
npx --yes create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

If prompted interactively about anything not covered by a flag (e.g. Turbopack), accept the default.

- [ ] **Step 2: Verify the scaffold**

Run: `cat package.json`
Expected: `dependencies` includes `next`, `react`, `react-dom`; `devDependencies` includes `typescript`, `tailwindcss`.

- [ ] **Step 3: Install the test tooling**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 5: Create the Vitest setup file**

Create `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Add test scripts**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Add a smoke test and run it**

Create `src/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('test pipeline smoke test', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

(This smoke test stays in the repo permanently as a trivial regression guard on the test pipeline itself — it is not a placeholder for later work.)

- [ ] **Step 8: Verify typecheck and lint are clean**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest project"
```

---

### Task 2: Core Types + Scoring Library

**Files:**
- Create: `src/types/quiz.ts`
- Create: `src/lib/scoring.ts`
- Test: `src/lib/scoring.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `DOMAINS: readonly Domain[]`, `type Domain`
  - `type QuestionType = 'single' | 'multi'`
  - `interface Option { id: string; text: string }`
  - `interface Question { id: string; domain: Domain; questionType: QuestionType; question: string; options: Option[]; correctAnswers: string[]; explanation: string }`
  - `type QuizMode = 'exam' | 'practice'`
  - `type Answers = Record<string, string[]>`
  - `interface DomainResult { domain: Domain; correct: number; total: number }`
  - `interface AttemptResult { id: string; mode: QuizMode; completedAt: string; questions: Question[]; answers: Answers; correctCount: number; totalCount: number; score: number; passed: boolean; domainBreakdown: DomainResult[] }`
  - `interface HistoryEntry { id: string; mode: QuizMode; completedAt: string; correctCount: number; totalCount: number; score: number; passed: boolean; domainBreakdown: DomainResult[] }`
  - `isAnswerCorrect(question: Question, selectedIds: string[]): boolean`
  - `scoreAttempt(questions: Question[], answers: Answers, mode: QuizMode): AttemptResult`

- [ ] **Step 1: Write the types file**

Create `src/types/quiz.ts`:

```ts
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
```

- [ ] **Step 2: Write the failing scoring tests**

Create `src/lib/scoring.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isAnswerCorrect, scoreAttempt } from './scoring'
import type { Question } from '@/types/quiz'

const singleQ: Question = {
  id: 'q1',
  domain: 'Data Protection',
  questionType: 'single',
  question: 'Which service provides managed encryption key storage?',
  options: [
    { id: 'a', text: 'AWS KMS' },
    { id: 'b', text: 'AWS IAM' },
  ],
  correctAnswers: ['a'],
  explanation: 'AWS KMS manages encryption keys.',
}

const multiQ: Question = {
  id: 'q2',
  domain: 'Identity and Access Management',
  questionType: 'multi',
  question: 'Select TWO ways to grant cross-account access.',
  options: [
    { id: 'a', text: 'IAM role with trust policy' },
    { id: 'b', text: 'Resource-based policy' },
    { id: 'c', text: 'Root account password sharing' },
  ],
  correctAnswers: ['a', 'b'],
  explanation: 'Cross-account access uses roles or resource policies, never shared credentials.',
}

describe('isAnswerCorrect', () => {
  it('returns true for an exact single-answer match', () => {
    expect(isAnswerCorrect(singleQ, ['a'])).toBe(true)
  })

  it('returns false for a wrong single answer', () => {
    expect(isAnswerCorrect(singleQ, ['b'])).toBe(false)
  })

  it('returns true for a multi-answer match regardless of selection order', () => {
    expect(isAnswerCorrect(multiQ, ['b', 'a'])).toBe(true)
  })

  it('returns false when the multi-answer selection is a partial subset', () => {
    expect(isAnswerCorrect(multiQ, ['a'])).toBe(false)
  })

  it('returns false when the multi-answer selection includes an extra wrong option', () => {
    expect(isAnswerCorrect(multiQ, ['a', 'b', 'c'])).toBe(false)
  })
})

describe('scoreAttempt', () => {
  it('computes correct count, score, pass/fail, and domain breakdown', () => {
    const result = scoreAttempt(
      [singleQ, multiQ],
      { q1: ['a'], q2: ['a', 'b'] },
      'practice'
    )
    expect(result.correctCount).toBe(2)
    expect(result.totalCount).toBe(2)
    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
    expect(result.mode).toBe('practice')
    expect(result.domainBreakdown).toEqual(
      expect.arrayContaining([
        { domain: 'Data Protection', correct: 1, total: 1 },
        { domain: 'Identity and Access Management', correct: 1, total: 1 },
      ])
    )
  })

  it('marks an attempt below 75% as not passed', () => {
    const result = scoreAttempt([singleQ, multiQ], { q1: ['b'], q2: ['a'] }, 'exam')
    expect(result.correctCount).toBe(0)
    expect(result.score).toBe(0)
    expect(result.passed).toBe(false)
  })

  it('treats an unanswered question as incorrect', () => {
    const result = scoreAttempt([singleQ], {}, 'exam')
    expect(result.correctCount).toBe(0)
    expect(result.totalCount).toBe(1)
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- scoring`
Expected: FAIL — `./scoring` has no exported members `isAnswerCorrect`/`scoreAttempt` (module doesn't exist yet).

- [ ] **Step 4: Implement the scoring library**

Create `src/lib/scoring.ts`:

```ts
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- scoring`
Expected: PASS, all 7 tests green.

- [ ] **Step 6: Commit**

```bash
git add src/types/quiz.ts src/lib/scoring.ts src/lib/scoring.test.ts
git commit -m "feat: add quiz types and scoring library"
```

---

### Task 3: Shuffle / Selection Utilities

**Files:**
- Create: `src/lib/shuffle.ts`
- Test: `src/lib/shuffle.test.ts`

**Interfaces:**
- Consumes: nothing (generic, works on any `{ domain: string }`-shaped items)
- Produces:
  - `shuffle<T>(items: T[]): T[]`
  - `pickRandom<T>(items: T[], count: number): T[]`
  - `filterByDomains<T extends { domain: string }>(items: T[], domains: string[]): T[]`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/shuffle.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { shuffle, pickRandom, filterByDomains } from './shuffle'

describe('shuffle', () => {
  it('returns an array with the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)
    expect(result).toHaveLength(5)
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('does not mutate the input array', () => {
    const input = [1, 2, 3]
    shuffle(input)
    expect(input).toEqual([1, 2, 3])
  })
})

describe('pickRandom', () => {
  it('returns the requested count when enough items exist', () => {
    const result = pickRandom([1, 2, 3, 4, 5], 3)
    expect(result).toHaveLength(3)
  })

  it('caps the result at the available item count', () => {
    const result = pickRandom([1, 2], 5)
    expect(result).toHaveLength(2)
  })
})

describe('filterByDomains', () => {
  const items = [
    { id: 'a', domain: 'X' },
    { id: 'b', domain: 'Y' },
    { id: 'c', domain: 'X' },
  ]

  it('returns all items when no domains are given', () => {
    expect(filterByDomains(items, [])).toEqual(items)
  })

  it('returns only items matching the given domains', () => {
    expect(filterByDomains(items, ['Y'])).toEqual([{ id: 'b', domain: 'Y' }])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- shuffle`
Expected: FAIL — module `./shuffle` does not exist.

- [ ] **Step 3: Implement the utilities**

Create `src/lib/shuffle.ts`:

```ts
export function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function pickRandom<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, Math.min(count, items.length))
}

export function filterByDomains<T extends { domain: string }>(
  items: T[],
  domains: string[]
): T[] {
  if (domains.length === 0) return items
  return items.filter((item) => domains.includes(item.domain))
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- shuffle`
Expected: PASS, all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/shuffle.ts src/lib/shuffle.test.ts
git commit -m "feat: add shuffle/pickRandom/filterByDomains utilities"
```

---

### Task 4: History (localStorage) Library

**Files:**
- Create: `src/lib/history.ts`
- Test: `src/lib/history.test.ts`

**Interfaces:**
- Consumes: `HistoryEntry` type from `src/types/quiz.ts` (Task 2)
- Produces:
  - `getAttempts(): HistoryEntry[]` — most recent first
  - `saveAttempt(entry: HistoryEntry): void`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/history.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { getAttempts, saveAttempt } from './history'
import type { HistoryEntry } from '@/types/quiz'

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    id: 'id-1',
    mode: 'practice',
    completedAt: '2026-01-01T00:00:00.000Z',
    correctCount: 8,
    totalCount: 10,
    score: 80,
    passed: false,
    domainBreakdown: [],
    ...overrides,
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('getAttempts', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(getAttempts()).toEqual([])
  })
})

describe('saveAttempt', () => {
  it('persists an attempt and returns it from getAttempts', () => {
    saveAttempt(makeEntry({ id: 'id-1' }))
    expect(getAttempts()).toEqual([makeEntry({ id: 'id-1' })])
  })

  it('returns attempts most-recent-first', () => {
    saveAttempt(makeEntry({ id: 'older', completedAt: '2026-01-01T00:00:00.000Z' }))
    saveAttempt(makeEntry({ id: 'newer', completedAt: '2026-02-01T00:00:00.000Z' }))
    const attempts = getAttempts()
    expect(attempts.map((a) => a.id)).toEqual(['newer', 'older'])
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- history`
Expected: FAIL — module `./history` does not exist.

- [ ] **Step 3: Implement the library**

Create `src/lib/history.ts`:

```ts
import type { HistoryEntry } from '@/types/quiz'

const STORAGE_KEY = 'aws-scs-mock-history'

export function getAttempts(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const entries: HistoryEntry[] = JSON.parse(raw)
    return [...entries].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
  } catch {
    return []
  }
}

export function saveAttempt(entry: HistoryEntry): void {
  if (typeof window === 'undefined') return
  const raw = window.localStorage.getItem(STORAGE_KEY)
  const entries: HistoryEntry[] = raw ? JSON.parse(raw) : []
  entries.push(entry)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- history`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/history.ts src/lib/history.test.ts
git commit -m "feat: add localStorage-backed attempt history library"
```

---

### Task 5: Current-Attempt (sessionStorage) Library

**Files:**
- Create: `src/lib/currentAttempt.ts`
- Test: `src/lib/currentAttempt.test.ts`

**Interfaces:**
- Consumes: `AttemptResult` type from `src/types/quiz.ts` (Task 2)
- Produces:
  - `setCurrentAttempt(attempt: AttemptResult): void`
  - `getCurrentAttempt(): AttemptResult | null`
  - `clearCurrentAttempt(): void`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/currentAttempt.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setCurrentAttempt, getCurrentAttempt, clearCurrentAttempt } from './currentAttempt'
import type { AttemptResult } from '@/types/quiz'

const attempt: AttemptResult = {
  id: 'a1',
  mode: 'exam',
  completedAt: '2026-01-01T00:00:00.000Z',
  questions: [],
  answers: {},
  correctCount: 0,
  totalCount: 0,
  score: 0,
  passed: false,
  domainBreakdown: [],
}

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('currentAttempt', () => {
  it('returns null when nothing is stored', () => {
    expect(getCurrentAttempt()).toBeNull()
  })

  it('stores and retrieves the current attempt', () => {
    setCurrentAttempt(attempt)
    expect(getCurrentAttempt()).toEqual(attempt)
  })

  it('clears the current attempt', () => {
    setCurrentAttempt(attempt)
    clearCurrentAttempt()
    expect(getCurrentAttempt()).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- currentAttempt`
Expected: FAIL — module `./currentAttempt` does not exist.

- [ ] **Step 3: Implement the library**

Create `src/lib/currentAttempt.ts`:

```ts
import type { AttemptResult } from '@/types/quiz'

const SESSION_KEY = 'aws-scs-current-attempt'

export function setCurrentAttempt(attempt: AttemptResult): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(attempt))
}

export function getCurrentAttempt(): AttemptResult | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AttemptResult
  } catch {
    return null
  }
}

export function clearCurrentAttempt(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(SESSION_KEY)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- currentAttempt`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/currentAttempt.ts src/lib/currentAttempt.test.ts
git commit -m "feat: add sessionStorage-backed current-attempt handoff library"
```

---

### Task 6: `useQuizAnswers` Hook

**Files:**
- Create: `src/lib/useQuizAnswers.ts`
- Test: `src/lib/useQuizAnswers.test.ts`

**Interfaces:**
- Consumes: `Answers` type from `src/types/quiz.ts` (Task 2)
- Produces: `useQuizAnswers(): { answers: Answers; setAnswer: (questionId: string, selectedIds: string[]) => void; isAnswered: (questionId: string) => boolean }`

- [ ] **Step 1: Write the failing test**

Create `src/lib/useQuizAnswers.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuizAnswers } from './useQuizAnswers'

describe('useQuizAnswers', () => {
  it('starts with no answers', () => {
    const { result } = renderHook(() => useQuizAnswers())
    expect(result.current.answers).toEqual({})
    expect(result.current.isAnswered('q1')).toBe(false)
  })

  it('records and reports an answer for a question', () => {
    const { result } = renderHook(() => useQuizAnswers())
    act(() => {
      result.current.setAnswer('q1', ['a', 'b'])
    })
    expect(result.current.answers).toEqual({ q1: ['a', 'b'] })
    expect(result.current.isAnswered('q1')).toBe(true)
  })

  it('overwrites a previous answer for the same question', () => {
    const { result } = renderHook(() => useQuizAnswers())
    act(() => {
      result.current.setAnswer('q1', ['a'])
    })
    act(() => {
      result.current.setAnswer('q1', ['b'])
    })
    expect(result.current.answers).toEqual({ q1: ['b'] })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- useQuizAnswers`
Expected: FAIL — module `./useQuizAnswers` does not exist.

- [ ] **Step 3: Implement the hook**

Create `src/lib/useQuizAnswers.ts`:

```ts
'use client'

import { useCallback, useState } from 'react'
import type { Answers } from '@/types/quiz'

export function useQuizAnswers() {
  const [answers, setAnswers] = useState<Answers>({})

  const setAnswer = useCallback((questionId: string, selectedIds: string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIds }))
  }, [])

  const isAnswered = useCallback(
    (questionId: string) => (answers[questionId]?.length ?? 0) > 0,
    [answers]
  )

  return { answers, setAnswer, isAnswered }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- useQuizAnswers`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/useQuizAnswers.ts src/lib/useQuizAnswers.test.ts
git commit -m "feat: add useQuizAnswers hook for tracking selected answers"
```

---

### Task 7: Question Bank Data (65 Questions)

**Files:**
- Create: `src/data/questions.ts`
- Test: `src/data/questions.test.ts`

**Interfaces:**
- Consumes: `Question`, `DOMAINS` from `src/types/quiz.ts` (Task 2)
- Produces: `questions: Question[]` — exactly 65 entries

- [ ] **Step 1: Write the data integrity tests**

Create `src/data/questions.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { questions } from './questions'
import { DOMAINS } from '@/types/quiz'

describe('questions data integrity', () => {
  it('contains exactly 65 questions', () => {
    expect(questions.length).toBe(65)
  })

  it('has unique ids', () => {
    const ids = questions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every question has a valid domain', () => {
    for (const q of questions) {
      expect(DOMAINS).toContain(q.domain)
    }
  })

  it('every option id referenced in correctAnswers exists in that question\'s options', () => {
    for (const q of questions) {
      const optionIds = q.options.map((o) => o.id)
      for (const correctId of q.correctAnswers) {
        expect(optionIds).toContain(correctId)
      }
    }
  })

  it('every question has at least 3 options and no duplicate option ids', () => {
    for (const q of questions) {
      expect(q.options.length).toBeGreaterThanOrEqual(3)
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length)
    }
  })

  it('single questions have exactly one correct answer, multi questions have two or more', () => {
    for (const q of questions) {
      if (q.questionType === 'single') {
        expect(q.correctAnswers.length).toBe(1)
      } else {
        expect(q.correctAnswers.length).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('includes at least 10 multi-answer questions', () => {
    const multiCount = questions.filter((q) => q.questionType === 'multi').length
    expect(multiCount).toBeGreaterThanOrEqual(10)
  })

  it('matches the target per-domain question count', () => {
    const targets: Record<string, number> = {
      'Threat Detection and Incident Response': 9,
      'Security Logging and Monitoring': 12,
      'Infrastructure Security': 13,
      'Identity and Access Management': 10,
      'Data Protection': 12,
      'Management and Security Governance': 9,
    }
    for (const [domain, target] of Object.entries(targets)) {
      const count = questions.filter((q) => q.domain === domain).length
      expect(count).toBe(target)
    }
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- data/questions`
Expected: FAIL — module `./questions` does not exist.

- [ ] **Step 3: Write the question bank**

Create `src/data/questions.ts`, following this pattern (a single-answer example and a multi-answer example are shown below — write the full set of 65 following the same `Question` shape from `src/types/quiz.ts`):

```ts
import type { Question } from '@/types/quiz'

export const questions: Question[] = [
  {
    id: 'dp-001',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company needs to encrypt objects in S3 using keys that AWS manages the storage for, but where the company controls key rotation policy and can audit key usage via CloudTrail. Which encryption option should they use?',
    options: [
      { id: 'a', text: 'SSE-S3' },
      { id: 'b', text: 'SSE-KMS with a customer managed key' },
      { id: 'c', text: 'SSE-C' },
      { id: 'd', text: 'Client-side encryption with a locally managed key' },
    ],
    correctAnswers: ['b'],
    explanation:
      'SSE-KMS with a customer managed key lets AWS store the key material while the customer controls the key policy, rotation, and gets CloudTrail visibility into every use of the key. SSE-S3 uses AWS-owned keys with no customer control; SSE-C and client-side encryption push key management entirely to the customer.',
  },
  {
    id: 'iam-001',
    domain: 'Identity and Access Management',
    questionType: 'multi',
    question:
      'A security engineer is designing cross-account access from Account A to a set of S3 buckets in Account B, without using long-lived credentials. Select TWO approaches that meet this requirement.',
    options: [
      { id: 'a', text: 'Create an IAM role in Account B with a trust policy allowing Account A to assume it' },
      { id: 'b', text: 'Share an IAM user access key from Account B with Account A' },
      { id: 'c', text: 'Attach a bucket policy in Account B that grants access to a specific IAM role ARN in Account A' },
      { id: 'd', text: 'Copy the S3 bucket policy into Account A' },
    ],
    correctAnswers: ['a', 'c'],
    explanation:
      'Cross-account access without long-lived credentials is achieved either by assuming a role in the target account (trust policy) or by granting a specific principal from the other account access via a resource-based (bucket) policy. Sharing access keys (b) creates long-lived credentials, and bucket policies are not "copied" between accounts (d).',
  },
]
```

The two objects above are real entries — keep them in the file as-is (they
already count toward the quota below) and author 63 more `Question` objects
directly in the array, in the same shape, until it holds exactly 65. Do
**not** leave any placeholder or "TODO" comment in the file — every entry
must be a complete, real question.

Required domain quota (from Global Constraints), counting the two examples
already written:

| Domain | Total needed | Already written |
|---|---|---|
| Threat Detection and Incident Response | 9 | 0 |
| Security Logging and Monitoring | 12 | 0 |
| Infrastructure Security | 13 | 0 |
| Identity and Access Management | 10 | 1 (`iam-001`) |
| Data Protection | 12 | 1 (`dp-001`) |
| Management and Security Governance | 9 | 0 |

Prefix each new question's `id` with a short domain code followed by a
zero-padded number, matching the two examples: `td-` (Threat Detection),
`slm-` (Security Logging and Monitoring), `is-` (Infrastructure Security),
`iam-` (Identity and Access Management), `dp-` (Data Protection), `msg-`
(Management and Security Governance) — e.g. `td-001`, `td-002`, ...
`msg-009`. Include at least 10 `questionType: 'multi'` questions spread
across the domains (the two examples include one already).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- data/questions`
Expected: PASS, all 8 tests green — this confirms the full 65-question bank was authored with the correct domain distribution and structure.

- [ ] **Step 5: Commit**

```bash
git add src/data/questions.ts src/data/questions.test.ts
git commit -m "feat: add 65-question SCS-C02 question bank"
```

---

### Task 8: `QuestionCard` Component

**Files:**
- Create: `src/components/QuestionCard.tsx`
- Test: `src/components/QuestionCard.test.tsx`

**Interfaces:**
- Consumes: `Question` type from `src/types/quiz.ts` (Task 2)
- Produces: `QuestionCard` component with props `{ question: Question; questionNumber: number; totalQuestions: number; selectedIds: string[]; onChange: (selectedIds: string[]) => void; disabled?: boolean; feedback?: { correct: boolean } | null }`

- [ ] **Step 1: Write the failing tests**

Create `src/components/QuestionCard.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuestionCard } from './QuestionCard'
import type { Question } from '@/types/quiz'

const singleQ: Question = {
  id: 'q1',
  domain: 'Data Protection',
  questionType: 'single',
  question: 'Which service manages encryption keys?',
  options: [
    { id: 'a', text: 'AWS KMS' },
    { id: 'b', text: 'AWS IAM' },
  ],
  correctAnswers: ['a'],
  explanation: 'KMS manages keys.',
}

const multiQ: Question = {
  id: 'q2',
  domain: 'Identity and Access Management',
  questionType: 'multi',
  question: 'Select TWO valid options.',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
  ],
  correctAnswers: ['a', 'b'],
  explanation: 'A and B are correct.',
}

describe('QuestionCard', () => {
  it('renders the question text and options', () => {
    render(
      <QuestionCard
        question={singleQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={[]}
        onChange={() => {}}
      />
    )
    expect(screen.getByText(singleQ.question)).toBeInTheDocument()
    expect(screen.getByText('AWS KMS')).toBeInTheDocument()
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument()
  })

  it('calls onChange with a single selection for single-answer questions', () => {
    const onChange = vi.fn()
    render(
      <QuestionCard
        question={singleQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={[]}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByLabelText('AWS KMS'))
    expect(onChange).toHaveBeenCalledWith(['a'])
  })

  it('toggles selections for multi-answer questions', () => {
    const onChange = vi.fn()
    render(
      <QuestionCard
        question={multiQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={['a']}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByLabelText('Option B'))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('shows the explanation when feedback is provided', () => {
    render(
      <QuestionCard
        question={singleQ}
        questionNumber={1}
        totalQuestions={5}
        selectedIds={['a']}
        onChange={() => {}}
        disabled
        feedback={{ correct: true }}
      />
    )
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('KMS manages keys.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- QuestionCard`
Expected: FAIL — module `./QuestionCard` does not exist.

- [ ] **Step 3: Implement the component**

Create `src/components/QuestionCard.tsx`:

```tsx
'use client'

import type { Question } from '@/types/quiz'

interface QuestionCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  disabled?: boolean
  feedback?: { correct: boolean } | null
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedIds,
  onChange,
  disabled = false,
  feedback = null,
}: QuestionCardProps) {
  const isMulti = question.questionType === 'multi'

  function toggleOption(optionId: string) {
    if (disabled) return
    if (isMulti) {
      const next = selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId]
      onChange(next)
    } else {
      onChange([optionId])
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        Question {questionNumber} of {totalQuestions}
        {isMulti && ` — Select ${question.correctAnswers.length}`}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-900">{question.question}</h2>
      <div className="mt-4 space-y-2">
        {question.options.map((option) => {
          const checked = selectedIds.includes(option.id)
          const isCorrectOption = question.correctAnswers.includes(option.id)
          const showFeedback = feedback !== null
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-md border p-3 ${
                showFeedback && isCorrectOption
                  ? 'border-green-500 bg-green-50'
                  : showFeedback && checked && !isCorrectOption
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200'
              }`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={question.id}
                checked={checked}
                disabled={disabled}
                onChange={() => toggleOption(option.id)}
              />
              <span>{option.text}</span>
            </label>
          )
        })}
      </div>
      {feedback && (
        <div
          className={`mt-4 rounded-md p-3 text-sm ${
            feedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          <p className="font-semibold">{feedback.correct ? 'Correct' : 'Incorrect'}</p>
          <p className="mt-1">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- QuestionCard`
Expected: PASS, all 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/QuestionCard.tsx src/components/QuestionCard.test.tsx
git commit -m "feat: add QuestionCard component with single/multi answer support"
```

---

### Task 9: `Timer` Component

**Files:**
- Create: `src/components/Timer.tsx`
- Test: `src/components/Timer.test.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `Timer` component with props `{ durationSeconds: number; onExpire: () => void }`

- [ ] **Step 1: Write the failing tests**

Create `src/components/Timer.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Timer } from './Timer'

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the initial duration as mm:ss', () => {
    render(<Timer durationSeconds={125} onExpire={() => {}} />)
    expect(screen.getByText('02:05')).toBeInTheDocument()
  })

  it('counts down every second', () => {
    render(<Timer durationSeconds={5} onExpire={() => {}} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('00:04')).toBeInTheDocument()
  })

  it('calls onExpire exactly once when the countdown reaches zero', () => {
    const onExpire = vi.fn()
    render(<Timer durationSeconds={2} onExpire={onExpire} />)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- Timer`
Expected: FAIL — module `./Timer` does not exist.

- [ ] **Step 3: Implement the component**

Create `src/components/Timer.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
  durationSeconds: number
  onExpire: () => void
}

export function Timer({ durationSeconds, onExpire }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire()
      return
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft, onExpire])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isLow = secondsLeft <= 300

  return (
    <div className={`font-mono text-lg ${isLow ? 'text-red-600' : 'text-slate-700'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- Timer`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/Timer.tsx src/components/Timer.test.tsx
git commit -m "feat: add countdown Timer component"
```

---

### Task 10: `ScoreSummary` + `DomainBreakdown` Components

**Files:**
- Create: `src/components/ScoreSummary.tsx`
- Create: `src/components/DomainBreakdown.tsx`
- Test: `src/components/ScoreSummary.test.tsx`
- Test: `src/components/DomainBreakdown.test.tsx`

**Interfaces:**
- Consumes: `AttemptResult`, `DomainResult` types from `src/types/quiz.ts` (Task 2)
- Produces:
  - `ScoreSummary` component with props `{ attempt: Pick<AttemptResult, 'mode' | 'correctCount' | 'totalCount' | 'score' | 'passed'> }`
  - `DomainBreakdown` component with props `{ domainBreakdown: DomainResult[] }`

- [ ] **Step 1: Write the failing tests**

Create `src/components/ScoreSummary.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScoreSummary } from './ScoreSummary'

describe('ScoreSummary', () => {
  it('shows the score and correct/total counts', () => {
    render(
      <ScoreSummary attempt={{ mode: 'practice', correctCount: 8, totalCount: 10, score: 80, passed: true }} />
    )
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('8 of 10 correct')).toBeInTheDocument()
  })

  it('shows a PASS badge for a passed exam attempt', () => {
    render(
      <ScoreSummary attempt={{ mode: 'exam', correctCount: 50, totalCount: 65, score: 77, passed: true }} />
    )
    expect(screen.getByText('PASS')).toBeInTheDocument()
  })

  it('shows a FAIL badge for a failed exam attempt', () => {
    render(
      <ScoreSummary attempt={{ mode: 'exam', correctCount: 30, totalCount: 65, score: 46, passed: false }} />
    )
    expect(screen.getByText('FAIL')).toBeInTheDocument()
  })

  it('does not show a pass/fail badge for practice mode', () => {
    render(
      <ScoreSummary attempt={{ mode: 'practice', correctCount: 30, totalCount: 65, score: 46, passed: false }} />
    )
    expect(screen.queryByText('FAIL')).not.toBeInTheDocument()
  })
})
```

Create `src/components/DomainBreakdown.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DomainBreakdown } from './DomainBreakdown'

describe('DomainBreakdown', () => {
  it('renders each domain with its correct/total counts and percentage', () => {
    render(
      <DomainBreakdown
        domainBreakdown={[
          { domain: 'Data Protection', correct: 3, total: 4 },
          { domain: 'Infrastructure Security', correct: 1, total: 2 },
        ]}
      />
    )
    expect(screen.getByText('Data Protection')).toBeInTheDocument()
    expect(screen.getByText('3/4 (75%)')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure Security')).toBeInTheDocument()
    expect(screen.getByText('1/2 (50%)')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- ScoreSummary DomainBreakdown`
Expected: FAIL — neither module exists yet.

- [ ] **Step 3: Implement the components**

Create `src/components/ScoreSummary.tsx`:

```tsx
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
```

(The `<span>` around `PASS`/`FAIL` is required, not decorative: the test below asserts `getByText('PASS')`, which needs an element whose own normalized text content is exactly `PASS` — without the span, "PASS" and " (75% required)" would be sibling text nodes under the same `<p>`, and RTL would not match either string alone.)

Create `src/components/DomainBreakdown.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- ScoreSummary DomainBreakdown`
Expected: PASS, all 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/ScoreSummary.tsx src/components/ScoreSummary.test.tsx src/components/DomainBreakdown.tsx src/components/DomainBreakdown.test.tsx
git commit -m "feat: add ScoreSummary and DomainBreakdown components"
```

---

### Task 11: `ReviewList` Component

**Files:**
- Create: `src/components/ReviewList.tsx`
- Test: `src/components/ReviewList.test.tsx`

**Interfaces:**
- Consumes: `Question`, `Answers` types from `src/types/quiz.ts` (Task 2); `isAnswerCorrect` from `src/lib/scoring.ts` (Task 2)
- Produces: `ReviewList` component with props `{ questions: Question[]; answers: Answers }`

- [ ] **Step 1: Write the failing test**

Create `src/components/ReviewList.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReviewList } from './ReviewList'
import type { Question } from '@/types/quiz'

const questions: Question[] = [
  {
    id: 'q1',
    domain: 'Data Protection',
    questionType: 'single',
    question: 'Which service manages encryption keys?',
    options: [
      { id: 'a', text: 'AWS KMS' },
      { id: 'b', text: 'AWS IAM' },
    ],
    correctAnswers: ['a'],
    explanation: 'KMS manages keys.',
  },
  {
    id: 'q2',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question: 'Which service filters traffic at the edge?',
    options: [
      { id: 'a', text: 'AWS WAF' },
      { id: 'b', text: 'AWS Config' },
    ],
    correctAnswers: ['a'],
    explanation: 'WAF filters web traffic.',
  },
]

describe('ReviewList', () => {
  it('marks the wrongly-selected option and shows the explanation for an incorrect answer', () => {
    render(<ReviewList questions={questions} answers={{ q1: ['b'], q2: ['a'] }} />)
    expect(screen.getByText('AWS IAM (your answer)')).toBeInTheDocument()
    expect(screen.getByText('KMS manages keys.')).toBeInTheDocument()
    expect(screen.getByText('WAF filters web traffic.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- ReviewList`
Expected: FAIL — module `./ReviewList` does not exist.

- [ ] **Step 3: Implement the component**

Create `src/components/ReviewList.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- ReviewList`
Expected: PASS, 1 test green.

- [ ] **Step 5: Commit**

```bash
git add src/components/ReviewList.tsx src/components/ReviewList.test.tsx
git commit -m "feat: add ReviewList component for post-attempt question review"
```

---

### Task 12: Root Layout + Home Page

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Test: `src/app/page.test.tsx`

**Interfaces:**
- Consumes: nothing beyond `next/link`
- Produces: the app shell (nav) and the home page linking to `/exam`, `/practice`, `/history`

- [ ] **Step 1: Replace the root layout**

Replace the contents of `src/app/layout.tsx` (keep the existing `import './globals.css'`, replace everything else) with:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'AWS Security Specialty Mock Test',
  description: 'Practice exams for the AWS Certified Security - Specialty (SCS-C02) certification.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              AWS Security Specialty Mock Test
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/practice">Practice</Link>
              <Link href="/exam">Exam</Link>
              <Link href="/history">History</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
```

(The root layout renders `<html>`/`<body>`, which is awkward to unit test in isolation under jsdom — it is covered instead by the manual QA pass in Task 17.)

- [ ] **Step 2: Write the failing home page test**

Create `src/app/page.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from './page'

describe('HomePage', () => {
  it('links to the exam, practice, and history pages', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: /timed exam simulation/i })).toHaveAttribute('href', '/exam')
    expect(screen.getByRole('link', { name: /practice mode/i })).toHaveAttribute('href', '/practice')
    expect(screen.getByRole('link', { name: /view past attempts/i })).toHaveAttribute('href', '/history')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- app/page`
Expected: FAIL — `src/app/page.tsx` still has the `create-next-app` default content, so the expected links aren't present.

- [ ] **Step 4: Replace the home page**

Replace the contents of `src/app/page.tsx` with:

```tsx
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- app/page`
Expected: PASS, 1 test green.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: add app shell nav and home page"
```

---

### Task 13: Exam Page

**Files:**
- Create: `src/app/exam/page.tsx`
- Test: `src/app/exam/page.test.tsx`

**Interfaces:**
- Consumes:
  - `questions` from `src/data/questions.ts` (Task 7)
  - `pickRandom` from `src/lib/shuffle.ts` (Task 3)
  - `scoreAttempt` from `src/lib/scoring.ts` (Task 2)
  - `saveAttempt` from `src/lib/history.ts` (Task 4)
  - `setCurrentAttempt` from `src/lib/currentAttempt.ts` (Task 5)
  - `useQuizAnswers` from `src/lib/useQuizAnswers.ts` (Task 6)
  - `QuestionCard` from `src/components/QuestionCard.tsx` (Task 8)
  - `Timer` from `src/components/Timer.tsx` (Task 9)
- Produces: the `/exam` route

- [ ] **Step 1: Write the failing test**

Create `src/app/exam/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ExamPage from './page'
import type { Question } from '@/types/quiz'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const mockQuestions: Question[] = [
  {
    id: 'q1',
    domain: 'Data Protection',
    questionType: 'single',
    question: 'Question one?',
    options: [
      { id: 'a', text: 'Answer A' },
      { id: 'b', text: 'Answer B' },
    ],
    correctAnswers: ['a'],
    explanation: 'A is correct.',
  },
  {
    id: 'q2',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question: 'Question two?',
    options: [
      { id: 'a', text: 'Answer A' },
      { id: 'b', text: 'Answer B' },
    ],
    correctAnswers: ['b'],
    explanation: 'B is correct.',
  },
]

vi.mock('@/data/questions', () => ({ questions: mockQuestions }))

beforeEach(() => {
  push.mockClear()
  window.localStorage.clear()
  window.sessionStorage.clear()
})

describe('ExamPage', () => {
  it('lets the user answer both questions and submit, saving the attempt and navigating to /results', async () => {
    render(<ExamPage />)

    await waitFor(() => expect(screen.getByText('Question 1 of 2')).toBeInTheDocument())

    fireEvent.click(screen.getByLabelText('Answer A'))
    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Answer B'))
    fireEvent.click(screen.getByRole('button', { name: 'Submit Exam' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/results'))
    expect(window.localStorage.getItem('aws-scs-mock-history')).toContain('"mode":"exam"')
    expect(window.sessionStorage.getItem('aws-scs-current-attempt')).toContain('"mode":"exam"')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- app/exam/page`
Expected: FAIL — `src/app/exam/page.tsx` does not exist.

- [ ] **Step 3: Implement the page**

Create `src/app/exam/page.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions as questionBank } from '@/data/questions'
import { pickRandom } from '@/lib/shuffle'
import { scoreAttempt } from '@/lib/scoring'
import { saveAttempt } from '@/lib/history'
import { setCurrentAttempt } from '@/lib/currentAttempt'
import { useQuizAnswers } from '@/lib/useQuizAnswers'
import { QuestionCard } from '@/components/QuestionCard'
import { Timer } from '@/components/Timer'
import type { Question } from '@/types/quiz'

const EXAM_LENGTH = 65
const EXAM_DURATION_SECONDS = 170 * 60

export default function ExamPage() {
  const router = useRouter()
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const { answers, setAnswer, isAnswered } = useQuizAnswers()
  const hasSubmitted = useRef(false)

  useEffect(() => {
    setExamQuestions(pickRandom(questionBank, EXAM_LENGTH))
  }, [])

  function handleSubmit() {
    if (hasSubmitted.current || examQuestions.length === 0) return
    hasSubmitted.current = true
    const result = scoreAttempt(examQuestions, answers, 'exam')
    saveAttempt(result)
    setCurrentAttempt(result)
    router.push('/results')
  }

  if (examQuestions.length === 0) {
    return <p>Loading exam...</p>
  }

  const question = examQuestions[currentIndex]
  const answeredCount = examQuestions.filter((q) => isAnswered(q.id)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Answered {answeredCount} of {examQuestions.length}
        </p>
        <Timer durationSeconds={EXAM_DURATION_SECONDS} onExpire={handleSubmit} />
      </div>
      <QuestionCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={examQuestions.length}
        selectedIds={answers[question.id] ?? []}
        onChange={(ids) => setAnswer(question.id, ids)}
      />
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="rounded-md border border-slate-300 px-4 py-2 disabled:opacity-40"
        >
          Previous
        </button>
        {currentIndex < examQuestions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(examQuestions.length - 1, i + 1))}
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-green-600 px-4 py-2 text-white"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- app/exam/page`
Expected: PASS, 1 test green.

- [ ] **Step 5: Commit**

```bash
git add src/app/exam/page.tsx src/app/exam/page.test.tsx
git commit -m "feat: add timed exam simulation page"
```

---

### Task 14: Practice Page

**Files:**
- Create: `src/app/practice/page.tsx`
- Test: `src/app/practice/page.test.tsx`

**Interfaces:**
- Consumes:
  - `questions` from `src/data/questions.ts` (Task 7)
  - `pickRandom`, `filterByDomains` from `src/lib/shuffle.ts` (Task 3)
  - `isAnswerCorrect`, `scoreAttempt` from `src/lib/scoring.ts` (Task 2)
  - `saveAttempt` from `src/lib/history.ts` (Task 4)
  - `setCurrentAttempt` from `src/lib/currentAttempt.ts` (Task 5)
  - `useQuizAnswers` from `src/lib/useQuizAnswers.ts` (Task 6)
  - `QuestionCard` from `src/components/QuestionCard.tsx` (Task 8)
  - `DOMAINS` from `src/types/quiz.ts` (Task 2)
- Produces: the `/practice` route

- [ ] **Step 1: Write the failing test**

Create `src/app/practice/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PracticePage from './page'
import type { Question } from '@/types/quiz'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const mockQuestions: Question[] = [
  {
    id: 'q1',
    domain: 'Data Protection',
    questionType: 'single',
    question: 'Question one?',
    options: [
      { id: 'a', text: 'Answer A' },
      { id: 'b', text: 'Answer B' },
    ],
    correctAnswers: ['a'],
    explanation: 'A is correct.',
  },
  {
    id: 'q2',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question: 'Question two?',
    options: [
      { id: 'a', text: 'Answer A' },
      { id: 'b', text: 'Answer B' },
    ],
    correctAnswers: ['b'],
    explanation: 'B is correct.',
  },
]

vi.mock('@/data/questions', () => ({ questions: mockQuestions }))

// The real pickRandom/filterByDomains shuffle order — mock them to be
// order-preserving so this test deterministically sees q1 then q2.
vi.mock('@/lib/shuffle', () => ({
  pickRandom: (items: unknown[], count: number) => items.slice(0, count),
  filterByDomains: (items: unknown[]) => items,
}))

beforeEach(() => {
  push.mockClear()
  window.localStorage.clear()
  window.sessionStorage.clear()
})

describe('PracticePage', () => {
  it('runs a full setup -> quiz -> feedback -> finish flow', async () => {
    render(<PracticePage />)

    fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }))

    expect(await screen.findByText('Question 1 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Answer A'))
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }))
    expect(screen.getByText('Correct')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Question 2 of 2')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Answer A'))
    fireEvent.click(screen.getByRole('button', { name: 'Check Answer' }))
    expect(screen.getByText('Incorrect')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/results'))
    expect(window.localStorage.getItem('aws-scs-mock-history')).toContain('"mode":"practice"')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- app/practice/page`
Expected: FAIL — `src/app/practice/page.tsx` does not exist.

- [ ] **Step 3: Implement the page**

Create `src/app/practice/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { questions as questionBank } from '@/data/questions'
import { pickRandom, filterByDomains } from '@/lib/shuffle'
import { isAnswerCorrect, scoreAttempt } from '@/lib/scoring'
import { saveAttempt } from '@/lib/history'
import { setCurrentAttempt } from '@/lib/currentAttempt'
import { useQuizAnswers } from '@/lib/useQuizAnswers'
import { QuestionCard } from '@/components/QuestionCard'
import { DOMAINS, type Question } from '@/types/quiz'

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 65]

export default function PracticePage() {
  const router = useRouter()
  const [stage, setStage] = useState<'setup' | 'quiz'>('setup')
  const [questionCount, setQuestionCount] = useState(10)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [checked, setChecked] = useState(false)
  const { answers, setAnswer } = useQuizAnswers()

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    )
  }

  function startPractice() {
    const pool = filterByDomains(questionBank, selectedDomains)
    setPracticeQuestions(pickRandom(pool, questionCount))
    setCurrentIndex(0)
    setChecked(false)
    setStage('quiz')
  }

  function finishPractice() {
    const result = scoreAttempt(practiceQuestions, answers, 'practice')
    saveAttempt(result)
    setCurrentAttempt(result)
    router.push('/results')
  }

  function handleNext() {
    if (currentIndex === practiceQuestions.length - 1) {
      finishPractice()
      return
    }
    setCurrentIndex((i) => i + 1)
    setChecked(false)
  }

  if (stage === 'setup') {
    return (
      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Practice Mode</h1>
        <div>
          <label className="block text-sm font-medium">Number of questions</label>
          <select
            className="mt-1 rounded-md border border-slate-300 p-2"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
          >
            {QUESTION_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className="text-sm font-medium">Domains (leave unchecked for all)</p>
          <div className="mt-2 space-y-1">
            {DOMAINS.map((domain) => (
              <label key={domain} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                />
                {domain}
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={startPractice}
          className="rounded-md bg-blue-600 px-4 py-2 text-white"
        >
          Start Practice
        </button>
      </div>
    )
  }

  const question = practiceQuestions[currentIndex]
  const selectedIds = answers[question.id] ?? []
  const feedback = checked ? { correct: isAnswerCorrect(question, selectedIds) } : null

  return (
    <div className="space-y-4">
      <QuestionCard
        question={question}
        questionNumber={currentIndex + 1}
        totalQuestions={practiceQuestions.length}
        selectedIds={selectedIds}
        onChange={(ids) => setAnswer(question.id, ids)}
        disabled={checked}
        feedback={feedback}
      />
      <div className="flex justify-end gap-3">
        {!checked ? (
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={selectedIds.length === 0}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
          >
            Check Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-md bg-green-600 px-4 py-2 text-white"
          >
            {currentIndex === practiceQuestions.length - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- app/practice/page`
Expected: PASS, 1 test green.

- [ ] **Step 5: Commit**

```bash
git add src/app/practice/page.tsx src/app/practice/page.test.tsx
git commit -m "feat: add practice mode page with setup, instant feedback, and domain filter"
```

---

### Task 15: Results Page

**Files:**
- Create: `src/app/results/page.tsx`
- Test: `src/app/results/page.test.tsx`

**Interfaces:**
- Consumes:
  - `getCurrentAttempt` from `src/lib/currentAttempt.ts` (Task 5)
  - `ScoreSummary` from `src/components/ScoreSummary.tsx` (Task 10)
  - `DomainBreakdown` from `src/components/DomainBreakdown.tsx` (Task 10)
  - `ReviewList` from `src/components/ReviewList.tsx` (Task 11)
- Produces: the `/results` route

- [ ] **Step 1: Write the failing tests**

Create `src/app/results/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ResultsPage from './page'
import type { AttemptResult } from '@/types/quiz'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

const getCurrentAttempt = vi.fn()

vi.mock('@/lib/currentAttempt', () => ({
  getCurrentAttempt: () => getCurrentAttempt(),
}))

const attempt: AttemptResult = {
  id: 'a1',
  mode: 'practice',
  completedAt: '2026-01-01T00:00:00.000Z',
  questions: [
    {
      id: 'q1',
      domain: 'Data Protection',
      questionType: 'single',
      question: 'Question one?',
      options: [
        { id: 'a', text: 'Answer A' },
        { id: 'b', text: 'Answer B' },
      ],
      correctAnswers: ['a'],
      explanation: 'A is correct.',
    },
  ],
  answers: { q1: ['a'] },
  correctCount: 1,
  totalCount: 1,
  score: 100,
  passed: true,
  domainBreakdown: [{ domain: 'Data Protection', correct: 1, total: 1 }],
}

beforeEach(() => {
  replace.mockClear()
  getCurrentAttempt.mockReset()
})

describe('ResultsPage', () => {
  it('renders the score summary, domain breakdown, and review for the current attempt', async () => {
    getCurrentAttempt.mockReturnValue(attempt)
    render(<ResultsPage />)
    expect(await screen.findByText('100%')).toBeInTheDocument()
    expect(screen.getByText('1 of 1 correct')).toBeInTheDocument()
    expect(screen.getByText('Question one?')).toBeInTheDocument()
  })

  it('redirects home when there is no current attempt', async () => {
    getCurrentAttempt.mockReturnValue(null)
    render(<ResultsPage />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'))
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/results/page`
Expected: FAIL — `src/app/results/page.tsx` does not exist.

- [ ] **Step 3: Implement the page**

Create `src/app/results/page.tsx`:

```tsx
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- app/results/page`
Expected: PASS, both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/results/page.tsx src/app/results/page.test.tsx
git commit -m "feat: add results page with score, domain breakdown, and review"
```

---

### Task 16: History Page

**Files:**
- Create: `src/app/history/page.tsx`
- Test: `src/app/history/page.test.tsx`

**Interfaces:**
- Consumes: `getAttempts` from `src/lib/history.ts` (Task 4)
- Produces: the `/history` route

- [ ] **Step 1: Write the failing tests**

Create `src/app/history/page.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import HistoryPage from './page'
import type { HistoryEntry } from '@/types/quiz'

const getAttempts = vi.fn()

vi.mock('@/lib/history', () => ({
  getAttempts: () => getAttempts(),
}))

beforeEach(() => {
  getAttempts.mockReset()
})

describe('HistoryPage', () => {
  it('shows a message when there are no past attempts', () => {
    getAttempts.mockReturnValue([])
    render(<HistoryPage />)
    expect(screen.getByText('No past attempts yet.')).toBeInTheDocument()
  })

  it('lists past attempts with mode, score, and pass/fail for exam mode', () => {
    const entries: HistoryEntry[] = [
      {
        id: 'a1',
        mode: 'exam',
        completedAt: '2026-01-01T00:00:00.000Z',
        correctCount: 50,
        totalCount: 65,
        score: 77,
        passed: true,
        domainBreakdown: [],
      },
    ]
    getAttempts.mockReturnValue(entries)
    render(<HistoryPage />)
    expect(screen.getByText('77%')).toBeInTheDocument()
    expect(screen.getByText('PASS')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- app/history/page`
Expected: FAIL — `src/app/history/page.tsx` does not exist.

- [ ] **Step 3: Implement the page**

Create `src/app/history/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { getAttempts } from '@/lib/history'
import type { HistoryEntry } from '@/types/quiz'

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setAttempts(getAttempts())
  }, [])

  if (attempts.length === 0) {
    return <p className="text-slate-600">No past attempts yet.</p>
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Past Attempts</h1>
      <ul className="space-y-2">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium capitalize">{attempt.mode}</p>
              <p className="text-sm text-slate-500">{new Date(attempt.completedAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{attempt.score}%</p>
              {attempt.mode === 'exam' && (
                <p className={attempt.passed ? 'text-green-600' : 'text-red-600'}>
                  {attempt.passed ? 'PASS' : 'FAIL'}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- app/history/page`
Expected: PASS, both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/history/page.tsx src/app/history/page.test.tsx
git commit -m "feat: add history page listing past attempts from localStorage"
```

---

### Task 17: Full Test Suite, Build, and Manual QA

**Files:** none created — verification only

**Interfaces:**
- Consumes: the entire app built in Tasks 1–16
- Produces: confidence the app is production-ready

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`
Expected: every test file from Tasks 1–16 passes (scoring, shuffle, history, currentAttempt, useQuizAnswers, questions data integrity, all components, all pages).

- [ ] **Step 2: Typecheck and lint the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Verify the production build succeeds**

Run: `npm run build`
Expected: build completes with no errors; all 6 routes (`/`, `/exam`, `/practice`, `/results`, `/history`, plus Next's internal ones) are listed in the build output.

- [ ] **Step 4: Manual QA in a browser**

Run: `npm run dev`, then open `http://localhost:3000`. If a browser-automation tool (e.g. the `claude-in-chrome` skill) is available, use it; otherwise ask the user to walk through this checklist and report back:

- Home page shows both mode cards and a History link.
- Practice Mode: set up with a small question count and one domain, answer a question, confirm instant feedback (correct/incorrect + explanation) appears, finish the set, land on `/results` with a score, domain breakdown, and full review.
- History page now shows the practice attempt just completed.
- Timed Exam: start it, confirm the countdown timer is visible and ticking down, answer a few questions, navigate Previous/Next, submit early, land on `/results` with a pass/fail badge.
- History page now shows both attempts, most recent first.
- Resize the browser to a mobile width and confirm the layout doesn't overflow horizontally.

Stop and fix any issue found before proceeding to deployment.

- [ ] **Step 5: Commit if any fixes were made during QA**

```bash
git add -A
git commit -m "fix: address issues found during manual QA"
```

(Skip this step if QA found nothing to fix.)

---

### Task 18: Deploy to Vercel

**Files:** none created — deployment only

**Interfaces:**
- Consumes: the completed, QA'd app from Task 17
- Produces: a live Vercel deployment URL

- [ ] **Step 1: Confirm deployment details with the user**

This step creates externally-visible resources (a GitHub repo, a pushed branch, a live Vercel deployment) — pause and confirm with the user before proceeding:
- GitHub repository name and visibility (public/private)
- Whether to deploy via the Vercel CLI (`vercel --prod`, requires `vercel login` first) or via importing the GitHub repo in the Vercel dashboard (vercel.com/new)

- [ ] **Step 2: Push to GitHub**

```bash
gh repo create <repo-name> --<public-or-private> --source=. --remote=origin
git push -u origin main
```

- [ ] **Step 3: Deploy**

Either:

```bash
npx vercel --prod
```

or instruct the user to import the pushed GitHub repo at vercel.com/new — Next.js App Router projects deploy with zero additional configuration.

- [ ] **Step 4: Verify the deployment**

Open the deployment URL Vercel returns and confirm the home page loads, then spot-check `/exam` and `/practice` load without errors.
