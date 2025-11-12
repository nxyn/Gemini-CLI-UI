import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.loadingContainer}
      >
        <BlurView intensity={80} tint="dark" style={styles.loadingBlur}>
          <ActivityIndicator size="large" color="#14b8a6" />
        </BlurView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="#0f172a" translucent />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerTransparent: true,
            headerBlurEffect: 'dark',
            headerTintColor: '#14b8a6',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#fff',
            },
          }}
        >
          <Stack.Screen
            name="Projects"
            component={ProjectsScreen}
            options={{ title: 'Gemini Projects' }}
          />
          <Stack.Screen
            name="ProjectDetail"
            component={ProjectDetailScreen}
            options={{ title: 'Project' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: 'Gemini Chat' }}
          />
          <Stack.Screen
            name="Files"
            component={FilesScreen}
            options={{ title: 'Files' }}
          />
          <Stack.Screen
            name="CodeEditor"
            component={CodeEditorScreen}
            options={{ title: 'Code Editor' }}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBlur: {
    padding: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
});