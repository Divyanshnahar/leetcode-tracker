import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { rowToUser } from '../route'

// DELETE /api/users/[username]
export async function DELETE(_req: NextRequest, { params }: { params: { username: string } }) {
  try {
    await db.delete(users).where(eq(users.username, params.username))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// PATCH /api/users/[username] — re-fetch from LeetCode and update DB
export async function PATCH(req: NextRequest, { params }: { params: { username: string } }) {
  const origin = req.nextUrl.origin
  const lcRes = await fetch(`${origin}/api/leetcode?username=${encodeURIComponent(params.username)}`)
  const lcData = await lcRes.json()
  if (!lcRes.ok) return NextResponse.json({ error: lcData.error }, { status: lcRes.status })

  // Re-use the POST logic by calling our own POST endpoint
  const postRes = await fetch(`${origin}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: params.username }),
  })
  const postData = await postRes.json()
  return NextResponse.json(postData, { status: postRes.status })
}
