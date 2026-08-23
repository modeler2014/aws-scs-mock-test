# Visual Redesign — Modern SaaS Look with Dark Mode

Date: 2026-08-23
Status: Approved

## Purpose

The app is functionally complete and deployed, but visually plain (default
Tailwind slate palette, no icons, a leftover font bug that silently falls
back to serif). This redesign gives it a polished, modern-SaaS look with
proper dark mode support, without touching any data, scoring, or storage
logic.

## Approach

Tailwind-only restyle of the existing components and pages. No CSS-in-JS,
no component library (shadcn/ui, Radix) — the current component structure
and its 55 tests query by text/role, not CSS classes, so a pure class-level
restyle is low-risk and doesn't require touching `src/lib`, `src/types`, or
`src/data`. Two new dependencies: `lucide-react` (icons) and `next/font/google`
(Inter — replacing the currently-broken dangling Geist font variables).

## Visual Language

Validated interactively via mockups (three rounds, each with a consistent
winner):

- **Palette:** indigo/violet accent (Tailwind `indigo-600` as primary,
  `violet-500` used in gradients alongside it) on a dark navy header/hero
  band (a custom dark slate/navy token, close to `slate-950`), with
  elevated white (light mode) / dark slate (dark mode) cards on a light
  gray (light mode) / near-black (dark mode) page background.
- **Shape language:** `rounded-2xl` cards, soft shadows (`shadow-lg`-ish,
  tuned lighter), pill-shaped (`rounded-full`) buttons, badges, and
  question-option rows.
- **Question feedback:** each option renders as a pill row; once answered,
  the correct option(s) get a green border + light green fill, the user's
  incorrect pick gets a red border + light red fill + strikethrough text,
  unselected/neutral options stay plain.
- **Results:** an SVG progress ring (colored red/green by pass-fail, or a
  neutral indigo ring in practice mode) for the headline score, and
  gradient (indigo→violet) pill-shaped progress bars for the per-domain
  breakdown.
- **Icons:** `lucide-react`, outline style, indigo-colored. Shield icon for
  the brand mark and exam mode, clock for the timer, check-circle for
  practice mode, a history icon for the history nav item, check/x icons in
  place of the current plain-text "(your answer)" marking in `ReviewList`.
- **Typography:** Inter, loaded via `next/font/google` in `layout.tsx` and
  wired into Tailwind's font-sans token — replacing the current dangling
  `--font-geist-sans`/`--font-geist-mono` CSS variables that have no
  `next/font` backing (a pre-existing, previously-deferred bug that this
  redesign fixes as a side effect).
- **Motion:** subtle Tailwind `transition-colors`/`transition-shadow` on
  hover/active states for buttons and option rows, a fade-in
  (`animate-in`-style opacity/translate transition) when a question's
  feedback appears or a new question renders, and an animated stroke-fill
  transition on the results progress ring on mount.

## Dark Mode

Class-based dark mode via Tailwind's `dark:` variant, driven by a `dark`
class on `<html>` rather than purely by `prefers-color-scheme` (so the
toggle can override the system preference). Tailwind v4 configures
class-based dark mode via a `@custom-variant dark` declaration in
`globals.css` (the v4 replacement for the old `darkMode: 'class'` JS-config
option) — the exact directive syntax gets verified against the installed
Tailwind version at plan-writing time. A theme toggle button (sun/moon
icon) lives in the header, next to the nav links. Behavior:

- On first load with no stored preference, the theme follows
  `prefers-color-scheme` (matching what a user's OS/browser already
  expects).
- Clicking the toggle sets an explicit preference, persisted in
  `localStorage` (a new small client-only module, e.g.
  `src/lib/theme.ts`), and applied by adding/removing a `dark` class on
  `<html>`.
- To avoid a flash of the wrong theme on load, the initial theme class is
  set synchronously before React hydrates (a small inline script in
  `layout.tsx`, reading `localStorage` then falling back to
  `prefers-color-scheme` — the standard no-flash pattern for class-based
  dark mode with SSR).
- Every component's dark-mode colors are defined alongside its light-mode
  colors using Tailwind's `dark:` prefix — no separate dark-mode-only
  files or components.

## Scope: Files Touched

Purely presentational changes, in place, to:

- `src/app/globals.css` — Tailwind theme tokens (color palette, font
  tokens), the `@variant dark` setup, and the no-flash inline theme script
  reference.
- `src/app/layout.tsx` — dark navy header/hero band, nav with icons, theme
  toggle button, Inter font wiring.
- `src/app/page.tsx` — home hero (inside the dark band) + the two mode
  cards below it, restyled per the approved home-page mockup.
- `src/components/QuestionCard.tsx` — pill-shaped options, colored
  feedback pills, icons for correct/incorrect state.
- `src/components/Timer.tsx` — clock icon, refined low-time styling
  (keeps its existing deadline-based logic untouched — visual only).
- `src/components/ScoreSummary.tsx` — SVG progress ring layout.
- `src/components/DomainBreakdown.tsx` — gradient pill progress bars.
- `src/components/ReviewList.tsx` — check/x icons replacing the plain
  "(your answer)" text marker, restyled cards.
- `src/app/exam/page.tsx`, `src/app/practice/page.tsx`,
  `src/app/results/page.tsx`, `src/app/history/page.tsx` — layout/spacing
  updates to match the new card language; no changes to their logic
  (state management, submit flow, storage calls).
- New: `src/lib/theme.ts` (get/set/apply theme preference,
  system-preference fallback) with unit tests.
- New: a small inline no-flash theme script, either as a literal
  `<script>` in `layout.tsx` or a tiny co-located helper — exact shape
  decided at plan-writing time.

No changes to `src/types/quiz.ts`, `src/lib/scoring.ts`, `src/lib/shuffle.ts`,
`src/lib/history.ts`, `src/lib/currentAttempt.ts`, `src/lib/useQuizAnswers.ts`,
or `src/data/questions.ts`.

## Testing

- The existing 55 tests query by text content and ARIA roles (`getByText`,
  `getByLabelText`, `getByRole`), not CSS classes, so they should remain
  green through a pure restyle. Each touched component/page's test file
  gets a pass to confirm this — fix forward immediately if a selector
  turns out to be styling-coupled (e.g. a test that happens to assert on
  an option's exact className) rather than leaving it broken.
- New `src/lib/theme.ts` gets its own unit tests (TDD): reading a stored
  preference, falling back to system preference when none is stored,
  writing a new preference.
- A new component/integration test for the theme toggle button's
  click-to-toggle behavior.
- After implementation: full suite, typecheck, lint, and build, followed
  by a Playwright QA pass (reusing the approach from the original build)
  that explicitly screenshots both light and dark mode across the home,
  practice (with feedback shown), exam, and results pages — dark mode
  must be visually re-verified given the app already shipped one
  dark-mode bug that manual QA missed the first time.

## Out of Scope (YAGNI)

- No component library / design system adoption (shadcn/ui, Radix, MUI).
- No changes to scoring, storage, routing, or question content.
- No additional theme options beyond light/dark (no "system" as a
  separately-selectable third UI state beyond its role as the default —
  the toggle is a two-state light/dark switch, matching how most
  consumer apps present it, with system preference only used to pick the
  *initial* state before the user ever toggles).
- No redesign of the practice-mode setup form's underlying interaction
  model (question count/domain selection) — only its visual styling.
