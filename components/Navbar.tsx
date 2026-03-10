'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'

export default function Navbar() {
  const pathname = usePathname()
  const { users, refreshAll, loading } = useStore()
  const isRefreshing = loading['refreshAll']

  return (
    <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div style={{ background: 'var(--accent)', color: '#000' }}
            className="w-7 h-7 rounded flex items-center justify-center text-sm font-bold font-mono">
            LC
          </div>
          <span className="font-bold tracking-tight text-sm" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            leaderboard
          </span>
        </Link>

        {/* Nav links + refresh button */}
        <div className="flex items-center gap-1">
          <Link href="/"
            className="px-3 py-1.5 rounded text-sm transition-all"
            style={{
              color: pathname === '/' ? 'var(--accent)' : 'var(--muted)',
              background: pathname === '/' ? 'rgba(245,166,35,0.08)' : 'transparent',
            }}>
            Dashboard
          </Link>
          <Link href="/leaderboard"
            className="px-3 py-1.5 rounded text-sm transition-all flex items-center gap-2"
            style={{
              color: pathname === '/leaderboard' ? 'var(--accent)' : 'var(--muted)',
              background: pathname === '/leaderboard' ? 'rgba(245,166,35,0.08)' : 'transparent',
            }}>
            Leaderboard
            {users.length > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: 'var(--border)', color: 'var(--muted)' }}>
                {users.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => refreshAll()}
            disabled={isRefreshing || users.length === 0}
            title="Refresh all users"
            className="px-2 py-1 rounded text-sm transition-all flex items-center"
            style={{
              color: isRefreshing || users.length === 0 ? 'var(--muted)' : 'var(--accent)',
            }}
          >
            {isRefreshing ? (
              <span className="spinner inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              '🔄'
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
