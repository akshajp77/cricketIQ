# CricketIQ — AI Cricket Analytics Platform

A full-stack cricket performance tracker with AI-powered coaching, built with Next.js 14, Prisma, and OpenAI GPT-4o.

## Features

- **Match Tracking** — 5-step form for logging batting, bowling, and fielding stats
- **AI Coach** — GPT-4o powered performance analysis with training plans and match strategies
- **Analytics** — 6 interactive Recharts with date filtering
- **CricketIQ Rating** — Proprietary 0–100 rating engine with breakdown by category
- **Performance Heatmap** — Calendar-style match day visualization
- **Authentication** — NextAuth with Google OAuth and email/password credentials
- **Ball-by-Ball Foundation** — Data model ready for future activation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript strict |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v5 |
| Charts | Recharts |
| AI | OpenAI GPT-4o |

## Quick Start

### 1. Install

```bash
cd cricketiq
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cricketiq"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="from Google Cloud Console (optional)"
GOOGLE_CLIENT_SECRET="from Google Cloud Console (optional)"
OPENAI_API_KEY="sk-... (optional, mock analysis used if absent)"
```

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed with 20 demo matches
npm run db:seed
```

### 4. Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000

**Demo account:** `demo@cricketiq.com` / `password123`

## CricketIQ Rating Formula

```
Batting  (40pts): avg/60*20 + SR/150*10 + consistency*10
Bowling  (35pts): wickets_per_match*5 + economy_score*15 + SR_score*15
Fielding (10pts): (catches + runouts*1.5 + stumpings*2) / matches * 10
Form     (15pts): last5_avg / career_avg * 15 (capped at 15)
Total            Clamped to [0, 100]
```

## API Reference

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard` | Dashboard stats + sparklines |
| GET/POST | `/api/matches` | List / create matches |
| GET/PUT/DELETE | `/api/matches/[id]` | Single match CRUD |
| POST | `/api/matches/[id]/balls` | Ball-by-ball events (foundation) |
| GET | `/api/analytics?last=5\|10\|20\|all` | Charts data |
| GET/POST | `/api/ai-coach` | Analysis history / trigger |
| GET | `/api/rating` | Current rating + history |
| GET/PUT | `/api/profile` | Profile CRUD |

## Deploy to Vercel

1. Push to GitHub and import in Vercel
2. Add all environment variables
3. Use a hosted PostgreSQL (Neon, Supabase, Railway)
4. Run `npx prisma migrate deploy` post-deploy

## Project Structure

```
app/
  (auth)/         — signin, signup, onboarding
  (dashboard)/    — layout, dashboard, matches, analytics, ai-coach, profile, settings
  api/            — all API routes
components/
  ui/             — shadcn primitives
  dashboard/      — StatCard, RatingGauge, Sidebar, Topbar, MobileNav
lib/
  stats.ts        — all stat calculation logic
  rating.ts       — CricketIQ rating engine
  ballAnalysis.ts — ball-by-ball analysis functions (dormant)
prisma/
  schema.prisma   — database schema (9 models)
  seed.ts         — 20 demo matches with realistic trends
```
