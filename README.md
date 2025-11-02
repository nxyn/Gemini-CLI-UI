# Gemini CLI UI - React Native Web

A cross-platform AI development assistant built with React Native Web and Expo. Deployable to Vercel with free tier services.

## Features

- 🤖 **AI Chat Interface** - Real-time conversations with Google Gemini AI
- 📁 **File Management** - Create, edit, and manage project files
- 🏗️ **Project Organization** - Organize conversations and files by project
- 📱 **Cross-Platform** - Works on web, iOS, and Android
- 🔐 **Secure Authentication** - Built with Supabase Auth
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations
- 💾 **Cloud Storage** - All data stored in Supabase cloud database

## Tech Stack

- **Frontend**: React Native 0.81+ with Expo
- **Navigation**: React Navigation 6+
- **UI Components**: React Native Paper
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API
- **Deployment**: Vercel (Free Tier)

## Quick Start

### Prerequisites

1. **Node.js** 18+ installed
2. **Supabase** account (free tier)
3. **Google Gemini API** key
4. **Vercel** account (free tier)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Gemini-CLI-UI
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your Supabase project dashboard:
   - Go to Settings > Database
   - Run the SQL from `supabase-schema.sql` in the SQL Editor
   - Go to Settings > API and copy your:
     - Project URL
     - `anon` key
     - `service_role` key

### 3. Set Environment Variables

Create a `.env.local` file:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# For Vercel deployment
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Locally

```bash
# Web version
npm run web

# iOS (requires Xcode)
npm run ios

# Android (requires Android Studio or Expo Go)
npm run android
```

### 5. Build Android APK

For creating an Android APK/AAB file:

```bash
# Automated build script (recommended)
./build-android.sh

# Or manual build using EAS
npm install -g eas-cli
eas build --platform android --profile preview
```

📖 **Detailed Instructions**: See [ANDROID_BUILD.md](./ANDROID_BUILD.md) for complete Android build guide.

### 6. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Database Schema

The app uses these main tables:

- `profiles` - User profiles (linked to Supabase Auth)
- `projects` - User projects
- `sessions` - Chat sessions within projects
- `messages` - Individual chat messages
- `files` - Project files and code

## API Endpoints

- `POST /api/chat` - Send messages to Gemini AI
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `GET /api/files` - List project files
- `POST /api/files` - Create new file

## Free Tier Limits

### Vercel (Free Plan)
- 100GB bandwidth per month
- 100,000 function invocations per month
- Unlimited projects

### Supabase (Free Plan)
- 500MB database storage
- 50MB file storage
- 50,000 monthly active users
- 1GB bandwidth

### Google Gemini API
- Free tier available (limited requests per minute)
- Pay-per-use after free tier limits

## Development

### Project Structure

```
src/
├── screens/           # React Native screens
│   ├── LoginScreen.tsx
│   ├── ProjectsScreen.tsx
│   ├── ChatScreen.tsx
│   └── ...
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── utils/            # Utility functions
│   └── supabase.ts
└── components/       # Reusable components

api/                  # Vercel serverless functions
├── chat/
│   └── index.js
├── projects/
│   └── index.js
└── files/
    └── index.js
```

### Styling

The app uses React Native StyleSheet objects instead of Tailwind CSS for better React Native compatibility.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **Supabase Connection Errors**
   - Verify your environment variables are correct
   - Check that your Supabase project is active
   - Ensure RLS policies are set up correctly

2. **Gemini API Errors**
   - Verify your API key is valid
   - Check if you've exceeded rate limits
   - Ensure the API is enabled in Google Cloud Console

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear Expo cache: `expo start -c`
   - Check for conflicting package versions

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Join our Discord community (link coming soon)

---

Built with ❤️ using React Native, Expo, and Supabase