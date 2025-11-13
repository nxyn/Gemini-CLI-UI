import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

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

// Import theme
import { Colors, Typography } from './src/constants/theme';
import { AnimatedBackground } from './src/components/animated/AnimatedBackground';
import { GlowingGreenAccent } from './src/components/animated/GlowingGreenAccent';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize storage and API services
      await geminiStorage.initialize();
      await geminiApi.initialize();

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedBackground />
        <View style={styles.loadingContent}>
          <GlowingGreenAccent size={80} intensity="high" speed="fast" />
          <Text style={styles.loadingText}>Chloro Code</Text>
          <ActivityIndicator size="large" color={Colors.chloro.primary} style={styles.loader} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  loadingText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.massive,
    fontWeight: Typography.fontWeight.heavy,
    marginTop: 16,
    letterSpacing: -1,
  },
  loader: {
    marginTop: 16,
  },
});