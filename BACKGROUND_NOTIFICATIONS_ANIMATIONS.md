# Background Notifications & UI Animations Implementation

This document outlines the implementation of background task notifications and UI animations for Chloro Code.

## Overview

The implementation includes:
1. **Background Task Service** - Keeps the app running in background during Gemini tasks
2. **Notification Service** - Shows notifications for task progress, completion, and errors
3. **UI Animations** - Enhanced user experience with smooth animations throughout the app

---

## Features Implemented

### 1. Background Tasks

The app now supports background execution of Gemini AI tasks to prevent the app from being killed by the system while processing requests.

#### Key Components:
- `src/services/backgroundTaskService.ts` - Manages background task lifecycle
- Uses Expo's `expo-task-manager` and `expo-background-fetch`
- Registers background fetch task that runs every 5 minutes
- Tracks active tasks in AsyncStorage
- Prevents app termination during long-running AI operations

#### Configuration:
```json
// app.json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["fetch", "remote-notification"]
    }
  },
  "android": {
    "permissions": [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.WAKE_LOCK",
      "android.permission.RECEIVE_BOOT_COMPLETED"
    ]
  }
}
```

---

### 2. Notification System

Real-time notifications inform users about the progress of their Gemini AI tasks, even when the app is in the background.

#### Key Components:
- `src/services/notificationService.ts` - Handles all notification operations
- Uses `expo-notifications` package
- Supports both local and push notifications
- Integrates with haptic feedback for better UX

#### Notification Types:
1. **Task Start** - Shows when Gemini begins processing
   - Icon: 🤖
   - Title: "Gemini Task Started"
   - Body: "Working on [task] in [project]"

2. **Task Progress** - Updates during long-running tasks
   - Icon: ⚙️
   - Title: "Task in Progress"
   - Body: Progress details with elapsed time

3. **Task Complete** - Shows when task finishes successfully
   - Icon: ✅
   - Title: "Task Complete"
   - Body: "[task] finished in [project]"
   - Includes success haptic feedback

4. **Task Error** - Shows if task encounters an error
   - Icon: ❌
   - Title: "Task Error"
   - Body: Error details
   - Includes error haptic feedback

#### Android Configuration:
- Notification channel: "gemini-tasks"
- Importance: HIGH
- Color: #00ff88 (Chloro green)
- Vibration pattern: [0, 250, 250, 250]
- Sound: Default notification sound

#### iOS Configuration:
- Background modes enabled for notifications
- Local notification support
- Badge count updates

#### Permissions:
- Android: `POST_NOTIFICATIONS` (API 33+)
- iOS: User notification permission requested on app launch

---

### 3. Enhanced Gemini API Integration

The Gemini API service has been updated to support background execution with notifications.

#### Changes to `src/services/geminiApi.ts`:
- Added `SendMessageOptions` interface for configuration
- New parameters:
  - `enableNotifications` (default: true) - Show notifications
  - `enableBackground` (default: true) - Enable background execution
  - `projectName` - For contextual notifications
- Automatic notification triggers:
  - Start notification when request begins
  - Completion notification when response is received
  - Error notification on failures
- Background task registration and tracking

#### Usage Example:
```typescript
const stream = await geminiApi.sendMessage(
  projectId,
  sessionId,
  message,
  images,
  {
    enableNotifications: true,
    enableBackground: true,
    projectName: 'My Project',
  }
);
```

---

### 4. UI Animations

The app now features smooth, professional animations throughout the interface.

#### New Animation Components:

1. **FadeInView** (`src/components/animated/FadeInView.tsx`)
   - Animates opacity from 0 to 1
   - Optional directional slide: top, bottom, left, right, or none
   - Configurable duration and delay
   - Uses spring physics for natural movement

2. **ScaleInView** (`src/components/animated/ScaleInView.tsx`)
   - Scales from initial size to full size
   - Supports springy or timing-based animation
   - Configurable initial scale and duration
   - Perfect for cards and modals

3. **PressableScale** (`src/components/animated/PressableScale.tsx`)
   - Interactive component that scales down on press
   - Includes haptic feedback
   - Spring-based release animation
   - Configurable scale value

#### Animation Usage:

**Projects Screen:**
- Header fades in from top
- "New Project" button fades in from bottom
- Project cards fade in sequentially (staggered delays)
- Empty state scales in
- Modal scales in with bounce effect

**Chat Screen:**
- Messages fade in from left (assistant) or right (user)
- Each message has a slight delay for smooth appearance
- Natural conversation flow

**General:**
- All list items animate on first render
- Modals scale in smoothly
- Buttons have press feedback

#### Configuration:
```typescript
// Example: Fade in from bottom with delay
<FadeInView from="bottom" delay={100}>
  <YourComponent />
</FadeInView>

// Example: Scale in with custom settings
<ScaleInView initialScale={0.8} springy={true}>
  <YourComponent />
</ScaleInView>

// Example: Pressable with scale effect
<PressableScale scaleValue={0.95} hapticFeedback={true}>
  <YourComponent />
</PressableScale>
```

---

## Installation & Setup

### Dependencies Added:
```json
{
  "expo-notifications": "latest",
  "expo-task-manager": "latest",
  "expo-background-fetch": "latest"
}
```

### Installation Command:
```bash
npm install expo-notifications expo-task-manager expo-background-fetch
```

### App Configuration:
The `app.json` has been updated with:
- Notification permissions for Android and iOS
- Background mode configurations
- Notification plugin with Chloro branding
- Proper Android notification channels

---

## Initialization

All services are automatically initialized in `App.tsx`:

```typescript
// Initialize notification service
const notificationInitialized = await notificationService.initialize();

// Initialize background task service
const backgroundInitialized = await backgroundTaskService.initialize();
```

The app will log whether notifications and background tasks are enabled.

---

## User Experience Improvements

### Before:
- No feedback when app is in background
- Tasks could be killed by the system
- Static, instant UI transitions
- No haptic feedback during interactions

### After:
- Real-time notifications for task progress
- Background execution prevents task interruption
- Smooth, professional animations throughout
- Haptic feedback on all interactions
- Better visual hierarchy with staggered animations
- More engaging and polished user experience

---

## Technical Details

### Performance:
- Animations use `react-native-reanimated` for 60fps performance
- Runs on the UI thread (not JavaScript thread)
- Minimal battery impact from background fetch (5-minute intervals)
- Efficient notification delivery

### Battery Optimization:
- Background fetch only runs every 5 minutes (iOS minimum)
- Tasks are removed from queue when completed
- Smart notification scheduling
- No constant polling or wake locks

### Privacy & Permissions:
- Notification permissions requested on first launch
- User can disable notifications in system settings
- No data sent to external servers
- All processing happens locally

---

## Testing

### To Test Notifications:
1. Launch the app and grant notification permissions
2. Send a message to Gemini in any project
3. Press home button to background the app
4. You should receive:
   - Start notification immediately
   - Progress notifications (for long tasks)
   - Completion notification when done

### To Test Background Execution:
1. Start a Gemini task
2. Background the app
3. Wait for the task to complete
4. The task should finish even while backgrounded
5. Check notification center for updates

### To Test Animations:
1. Navigate through different screens
2. Create a new project (watch modal animation)
3. Open a chat (watch messages fade in)
4. Press buttons and cards (feel the haptic feedback)

---

## Future Enhancements

Possible improvements:
1. **Progress Bar** in notifications for long tasks
2. **Custom Notification Sounds** for different event types
3. **Rich Notifications** with inline actions (Reply, Cancel)
4. **Widget Support** for iOS 14+ with task status
5. **More Animation Presets** (rotation, slide, etc.)
6. **Animation Preferences** in settings to reduce motion
7. **Background Upload/Download** for large files
8. **Siri Shortcuts** for quick task access

---

## Troubleshooting

### Notifications Not Showing:
1. Check notification permissions in device settings
2. Ensure app is properly initialized
3. Check console logs for errors
4. Verify Android notification channel is created

### Background Tasks Not Running:
1. Background fetch must be enabled in settings
2. iOS requires at least 5-minute intervals
3. Check battery optimization settings on Android
4. Verify app.json configuration

### Animations Not Smooth:
1. Ensure `react-native-reanimated` is properly installed
2. Check for JavaScript thread blocking
3. Reduce animation complexity if needed
4. Test on a physical device (not simulator)

---

## Code Structure

```
src/
├── services/
│   ├── notificationService.ts      # Notification management
│   ├── backgroundTaskService.ts    # Background task handling
│   └── geminiApi.ts               # Updated with notification support
│
├── components/
│   └── animated/
│       ├── AnimatedBackground.tsx  # Existing gradient animation
│       ├── GlowingGreenAccent.tsx # Existing glow effect
│       ├── FadeInView.tsx         # NEW: Fade in animation
│       ├── ScaleInView.tsx        # NEW: Scale in animation
│       ├── PressableScale.tsx     # NEW: Interactive press animation
│       └── index.ts               # Export all animations
│
└── screens/
    ├── ChatScreen.tsx             # Updated with notifications & animations
    └── ProjectsScreen.tsx         # Updated with animations
```

---

## Credits

Implementation by: Tembo AI Agent
Date: 2025-11-13
Branch: `tembo/background-notifs-animations`

Built with:
- React Native 0.76
- Expo 52
- TypeScript 5.3
- react-native-reanimated 3.16
- expo-notifications
- expo-task-manager
- expo-background-fetch
