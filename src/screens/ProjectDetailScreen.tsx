import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../components/animated/AnimatedBackground';
import { GlowingGreenAccent } from '../components/animated/GlowingGreenAccent';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { supabase } from '../utils/supabase';

interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

type RootStackParamList = {
  ProjectDetail: { projectId: string; projectName: string };
  Chat: { projectId: string; sessionId: string };
  Files: { projectId: string; projectName: string };
};

type ProjectDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProjectDetail'>;
type ProjectDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen() {
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const route = useRoute<ProjectDetailScreenRouteProp>();
  const { projectId, projectName } = route.params;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [projectId]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          messages(count)
        `)
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const sessionsWithMessageCount = data.map(session => ({
        ...session,
        message_count: session.messages?.[0]?.count || 0
      }));

      setSessions(sessionsWithMessageCount);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          project_id: projectId,
          title: 'New Chat Session',
        })
        .select()
        .single();

      if (error) throw error;

      navigation.navigate('Chat', {
        projectId,
        sessionId: data.id,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderSession = ({ item }: { item: Session }) => (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() =>
        navigation.navigate('Chat', {
          projectId,
          sessionId: item.id,
        })
      }
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.text.tertiary} />
      </View>
      <Text style={styles.sessionDetails}>
        {item.message_count} message{item.message_count !== 1 ? 's' : ''}
      </Text>
      <Text style={styles.sessionDate}>
        Updated {new Date(item.updated_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.header}>
        <Text style={styles.title}>{projectName}</Text>
        <View style={styles.headerButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Files', { projectId, projectName })}
            style={styles.filesButton}
            compact
          >
            Files
          </Button>
          <Button
            mode="contained"
            onPress={createNewSession}
            style={styles.newChatButton}
            icon="plus"
            compact
          >
            New Chat
          </Button>
        </View>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sessionsList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No chat sessions yet</Text>
            <Text style={styles.emptySubtitle}>
              Start a new conversation to get started
            </Text>
            <Button
              mode="contained"
              onPress={createNewSession}
              style={styles.startChatButton}
            >
              Start Chatting
            </Button>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
  },
  header: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  filesButton: {
    borderColor: Colors.chloro.primary,
  },
  newChatButton: {
    backgroundColor: Colors.chloro.primary,
  },
  sessionsList: {
    padding: Spacing.xl,
  },
  sessionCard: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sessionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  sessionDetails: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    marginBottom: 4,
  },
  sessionDate: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  startChatButton: {
    backgroundColor: Colors.chloro.primary,
  },
});