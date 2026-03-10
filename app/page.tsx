'use client'
import { StoreProvider, useStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import AddUserForm from '@/components/AddUserForm'
import UserCard from '@/components/UserCard'

function Dashboard() {
  const { users, initialLoading } = useStore()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            <span style={{ color: 'var(--accent)' }}>Leetcode</span> Tracker
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Track & compare coding progress — synced across devices via Neon DB
          </p>
        </div>

        {/* Add user form + refresh all button */}
        <div className="mb-8 max-w-xl flex items-start justify-between">
          <AddUserForm />
          {/* refresh button placed beside form on larger screens */}
          <RefreshAllButton />
        </div>

        {/* Loading skeleton */}
        {initialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl h-64 animate-pulse"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }} />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⌨️</div>
            <h3 className="text-lg font-semibold mb-2">No users yet</h3>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Add a LeetCode username above to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <div key={user.username} className="animate-fade-in">
                <UserCard user={user} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// small helper component for refresh button
type RefreshButtonProps = {}

function RefreshAllButton() {
  const { refreshAll, loading, users, error } = useStore()
  const isLoading = loading['refreshAll']

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={() => refreshAll()}
        disabled={isLoading || users.length === 0}
        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
        style={{
          background: isLoading || users.length === 0 ? 'var(--border)' : 'var(--accent)',
          color: isLoading || users.length === 0 ? 'var(--muted)' : '#000',
          cursor: isLoading || users.length === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? (
          <>
            <span className="spinner inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Refreshing...
          </>
        ) : (
          'Refresh all'
        )}
      </button>
      {error['refreshAll'] && (
        <div className="mt-2 text-sm px-3 py-2 rounded-lg"
          style={{ background: 'rgba(232,69,69,0.1)', color: 'var(--accent2)', border: '1px solid rgba(232,69,69,0.2)' }}>
          ⚠ {error['refreshAll']}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  )
}
