import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
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
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
