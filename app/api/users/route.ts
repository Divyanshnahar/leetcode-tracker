import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { LeetCodeUser } from '@/lib/types'

// helper: invoke LeetCode fetch endpoint and parse result
async function fetchFromLeetCode(username: string, origin: string): Promise<LeetCodeUser> {
  const lcRes = await fetch(
    `${origin}/api/leetcode?username=${encodeURIComponent(username.trim())}`
  )
  const lcData = await lcRes.json()
  if (!lcRes.ok) throw new Error(lcData.error || 'leetcode fetch failed')
  return lcData as LeetCodeUser
}

// helper: insert / update a LeetCodeUser in the DB and return the row
async function upsertUserData(u: LeetCodeUser) {
  const [row] = await db
    .insert(users)
    .values({
      username: u.username,
      updatedAt: new Date(),

      realName: u.profile.realName || null,
      userAvatar: u.profile.userAvatar || null,
      countryName: u.profile.countryName || null,
      company: u.profile.company || null,
      jobTitle: u.profile.jobTitle || null,
      school: u.profile.school || null,
      aboutMe: u.profile.aboutMe || null,
      githubUrl: u.profile.githubUrl || null,
      twitterUrl: u.profile.twitterUrl || null,
      linkedinUrl: u.profile.linkedinUrl || null,
      websites: u.profile.websites || [],
      skillTags: u.profile.skillTags || [],
      reputation: u.profile.reputation || 0,
      solutionCount: u.profile.solutionCount || 0,
      globalRanking: u.profile.ranking || null,

      totalSolved: u.stats.totalSolved,
      totalSubmissions: u.stats.totalSubmissions,
      acceptanceRate: u.stats.acceptanceRate,
      easySolved: u.stats.easy.solved,
      easySubmissions: u.stats.easy.submissions,
      mediumSolved: u.stats.medium.solved,
      mediumSubmissions: u.stats.medium.submissions,
      hardSolved: u.stats.hard.solved,
      hardSubmissions: u.stats.hard.submissions,

      contestRating: u.contest?.rating ?? null,
      contestGlobalRanking: u.contest?.globalRanking ?? null,
      contestTotalParticipants: u.contest?.totalParticipants ?? null,
      contestTopPercentage: u.contest?.topPercentage ?? null,
      attendedContests: u.contest?.attendedContests ?? null,
      contestBadge: u.contest?.badge ?? null,

      streak: u.calendar?.streak ?? 0,
      totalActiveDays: u.calendar?.totalActiveDays ?? 0,
      activeYears: u.calendar?.activeYears ?? [],

      badges: u.badges ?? [],
      activeBadge: u.activeBadge ?? null,
      recentSubmissions: u.recentSubmissions ?? [],
    })
    .onConflictDoUpdate({
      target: users.username,
      set: {
        updatedAt: new Date(),
        realName: u.profile.realName || null,
        userAvatar: u.profile.userAvatar || null,
        countryName: u.profile.countryName || null,
        company: u.profile.company || null,
        jobTitle: u.profile.jobTitle || null,
        school: u.profile.school || null,
        githubUrl: u.profile.githubUrl || null,
        twitterUrl: u.profile.twitterUrl || null,
        linkedinUrl: u.profile.linkedinUrl || null,
        websites: u.profile.websites || [],
        skillTags: u.profile.skillTags || [],
        reputation: u.profile.reputation || 0,
        solutionCount: u.profile.solutionCount || 0,
        globalRanking: u.profile.ranking || null,
        totalSolved: u.stats.totalSolved,
        totalSubmissions: u.stats.totalSubmissions,
        acceptanceRate: u.stats.acceptanceRate,
        easySolved: u.stats.easy.solved,
        easySubmissions: u.stats.easy.submissions,
        mediumSolved: u.stats.medium.solved,
        mediumSubmissions: u.stats.medium.submissions,
        hardSolved: u.stats.hard.solved,
        hardSubmissions: u.stats.hard.submissions,
        contestRating: u.contest?.rating ?? null,
        contestGlobalRanking: u.contest?.globalRanking ?? null,
        contestTotalParticipants: u.contest?.totalParticipants ?? null,
        contestTopPercentage: u.contest?.topPercentage ?? null,
        attendedContests: u.contest?.attendedContests ?? null,
        contestBadge: u.contest?.badge ?? null,
        streak: u.calendar?.streak ?? 0,
        totalActiveDays: u.calendar?.totalActiveDays ?? 0,
        activeYears: u.calendar?.activeYears ?? [],
        badges: u.badges ?? [],
        activeBadge: u.activeBadge ?? null,
        recentSubmissions: u.recentSubmissions ?? [],
      },
    })
    .returning()
  return row
}

// GET /api/users — list all users from DB
export async function GET() {
  try {
    const rows = await db.select().from(users).orderBy(desc(users.addedAt))
    return NextResponse.json(rows.map(rowToUser))
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

// POST /api/users — fetch from LeetCode + upsert into DB
export async function POST(request: NextRequest) {
  const { username } = await request.json()
  if (!username?.trim()) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    const u = await fetchFromLeetCode(username, request.nextUrl.origin)
    const row = await upsertUserData(u)
    return NextResponse.json(rowToUser(row))
  } catch (err) {
    console.error(err)
    // could be fetch error or db error
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Database error' }, { status: 500 })
  }
}

// PATCH /api/users — refresh every user in DB
export async function PATCH(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin
    const existing = await db.select().from(users)
    const refreshed: LeetCodeUser[] = []

    for (const row of existing) {
      try {
        const u = await fetchFromLeetCode(row.username, origin)
        const newRow = await upsertUserData(u)
        refreshed.push(rowToUser(newRow))
      } catch (innerErr) {
        console.error('failed to refresh', row.username, innerErr)
        // abort entire batch on first failure
        throw innerErr
      }
    }

    return NextResponse.json(refreshed)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

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
