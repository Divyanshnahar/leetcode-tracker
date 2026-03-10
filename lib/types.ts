export interface UserStats {
  totalSolved: number
  totalSubmissions: number
  acceptanceRate: number
  easy: { solved: number; submissions: number }
  medium: { solved: number; submissions: number }
  hard: { solved: number; submissions: number }
}

export interface ContestInfo {
  rating: number
  globalRanking: number
  totalParticipants: number
  topPercentage: number
  attendedContests: number
  badge: string | null
}

export interface CalendarInfo {
  streak: number
  totalActiveDays: number
  activeYears: number[]
  submissionCalendar: Record<string, number>
}

export interface Badge {
  id: string
  displayName: string
  icon: string
  creationDate: string
}

export interface RecentSubmission {
  id: string
  title: string
  titleSlug: string
  timestamp: string
  lang: string
  runtime: string
  memory: string
}

export interface LeetCodeUser {
  username: string
  profile: {
    ranking: number
    userAvatar: string
    realName: string
    aboutMe: string
    school: string
    websites: string[]
    countryName: string
    company: string
    jobTitle: string
    skillTags: string[]
    reputation: number
    solutionCount: number
    githubUrl: string
    twitterUrl: string
    linkedinUrl: string
  }
  stats: UserStats
  contest: ContestInfo | null
  calendar: CalendarInfo | null
  badges: Badge[]
  activeBadge: Badge | null
  recentSubmissions: RecentSubmission[]
  addedAt: number
}

// Leaderboard scoring
export function calcScore(user: LeetCodeUser): number {
  const s = user.stats
  return (s.easy.solved * 1) + (s.medium.solved * 3) + (s.hard.solved * 7)
}
