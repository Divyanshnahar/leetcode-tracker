# 🏆 LeetCode Leaderboard — with Neon DB

A Next.js app to track and compare LeetCode progress, backed by **Neon Postgres** for cross-device persistence.

## Stack
- **Next.js 14** (App Router)
- **Neon** — serverless Postgres
- **Drizzle ORM** — type-safe SQL
- **LeetCode GraphQL API** — live stats

## Setup

### 1. Create a Neon database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your **Connection string** from the dashboard

### 2. Configure environment
```bash
cp .env.local.example .env.local
# Paste your Neon connection string as DATABASE_URL
```

### 3. Initialize the database schema
Option A — Neon SQL Editor: paste the contents of `drizzle/init.sql`

Option B — Drizzle Kit:
```bash
npm install
npm run db:push
```

### 4. Run
```bash
npm run dev
```

## Architecture
```
Browser → GET  /api/users         → Neon DB (list all)
Browser → POST /api/users         → LeetCode GQL → Neon DB (upsert)
Browser → DELETE /api/users/:u    → Neon DB (delete row)
Browser → PATCH  /api/users/:u    → LeetCode GQL → Neon DB (refresh)
```

## Scoring Formula
**Score = Easy×1 + Medium×3 + Hard×7**
