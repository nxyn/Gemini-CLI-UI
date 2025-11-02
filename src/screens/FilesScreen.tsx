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
            color={item.type === 'directory' ? '#f59e0b' : '#3b82f6'}
          />
          <Text style={styles.fileName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteFile(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
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
            <Ionicons name="document-outline" size={48} color="#64748b" />
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
                <Ionicons name="close" size={24} color="#64748b" />
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
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>File Name</Text>
            <TextInput
              style={styles.input}
              value={newFileName}
              onChangeText={setNewFileName}
              placeholder="example.js"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Content</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newFileContent}
              onChangeText={setNewFileContent}
              placeholder="Enter file content..."
              placeholderTextColor="#64748b"
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
  newFileButton: {
    backgroundColor: '#3b82f6',
  },
  filesList: {
    padding: 20,
  },
  fileCard: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 12,
  },
  deleteButton: {
    padding: 8,
  },
  fileSize: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 4,
  },
  fileDate: {
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
  fileContentContainer: {
    flex: 1,
    padding: 20,
  },
  fileContent: {
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  modalContent: {
    flex: 1,
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
  textArea: {
    height: 200,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
});