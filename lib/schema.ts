import { pgTable, text, integer, real, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  username: text('username').primaryKey(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Profile
  realName: text('real_name'),
  userAvatar: text('user_avatar'),
  countryName: text('country_name'),
  company: text('company'),
  jobTitle: text('job_title'),
  school: text('school'),
  aboutMe: text('about_me'),
  githubUrl: text('github_url'),
  twitterUrl: text('twitter_url'),
  linkedinUrl: text('linkedin_url'),
  websites: jsonb('websites').$type<string[]>(),
  skillTags: jsonb('skill_tags').$type<string[]>(),
  reputation: integer('reputation'),
  solutionCount: integer('solution_count'),
  globalRanking: integer('global_ranking'),

  // Stats
  totalSolved: integer('total_solved').default(0),
  totalSubmissions: integer('total_submissions').default(0),
  acceptanceRate: real('acceptance_rate').default(0),
  easySolved: integer('easy_solved').default(0),
  easySubmissions: integer('easy_submissions').default(0),
  mediumSolved: integer('medium_solved').default(0),
  mediumSubmissions: integer('medium_submissions').default(0),
  hardSolved: integer('hard_solved').default(0),
  hardSubmissions: integer('hard_submissions').default(0),

  // Contest
  contestRating: integer('contest_rating'),
  contestGlobalRanking: integer('contest_global_ranking'),
  contestTotalParticipants: integer('contest_total_participants'),
  contestTopPercentage: real('contest_top_percentage'),
  attendedContests: integer('attended_contests'),
  contestBadge: text('contest_badge'),

  // Calendar
  streak: integer('streak').default(0),
  totalActiveDays: integer('total_active_days').default(0),
  activeYears: jsonb('active_years').$type<number[]>(),

  // JSON blobs
  badges: jsonb('badges'),
  activeBadge: jsonb('active_badge'),
  recentSubmissions: jsonb('recent_submissions'),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
