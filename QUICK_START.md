# 🚀 Quick Start Guide - Chloro Code

Get your premium Expo app running in 5 minutes!

## Prerequisites

Make sure you have:
- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Expo CLI (will be installed with dependencies)
- ✅ A mobile device or emulator

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Expo SDK 54
- React Native 0.76
- React Native Reanimated
- All UI components

## Step 2: Start Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Open the Expo DevTools in your browser
- Show a QR code for testing

## Step 3: Run on Device

### Option A: Physical Device
1. Install "Expo Go" app from App Store (iOS) or Play Store (Android)
2. Scan the QR code from your terminal
3. App will load on your device

### Option B: iOS Simulator (Mac only)
```bash
npm run ios
```

### Option C: Android Emulator
```bash
npm run android
```

## Step 4: Experience the Magic ✨

Once the app loads, you'll see:
1. **Premium Splash Screen** with glowing animations
2. **Liquid Glass UI** with blur effects
3. **Smooth Animations** at 60fps
4. **Haptic Feedback** on every interaction

## What to Try

### 1. Create a Project
- Tap "New Project" button
- Feel the haptic feedback
- Watch the modal animate in
- See the shimmer effects

### 2. Explore Animations
- Press any button - feel the scale animation
- Focus on input - watch it glow
- Swipe cards - see gesture animations
- Navigate screens - smooth transitions

### 3. Test Features
- Create multiple projects
- Navigate to project details
- Try the chat interface
- Explore settings

## Development Tips

### Hot Reload
The app supports hot reload. Just save your files and changes appear instantly!

### Debug Menu
- iOS: Shake device or Cmd+D
- Android: Shake device or Cmd+M

### Clear Cache
If you encounter issues:
```bash
npm start -- --clear
```

## Build Commands

### Preview Build (Internal Testing)
```bash
eas build --profile preview --platform android
```

### Production Build
```bash
eas build --profile production --platform android
```

### Production AAB (Play Store)
```bash
eas build --profile production-aab --platform android
```

## Project Structure

```
chloro-code/
├── App.tsx              # Entry point with splash screen
├── src/
│   ├── components/      # Reusable components
│   │   ├── liquid/      # Liquid glass components
│   │   └── animated/    # Animated components
│   ├── screens/         # App screens
│   ├── services/        # API services
│   └── constants/       # Theme and constants
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Environment Setup

### API Keys
Copy the example environment file:
```bash
cp .env.example .env
```

Add your Gemini API key:
```
GEMINI_API_KEY=your_key_here
```

## Common Issues

### Metro Bundler Issues
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### iOS Build Issues
```bash
cd ios
pod install
cd ..
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
```

## VS Code Extensions

Recommended extensions:
- **React Native Tools**
- **ESLint**
- **Prettier**
- **Auto Import**

## Key Features to Notice

### 1. Liquid Glass Components
- Blur effects
- Gradient overlays
- Shimmer animations
- Glow effects

### 2. Animations
- Spring physics
- Scale transformations
- Fade transitions
- Shimmer sweeps

### 3. Haptic Feedback
- Button presses
- Navigation
- Deletions
- Success/Error states

### 4. Error Handling
- Try throwing an error to see the ErrorBoundary
- Beautiful error UI with retry

### 5. Loading States
- Skeleton loaders
- Smooth transitions
- Animated placeholders

## Performance

The app is optimized for:
- ✅ 60fps animations
- ✅ Fast startup (<2s)
- ✅ Smooth scrolling
- ✅ Efficient re-renders

## Resources

- 📚 [Full Documentation](./PRODUCTION_READY.md)
- 🎨 [Design System](./src/constants/theme.ts)
- 🏗️ [Build Guide](./BUILD_INSTRUCTIONS.md)
- 📱 [Expo Docs](https://docs.expo.dev)

## Need Help?

1. Check `PRODUCTION_READY.md` for detailed info
2. Review component source code
3. Check Expo documentation
4. Review React Native Reanimated docs

## What's Next?

After getting familiar with the app:
1. ✅ Customize colors in `src/constants/theme.ts`
2. ✅ Add your own screens
3. ✅ Integrate your backend
4. ✅ Add more features
5. ✅ Build and deploy!

---

**Happy coding! 🎉**

Your app is production-ready and looks amazing!
