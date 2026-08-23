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
