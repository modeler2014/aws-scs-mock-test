# AWS Certified Security – Specialty Mock Test Web App

Date: 2026-08-23
Status: Approved

## Purpose

A self-contained web app for practicing for the AWS Certified Security –
Specialty (SCS-C02) exam. No login, no backend, no database — everything
runs client-side and is deployable as a static/serverless app on Vercel.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- No backend, no database — question bank is bundled data; attempt history
  lives in the browser's `localStorage`
- Deployed on Vercel

## Question Bank

- ~65 questions stored in a local TypeScript/JSON data file
  (`src/data/questions.ts`), each with:
  - `id`
  - `domain` — one of the 6 SCS-C02 domains:
    1. Threat Detection and Incident Response
    2. Security Logging and Monitoring
    3. Infrastructure Security
    4. Identity and Access Management
    5. Data Protection
    6. Management and Security Governance
  - `question` text
  - `options` (multiple choice, single-answer to start)
  - `correctAnswer`
  - `explanation` text shown during review/feedback

## Modes

### 1. Timed Exam Simulation (`/exam`)

- 65 questions, randomly drawn/shuffled from the bank
- 170-minute countdown timer, auto-submits when time expires
- No feedback shown during the exam — user can navigate between questions
  and flag/change answers before submitting
- On submit → `/results`: overall score, pass/fail against a 75% threshold,
  per-domain score breakdown, and a full review list with explanations

### 2. Practice Mode (`/practice`)

- Setup screen: choose number of questions and/or filter by domain
  (multi-select or "all domains")
- Untimed
- Instant per-question feedback (correct/incorrect + explanation) shown
  immediately after answering, before moving to the next question
- On completion → `/results` (same shared results screen, minus the
  pass/fail timer framing)

### Shared Results Screen (`/results`)

- Reads the completed attempt from in-memory/session state (not a
  standalone route reachable without an attempt)
- Shows score, per-domain breakdown, and full question-by-question review
  with explanations
- On completion, the attempt (mode, date, score, per-domain breakdown) is
  written to `localStorage`

### History (`/history`)

- Lists past attempts from `localStorage`, most recent first
- Each entry shows mode, date, score, pass/fail (for exam mode)

## Components

- `QuestionCard` — renders a question + options, handles selection
- `Timer` — countdown timer used by exam mode
- `ScoreSummary` — overall score + pass/fail
- `DomainBreakdown` — per-domain score bars/table
- `ReviewList` — full question review with explanations

## Out of Scope (YAGNI)

- User accounts / auth
- Server-side storage of results
- AI-generated questions at runtime
- Multi-answer (select-multiple) questions in v1 — all questions are
  single-answer multiple choice
- Cross-device sync of history

## Deployment

- Git repo initialized locally; pushed to GitHub, then connected to Vercel
  (or deployed via Vercel CLI) — exact mechanism confirmed during
  implementation/deployment step.
