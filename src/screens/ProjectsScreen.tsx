import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

interface Project {
  id: string;
  name: string;
  display_name: string;
  created_at: string;
  session_count?: number;
}

type RootStackParamList = {
  Projects: undefined;
  ProjectDetail: { projectId: string; projectName: string };
  Settings: undefined;
};

type ProjectsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Projects'>;

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDisplayName, setNewProjectDisplayName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          sessions(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithSessionCount = data.map(project => ({
        ...project,
        session_count: project.sessions?.[0]?.count || 0
      }));

      setProjects(projectsWithSessionCount);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const createProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Project name is required');
      return;
    }

    setCreatingProject(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          display_name: newProjectDisplayName.trim() || newProjectName.trim(),
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setShowNewProjectModal(false);
      setNewProjectName('');
      setNewProjectDisplayName('');

      navigation.navigate('ProjectDetail', {
        projectId: data.id,
        projectName: data.display_name,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() =>
        navigation.navigate('ProjectDetail', {
          projectId: item.id,
          projectName: item.display_name,
        })
      }
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{item.display_name}</Text>
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
      <Text style={styles.projectDetails}>
        {item.session_count} session{item.session_count !== 1 ? 's' : ''}
      </Text>
      <Text style={styles.projectDate}>
        Created {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Projects</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
        <Button
          mode="contained"
          onPress={() => setShowNewProjectModal(true)}
          style={styles.newProjectButton}
          icon="plus"
        >
          New Project
        </Button>
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.projectsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="folder-outline" size={48} color="#64748b" />
            <Text style={styles.emptyTitle}>No projects yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first project to get started
            </Text>
          </View>
        }
      />

      <Modal
        visible={showNewProjectModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Project</Text>
            <TouchableOpacity onPress={() => setShowNewProjectModal(false)}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Project Name *</Text>
            <TextInput
              style={styles.input}
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="my-project"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={newProjectDisplayName}
              onChangeText={setNewProjectDisplayName}
              placeholder="My Project"
              placeholderTextColor="#64748b"
            />

            <Button
              mode="contained"
              onPress={createProject}
              loading={creatingProject}
              disabled={creatingProject || !newProjectName.trim()}
              style={styles.createButton}
            >
              Create Project
            </Button>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#0f172a',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButton: {
    padding: 8,
  },
  newProjectButton: {
    backgroundColor: '#3b82f6',
  },
  projectsList: {
    padding: 20,
  },
  projectCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  projectDetails: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  projectDate: {
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
});