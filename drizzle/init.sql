-- Run this in your Neon SQL editor to initialize the database

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Profile
  real_name TEXT,
  user_avatar TEXT,
  country_name TEXT,
  company TEXT,
  job_title TEXT,
  school TEXT,
  about_me TEXT,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  websites JSONB,
  skill_tags JSONB,
  reputation INTEGER,
  solution_count INTEGER,
  global_ranking INTEGER,

  -- Stats
  total_solved INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  acceptance_rate REAL DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  easy_submissions INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  medium_submissions INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  hard_submissions INTEGER DEFAULT 0,

  -- Contest
  contest_rating INTEGER,
  contest_global_ranking INTEGER,
  contest_total_participants INTEGER,
  contest_top_percentage REAL,
  attended_contests INTEGER,
  contest_badge TEXT,

  -- Calendar
  streak INTEGER DEFAULT 0,
  total_active_days INTEGER DEFAULT 0,
  active_years JSONB,

  -- JSON blobs
  badges JSONB,
  active_badge JSONB,
  recent_submissions JSONB
);
