# Quick Start Guide 🚀

Get your app running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Vercel account (free)
- Supabase account (free)
- Google Gemini API key (free tier available)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase (5 minutes)

### Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details
4. Wait for setup to complete

### Run Database Migration
1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy contents from `supabase-schema-updated.sql`
4. Paste and click "Run"
5. Verify tables are created (check Database > Tables)

### Get API Keys
1. Go to Settings > API
2. Copy these values:
   - Project URL
   - anon public key
   - service_role key (keep secret!)

## Step 3: Get API Keys (2 minutes)

### Google Gemini
1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create new key
4. Copy the key

### Vercel Blob (after first deploy)
1. Will be created during Vercel setup
2. See Step 5 for details

## Step 4: Configure Environment (1 minute)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Gemini
GEMINI_API_KEY=your_gemini_key_here
```

## Step 5: Deploy to Vercel (3 minutes)

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
vercel --prod
```

### Set Up Blob Storage
1. Go to Vercel dashboard
2. Select your project
3. Go to Storage tab
4. Click "Create Database"
5. Select "Blob"
6. Create store
7. Copy `BLOB_READ_WRITE_TOKEN`

### Add Environment Variables in Vercel
1. Go to Settings > Environment Variables
2. Add all variables from `.env`
3. Add `BLOB_READ_WRITE_TOKEN`
4. Add server-only variables:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=xxx
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```
5. Redeploy: `vercel --prod`

## Step 6: Test Your Deployment

1. Visit your deployed URL (shown after `vercel --prod`)
2. Click "Sign Up" to create account
3. Create a new project using gradient cards
4. Test chat with Gemini
5. Upload a file

## Run Locally

### Web
```bash
npm run web
```
Visit http://localhost:19006

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Success! 🎉

Your app should now be running!
