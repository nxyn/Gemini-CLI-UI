# Chloro Code - Deployment Guide

## Overview

Chloro Code is a modern AI development assistant with a premium liquid glass UI. This guide covers deployment for web (Vercel) and mobile (Expo).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React Native/Web)             │
│  - Home Screen with gradient cards                          │
│  - Project management                                        │
│  - AI chat interface                                         │
│  - File management                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Serverless Functions               │
│  - /api/gemini-sandbox  (Per-user AI sandboxes)            │
│  - /api/files/upload    (File uploads to Blob)             │
│  - /api/projects        (Project CRUD)                      │
│  - /api/chat            (AI chat streaming)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Supabase Database      │  │   Vercel Blob Storage    │
│   - User profiles        │  │   - User files           │
│   - Projects             │  │   - Gemini CLI installs  │
│   - Sessions             │  │   - Project assets       │
│   - Messages             │  │   - User uploads         │
│   - Files metadata       │  │                          │
│   - User sandboxes       │  │                          │
└──────────────────────────┘  └──────────────────────────┘
```

## Key Features

### 1. New UI Design
- Dark gradient background (purple to dark)
- Animated sun/moon icon
- Gradient cards with smooth animations
- Token usage indicator
- Bottom input with paste support

### 2. Per-User Gemini CLI Sandboxes
- Each user gets an isolated Gemini CLI environment
- Automatic installation on first use
- Stored in Vercel Blob storage
- Sandboxed execution per request

### 3. Vercel Blob Storage
- All project files stored in Blob
- Per-user file isolation
- Automatic cleanup
- CDN-backed delivery

### 4. Supabase Integration
- PostgreSQL database with RLS
- User authentication
- Real-time subscriptions
- Row-level security for data isolation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for API)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token

### 3. Set Up Supabase Database

Run the database migration in Supabase SQL Editor:

```bash
# Copy the contents of supabase-schema-updated.sql
# Paste into Supabase SQL Editor
# Run the migration
```

### 4. Run Locally

```bash
# Web
npm run web

# Mobile (iOS)
npm run ios

# Mobile (Android)
npm run android
```

## Deployment

### Deploy to Vercel (Web)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Build Mobile Apps (Expo)

```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

## API Endpoints

### POST /api/gemini-sandbox
Interact with Gemini AI in a per-user sandbox.

**Request:**
```json
{
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "sessionId": "session-uuid",
  "message": "Help me build a landing page"
}
```

**Response:** Server-Sent Events (SSE) stream
```
data: {"content": "I'll help...", "sandboxId": "xxx"}
data: [DONE]
```

### POST /api/files/upload
Upload files to Vercel Blob storage.

**Request:**
```json
{
  "userId": "user-uuid",
  "projectId": "project-uuid",
  "fileName": "index.html",
  "content": "<html>...</html>"
}
```

**Response:**
```json
{
  "success": true,
  "file": { "id": "...", "name": "index.html", ... },
  "blobUrl": "https://...",
  "downloadUrl": "https://..."
}
```

## Database Schema

### Tables
- `profiles` - User profiles
- `projects` - User projects
- `sessions` - Chat sessions
- `messages` - Chat messages
- `files` - Project files
- `user_sandboxes` - Per-user Gemini CLI environments

See `supabase-schema-updated.sql` for full schema.

## Environment Variables

### Frontend (Expo)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Backend (Vercel Functions)
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
GEMINI_API_KEY=xxx
BLOB_READ_WRITE_TOKEN=xxx
```

## UI Components

### New Components
- `GradientCard` - Animated gradient cards
- `SunMoonIcon` - Animated sun/moon icon
- `HomeScreen` - New home screen with target UI design

### Existing Components
- `LiquidGlassCard` - Glass morphism cards
- `LiquidGlassButton` - Glass morphism buttons
- `AnimatedBackground` - Animated gradient background

## Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Clean Install
```bash
npm run clean
```

## Project Structure

```
.
├── api/                          # Vercel serverless functions
│   ├── gemini-sandbox/          # Per-user AI sandboxes
│   ├── files/                   # File operations
│   ├── projects/                # Project CRUD
│   └── chat/                    # Legacy chat endpoint
├── src/
│   ├── components/
│   │   ├── ui/                  # UI components
│   │   │   ├── GradientCard.tsx
│   │   │   └── SunMoonIcon.tsx
│   │   └── liquid/              # Liquid glass components
│   ├── screens/
│   │   ├── HomeScreen.tsx       # New home screen
│   │   └── ...                  # Other screens
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication
│   └── utils/
│       └── supabase.ts          # Supabase client
├── supabase-schema-updated.sql  # Database schema
├── vercel.json                  # Vercel configuration
├── VERCEL_DEPLOYMENT.md         # Vercel deployment guide
└── package.json                 # Dependencies
```

## Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
npm run clean
```

### API Issues
Check Vercel function logs:
```bash
vercel logs
```

### Database Issues
1. Check RLS policies in Supabase
2. Verify environment variables
3. Check API connection in Supabase dashboard

## Support

- Documentation: See `VERCEL_DEPLOYMENT.md`
- Issues: Create a GitHub issue
- Expo Docs: https://docs.expo.dev
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
