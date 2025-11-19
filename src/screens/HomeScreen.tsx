import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientCard } from '../components/ui/GradientCard';
import { SunMoonIcon } from '../components/ui/SunMoonIcon';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [tokenCount, setTokenCount] = useState({ used: 57, total: 2000 });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleCreateProject = async (prompt: string, description: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: prompt,
          description: description,
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to project detail or chat screen
      navigation.navigate('ProjectDetail', { projectId: data.id });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const suggestedPrompts = [
    {
      title: 'Help me to build landing page',
      gradient: ['#8B5CF6', '#6D28D9', '#5B21B6'],
    },
    {
      title: 'Help me to design dashboard',
      gradient: ['#EC4899', '#DB2777', '#BE185D'],
    },
    {
      title: 'Help me to make portfolio site',
      gradient: ['#F97316', '#EA580C', '#DC2626'],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f0f23', '#0a0a0a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.projectButton}>
            <Text style={styles.projectButtonText}>New Project</Text>
            <Text style={styles.projectButtonIcon}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>⬆</Text>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sun/Moon Icon */}
          <View style={styles.iconContainer}>
            <SunMoonIcon size={100} />
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Welcome to the Pond</Text>

          {/* Main Heading */}
          <Text style={styles.heading}>How can I help?</Text>

          {/* Gradient Cards */}
          <View style={styles.cardsContainer}>
            {suggestedPrompts.map((prompt, index) => (
              <GradientCard
                key={index}
                title={prompt.title}
                gradientColors={prompt.gradient}
                onPress={() => handleCreateProject(prompt.title, prompt.title)}
                style={styles.card}
              />
            ))}
          </View>

          {/* Token Counter */}
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenIcon}>⚡</Text>
            <Text style={styles.tokenText}>
              {tokenCount.used}K / {tokenCount.total}M tokens used
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(tokenCount.used / (tokenCount.total * 1000)) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.percentageText}>
              {Math.round((tokenCount.used / (tokenCount.total * 1000)) * 100)}%
            </Text>
          </View>
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="What do you want to see    (Paste images with Ctrl+V)"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={inputValue}
              onChangeText={setInputValue}
              multiline
              onSubmitEditing={() => {
                if (inputValue.trim()) {
                  handleCreateProject(inputValue, inputValue);
                  setInputValue('');
                }
              }}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>🎤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (inputValue.trim()) {
                    handleCreateProject(inputValue, inputValue);
                    setInputValue('');
                  }
                }}
              >
                <Text style={styles.submitIcon}>↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 10,
    paddingBottom: 10,
  },
  projectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  projectButtonIcon: {
    color: '#ffffff',
    fontSize: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  shareIcon: {
    fontSize: 14,
  },
  shareText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 12,
  },
  heading: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  card: {
    // Card styles are handled by GradientCard component
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginTop: 20,
  },
  tokenIcon: {
    fontSize: 14,
  },
  tokenText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 2,
  },
  percentageText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginLeft: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'web' ? 20 : 30,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    color: '#ffffff',
    fontSize: 14,
    minHeight: 40,
    maxHeight: 120,
    paddingRight: 120,
  },
  inputActions: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  submitButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  submitIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
