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
import { AnimatedBackground } from '../components/animated/AnimatedBackground';
import { GlowingGreenAccent } from '../components/animated/GlowingGreenAccent';
import { geminiStorage, GeminiProject } from '../services/geminiStorage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../constants/theme';

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
    <View style={styles.container}>
      <AnimatedBackground />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.chloro.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <GlowingGreenAccent size={40} intensity="high" speed="normal" />
            <View style={styles.titleTextContainer}>
              <Text style={styles.title}>Chloro Code</Text>
              <Text style={styles.subtitle}>Projects</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleSettingsPress} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={Colors.chloro.primary} />
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
            <LiquidGlassCard style={styles.emptyCard} glowEffect>
              <GlowingGreenAccent size={60} intensity="medium" speed="normal" />
              <Ionicons name="folder-outline" size={64} color={Colors.chloro.dim} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No projects yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first project to get started with Chloro Code AI assistant
              </Text>
              <LiquidGlassButton
                onPress={() => setShowNewProjectModal(true)}
                title="Create Project"
                style={styles.emptyButton}
              />
            </LiquidGlassCard>
          ) : (
            projects.map((project, index) => (
              <LiquidGlassCard
                key={project.id}
                pressable
                onPress={() => handleProjectPress(project)}
                style={[styles.projectCard, { marginBottom: index === projects.length - 1 ? 100 : Spacing.lg }]}
                glowEffect
              >
                <View style={styles.projectContent}>
                  <View style={styles.projectHeader}>
                    <View style={styles.projectIconContainer}>
                      <Ionicons name="folder" size={28} color={Colors.chloro.primary} />
                    </View>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.projectDate}>
                        Created {new Date(project.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.projectFooter}>
                    <View style={styles.projectStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="chatbubbles-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.statText}>0 chats</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="document-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.statText}>0 files</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id, project.name);
                      }}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={22} color={Colors.semantic.error} />
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
          <LiquidGlassCard style={styles.modalCard} glowEffect>
            <View style={styles.modalHeader}>
              <GlowingGreenAccent size={32} intensity="high" speed="fast" />
              <Text style={styles.modalTitle}>New Project</Text>
            </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  titleTextContainer: {
    flexDirection: 'column',
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.heavy,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.chloro.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginTop: -4,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  actions: {
    marginBottom: Spacing.xxl,
  },
  newProjectButton: {
    width: '100%',
  },
  projectsList: {
    gap: Spacing.lg,
  },
  projectCard: {
    marginBottom: Spacing.lg,
  },
  projectContent: {
    gap: Spacing.lg,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  projectIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.chloro.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.chloro.primary + '40',
  },
  projectInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  projectName: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -0.5,
  },
  projectDate: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.divider,
  },
  projectStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  deleteButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.semantic.error + '15',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyIcon: {
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
    maxWidth: 300,
  },
  emptyButton: {
    marginTop: Spacing.lg,
    minWidth: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.ui.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalInput: {
    marginBottom: Spacing.xxl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
