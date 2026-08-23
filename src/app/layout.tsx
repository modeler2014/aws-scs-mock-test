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
