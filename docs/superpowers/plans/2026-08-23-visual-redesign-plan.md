# Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing AWS Security Specialty mock-test app (Next.js + Tailwind v4) into a modern-SaaS look — indigo/violet accent, dark navy hero band, rounded/elevated cards, `lucide-react` icons, Inter font, and a proper class-based dark mode with a toggle — without changing any data, scoring, storage, or routing logic.

**Architecture:** Pure presentational restyle. Every existing component and page keeps its exact props/interfaces and existing tests; only JSX structure (where icons are added) and Tailwind classes change. Two new small, independently-testable client-side modules are added: `src/lib/theme.ts` (theme state — get/set/system-preference, no React) and `src/components/ThemeToggle.tsx` (the toggle button, built on top of `theme.ts`).

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, `lucide-react` (new dependency, icons), `next/font/google` (Inter), Vitest + React Testing Library (existing).

## Global Constraints

- No changes to `src/types/quiz.ts`, `src/lib/scoring.ts`, `src/lib/shuffle.ts`,
  `src/lib/history.ts`, `src/lib/currentAttempt.ts`, `src/lib/useQuizAnswers.ts`,
  or `src/data/questions.ts` — this plan is presentational only.
- All 55 pre-existing tests must continue to pass unmodified. The exact
  strings/roles they depend on (verified against the current source before
  writing this plan):
  - `QuestionCard`: the question heading must stay an `<h2>` (relied on by
    `practice/page.domain-filter.test.tsx`'s `getByRole('heading', { level: 2 })`);
    `"Question {n} of {total}"` (no multi suffix when single-answer) must
    remain one element's full text; each option's accessible name (via
    `getByLabelText`) must stay exactly the option's `text`; feedback text
    stays exactly `"Correct"` / `"Incorrect"`.
  - `Timer`: initial/ticking display stays `"MM:SS"` as one element's full
    text (e.g. `"02:05"`, `"170:00"`).
  - `ScoreSummary`: `"{score}%"` and `"{correct} of {total} correct"` each
    stay one element's full text; the pass/fail badge stays exactly
    `"PASS"` / `"FAIL"` in its own element, shown only when `mode === 'exam'`.
  - `DomainBreakdown`: `"{correct}/{total} ({pct}%)"` stays one element's
    full text.
  - `ReviewList`: `"{option.text} (your answer)"` stays one element's full
    merged text for a wrongly-selected option — icons are added *alongside*
    this text (aria-hidden, contributing no accessible name), not in place
    of it, specifically so this assertion needs no change.
  - Buttons keep their exact accessible names: `"Previous"`, `"Next"`,
    `"Submit Exam"`, `"Start Practice"`, `"Check Answer"`, `"Finish"` — any
    icon added to a button must be `aria-hidden="true"` so it doesn't alter
    the computed name.
  - `HistoryPage`: `"No past attempts yet."`, `"{score}%"`, `"PASS"` stay
    exact.
  - `HomePage`: link accessible names are matched via case-insensitive
    regex (`/timed exam simulation/i` etc.), so added icons/extra text are
    tolerated as long as the existing heading text isn't removed.
- New dependency: `lucide-react` (icons) — install via `npm install lucide-react`.
- New dependency: none for fonts — `next/font/google` ships with Next.js already.
- Tailwind v4 dark mode: class-based via `@custom-variant dark (&:where(.dark, .dark *));`
  in `globals.css` (confirmed supported by the installed `tailwindcss@4.3.3`).
- Theme localStorage key: `aws-scs-theme` (matches the existing
  `aws-scs-mock-history` / `aws-scs-current-attempt` naming convention).
  Valid stored values: `"light"` | `"dark"`.

---

### Task 1: `theme.ts` — Theme State Library

**Files:**
- Create: `src/lib/theme.ts`
- Test: `src/lib/theme.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type Theme = 'light' | 'dark'`
  - `getStoredTheme(): Theme | null`
  - `getSystemTheme(): Theme`
  - `setStoredTheme(theme: Theme): void`
  - `resolveInitialTheme(): Theme`
  - `applyTheme(theme: Theme): void`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/theme.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getStoredTheme,
  getSystemTheme,
  setStoredTheme,
  resolveInitialTheme,
  applyTheme,
} from './theme'

function mockMatchMedia(prefersDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('getStoredTheme', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredTheme()).toBeNull()
  })

  it('returns the stored theme when valid', () => {
    window.localStorage.setItem('aws-scs-theme', 'dark')
    expect(getStoredTheme()).toBe('dark')
  })

  it('returns null for a corrupted/invalid stored value', () => {
    window.localStorage.setItem('aws-scs-theme', 'purple')
    expect(getStoredTheme()).toBeNull()
  })
})

describe('getSystemTheme', () => {
  it('returns dark when the system prefers dark', () => {
    mockMatchMedia(true)
    expect(getSystemTheme()).toBe('dark')
  })

  it('returns light when the system does not prefer dark', () => {
    mockMatchMedia(false)
    expect(getSystemTheme()).toBe('light')
  })
})

describe('setStoredTheme', () => {
  it('persists the theme to localStorage', () => {
    setStoredTheme('dark')
    expect(window.localStorage.getItem('aws-scs-theme')).toBe('dark')
  })
})

describe('resolveInitialTheme', () => {
  it('prefers the stored theme over the system preference', () => {
    mockMatchMedia(false)
    window.localStorage.setItem('aws-scs-theme', 'dark')
    expect(resolveInitialTheme()).toBe('dark')
  })

  it('falls back to the system preference when nothing is stored', () => {
    mockMatchMedia(true)
    expect(resolveInitialTheme()).toBe('dark')
  })
})

describe('applyTheme', () => {
  it('adds the dark class to the document root for dark theme', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes the dark class from the document root for light theme', () => {
    document.documentElement.classList.add('dark')
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- theme`
Expected: FAIL — module `./theme` does not exist.

- [ ] **Step 3: Implement the library**

Create `src/lib/theme.ts`:

```ts
const STORAGE_KEY = 'aws-scs-theme'

export type Theme = 'light' | 'dark'

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, theme)
}

export function resolveInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- theme`
Expected: PASS, all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts src/lib/theme.test.ts
git commit -m "feat: add theme state library (stored/system preference, apply)"
```

---

### Task 2: Tailwind Dark Mode, Inter Font, and the No-Flash Theme Script

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: nothing (this task is CSS/config plus the inline bootstrap script; `theme.ts`'s `STORAGE_KEY` value `'aws-scs-theme'` is duplicated here as a literal string, since the inline script runs before any JS module can load — see the comment in the code below)
- Produces: a working `dark:` Tailwind variant driven by a `dark` class on `<html>`, the Inter font applied via Tailwind's `font-sans` token, and no flash-of-wrong-theme on load. Later tasks build the actual header/hero visuals on top of this.

- [ ] **Step 1: Replace `globals.css`**

Replace the contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --font-sans: var(--font-inter);
  --animate-fade-in: fade-in 300ms ease-out;

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

(Registering the keyframes inside `@theme` makes `animate-fade-in` available
as a normal Tailwind utility class — Tailwind v4's `@theme` block supports
nested `@keyframes` alongside an `--animate-*` token that references them,
the v4 equivalent of the old `theme.extend.keyframes`/`theme.extend.animation`
JS-config options. This is used by `QuestionCard`'s feedback panel in Task 6.)

- [ ] **Step 2: Wire up Inter and the no-flash script in `layout.tsx`**

Replace the contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AWS Security Specialty Mock Test',
  description: 'Practice exams for the AWS Certified Security - Specialty (SCS-C02) certification.',
}

// Sets the `dark` class on <html> before React hydrates, so the theme the
// user already chose (or their OS preference, if they never chose one)
// applies on first paint with no flash of the wrong theme. Must run
// synchronously in <head>, so it can't import from '@/lib/theme' — the
// storage key ('aws-scs-theme') is duplicated here and MUST be kept in
// sync with STORAGE_KEY in src/lib/theme.ts if that ever changes.
const noFlashThemeScript = `
(function () {
  try {
    var stored = localStorage.getItem('aws-scs-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
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

(This step keeps the header/nav visually as-is for now — Task 4 gives it the
dark hero band, icons, and theme toggle. This task's only job is making the
`dark:` variant, the Inter font, and the no-flash script actually work.)

- [ ] **Step 3: Verify manually**

Run: `npx tsc --noEmit` — expect clean.
Run: `npm run build` — expect success.
Run: `npm test` — expect all 55 pre-existing tests still passing (no test
directly exercises `globals.css` or the font, so this step is a regression
check, not new coverage).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: wire up Tailwind class-based dark mode, Inter font, no-flash theme script"
```

---

### Task 3: `ThemeToggle` Component

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Test: `src/components/ThemeToggle.test.tsx`

**Interfaces:**
- Consumes: `resolveInitialTheme`, `setStoredTheme`, `applyTheme`, `type Theme` from `src/lib/theme.ts` (Task 1)
- Produces: `ThemeToggle` component (no props) — a button that shows the current theme's icon and switches themes on click

- [ ] **Step 1: Write the failing tests**

Create `src/components/ThemeToggle.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import * as theme from '@/lib/theme'

beforeEach(() => {
  vi.spyOn(theme, 'resolveInitialTheme').mockReturnValue('light')
  vi.spyOn(theme, 'setStoredTheme').mockImplementation(() => {})
  vi.spyOn(theme, 'applyTheme').mockImplementation(() => {})
})

describe('ThemeToggle', () => {
  it('starts labeled for switching to dark mode when the resolved theme is light', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument()
  })

  it('switches to dark mode on click: persists and applies the new theme, flips the label', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }))
    expect(theme.setStoredTheme).toHaveBeenCalledWith('dark')
    expect(theme.applyTheme).toHaveBeenCalledWith('dark')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })

  it('starts labeled for switching to light mode when the resolved theme is dark', () => {
    vi.spyOn(theme, 'resolveInitialTheme').mockReturnValue('dark')
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- ThemeToggle`
Expected: FAIL — module `./ThemeToggle` does not exist.

- [ ] **Step 3: Implement the component**

Create `src/components/ThemeToggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, resolveInitialTheme, setStoredTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // The real initial theme was already applied synchronously by the
    // no-flash script in layout.tsx before React ever mounted; this just
    // brings this component's own state in sync with what's already true.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveInitialTheme())
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setStoredTheme(next)
    applyTheme(next)
  }

  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
    >
      {theme === 'dark' ? <Sun aria-hidden="true" size={18} /> : <Moon aria-hidden="true" size={18} />}
    </button>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- ThemeToggle`
Expected: PASS, all 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/ThemeToggle.test.tsx
git commit -m "feat: add ThemeToggle component"
```

---

### Task 4: Header/Hero Restyle — `layout.tsx`

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` from `src/components/ThemeToggle.tsx` (Task 3)
- Produces: the app-wide dark navy header/nav with icons and the theme toggle wired in

- [ ] **Step 1: Update the header markup**

In `src/app/layout.tsx`, replace the `<header>...</header>` block (leave
everything else — the `<html>`, no-flash script, `<body>` classes, and
`<main>` — exactly as Task 2 left them) with:

```tsx
        <header className="bg-slate-950">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <Shield aria-hidden="true" size={20} className="text-indigo-400" />
              AWS Security Specialty Mock Test
            </Link>
            <div className="flex items-center gap-5 text-sm font-medium text-slate-300">
              <Link href="/practice" className="transition-colors hover:text-white">
                Practice
              </Link>
              <Link href="/exam" className="transition-colors hover:text-white">
                Exam
              </Link>
              <Link href="/history" className="transition-colors hover:text-white">
                History
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </header>
```

Add the two new imports at the top of the file (alongside the existing
`Link` import):

```tsx
import { Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
```

- [ ] **Step 2: Run the home page test to confirm the nav links still resolve correctly**

Run: `npm test -- app/page`
Expected: PASS — `HomePage`'s own test doesn't touch the header, but this
confirms nothing broke at the app-shell level. (There's no dedicated layout
test — per the original plan, `<html>`/`<body>` is awkward to unit test
under jsdom; this is covered by the manual QA task at the end of this plan.)

- [ ] **Step 3: Run the full suite, typecheck, lint, build**

Run: `npm test` — expect all 67 tests passing (55 pre-existing + 9 from
`theme.test.ts` (Task 1) + 3 from `ThemeToggle.test.tsx` (Task 3)).
Run: `npx tsc --noEmit` — expect clean.
Run: `npm run lint` — expect clean.
Run: `npm run build` — expect success.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: restyle header/nav as a dark hero band with icons and theme toggle"
```

---

### Task 5: Home Page Restyle

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: nothing new (uses `next/link`, `lucide-react` icons)
- Produces: the restyled home page — existing test in `src/app/page.test.tsx` must keep passing unmodified

- [ ] **Step 1: Replace the page content**

Replace the contents of `src/app/page.tsx` with:

```tsx
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
```

- [ ] **Step 2: Run the existing test to confirm it still passes**

Run: `npm test -- app/page`
Expected: PASS, unmodified test still green (the icons are `aria-hidden`
and the heading text is untouched, so the regex-based `getByRole('link', ...)`
matchers keep resolving).

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: restyle home page with dark hero band and icon mode cards"
```

---

### Task 6: `QuestionCard` Restyle

**Files:**
- Modify: `src/components/QuestionCard.tsx`

**Interfaces:**
- Consumes: nothing new (uses `lucide-react` icons)
- Produces: restyled pill-shaped options with colored feedback — existing tests in `src/components/QuestionCard.test.tsx` must keep passing unmodified

- [ ] **Step 1: Replace the component**

Replace the contents of `src/components/QuestionCard.tsx` with:

```tsx
'use client'

import { Check, X } from 'lucide-react'
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
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <p className="text-xs font-semibold tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
        Question {questionNumber} of {totalQuestions}
        {isMulti && (
          <span className="ml-2 text-slate-400 normal-case dark:text-slate-500">
            · Select {question.correctAnswers.length}
          </span>
        )}
      </p>
      <h2 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{question.question}</h2>
      <div className="mt-4 flex flex-col gap-2.5">
        {question.options.map((option) => {
          const checked = selectedIds.includes(option.id)
          const isCorrectOption = question.correctAnswers.includes(option.id)
          const showFeedback = feedback !== null
          const isWrongPick = showFeedback && checked && !isCorrectOption
          return (
            <label
              key={option.id}
              className={`flex items-center gap-3 rounded-2xl border-[1.5px] p-3.5 transition-colors ${
                showFeedback && isCorrectOption
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                  : isWrongPick
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/40'
                    : 'border-slate-200 dark:border-slate-700 dark:bg-slate-900/40'
              }`}
            >
              <input
                type={isMulti ? 'checkbox' : 'radio'}
                name={question.id}
                checked={checked}
                disabled={disabled}
                onChange={() => toggleOption(option.id)}
                className="size-4 accent-indigo-600"
              />
              {showFeedback && isCorrectOption && (
                <Check aria-hidden="true" size={16} className="shrink-0 text-green-600 dark:text-green-400" />
              )}
              {isWrongPick && <X aria-hidden="true" size={16} className="shrink-0 text-red-600 dark:text-red-400" />}
              <span
                className={`text-sm ${
                  showFeedback && isCorrectOption
                    ? 'font-medium text-green-800 dark:text-green-300'
                    : isWrongPick
                      ? 'font-medium text-red-800 dark:text-red-300'
                      : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {option.text}
              </span>
            </label>
          )
        })}
      </div>
      {feedback && (
        <div
          className={`mt-4 animate-fade-in rounded-2xl p-3.5 text-sm ${
            feedback.correct
              ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
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

Note: `"Question N of M"` stays bare text directly inside the `<p>`,
matching the original structure. (RTL's `getByText` only matches an
element's own direct child text nodes, not full recursive `textContent` —
so nesting it in a `<span>` would actually have been safe too, since only
the innermost element with direct text-node children matches. Keeping it
flat here is just the simpler, closer-to-original choice, not a
correctness requirement.)

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- QuestionCard`
Expected: PASS, all 4 pre-existing tests green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/components/QuestionCard.tsx
git commit -m "feat: restyle QuestionCard with pill options and icon feedback"
```

---

### Task 7: `Timer` Restyle

**Files:**
- Modify: `src/components/Timer.tsx`

**Interfaces:**
- Consumes: nothing new (uses a `lucide-react` icon)
- Produces: a clock icon added to the timer display — existing tests in `src/components/Timer.test.tsx` must keep passing unmodified. The deadline-based countdown logic itself (already fixed in a prior pass) is untouched.

- [ ] **Step 1: Add the icon**

In `src/components/Timer.tsx`, add the import:

```tsx
import { Clock } from 'lucide-react'
```

Replace only the `return (...)` JSX block (leave every hook/state/effect
above it exactly as-is) with:

```tsx
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-sm font-semibold ${
        isLow
          ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      }`}
    >
      <Clock aria-hidden="true" size={14} />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
```

The `Clock` icon and the `"MM:SS"` text are siblings directly inside the
same `<div>`, and the icon is `aria-hidden` with no text content, so the
`<div>`'s full text is still exactly `"MM:SS"` (e.g. `"02:05"`) — identical
to what `Timer.test.tsx` already asserts.

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- Timer`
Expected: PASS, all 3 pre-existing tests green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/components/Timer.tsx
git commit -m "feat: add clock icon to Timer display"
```

---

### Task 8: `ScoreSummary` Restyle — Progress Ring

**Files:**
- Modify: `src/components/ScoreSummary.tsx`

**Interfaces:**
- Consumes: nothing new (pure SVG + Tailwind, no new dependency)
- Produces: a circular progress ring for the score — existing tests in `src/components/ScoreSummary.test.tsx` must keep passing unmodified

- [ ] **Step 1: Replace the component**

Replace the contents of `src/components/ScoreSummary.tsx` with:

```tsx
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
```

Note: `{attempt.score}%` is now inside an absolutely-positioned `<span>`
overlaying the SVG ring (an HTML overlay, not a native SVG `<text>`
element) — this keeps it a normal, easily-testable text node with the exact
same full text (`"80%"`, `"100%"`, etc.) that the existing test already
asserts. `"{correct} of {total} correct"` and the `"PASS"`/`"FAIL"` badge
are untouched from the original markup.

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- ScoreSummary`
Expected: PASS, all 4 pre-existing tests green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/components/ScoreSummary.tsx
git commit -m "feat: restyle ScoreSummary with an SVG progress ring"
```

---

### Task 9: `DomainBreakdown` Restyle — Gradient Bars

**Files:**
- Modify: `src/components/DomainBreakdown.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: gradient pill progress bars — existing test in `src/components/DomainBreakdown.test.tsx` must keep passing unmodified

- [ ] **Step 1: Replace the component**

Replace the contents of `src/components/DomainBreakdown.tsx` with:

```tsx
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
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
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
```

- [ ] **Step 2: Run the existing test to confirm it still passes**

Run: `npm test -- DomainBreakdown`
Expected: PASS, the 1 pre-existing test green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/components/DomainBreakdown.tsx
git commit -m "feat: restyle DomainBreakdown with gradient progress bars"
```

---

### Task 10: `ReviewList` Restyle

**Files:**
- Modify: `src/components/ReviewList.tsx`

**Interfaces:**
- Consumes: nothing new (uses `lucide-react` icons; still uses `isAnswerCorrect` from `src/lib/scoring.ts`, unchanged)
- Produces: restyled review cards with check/x icons alongside the existing text markers — existing test in `src/components/ReviewList.test.tsx` must keep passing unmodified

- [ ] **Step 1: Replace the component**

Replace the contents of `src/components/ReviewList.tsx` with:

```tsx
import { Check, X } from 'lucide-react'
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
            className={`rounded-2xl bg-white p-5 shadow-sm ring-1 dark:bg-slate-800 ${
              correct ? 'ring-green-300 dark:ring-green-800' : 'ring-red-300 dark:ring-red-800'
            }`}
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {correct ? (
                <Check aria-hidden="true" size={14} className="text-green-600 dark:text-green-400" />
              ) : (
                <X aria-hidden="true" size={14} className="text-red-600 dark:text-red-400" />
              )}
              Question {index + 1}
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{question.question}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {question.options.map((option) => {
                const wasSelected = selected.includes(option.id)
                const isCorrectOption = question.correctAnswers.includes(option.id)
                return (
                  <li
                    key={option.id}
                    className={
                      isCorrectOption
                        ? 'font-semibold text-green-700 dark:text-green-400'
                        : wasSelected
                          ? 'text-red-700 line-through dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-400'
                    }
                  >
                    {option.text}
                    {wasSelected && !isCorrectOption && ' (your answer)'}
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{question.explanation}</p>
          </div>
        )
      })}
    </div>
  )
}
```

Note: per the Global Constraints, the `"{option.text} (your answer)"` text
marker is unchanged from the original — the check/x icon added next to
`"Question {n}"` is the only icon in this component, and it doesn't touch
the option list at all, so the existing test's exact-text assertion needs
no change.

- [ ] **Step 2: Run the existing test to confirm it still passes**

Run: `npm test -- ReviewList`
Expected: PASS, the 1 pre-existing test green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReviewList.tsx
git commit -m "feat: restyle ReviewList with per-question correct/incorrect icons"
```

---

### Task 11: Exam Page Restyle

**Files:**
- Modify: `src/app/exam/page.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: layout/spacing updates only — no changes to state, effects, or the submit flow. Existing tests in `src/app/exam/page.test.tsx` must keep passing unmodified.

- [ ] **Step 1: Update the JSX**

In `src/app/exam/page.tsx`, the component's logic (every hook, `handleSubmit`,
the two `useEffect`s syncing refs, the question-loading effect) stays
exactly as-is. Replace only the `return (...)` block for the loaded state
(the `<p>Loading exam...</p>` early return also stays as-is) with:

```tsx
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
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
          className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Previous
        </button>
        {currentIndex < examQuestions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(examQuestions.length - 1, i + 1))}
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  )
```

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- app/exam/page`
Expected: PASS, all 3 pre-existing tests green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/app/exam/page.tsx
git commit -m "feat: restyle exam page layout"
```

---

### Task 12: Practice Page Restyle

**Files:**
- Modify: `src/app/practice/page.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: layout/spacing updates to both the setup screen and the quiz screen — no changes to state or handlers. Existing tests in `src/app/practice/page.test.tsx` and `src/app/practice/page.domain-filter.test.tsx` must keep passing unmodified.

- [ ] **Step 1: Update the JSX**

In `src/app/practice/page.tsx`, every function (`toggleDomain`,
`startPractice`, `finishPractice`, `handleNext`) and every piece of state
stays exactly as-is. Replace only the two `return (...)` blocks.

Replace the `stage === 'setup'` return block with:

```tsx
  if (stage === 'setup') {
    return (
      <div className="max-w-md space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Practice Mode</h1>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Number of questions</label>
          <select
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
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
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Domains (leave unchecked for all)</p>
          <div className="mt-2 space-y-1.5">
            {DOMAINS.map((domain) => (
              <label key={domain} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain)}
                  onChange={() => toggleDomain(domain)}
                  className="size-4 accent-indigo-600"
                />
                {domain}
              </label>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={startPractice}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Start Practice
        </button>
      </div>
    )
  }
```

Replace the quiz-screen return block (everything after the `question`/
`selectedIds`/`feedback` computation) with:

```tsx
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
            className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
          >
            Check Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            {currentIndex === practiceQuestions.length - 1 ? 'Finish' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
```

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- app/practice/page`
Expected: PASS, all 2 pre-existing test files (`page.test.tsx`,
`page.domain-filter.test.tsx`) green with no changes to either test file.

- [ ] **Step 3: Commit**

```bash
git add src/app/practice/page.tsx
git commit -m "feat: restyle practice page setup and quiz layout"
```

---

### Task 13: Results Page Restyle

**Files:**
- Modify: `src/app/results/page.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: spacing/heading updates only. Existing tests in `src/app/results/page.test.tsx` must keep passing unmodified.

- [ ] **Step 1: Update the JSX**

In `src/app/results/page.tsx`, the `useEffect` and all state stay exactly
as-is. Replace only the `return (...)` block for the loaded state (the
`<p>Loading results...</p>` early return stays as-is) with:

```tsx
  return (
    <div className="space-y-6">
      <ScoreSummary attempt={attempt} />
      <DomainBreakdown domainBreakdown={attempt.domainBreakdown} />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Review</h2>
      <ReviewList questions={attempt.questions} answers={attempt.answers} />
    </div>
  )
```

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- app/results/page`
Expected: PASS, both pre-existing tests green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/app/results/page.tsx
git commit -m "feat: restyle results page heading spacing"
```

---

### Task 14: History Page Restyle

**Files:**
- Modify: `src/app/history/page.tsx`

**Interfaces:**
- Consumes: nothing new (uses `lucide-react` icons)
- Produces: restyled attempt list cards. Existing tests in `src/app/history/page.test.tsx` must keep passing unmodified.

- [ ] **Step 1: Update the JSX**

In `src/app/history/page.tsx`, the `useEffect` and state stay exactly
as-is. Replace only the `return (...)` block for the non-empty state (the
`"No past attempts yet."` early return stays as-is, unchanged text) with:

```tsx
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Past Attempts</h1>
      <ul className="space-y-2">
        {attempts.map((attempt) => (
          <li
            key={attempt.id}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
          >
            <div>
              <p className="font-medium text-slate-900 capitalize dark:text-slate-100">{attempt.mode}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date(attempt.completedAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{attempt.score}%</p>
              {attempt.mode === 'exam' && (
                <p
                  className={
                    attempt.passed
                      ? 'text-sm font-medium text-green-600 dark:text-green-400'
                      : 'text-sm font-medium text-red-600 dark:text-red-400'
                  }
                >
                  {attempt.passed ? 'PASS' : 'FAIL'}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
```

- [ ] **Step 2: Run the existing tests to confirm they still pass**

Run: `npm test -- app/history/page`
Expected: PASS, both pre-existing tests green with no changes to the test
file.

- [ ] **Step 3: Commit**

```bash
git add src/app/history/page.tsx
git commit -m "feat: restyle history page attempt list"
```

---

### Task 15: Full Verification, Light/Dark Manual QA, and Redeploy

**Files:** none created — verification and deployment only

**Interfaces:**
- Consumes: the entire redesign from Tasks 1–14
- Produces: confidence the redesign works in both themes, and an updated live deployment

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`
Expected: every test file passes — the 55 pre-existing tests (all
unmodified) plus `theme.test.ts` (9 tests) and `ThemeToggle.test.tsx`
(3 tests) from this plan, so 67 total.

- [ ] **Step 2: Typecheck, lint, and build**

Run: `npx tsc --noEmit` — expect clean.
Run: `npm run lint` — expect clean.
Run: `npm run build` — expect success, all 6 routes still prerendered as
static content.

- [ ] **Step 3: Manual light/dark QA in a browser**

Run `npm run dev`, then use a real browser-automation tool (Playwright, as
used for the original build's QA pass, or the `claude-in-chrome`/
`chromium-cli` tooling if available in this environment) to walk through,
in **both** light and dark mode (toggle the button, or set the OS/browser
color-scheme preference before loading), taking a screenshot at each step:

- Home page: hero band, mode cards, icons all legible in both themes.
- Practice mode: setup form, a question with instant feedback shown
  (correct and incorrect), in both themes.
- Exam mode: the timer visible and readable, free navigation between
  questions, in both themes.
- Results page: the progress ring renders correctly (including its
  center percentage text lining up inside the ring) and the domain
  breakdown bars render, in both themes.
- History page: past attempts list legible, in both themes.
- Confirm no console/page errors in either theme, and no
  flash-of-wrong-theme when reloading a page after the toggle has been
  used (the no-flash script from Task 2 is the thing being validated
  here).

Stop and fix any issue found — this app has shipped one dark-mode
visibility bug already; this step exists specifically to catch a repeat
before it ships again.

- [ ] **Step 4: Commit any fixes found during QA**

```bash
git add -A
git commit -m "fix: address issues found during redesign QA"
```

(Skip this step if QA found nothing to fix.)

Redeployment to the live production site is a separate, controller-level
step after this task is reviewed and merged — not something for this
task's implementer to do. It updates an already-deployed production site,
so it needs explicit user confirmation first (per this project's
established practice of pausing before actions with real external
effects), which only the controller session can obtain — an implementer
subagent has no channel to the user. Once confirmed: `npx vercel --prod`
from the repo root, then spot-check the live URL in both light and dark
mode.
