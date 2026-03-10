'use client'
import { StoreProvider, useStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import { LeetCodeUser, calcScore } from '@/lib/types'
import Link from 'next/link'
import { useState } from 'react'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="rank-1 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">🥇</span>
  if (rank === 2) return <span className="rank-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">🥈</span>
  if (rank === 3) return <span className="rank-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">🥉</span>
  return (
    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 counter"
      style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
      {rank}
    </span>
  )
}

type SortKey = 'score' | 'solved' | 'rating' | 'streak' | 'hard'

function Leaderboard() {
  const { users, initialLoading } = useStore()
  const [sort, setSort] = useState<SortKey>('score')

  const sorted = [...users].sort((a, b) => {
    if (sort === 'score') return calcScore(b) - calcScore(a)
    if (sort === 'solved') return b.stats.totalSolved - a.stats.totalSolved
    if (sort === 'rating') return (b.contest?.rating || 0) - (a.contest?.rating || 0)
    if (sort === 'streak') return (b.calendar?.streak || 0) - (a.calendar?.streak || 0)
    if (sort === 'hard') return b.stats.hard.solved - a.stats.hard.solved
    return 0
  })

  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'score', label: 'Score' },
    { key: 'solved', label: 'Total Solved' },
    { key: 'hard', label: 'Hard Solved' },
    { key: 'rating', label: 'Contest Rating' },
    { key: 'streak', label: 'Streak' },
  ]

  if (initialLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="h-8 w-48 rounded animate-pulse mb-8" style={{ background: 'var(--surface)' }} />
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl mb-2 animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />)}
        </div>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h3 className="text-lg font-semibold mb-2">No users to rank</h3>
          <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Add some LeetCoders from the dashboard first</p>
          <Link href="/" className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--accent)', color: '#000' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const leaderScore = calcScore(sorted[0])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1"><span style={{ color: 'var(--accent)' }}>Rank</span>board</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{users.length} coder{users.length !== 1 ? 's' : ''} competing · synced via Neon DB</p>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Score = Easy×1 + Medium×3 + Hard×7</div>
          </div>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {SORTS.map(s => (
            <button key={s.key} onClick={() => setSort(s.key)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{ background: sort === s.key ? 'var(--accent)' : 'transparent', color: sort === s.key ? '#000' : 'var(--muted)' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="px-5 py-3 text-xs font-semibold grid gap-4"
            style={{ background: 'var(--surface2)', color: 'var(--muted)', gridTemplateColumns: '2rem 1fr 4rem 4rem 4rem 5rem 4rem', borderBottom: '1px solid var(--border)' }}>
            <span>#</span><span>User</span><span className="text-right">Easy</span>
            <span className="text-right">Med</span><span className="text-right">Hard</span>
            <span className="text-right">Rating</span><span className="text-right">Score</span>
          </div>

          {sorted.map((user, idx) => {
            const score = calcScore(user)
            const barWidth = leaderScore > 0 ? (score / leaderScore) * 100 : 0
            return (
              <div key={user.username} className="relative px-5 py-4 transition-all hover:bg-white/[0.02] animate-fade-in"
                style={{ borderBottom: idx < sorted.length - 1 ? '1px solid var(--border)' : 'none', background: idx === 0 ? 'rgba(245,166,35,0.03)' : undefined, animationDelay: `${idx * 0.05}s` }}>
                <div className="absolute left-0 top-0 bottom-0 opacity-5 pointer-events-none" style={{ width: `${barWidth}%`, background: 'var(--accent)' }} />
                <div className="relative grid gap-4 items-center" style={{ gridTemplateColumns: '2rem 1fr 4rem 4rem 4rem 5rem 4rem' }}>
                  <RankBadge rank={idx + 1} />
                  <div className="flex items-center gap-3 min-w-0">
                    {user.profile.userAvatar ? (
                      <img src={user.profile.userAvatar} alt={user.username} className="w-9 h-9 rounded-lg object-cover shrink-0" style={{ border: '1px solid var(--border)' }} />
                    ) : (
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0" style={{ background: 'var(--surface2)', color: 'var(--accent)' }}>
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{user.profile.realName || user.username}</div>
                      <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>@{user.username}</div>
                      {user.calendar && user.calendar.streak > 0 && <div className="text-xs" style={{ color: 'var(--accent)' }}>🔥 {user.calendar.streak}d</div>}
                    </div>
                  </div>
                  <div className="text-right counter text-sm font-bold" style={{ color: 'var(--easy)' }}>{user.stats.easy.solved}</div>
                  <div className="text-right counter text-sm font-bold" style={{ color: 'var(--medium)' }}>{user.stats.medium.solved}</div>
                  <div className="text-right counter text-sm font-bold" style={{ color: 'var(--hard)' }}>{user.stats.hard.solved}</div>
                  <div className="text-right counter text-sm" style={{ color: 'var(--text)' }}>{user.contest?.rating || <span style={{ color: 'var(--muted)' }}>—</span>}</div>
                  <div className="text-right counter text-sm font-bold" style={{ color: 'var(--accent)' }}>{score}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Most Solved', value: Math.max(...users.map(u => u.stats.totalSolved)), user: sorted.find(u => u.stats.totalSolved === Math.max(...users.map(x => x.stats.totalSolved))) },
            { label: 'Highest Rating', value: Math.max(...users.map(u => u.contest?.rating || 0)) || null, user: sorted.find(u => (u.contest?.rating || 0) === Math.max(...users.map(x => x.contest?.rating || 0))) },
            { label: 'Longest Streak', value: Math.max(...users.map(u => u.calendar?.streak || 0)), user: sorted.find(u => (u.calendar?.streak || 0) === Math.max(...users.map(x => x.calendar?.streak || 0))) },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{stat.label}</div>
              <div className="counter text-2xl font-bold mb-0.5" style={{ color: 'var(--accent)' }}>{stat.value || '—'}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{stat.user?.username || ''}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function LeaderboardPage() {
  return <StoreProvider><Leaderboard /></StoreProvider>
}
