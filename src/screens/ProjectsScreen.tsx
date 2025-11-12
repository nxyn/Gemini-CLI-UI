import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard, LiquidGlassButton, LiquidGlassInput } from '../components/liquid';
import { geminiStorage, GeminiProject } from '../services/geminiStorage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ProjectsScreenProps {
  navigation: any;
}

export default function ProjectsScreen({ navigation }: ProjectsScreenProps) {
  const [projects, setProjects] = useState<GeminiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const loadedProjects = await geminiStorage.getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProjects();
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert('Error', 'Please enter a project name');
      return;
    }

    setCreatingProject(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const project = await geminiStorage.createProject(newProjectName.trim());
      setProjects([project, ...projects]);
      setShowNewProjectModal(false);
      setNewProjectName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to the new project
      navigation.navigate('ProjectDetail', {
        projectId: project.id,
        projectName: project.name,
      });
    } catch (error) {
      console.error('Failed to create project:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectName}"? This will delete all sessions and files.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            try {
              await geminiStorage.deleteProject(projectId);
              setProjects(projects.filter((p) => p.id !== projectId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Failed to delete project:', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  const handleProjectPress = (project: GeminiProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ProjectDetail', {
      projectId: project.id,
      projectName: project.name,
    });
  };

  const handleSettingsPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Settings');
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#14b8a6"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="sparkles" size={32} color="#14b8a6" />
            <Text style={styles.title}>Gemini Projects</Text>
          </View>

          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color="#14b8a6" />
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <LiquidGlassButton
            onPress={() => setShowNewProjectModal(true)}
            title="New Project"
            style={styles.newProjectButton}
          />
        </View>

        <View style={styles.projectsList}>
          {projects.length === 0 ? (
            <LiquidGlassCard style={styles.emptyCard}>
              <Ionicons name="folder-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
              <Text style={styles.emptyText}>No projects yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first project to get started with Gemini
              </Text>
            </LiquidGlassCard>
          ) : (
            projects.map((project) => (
              <LiquidGlassCard
                key={project.id}
                pressable
                onPress={() => handleProjectPress(project)}
                style={styles.projectCard}
              >
                <View style={styles.projectContent}>
                  <View style={styles.projectHeader}>
                    <Ionicons name="folder" size={24} color="#14b8a6" />
                    <Text style={styles.projectName}>{project.name}</Text>
                  </View>

                  <Text style={styles.projectDate}>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </Text>

                  <View style={styles.projectActions}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.name);
                      }}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LiquidGlassCard>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showNewProjectModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewProjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LiquidGlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Project</Text>

            <LiquidGlassInput
              containerStyle={styles.modalInput}
              placeholder="Project name"
              value={newProjectName}
              onChangeText={setNewProjectName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <LiquidGlassButton
                onPress={() => {
                  setShowNewProjectModal(false);
                  setNewProjectName('');
                }}
                title="Cancel"
                variant="secondary"
                style={styles.modalButton}
              />
              <LiquidGlassButton
                onPress={handleCreateProject}
                title={creatingProject ? 'Creating...' : 'Create'}
                loading={creatingProject}
                disabled={!newProjectName.trim() || creatingProject}
                style={styles.modalButton}
              />
            </View>
          </LiquidGlassCard>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  actions: {
    marginBottom: 24,
  },
  newProjectButton: {
    width: '100%',
  },
  projectsList: {
    gap: 16,
  },
  projectCard: {
    marginBottom: 16,
  },
  projectContent: {
    gap: 8,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  projectDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  projectActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  modalInput: {
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
