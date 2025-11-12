# Gemini Mobile - Liquid Glass Design

A beautiful Expo-based mobile application for interacting with Google Gemini AI, featuring a stunning liquid glass design and direct mobile storage access for file editing.

## 🌟 Features

- 🌈 **Liquid Glass Design**: Beautiful glassmorphic UI with blur effects and gradients
- 💾 **Direct File System Access**: No sandbox limitations - edit files directly in mobile storage
- 🤖 **Gemini AI Integration**: Full-featured chat interface with streaming responses
- 🖼️ **Image Support**: Upload and send images to Gemini
- 💻 **Code Editor**: Syntax-highlighted mobile code editor
- 📁 **Project Management**: Create and manage multiple Gemini projects
- 📝 **Session History**: Store and retrieve conversation history
- 📳 **Haptic Feedback**: Tactile responses for better UX

## 🎨 Design System

### Liquid Glass Components
- Frosted glass cards with blur effects
- Smooth gradient backgrounds
- Animated interactions with haptic feedback
- Responsive layouts optimized for mobile

### Colors
- **Primary**: Teal (#14b8a6)
- **Secondary**: Blue (#3b82f6)
- **Background Gradient**: Slate (#0f172a → #1e293b → #334155)
- **Danger**: Red (#ef4444)

## 📱 Tech Stack

- **Frontend**: React Native 0.74+ with **Expo 51**
- **Navigation**: React Navigation 6+
- **UI Effects**: Expo Blur, Linear Gradient
- **Storage**: Expo FileSystem + AsyncStorage
- **JavaScript Engine**: Hermes (improved performance)
- **AI Integration**: Google Gemini API (Direct REST API)
- **Markdown**: React Native Markdown Display
- **Syntax Highlighting**: React Native Syntax Highlighter

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode 14+ and iOS 13+ device or simulator
- Android: Android Studio with SDK 23+ or Android device
- **Google Gemini API Key** - Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd gemini-cli-ui
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on your device**
- **iOS**: Press `i` or scan QR code with Camera app
- **Android**: Press `a` or scan QR code with Expo Go app

### First Launch Setup

When you first launch the app:

1. Navigate to **Settings** (gear icon on Projects screen)
2. Enter your **Gemini API Key**
3. Optionally change the model (default: gemini-2.5-flash)
4. Return to Projects and create your first project!

## 📦 Building for Production

### Android

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
npm run build:android
```

### iOS

```bash
# Build for iOS
npm run build:ios
```

The builds will be managed by Expo Application Services (EAS) and you'll receive download links when complete.

## 🏗️ Architecture

### Storage System

The app uses **Expo FileSystem** for direct file access without sandbox restrictions:

```
{DocumentDirectory}/gemini/
├── projects/
│   ├── project_1234567890/
│   │   ├── sessions/
│   │   │   ├── session_1234567890.json
│   │   │   └── session_1234567891.json
│   │   └── files/
│   │       ├── index.js
│   │       └── README.md
│   └── project_1234567891/
│       └── ...
```

**Key Benefits:**
- ✅ Direct file system access
- ✅ No sandbox limitations
- ✅ Persistent storage across app restarts
- ✅ Works offline after initial setup

### API Communication

The app communicates directly with Gemini API using streaming:

```typescript
// Example: Sending a message
const stream = await geminiApi.sendMessage(
  projectId,
  sessionId,
  'Hello Gemini!',
  optionalImages
);

for await (const chunk of stream) {
  // Display streamed response in real-time
  console.log(chunk);
}
```

## 🛠️ Development

### Project Structure

```
├── App.tsx                      # Main app entry with initialization
├── index.ts                     # Expo entry point
├── package.json                 # Dependencies
├── app.json                     # Expo configuration
├── src/
│   ├── components/
│   │   └── liquid/             # Liquid glass components
│   │       ├── LiquidGlassView.tsx
│   │       ├── LiquidGlassButton.tsx
│   │       ├── LiquidGlassCard.tsx
│   │       └── LiquidGlassInput.tsx
│   ├── screens/                # App screens
│   │   ├── ProjectsScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   ├── CodeEditorScreen.tsx
│   │   ├── FilesScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/               # Business logic
│   │   ├── geminiStorage.ts   # Storage service
│   │   └── geminiApi.ts       # API service
│   └── contexts/              # React contexts (if needed)
```

### Using Liquid Glass Components

```tsx
import { LiquidGlassCard, LiquidGlassButton } from '../components/liquid';

<LiquidGlassCard pressable onPress={handlePress}>
  <Text>Beautiful glass effect!</Text>
</LiquidGlassCard>

<LiquidGlassButton
  onPress={handleAction}
  title="Click Me"
  variant="primary"
  hapticFeedback
/>
```

### Storage API Examples

```typescript
// Create a project
const project = await geminiStorage.createProject('My Project');

// Create a session
const session = await geminiStorage.createSession(projectId, 'Chat 1');

// Add a message
await geminiStorage.addMessage(projectId, sessionId, {
  role: 'user',
  content: 'Hello Gemini!',
  images: ['data:image/jpeg;base64,...'],
});

// Read/Write files
const content = await geminiStorage.readFile(filePath);
await geminiStorage.writeFile(filePath, newContent);
```

## 🐛 Troubleshooting

### App Won't Start

- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo: `npm install expo@latest`

### Storage Issues

- Check file system permissions in app.json
- Verify DocumentDirectory is accessible
- On Android: Ensure MANAGE_EXTERNAL_STORAGE permission is granted

### Gemini API Errors

- **401 Unauthorized**: Check your API key in Settings
- **429 Too Many Requests**: You've exceeded rate limits, wait and try again
- **Network Error**: Check internet connection

### Build Failures

- Ensure EAS CLI is installed: `npm install -g eas-cli`
- Login to Expo: `eas login`
- Check your Expo account has build credits
- Verify app.json configuration is correct

### Image Upload Issues

- Ensure image picker permissions are granted
- Check image file size (max recommended: 5MB)
- Verify base64 encoding is correct

## 💡 Tips & Best Practices

- **Performance**: Test on physical devices for best performance
- **Storage**: Files persist in app's document directory across updates
- **API Keys**: Never commit API keys - store in AsyncStorage only
- **Offline**: App works offline for viewing stored data
- **Haptics**: Disable in settings if battery life is a concern

## 🔒 Security Notes

- API keys are stored securely in AsyncStorage
- No backend server required - direct Gemini API communication
- All data stored locally on device
- Consider adding biometric authentication for production use

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Google Gemini API for AI capabilities
- Expo team for amazing development tools
- React Native community for components

## 🔗 Useful Links

- [Expo Documentation](https://docs.expo.dev/)
- [Gemini API Docs](https://ai.google.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native](https://reactnative.dev/)

---

**Built with ❤️ using Expo and React Native**

_Liquid glass design inspired by modern mobile UI trends_