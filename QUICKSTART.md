# Quick Start Guide - Gemini Mobile

Get up and running with Gemini Mobile in 5 minutes!

## Prerequisites

- Node.js 18+ installed ([Download](https://nodejs.org/))
- A smartphone (iOS or Android) OR an emulator
- Google Gemini API key ([Get one free](https://makersuite.google.com/app/apikey))

## Step 1: Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

## Step 2: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd gemini-cli-ui

# Install dependencies
npm install
```

## Step 3: Start the Development Server

```bash
npm start
```

This will open the Expo Developer Tools in your browser.

## Step 4: Run on Your Device

### Option A: Physical Device (Recommended)

#### iOS:
1. Install **Expo Go** from the App Store
2. Open the Camera app
3. Scan the QR code from the terminal/browser
4. Expo Go will open automatically

#### Android:
1. Install **Expo Go** from the Play Store
2. Open Expo Go app
3. Tap "Scan QR code"
4. Scan the QR code from the terminal/browser

### Option B: Emulator

#### iOS Simulator:
```bash
# Press 'i' in the terminal, or
npm run ios
```
(Requires Xcode installed on Mac)

#### Android Emulator:
```bash
# Press 'a' in the terminal, or
npm run android
```
(Requires Android Studio with an AVD set up)

## Step 5: Configure Your API Key

1. **App opens** → You'll see the Projects screen
2. Tap the **Settings icon** (⚙️) in the top-right
3. Enter your **Gemini API Key**
4. (Optional) Change the model if desired
5. Tap **Save**
6. Navigate back to Projects

## Step 6: Create Your First Project

1. On the **Projects screen**, tap **"New Project"**
2. Enter a project name (e.g., "My First Project")
3. Tap **"Create"**
4. You'll be taken to the Project Detail screen

## Step 7: Start Chatting with Gemini!

1. Tap **"New Session"** or select an existing session
2. Type a message in the input field
3. (Optional) Tap the 📷 icon to attach an image
4. Tap **"Send"**
5. Watch the response stream in real-time!

## 🎉 You're All Set!

You now have a fully functional Gemini mobile app with:
- ✅ Beautiful liquid glass UI
- ✅ Direct file system storage
- ✅ Image support
- ✅ Streaming AI responses
- ✅ Code editor
- ✅ Haptic feedback

## What's Next?

### Explore Features

1. **Send Images**: Tap the image icon in chat to upload photos
2. **Edit Code**: Navigate to Files → Select a file → Edit
3. **Manage Projects**: Create multiple projects for different tasks
4. **View History**: All conversations are saved automatically

### Customize

1. **Change AI Model**: Settings → Select different Gemini model
2. **Adjust Settings**: More options available in Settings screen

### Build Production App

When you're ready to build a standalone app:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
npm run build:android

# Build for iOS
npm run build:ios
```

## Troubleshooting

### App won't load?
```bash
# Clear cache and restart
expo start -c
```

### Module not found errors?
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Can't connect to development server?
- Make sure your phone and computer are on the same WiFi network
- Try using tunnel mode: `expo start --tunnel`

### Gemini API not working?
- Double-check your API key in Settings
- Verify you have internet connection
- Check if you've exceeded API rate limits

## Get Help

- 📖 Read the [Full README](./README.md)
- 🔧 Check [Conversion Summary](./CONVERSION_SUMMARY.md)
- 🐛 [Report an Issue](https://github.com/your-repo/issues)

---

**Happy Coding! 🚀**

The liquid glass design will make your AI interactions beautiful and intuitive!
