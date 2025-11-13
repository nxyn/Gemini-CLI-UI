import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

// Import screens
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import ChatScreen from './src/screens/ChatScreen';
import FilesScreen from './src/screens/FilesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CodeEditorScreen from './src/screens/CodeEditorScreen';

// Import services
import { geminiStorage } from './src/services/geminiStorage';
import { geminiApi } from './src/services/geminiApi';

// Import components
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AnimatedBackground } from './src/components/animated/AnimatedBackground';
import { GlowingGreenAccent } from './src/components/animated/GlowingGreenAccent';

// Import theme
import { Colors, Typography } from './src/constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);

  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      fadeAnim.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      });
      scaleAnim.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [appIsReady]);

  const initializeApp = async () => {
    try {
      // Initialize storage and API services
      await geminiStorage.initialize();
      await geminiApi.initialize();

      // Simulate minimum loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('App initialized successfully');
      setAppIsReady(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setAppIsReady(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedBackground />
        <View style={styles.loadingContent}>
          <GlowingGreenAccent size={100} intensity="high" speed="fast" />
          <Text style={styles.loadingText}>Chloro Code</Text>
          <Text style={styles.loadingSubtext}>Premium AI Development Assistant</Text>
          <ActivityIndicator size="large" color={Colors.chloro.primary} style={styles.loader} />
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Animated.View style={[styles.container, animatedStyle]} onLayout={onLayoutRootView}>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: Colors.chloro.primary,
                background: Colors.background.primary,
                card: Colors.background.tertiary,
                text: Colors.text.primary,
                border: Colors.ui.border,
                notification: Colors.chloro.primary,
              },
              fonts: {
                regular: {
                  fontFamily: 'System',
                  fontWeight: '400' as const,
                },
                medium: {
                  fontFamily: 'System',
                  fontWeight: '500' as const,
                },
                bold: {
                  fontFamily: 'System',
                  fontWeight: '700' as const,
                },
                heavy: {
                  fontFamily: 'System',
                  fontWeight: '800' as const,
                },
              },
            }}
          >
            <StatusBar style="light" backgroundColor={Colors.background.primary} translucent />
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: Colors.background.secondary,
                },
                headerTransparent: true,
                headerBlurEffect: 'dark',
                headerTintColor: Colors.chloro.primary,
                headerTitleStyle: {
                  fontWeight: Typography.fontWeight.bold,
                  color: Colors.text.primary,
                  fontSize: Typography.fontSize.xl,
                },
                headerShadowVisible: false,
                contentStyle: {
                  backgroundColor: Colors.background.primary,
                },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="Projects"
                component={ProjectsScreen}
                options={{ title: 'Chloro Code' }}
              />
              <Stack.Screen
                name="ProjectDetail"
                component={ProjectDetailScreen}
                options={{ title: 'Project' }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: 'Chat' }}
              />
              <Stack.Screen
                name="Files"
                component={FilesScreen}
                options={{ title: 'Files' }}
              />
              <Stack.Screen
                name="CodeEditor"
                component={CodeEditorScreen}
                options={{ title: 'Editor' }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Animated.View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.massive,
    fontWeight: Typography.fontWeight.heavy,
    marginTop: 24,
    letterSpacing: -1,
  },
  loadingSubtext: {
    color: Colors.chloro.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    marginTop: -8,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 24,
  },
});