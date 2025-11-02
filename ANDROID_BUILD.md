# Android Build Guide - Gemini CLI UI

This guide explains how to build an Android APK/AAB for the Gemini CLI UI React Native application.

## Prerequisites

1. **Node.js** 18+ installed
2. **Expo CLI** installed globally: `npm install -g @expo/cli`
3. **EAS CLI** installed globally: `npm install -g eas-cli`
4. **Expo Account** - Create account at [expo.dev](https://expo.dev)
5. **Android Studio** (for testing and debugging)
6. **Physical Android device** or **Android Emulator**

## Setup Instructions

### 1. Install Dependencies

```bash
cd Gemini-CLI-UI
npm install
```

### 2. Configure Environment Variables

Create a `.env` file with your configuration:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Login to Expo

```bash
npx expo login
```

Follow the prompts to login to your Expo account.

### 4. Configure EAS Build

The `eas.json` file is already configured for Android builds:

```json
{
  "cli": {
    "version": ">= 9.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## Build Options

### Option 1: Development Build (Easiest)

For testing and development:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Configure EAS (one-time setup)
eas build:configure

# Build development APK
eas build --platform android --profile development
```

### Option 2: Preview Build

For sharing with testers:

```bash
eas build --platform android --profile preview
```

### Option 3: Production Build

For app store release:

```bash
eas build --platform android --profile production
```

### Option 4: Local Development Build

For quick local testing:

```bash
# Start development server
npx expo start

# Install Expo Go app on Android device
# Scan QR code from Expo terminal output
```

## Build Configuration

### Android Requirements

The app requires:
- **Minimum Android Version**: Android 5.0 (API 21)
- **Target Android Version**: Android 13 (API 33)
- **Permissions**:
  - Internet access (for API calls)
  - Network state (for connectivity checks)

### App Configuration

Update `app.json` for Android-specific settings:

```json
{
  "expo": {
    "name": "Gemini CLI UI",
    "slug": "gemini-cli-ui",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      },
      "package": "com.geminicliui.app",
      "versionCode": 1,
      "compileSdkVersion": 33,
      "targetSdkVersion": 33,
      "minSdkVersion": 21
    }
  }
}
```

## Testing the Build

### 1. Install APK on Device

```bash
# After build completes, download the APK
# Install using ADB (for development)
adb install your-app.apk

# Or transfer APK to device and install manually
```

### 2. Test Key Features

- **Authentication**: Login/register with Supabase
- **Project Management**: Create and manage projects
- **Chat Interface**: Send messages to Gemini AI
- **File Management**: Create and edit files
- **Navigation**: Test all screens and navigation

### 3. Debugging

Use Expo's development tools for debugging:

```bash
# Start development server with debug options
npx expo start --dev-client

# View logs
npx expo start --web
```

## Deployment Options

### 1. Google Play Store

For production deployment to Google Play:

1. **Create Google Play Developer Account** ($25 one-time fee)
2. **Generate Signed APK/AAB**: `eas build --platform android --profile production`
3. **Create App Listing**: Fill out app details, screenshots, etc.
4. **Upload Build**: Upload the generated AAB file
5. **Submit for Review**: Wait for Google approval

### 2. Direct Distribution

For direct distribution outside Play Store:

1. **Generate APK**: `eas build --platform android --profile preview`
2. **Enable Unknown Sources**: On Android device settings
3. **Install APK**: Directly install the APK file
4. **Update Mechanism**: Implement in-app update checking

### 3. Alternative App Stores

Deploy to alternative app stores:
- **Amazon Appstore**
- **Samsung Galaxy Store**
- **F-Droid** (if open source compliant)

## Troubleshooting

### Common Build Issues

1. **EAS Build Fails**
   ```bash
   # Clear EAS cache
   eas build --clear-cache

   # Check build logs
   eas build:view
   ```

2. **Metro Bundler Issues**
   ```bash
   # Clear Metro cache
   npx expo start -c

   # Reset node modules
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Android Studio Issues**
   - Ensure Android SDK is properly installed
   - Check ANDROID_HOME environment variable
   - Update Android Studio to latest version

4. **Network Issues**
   - Check firewall settings
   - Verify internet connectivity
   - Try using different network

### Performance Optimization

1. **Bundle Size Optimization**
   - Use `npx expo optimize` to optimize images
   - Implement code splitting for large bundles
   - Compress assets before building

2. **Build Time Optimization**
   - Use EAS build cache
   - Enable parallel builds in EAS configuration
   - Optimize dependency tree

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **Code Obfuscation**: Enable in production builds
3. **Root Detection**: Consider implementing root detection
4. **SSL Pinning**: Implement for API security

## Support

For build-related issues:

1. **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
2. **EAS Build Docs**: [docs.expo.dev/build](https://docs.expo.dev/build)
3. **GitHub Issues**: Report issues in project repository
4. **Community Forums**: Expo Discord and forums

---

## Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your keys

# 3. Login to Expo
npx expo login

# 4. Build APK
eas build --platform android --profile preview

# 5. Test on device
adb install build.apk
```

This will generate an Android APK that can be installed and tested on any Android device.