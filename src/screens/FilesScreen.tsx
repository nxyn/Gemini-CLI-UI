import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../components/animated/AnimatedBackground';
import { GlowingGreenAccent } from '../components/animated/GlowingGreenAccent';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { supabase } from '../utils/supabase';

interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'file' | 'directory';
  size?: number;
  created_at: string;
  updated_at: string;
}

type RootStackParamList = {
  Files: { projectId: string; projectName: string };
};

type FilesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Files'>;
type FilesScreenRouteProp = RouteProp<RootStackParamList, 'Files'>;

export default function FilesScreen() {
  const navigation = useNavigation<FilesScreenNavigationProp>();
  const route = useRoute<FilesScreenRouteProp>();
  const { projectId, projectName } = route.params;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [creatingFile, setCreatingFile] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `${projectName} - Files` });
    loadFiles();
  }, [projectId, projectName]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('type', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      setFiles(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createFile = async () => {
    if (!newFileName.trim()) {
      Alert.alert('Error', 'File name is required');
      return;
    }

    setCreatingFile(true);
    try {
      const { error } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          name: newFileName.trim(),
          path: newFileName.trim(),
          content: newFileContent,
          type: 'file',
        });

      if (error) throw error;

      setShowNewFileModal(false);
      setNewFileName('');
      setNewFileContent('');
      loadFiles();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setCreatingFile(false);
    }
  };

  const deleteFile = async (fileId: string) => {
    Alert.alert(
      'Delete File',
      'Are you sure you want to delete this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('files')
                .delete()
                .eq('id', fileId);

              if (error) throw error;
              loadFiles();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderFile = ({ item }: { item: FileItem }) => (
    <TouchableOpacity
      style={styles.fileCard}
      onPress={() => {
        setSelectedFile(item);
        setShowFileModal(true);
      }}
    >
      <View style={styles.fileHeader}>
        <View style={styles.fileInfo}>
          <Ionicons
            name={item.type === 'directory' ? 'folder' : 'document-text'}
            size={20}
            color={item.type === 'directory' ? '#f59e0b' : Colors.chloro.primary}
          />
          <Text style={styles.fileName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteFile(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.semantic.error} />
        </TouchableOpacity>
      </View>
      {item.type === 'file' && item.size && (
        <Text style={styles.fileSize}>
          {(item.size / 1024).toFixed(1)} KB
        </Text>
      )}
      <Text style={styles.fileDate}>
        Modified {new Date(item.updated_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading files...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <View style={styles.header}>
        <Button
          mode="contained"
          onPress={() => setShowNewFileModal(true)}
          style={styles.newFileButton}
          icon="plus"
        >
          New File
        </Button>
      </View>

      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.filesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={Colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No files yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first file to get started
            </Text>
          </View>
        }
      />

      {/* File View Modal */}
      <Modal
        visible={showFileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedFile && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedFile.name}</Text>
              <TouchableOpacity onPress={() => setShowFileModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.fileContentContainer}>
              <Text style={styles.fileContent}>{selectedFile.content}</Text>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* New File Modal */}
      <Modal
        visible={showNewFileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New File</Text>
            <TouchableOpacity onPress={() => setShowNewFileModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>File Name</Text>
            <TextInput
              style={styles.input}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="example.js"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newFileContent}
              onChangeText={setNewFileContent}
              placeholder="Enter file content..."
              placeholderTextColor={Colors.text.tertiary}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />

            <Button
              mode="contained"
              onPress={createFile}
              loading={creatingFile}
              disabled={creatingFile || !newFileName.trim()}
              style={styles.createButton}
            >
              Create File
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
  newFileButton: {
    backgroundColor: Colors.chloro.primary,
  },
  filesList: {
    padding: Spacing.xl,
  },
  fileCard: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginLeft: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  fileSize: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    marginBottom: 4,
  },
  fileDate: {
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  fileContentContainer: {
    flex: 1,
    padding: Spacing.xl,
  },
  fileContent: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontFamily: 'monospace',
  },
  modalContent: {
    flex: 1,
    padding: Spacing.xl,
  },
  inputLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: Spacing.sm,
    padding: Spacing.lg,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    marginBottom: Spacing.xl,
  },
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: Colors.chloro.primary,
  },
});