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

- Node.js (v18+)
- npm or yarn
- Environment variables (see `.env.example`)

### Installation

```bash
npm install
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_AIRTABLE_API_KEY=your_api_key_here
VITE_ADMIN_PASSWORD=your_secure_password_here
```

## Architecture

### Key Directories

- `src/pages/` - Main pages (Login, WorldMap, Lesson, Course, Admin)
- `src/components/` - Reusable components (QuizEngine, VideoPlayer, Header)
- `src/services/` - API/auth services (Airtable, Auth)
- `src/data/` - Course data and seed content

### Data Flow

1. **Authentication**: Editors log in with email; email is looked up in Airtable Players table
2. **Course Data**: Worlds, lessons, and quizzes stored in `courseData.js` (seeded to localStorage)
3. **Progress Sync**: Quiz results synced to Airtable `AdLingo Progress` field
4. **Admin Management**: Course structure can be edited via Admin portal (password-protected)

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

## API Integration

### Airtable Service

The app integrates with Airtable for:
- Player lookup by email
- Progress persistence
- Rank/tier updates
- Leaderboard data

All API calls include error handling and logging via `console.error()`.

## Security Notes

- Admin password and Airtable API key are environment variables (never hardcoded)
- Email input is sanitized to prevent Airtable formula injection
- Admin session is stored in sessionStorage (scoped to session)

## See Also

- `PRD.md` - Product requirements and vision
- `AssetAssignments.md` - Asset ownership and credits
