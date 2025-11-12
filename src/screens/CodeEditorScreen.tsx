import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard, LiquidGlassButton } from '../components/liquid';
import { geminiStorage } from '../services/geminiStorage';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/styles/hljs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CodeEditorScreenProps {
  route: {
    params: {
      projectId: string;
      filePath: string;
    };
  };
  navigation: any;
}

export default function CodeEditorScreen({ route, navigation }: CodeEditorScreenProps) {
  const { projectId, filePath } = route.params;
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    loadFile();
    detectLanguage();
  }, [filePath]);

  const detectLanguage = () => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      php: 'php',
      html: 'html',
      css: 'css',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      yml: 'yaml',
      md: 'markdown',
      sh: 'bash',
    };
    setLanguage(langMap[ext || ''] || 'plaintext');
  };

  const loadFile = async () => {
    try {
      const fileContent = await geminiStorage.readFile(filePath);
      setContent(fileContent);
      setOriginalContent(fileContent);
    } catch (error) {
      console.error('Failed to load file:', error);
      Alert.alert('Error', 'Failed to load file');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await geminiStorage.writeFile(filePath, content);
      setOriginalContent(content);
      setEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'File saved successfully');
    } catch (error) {
      console.error('Failed to save file:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setEditing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasChanges = content !== originalContent;

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
      <View style={styles.header}>
        <LiquidGlassCard style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Ionicons name="document-text" size={20} color="#14b8a6" />
            <Text style={styles.fileName} numberOfLines={1}>
              {filePath.split('/').pop()}
            </Text>
          </View>
        </LiquidGlassCard>
      </View>

      <ScrollView style={styles.contentContainer}>
        <LiquidGlassCard style={styles.editorCard}>
          {editing ? (
            <TextInput
              style={styles.editor}
              value={content}
              onChangeText={setContent}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          ) : (
            <ScrollView horizontal>
              <SyntaxHighlighter
                language={language}
                style={atomOneDark}
                customStyle={styles.syntaxHighlighter}
                highlighter="hljs"
              >
                {content}
              </SyntaxHighlighter>
            </ScrollView>
          )}
        </LiquidGlassCard>
      </ScrollView>

      <View style={styles.footer}>
        {editing ? (
          <View style={styles.buttonRow}>
            <LiquidGlassButton
              onPress={handleCancel}
              title="Cancel"
              variant="secondary"
              style={styles.button}
            />
            <LiquidGlassButton
              onPress={handleSave}
              title={saving ? 'Saving...' : 'Save'}
              loading={saving}
              disabled={!hasChanges || saving}
              style={styles.button}
            />
          </View>
        ) : (
          <LiquidGlassButton
            onPress={() => setEditing(true)}
            title="Edit File"
            style={styles.fullButton}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 8,
  },
  headerCard: {
    padding: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  editorCard: {
    flex: 1,
    marginBottom: 16,
  },
  editor: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
    minHeight: 400,
  },
  syntaxHighlighter: {
    backgroundColor: 'transparent',
    padding: 0,
    margin: 0,
    fontSize: 14,
  },
  footer: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  fullButton: {
    width: '100%',
  },
});
