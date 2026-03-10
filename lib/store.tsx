'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LeetCodeUser } from './types'

interface StoreCtx {
  users: LeetCodeUser[]
  addUser: (username: string) => Promise<void>
  removeUser: (username: string) => Promise<void>
  refreshUser: (username: string) => Promise<void>
  loading: Record<string, boolean>
  error: Record<string, string>
  initialLoading: boolean
}

const Store = createContext<StoreCtx>({} as StoreCtx)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<LeetCodeUser[]>([])
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<Record<string, string>>({})
  const [initialLoading, setInitialLoading] = useState(true)

  // Load all users from Neon DB on mount
  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUsers(data) })
      .catch(() => {})
      .finally(() => setInitialLoading(false))
  }, [])

  const addUser = async (username: string) => {
    const lower = username.toLowerCase().trim()
    if (users.find(u => u.username.toLowerCase() === lower)) {
      setError(e => ({ ...e, add: 'User already added' }))
      return
    }
    setLoading(l => ({ ...l, add: true }))
    setError(e => ({ ...e, add: '' }))
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add')
      setUsers(u => [...u, data])
    } catch (err) {
      setError(e => ({ ...e, add: err instanceof Error ? err.message : 'Error' }))
    } finally {
      setLoading(l => ({ ...l, add: false }))
    }
  }

  const removeUser = async (username: string) => {
    setLoading(l => ({ ...l, [username]: true }))
    try {
      await fetch(`/api/users/${encodeURIComponent(username)}`, { method: 'DELETE' })
      setUsers(u => u.filter(x => x.username !== username))
    } catch {}
    finally { setLoading(l => ({ ...l, [username]: false })) }
  }

  const refreshUser = async (username: string) => {
    setLoading(l => ({ ...l, [username]: true }))
    setError(e => ({ ...e, [username]: '' }))
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(username)}`, { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to refresh')
      setUsers(u => u.map(x => x.username === username ? data : x))
    } catch (err) {
      setError(e => ({ ...e, [username]: err instanceof Error ? err.message : 'Error' }))
    } finally {
      setLoading(l => ({ ...l, [username]: false }))
    }
  }

  return (
    <Store.Provider value={{ users, addUser, removeUser, refreshUser, loading, error, initialLoading }}>
      {children}
    </Store.Provider>
  )
}

export const useStore = () => useContext(Store)
