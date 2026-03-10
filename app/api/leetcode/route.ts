import { NextRequest, NextResponse } from 'next/server'

const LEETCODE_API = 'https://leetcode.com/graphql'

const USER_QUERY = `
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    githubUrl
    twitterUrl
    linkedinUrl
    profile {
      ranking
      userAvatar
      realName
      aboutMe
      school
      websites
      countryName
      company
      jobTitle
      skillTags
      postViewCount
      postViewCountDiff
      reputation
      reputationDiff
      solutionCount
      categoryDiscussCount
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
    badges {
      id
      displayName
      icon
      creationDate
    }
    upcomingBadges {
      name
      icon
    }
    activeBadge {
      id
      displayName
      icon
      creationDate
    }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    totalParticipants
    topPercentage
    badge {
      name
    }
  }
  recentAcSubmissionList(username: $username, limit: 5) {
    id
    title
    titleSlug
    timestamp
    lang
    runtime
    memory
  }
}
`

const CALENDAR_QUERY = `
query userProfileCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears
      streak
      totalActiveDays
      dccBadges {
        timestamp
        badge {
          name
          icon
        }
      }
      submissionCalendar
    }
  }
}
`

async function fetchLeetCode(query: string, variables: Record<string, unknown>) {
  const res = await fetch(LEETCODE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  })
  if (!res.ok) throw new Error(`LeetCode API error: ${res.status}`)
  return res.json()
}

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username')
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    const [profileData, calendarData] = await Promise.all([
      fetchLeetCode(USER_QUERY, { username }),
      fetchLeetCode(CALENDAR_QUERY, { username, year: new Date().getFullYear() }),
    ])

    if (!profileData.data?.matchedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = profileData.data.matchedUser
    const contestRanking = profileData.data.userContestRanking
    const recentSubmissions = profileData.data.recentAcSubmissionList
    const calendar = calendarData.data?.matchedUser?.userCalendar

    // Compute stats
    const acStats = user.submitStats.acSubmissionNum
    const totalStats = user.submitStats.totalSubmissionNum

    const easy = acStats.find((s: { difficulty: string }) => s.difficulty === 'Easy') || { count: 0, submissions: 0 }
    const medium = acStats.find((s: { difficulty: string }) => s.difficulty === 'Medium') || { count: 0, submissions: 0 }
    const hard = acStats.find((s: { difficulty: string }) => s.difficulty === 'Hard') || { count: 0, submissions: 0 }
    const totalAC = acStats.find((s: { difficulty: string }) => s.difficulty === 'All') || { count: 0, submissions: 0 }
    const totalAll = totalStats.find((s: { difficulty: string }) => s.difficulty === 'All') || { count: 0, submissions: 0 }

    const acceptanceRate = totalAll.submissions > 0
      ? Math.round((totalAC.submissions / totalAll.submissions) * 100 * 10) / 10
      : 0

    return NextResponse.json({
      username: user.username,
      profile: {
        ...user.profile,
        githubUrl: user.githubUrl,
        twitterUrl: user.twitterUrl,
        linkedinUrl: user.linkedinUrl,
      },
      stats: {
        totalSolved: totalAC.count,
        totalSubmissions: totalAC.submissions,
        acceptanceRate,
        easy: { solved: easy.count, submissions: easy.submissions },
        medium: { solved: medium.count, submissions: medium.submissions },
        hard: { solved: hard.count, submissions: hard.submissions },
      },
      contest: contestRanking ? {
        rating: Math.round(contestRanking.rating),
        globalRanking: contestRanking.globalRanking,
        totalParticipants: contestRanking.totalParticipants,
        topPercentage: Math.round(contestRanking.topPercentage * 10) / 10,
        attendedContests: contestRanking.attendedContestsCount,
        badge: contestRanking.badge?.name || null,
      } : null,
      calendar: calendar ? {
        streak: calendar.streak,
        totalActiveDays: calendar.totalActiveDays,
        activeYears: calendar.activeYears,
        submissionCalendar: JSON.parse(calendar.submissionCalendar || '{}'),
      } : null,
      badges: user.badges || [],
      activeBadge: user.activeBadge || null,
      recentSubmissions: recentSubmissions || [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
