'use client'
import Image from 'next/image'
import { LeetCodeUser, calcScore } from '@/lib/types'
import { useStore } from '@/lib/store'

const TOTAL_EASY = 843
const TOTAL_MEDIUM = 1766
const TOTAL_HARD = 762

function Bar({ solved, total, color }: { solved: number; total: number; color: string }) {
  const pct = Math.min((solved / total) * 100, 100)
  return (
    <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="counter text-xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
    </div>
  )
}

export default function UserCard({ user }: { user: LeetCodeUser }) {
  const { removeUser, refreshUser, loading } = useStore()
  const isLoading = loading[user.username]
  const score = calcScore(user)

  const formatLang = (lang: string) => {
    const m: Record<string, string> = { cpp: 'C++', python3: 'Python', java: 'Java', javascript: 'JS', typescript: 'TS' }
    return m[lang] || lang
  }

  const formatTime = (ts: string) => {
    const d = new Date(parseInt(ts) * 1000)
    const diff = Date.now() - d.getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  return (
    <div className="card-hover rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="p-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user.profile.userAvatar ? (
                <img src={user.profile.userAvatar} alt={user.username}
                  className="w-11 h-11 rounded-lg object-cover"
                  style={{ border: '2px solid var(--border)' }} />
              ) : (
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{ background: 'var(--surface2)', border: '2px solid var(--border)', color: 'var(--accent)' }}>
                  {user.username[0].toUpperCase()}
                </div>
              )}
              {user.activeBadge && (
                <img src={user.activeBadge.icon} alt={user.activeBadge.displayName}
                  className="absolute -bottom-1 -right-1 w-5 h-5" />
              )}
            </div>
            <div>
              <a href={`https://leetcode.com/${user.username}`} target="_blank" rel="noopener noreferrer"
                className="font-semibold hover:underline" style={{ color: 'var(--text)' }}>
                {user.profile.realName || user.username}
              </a>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>@{user.username}</div>
              {user.profile.countryName && (
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  📍 {user.profile.countryName}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => refreshUser(user.username)} disabled={isLoading}
              className="w-7 h-7 rounded flex items-center justify-center text-xs transition-all hover:opacity-80"
              style={{ background: 'var(--surface2)', color: 'var(--muted)' }}
              title="Refresh">
              <span className={isLoading ? 'spinner inline-block' : ''}>↻</span>
            </button>
            <button onClick={() => removeUser(user.username)}
              className="w-7 h-7 rounded flex items-center justify-center text-xs transition-all hover:opacity-80"
              style={{ background: 'rgba(232,69,69,0.1)', color: 'var(--accent2)' }}
              title="Remove">
              ✕
            </button>
          </div>
        </div>

        {/* Score */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Global Rank</span>
            <span className="counter text-xs font-bold" style={{ color: 'var(--accent)' }}>
              #{user.profile.ranking?.toLocaleString() || '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Score</span>
            <span className="counter text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: 'rgba(245,166,35,0.1)', color: 'var(--accent)' }}>
              {score}
            </span>
          </div>
        </div>
      </div>

      {/* Solved stats */}
      <div className="p-4">
        <div className="flex justify-around mb-4">
          <StatPill label="Easy" value={user.stats.easy.solved} color="var(--easy)" />
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <StatPill label="Medium" value={user.stats.medium.solved} color="var(--medium)" />
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <StatPill label="Hard" value={user.stats.hard.solved} color="var(--hard)" />
        </div>

        {/* Progress bars */}
        <div className="space-y-2">
          <Bar solved={user.stats.easy.solved} total={TOTAL_EASY} color="var(--easy)" />
          <Bar solved={user.stats.medium.solved} total={TOTAL_MEDIUM} color="var(--medium)" />
          <Bar solved={user.stats.hard.solved} total={TOTAL_HARD} color="var(--hard)" />
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            Total: <span className="counter font-bold" style={{ color: 'var(--text)' }}>
              {user.stats.totalSolved}
            </span> solved
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            <span className="counter font-bold" style={{ color: 'var(--text)' }}>
              {user.stats.acceptanceRate}%
            </span> accept rate
          </span>
        </div>
      </div>

      {/* Contest info */}
      {user.contest && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>CONTEST</div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <span className="counter text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  {user.contest.rating}
                </span>
                <span className="text-xs ml-1" style={{ color: 'var(--muted)' }}>rating</span>
              </div>
              <div>
                <span className="counter text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {user.contest.attendedContests}
                </span>
                <span className="text-xs ml-1" style={{ color: 'var(--muted)' }}>contests</span>
              </div>
            </div>
            {user.contest.badge && (
              <span className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(245,166,35,0.1)', color: 'var(--accent)' }}>
                {user.contest.badge}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Streak */}
      {user.calendar && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span className="counter text-sm font-bold" style={{ color: 'var(--accent)' }}>
                {user.calendar.streak}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>day streak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="counter text-sm font-bold" style={{ color: 'var(--text)' }}>
                {user.calendar.totalActiveDays}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>active days</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent submissions */}
      {user.recentSubmissions && user.recentSubmissions.length > 0 && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>RECENT AC</div>
          <div className="space-y-1.5">
            {user.recentSubmissions.slice(0, 3).map(s => (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <a href={`https://leetcode.com/problems/${s.titleSlug}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs truncate hover:underline"
                  style={{ color: 'var(--easy)', maxWidth: '65%' }}>
                  {s.title}
                </a>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs px-1 rounded"
                    style={{ background: 'var(--surface2)', color: 'var(--muted)', fontFamily: 'monospace' }}>
                    {formatLang(s.lang)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {formatTime(s.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
