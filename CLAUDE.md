# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies (required first time)
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Type-check (tsc) then build to dist/
npm run preview      # Serve the production build locally
```

There are no tests currently. Type-checking runs as part of `npm run build`.

## Deployment

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds and deploys to GitHub Pages. The workflow injects two secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

For local development, copy `.env.example` to `.env.local` and fill in values from your Supabase project dashboard.

## Architecture

**Dual-storage design.** The app works entirely offline using `localStorage`, and optionally syncs to Supabase when credentials are present. `src/lib/supabase.ts` exports `isSupabaseConfigured` (a boolean) and a nullable `supabase` client. All reads/writes go through `src/lib/storage.ts`, which branches on that flag — always writing to `localStorage` first, then upsert to Supabase if available.

**Single context.** `src/contexts/AppContext.tsx` is the only state container. It exposes auth (`user`, sign-in/out methods), progress mutations (`toggleDeliverable`, `updateCounter`, `setCurrentWeek`), and log CRUD (`addLog`, `editLog`, `removeLog`). Every page reads from this context; nothing fetches independently.

**Roadmap data is static TypeScript.** The full 40-week roadmap lives in two files:
- `src/data/phases.ts` — 5 phases with metadata (name, goal, week range, color tokens)
- `src/data/weeks.ts` — all 40 weeks, each with `deliverables[]`, `trackAFocus`, `trackBFocus`, `trackCFocus`, and an optional `schedule[]` (daily Block 1/2/3 breakdown for Weeks 1–15)

Progress state tracks completion by **deliverable ID** (`completedDeliverables: Record<string, boolean>`). IDs are stable strings like `w1-d1`, `w12-d3`. Adding new deliverables to a week is safe as long as IDs are unique and not reused.

**Utility functions** in `src/lib/utils.ts` compute derived values: `overallPercent`, `phasePercent`, `weekCompletionPercent` — all pure functions over `ProgressState`. Use these rather than inline calculations in components.

**Routing** (React Router v6, `basename="/career-roadmap"` set for GitHub Pages):
- `/` → Dashboard
- `/roadmap?phase=<phase-id>` → RoadmapPage (phase tabs + week list)
- `/roadmap/week/:weekId` → WeekDetailPage (schedule table + deliverable checkboxes)
- `/log` → LogPage
- `/share` and `/share/:userId` → SharePage (public profile preview)
- `/auth` → AuthPage (rendered outside `<Layout>`)

## Supabase Schema

Schema is in `supabase/schema.sql`. Two tables: `progress` (one row per user, stores full `ProgressState` as JSONB) and `log_entries` (individual log rows). Both have RLS policies restricting access to the owning user. Run the SQL in your Supabase project's SQL editor to initialize.
