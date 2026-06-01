# AdLingo - Editor Training Platform

A Duolingo-style training platform for video editors built with React, Vite, and Tailwind CSS.

## Overview

AdLingo gamifies Direct Response Video Editing training to standardize quality and track performance. The platform features:

- **World-based Curriculum**: Organized into themed worlds with progressive lessons
- **Quiz-based Learning**: Interactive quizzes after each lesson with progress tracking
- **Player Progress Tracking**: XP, streaks, completion rates stored in Airtable
- **Admin Portal**: Manage courses, worlds, lessons, and monitor player progress
- **Role-based Access**: Editor login via email, admin access via password

## Development Setup

### Prerequisites

- Node.js (v20.6+) — required for `--env-file` flag
- npm
- Environment variables (see `.env.example`)

### Installation

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev:all        # Vite (5173) + Express proxy (3001), both with hot reload
```

### Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev:all` | **Recommended.** Runs Vite + the API proxy together with shared logs. |
| `npm run dev` | Vite only (frontend on :5173). `/api/*` calls will 502 until the proxy is up. |
| `npm run server` | Proxy only (Express on :3001, `--watch` for hot reload). |
| `npm run build` | Production build to `dist/`. |
| `npm run start` | Production run (Render etc.) — serves `dist/` plus `/api/*`, reads env vars from the environment (no `.env` file). Run `npm run build` first. |
| `npm run start:local` | Same as `start` but loads secrets from a local `.env` (for testing the prod build on your machine). |
| `npm run lint` | ESLint across frontend + `server/`. |
| `npm run preview` | Vite preview of the build (frontend only — pair with `npm run server` for API). |

### Environment variables

Create `.env` based on `.env.example`:

```
AIRTABLE_API_KEY=...        # Personal Access Token, data read+write
ADMIN_PASSWORD=...          # admin portal password (server-side check)
```

**Server-side only.** Neither variable is bundled into the client — they're consumed by `server/index.js`. The proxy holds the Airtable PAT and exposes a thin `/api` surface to the browser.

## Architecture

### Request flow

```
browser ──► Vite (:5173)  ──/api/*──►  Express proxy (:3001)  ──►  Airtable
        ◄── static SPA   ◄──JSON────                          ◄── records
```

In development, Vite's `server.proxy` forwards `/api/*` to `http://localhost:3001`. In production, run `npm run build` followed by `npm run start`; the Express server serves the built SPA from `dist/` and handles `/api/*` on the same port.

### Proxy responsibilities (`server/index.js`)

- Holds the Airtable PAT (never shipped to the browser)
- Token-bucket-limits outbound Airtable calls to 4 req/s (Airtable's ceiling is 5)
- Honors `Retry-After` on 429
- Caches `getAllPlayers` for 30 s (admin refreshes are free)
- Coalesces per-player progress writes (500 ms debounce — many quick saves → one PATCH)
- Issues short-lived bearer tokens for admin endpoints
- Per-IP rate cap (120 rpm) as defense in depth
- Serves the built SPA from `../dist` (production)

### Key directories

- `server/` - Express API proxy (Airtable, admin auth, rate limiting)
- `src/pages/` - Main pages (Login, WorldMap, Course, Lesson, Admin)
- `src/components/` - Reusable components (QuizEngine, VideoPlayer, Header)
- `src/services/` - Frontend API client + auth wrapper (talks to `/api/*`)
- `src/data/` - Course + discipline seed data
- `scripts/disciplines/` - One-off scripts (e.g., `build-videos.sh` for stitched MP4s)
- `public/disciplines/` - Self-hosted MP4s (gitignored; rebuild via the script)
- `docs/superpowers/` - Specs and implementation plans

### Data flow

1. **Auth (editor)**: email → `/api/me` → server filters Players table by Email → returns the record.
2. **Auth (admin)**: password → `/api/admin/login` → server returns a bearer token stored in `sessionStorage`. Token is sent on `/api/admin/*` calls and expires in 24 h.
3. **Course data**: seeded into `localStorage` from `src/data/courseData.js`; editable via Admin portal.
4. **Progress sync**: quiz completion → `/api/progress` → server debounces 500 ms → single PATCH to Airtable.

## Key Features

### World System

Worlds represent curriculum sections with lessons that unlock progressively. Each world has:

- Theme colors and styling
- Unlock dependencies (e.g., World 2 unlocks after World 1 completion)
- Multiple lessons with embedded videos and quizzes

### Video Support

Supports embedded videos from:
- Tella (tella.tv, tella.video)
- Loom (loom.com)
- YouTube
- Vimeo

### Progress Tracking

- Tracks completed lessons and quiz scores per player
- Calculates XP (10 per correct answer), streaks, and completion percentages
- Syncs to Airtable for admin visibility

## API endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | none | Liveness probe (`{ ok: true }`). |
| `GET` | `/api/me?email=` | none | Look up a player by email. |
| `POST` | `/api/progress` | none | Save player progress (debounced + coalesced). |
| `POST` | `/api/admin/login` | none | Exchange password for a bearer token. |
| `GET` | `/api/admin/players` | bearer | List all players (cached 30 s). |
| `PATCH` | `/api/admin/rank` | bearer | Update a player's rank. |

## Security notes

- Airtable PAT and admin password live in `.env`, read **only** by `server/index.js`. Neither is bundled into the browser.
- Email input is escaped before being interpolated into Airtable `filterByFormula`.
- Admin bearer tokens are kept in `sessionStorage` (cleared on tab close) and validated server-side per request.
- A per-IP rate limit (120 rpm) sits in front of all `/api/*` calls as defense in depth.

## See Also

- `PRD.md` - Product requirements and vision
- `AssetAssignments.md` - Asset ownership and credits
