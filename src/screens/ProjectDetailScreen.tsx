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
        <Ionicons name="chevron-forward" size={16} color="#64748b" />
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
            <Ionicons name="chatbubble-outline" size={48} color="#64748b" />
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
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filesButton: {
    borderColor: '#3b82f6',
  },
  newChatButton: {
    backgroundColor: '#3b82f6',
  },
  sessionsList: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  sessionDetails: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  sessionDate: {
    color: '#64748b',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    backgroundColor: '#3b82f6',
  },
});