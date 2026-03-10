import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LeetCode Leaderboard',
  description: 'Track and compare LeetCode progress with friends',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grid-bg min-h-screen">
        {children}
      </body>
    </html>
  )
}
