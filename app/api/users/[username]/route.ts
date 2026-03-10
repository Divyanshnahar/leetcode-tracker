import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
// import { rowToUser } from '../route'
import { LeetCodeUser } from '@/lib/types'

function rowToUser(row: typeof users.$inferSelect): LeetCodeUser {
  return {
    username: row.username,
    addedAt: row.addedAt.getTime(),
    profile: {
      ranking: row.globalRanking ?? 0,
      userAvatar: row.userAvatar ?? '',
      realName: row.realName ?? '',
      aboutMe: row.aboutMe ?? '',
      school: row.school ?? '',
      websites: (row.websites as string[]) ?? [],
      countryName: row.countryName ?? '',
      company: row.company ?? '',
      jobTitle: row.jobTitle ?? '',
      skillTags: (row.skillTags as string[]) ?? [],
      reputation: row.reputation ?? 0,
      solutionCount: row.solutionCount ?? 0,
      githubUrl: row.githubUrl ?? '',
      twitterUrl: row.twitterUrl ?? '',
      linkedinUrl: row.linkedinUrl ?? '',
    },
    stats: {
      totalSolved: row.totalSolved ?? 0,
      totalSubmissions: row.totalSubmissions ?? 0,
      acceptanceRate: row.acceptanceRate ?? 0,
      easy: { solved: row.easySolved ?? 0, submissions: row.easySubmissions ?? 0 },
      medium: { solved: row.mediumSolved ?? 0, submissions: row.mediumSubmissions ?? 0 },
      hard: { solved: row.hardSolved ?? 0, submissions: row.hardSubmissions ?? 0 },
    },
    contest: row.contestRating ? {
      rating: row.contestRating,
      globalRanking: row.contestGlobalRanking ?? 0,
      totalParticipants: row.contestTotalParticipants ?? 0,
      topPercentage: row.contestTopPercentage ?? 0,
      attendedContests: row.attendedContests ?? 0,
      badge: row.contestBadge,
    } : null,
    calendar: {
      streak: row.streak ?? 0,
      totalActiveDays: row.totalActiveDays ?? 0,
      activeYears: (row.activeYears as number[]) ?? [],
      submissionCalendar: {},
    },
    badges: (row.badges as LeetCodeUser['badges']) ?? [],
    activeBadge: (row.activeBadge as LeetCodeUser['activeBadge']) ?? null,
    recentSubmissions: (row.recentSubmissions as LeetCodeUser['recentSubmissions']) ?? [],
  }
}

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
