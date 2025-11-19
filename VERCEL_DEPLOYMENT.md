# Vercel Deployment Guide

This guide will help you deploy the Chloro Code application to Vercel with Supabase integration and Vercel Blob storage.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A Supabase project (https://supabase.com)
3. A Google Gemini API key (https://ai.google.dev/)
4. Vercel CLI installed: `npm install -g vercel`

## Step 1: Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API
3. Copy the following values:
   - Project URL (e.g., https://xxxxx.supabase.co)
   - anon/public key
   - service_role key (keep this secret!)

4. Run the database migration:
   - Go to SQL Editor in Supabase dashboard
   - Copy the contents of `supabase-schema-updated.sql`
   - Paste and run the SQL

## Step 2: Set Up Vercel Blob Storage

1. Go to your Vercel dashboard
2. Select your project (or create a new one)
3. Go to Storage tab
4. Create a new Blob store
5. Copy the `BLOB_READ_WRITE_TOKEN`

## Step 3: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# For Expo/React Native web build
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## Step 4: Deploy to Vercel

### Option 1: Deploy with Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy with GitHub

1. Push your code to a GitHub repository
2. Import the repository in Vercel dashboard
3. Vercel will automatically detect the build settings
4. Add the environment variables in the Vercel project settings
5. Deploy!

## Step 5: Configure Build Settings

Vercel should automatically detect these settings, but verify:

- **Framework Preset**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## API Endpoints

After deployment, your API endpoints will be available at:

- Chat with Gemini: `https://your-domain.vercel.app/api/gemini-sandbox`
- Upload files: `https://your-domain.vercel.app/api/files/upload`
- Projects API: `https://your-domain.vercel.app/api/projects`
- Files API: `https://your-domain.vercel.app/api/files`

## Features

### Per-User Gemini CLI Sandboxes

Each user gets their own isolated Gemini CLI environment:
- Automatic installation on first use
- Stored in Vercel Blob storage
- Sandboxed execution per user
- Persistent across sessions

### Vercel Blob Storage

All user files are stored in Vercel Blob:
- Project files
- Gemini CLI installations
- User uploads
- Automatic cleanup of old files

### Supabase Integration

- User authentication with Supabase Auth
- Row Level Security (RLS) for data isolation
- Real-time subscriptions (optional)
- Automatic user profile creation

## Testing Your Deployment

1. Visit your deployed URL
2. Create a new account or sign in
3. Create a new project
4. Test the chat functionality with Gemini
5. Upload files and verify they appear in Vercel Blob dashboard
6. Check Supabase dashboard to verify data is being stored

## Monitoring

### Vercel Dashboard
- Monitor function executions
- View logs for API endpoints
- Check Blob storage usage
- Monitor bandwidth and build minutes

### Supabase Dashboard
- Monitor database queries
- Check authentication logs
- View real-time activity
- Monitor API usage

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
npm run clean

# Try building locally first
npm run build:web
```

### API Errors

Check Vercel function logs:
```bash
vercel logs
```

### Database Errors

1. Verify RLS policies are enabled
2. Check that environment variables are set correctly
3. Test API connection in Supabase dashboard

### Blob Storage Errors

1. Verify `BLOB_READ_WRITE_TOKEN` is set
2. Check Blob storage quotas in Vercel dashboard
3. Ensure file sizes are within limits (10MB default)

## Performance Optimization

1. **Edge Functions**: API endpoints run on Vercel Edge Network
2. **Caching**: Static assets are cached at edge locations
3. **Code Splitting**: Automatic code splitting for web builds
4. **Image Optimization**: Use Vercel's image optimization

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use RLS policies** in Supabase for data isolation
3. **Rotate API keys** regularly
4. **Monitor usage** to detect anomalies
5. **Enable rate limiting** on API endpoints

## Costs

### Vercel (Free Tier)
- 100GB bandwidth/month
- 100 hours serverless function execution
- Unlimited Blob storage (with fair use)

### Supabase (Free Tier)
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- 2GB bandwidth

### Google Gemini API
- Pay per token usage
- Check current pricing at https://ai.google.dev/pricing

## Scaling

As your application grows:

1. **Upgrade Vercel plan** for more bandwidth and function execution time
2. **Upgrade Supabase plan** for more database storage and users
3. **Implement caching** for frequently accessed data
4. **Use CDN** for static assets
5. **Enable connection pooling** in Supabase

## Support

For issues or questions:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Expo Docs: https://docs.expo.dev
- GitHub Issues: [your-repo-url]/issues
