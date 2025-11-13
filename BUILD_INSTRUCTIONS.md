# Chloro Code - Build Instructions

## 🚀 Building Android Release

### Prerequisites

1. **Expo Account**: Sign up at https://expo.dev
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   ```
3. **Login to EAS**:
   ```bash
   eas login
   ```

### Build Commands

#### 1. Configure EAS Project (First Time Only)
```bash
eas build:configure
```

#### 2. Build Android APK (For Testing)
```bash
eas build --platform android --profile production
```

This will:
- Build an APK file
- Can be installed directly on Android devices
- Download link provided after build completes

#### 3. Build Android App Bundle (For Google Play Store)
```bash
eas build --platform android --profile production-aab
```

This will:
- Build an AAB file
- Required for Google Play Store submission
- Optimized for distribution

#### 4. Build Preview APK (Internal Testing)
```bash
eas build --platform android --profile preview
```

This will:
- Build quickly for internal testing
- Internal distribution only

### Alternative: Local Build (Without EAS)

If you prefer to build locally without EAS:

#### Setup Local Android Environment

1. **Install Android Studio**: Download from https://developer.android.com/studio
2. **Install Android SDK**: Through Android Studio SDK Manager
3. **Set Environment Variables**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

#### Generate Android Project
```bash
npx expo prebuild --platform android
```

#### Build APK with Gradle
```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

#### Build AAB with Gradle
```bash
cd android
./gradlew bundleRelease
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## 📦 Build Profiles

### Development
- **Purpose**: Development with hot reload
- **Distribution**: Internal
- **Command**: `eas build --platform android --profile development`

### Preview
- **Purpose**: Internal testing
- **Distribution**: Internal
- **Format**: APK
- **Command**: `eas build --platform android --profile preview`

### Production
- **Purpose**: Public release
- **Distribution**: Store or manual
- **Format**: APK
- **Command**: `eas build --platform android --profile production`

### Production AAB
- **Purpose**: Google Play Store submission
- **Distribution**: Google Play Store
- **Format**: AAB
- **Command**: `eas build --platform android --profile production-aab`

## 🔐 Code Signing

### Generate Keystore (For Local Builds)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore chloro-code.keystore -alias chloro-code-key -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Gradle Signing (android/app/build.gradle)

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('chloro-code.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD")
            keyAlias 'chloro-code-key'
            keyPassword System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

### Set Environment Variables Before Building

```bash
export KEYSTORE_PASSWORD="your-keystore-password"
export KEY_PASSWORD="your-key-password"
```

## 🧪 Testing the Build

### Install APK on Device

1. **Enable USB Debugging** on Android device
2. **Connect device** via USB
3. **Install APK**:
   ```bash
   adb install path/to/chloro-code.apk
   ```

### Install via QR Code (EAS Builds)

After EAS build completes:
1. Scan QR code with Android device
2. Download and install APK
3. Grant installation permissions if needed

## 📊 Build Size Optimization

The app is optimized with:
- ✅ Hermes engine for faster startup
- ✅ AMOLED backgrounds for smaller assets
- ✅ Tree-shaking enabled
- ✅ Minification enabled in production
- ✅ ProGuard/R8 enabled for Android

## 🐛 Troubleshooting

### Build Fails with "Expo SDK Mismatch"
```bash
npx expo install --fix
```

### Build Fails with "Dependency Issues"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Fails with "Gradle Error"
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### Build Succeeds but App Crashes
- Check logs: `adb logcat`
- Verify all dependencies are installed
- Check app.json configuration

## 📱 Testing on Emulator

### Start Android Emulator
```bash
npx expo start --android
```

This will:
1. Start Metro bundler
2. Launch Android emulator (if installed)
3. Install and run the app

## 🚢 Publishing to Google Play Store

### 1. Create Google Play Developer Account
- Visit https://play.google.com/console
- Pay one-time $25 fee

### 2. Create App Listing
- Fill in app details
- Upload screenshots
- Write description
- Set pricing (Free)

### 3. Upload AAB
```bash
eas build --platform android --profile production-aab
```

Download the AAB and upload to Play Console

### 4. Submit for Review
- Complete all required sections
- Submit for review
- Wait for approval (usually 1-3 days)

## ✅ Pre-Release Checklist

- [ ] Test on multiple Android devices/versions
- [ ] Test all features (projects, chat, files, editor)
- [ ] Test dark mode appearance
- [ ] Test AMOLED backgrounds (check on OLED device)
- [ ] Test animations and transitions
- [ ] Test file permissions
- [ ] Test offline functionality
- [ ] Verify green accent colors throughout
- [ ] Test haptic feedback
- [ ] Update version code in app.json
- [ ] Update changelog
- [ ] Create release notes

## 🎯 Recommended Build Strategy

For first release:

1. **Build Preview APK** for internal testing:
   ```bash
   eas build --platform android --profile preview
   ```

2. **Test thoroughly** on multiple devices

3. **Build Production AAB** for Play Store:
   ```bash
   eas build --platform android --profile production-aab
   ```

4. **Submit to Google Play** in alpha/beta track first

5. **Gradual rollout** to 100% of users

## 📞 Support

If you encounter issues:
- Check Expo documentation: https://docs.expo.dev
- Check EAS Build docs: https://docs.expo.dev/build/introduction/
- Expo Discord: https://discord.gg/expo
- GitHub Issues: [Your repo issues page]

---

**Built with ❤️ using Expo SDK 52 and React Native 0.76**
