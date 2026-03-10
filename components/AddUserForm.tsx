'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'

export default function AddUserForm() {
  const [input, setInput] = useState('')
  const { addUser, loading, error } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await addUser(input)
    setInput('')
  }

  const isLoading = loading['add']

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="text-lg font-bold mb-1">Add LeetCoder</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        Enter a LeetCode username to track their progress
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. tourist"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
          style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontFamily: 'JetBrains Mono, monospace',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(245,166,35,0.5)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          style={{
            background: isLoading || !input.trim() ? 'var(--border)' : 'var(--accent)',
            color: isLoading || !input.trim() ? 'var(--muted)' : '#000',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
          }}>
          {isLoading ? (
            <>
              <span className="spinner inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Fetching...
            </>
          ) : 'Add User'}
        </button>
      </form>

      {error['add'] && (
        <div className="mt-3 text-sm px-3 py-2 rounded-lg"
          style={{ background: 'rgba(232,69,69,0.1)', color: 'var(--accent2)', border: '1px solid rgba(232,69,69,0.2)' }}>
          ⚠ {error['add']}
        </div>
      )}
    </div>
  )
}
