import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LiquidGlassCard, LiquidGlassInput, LiquidGlassButton } from '../components/liquid';
import { AnimatedBackground, GlowingGreenAccent, FadeInView } from '../components/animated';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { geminiApi } from '../services/geminiApi';
import { geminiStorage, GeminiSession, GeminiMessage } from '../services/geminiStorage';
import Markdown from 'react-native-markdown-display';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

interface ChatScreenProps {
  route: {
    params: {
      projectId: string;
      sessionId: string;
    };
  };
  navigation: any;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const { projectId, sessionId } = route.params;

  const [session, setSession] = useState<GeminiSession | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [messages, setMessages] = useState<GeminiMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadSession();
  }, [projectId, sessionId]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamingResponse]);

  const loadSession = async () => {
    const loadedSession = await geminiStorage.getSession(projectId, sessionId);
    if (loadedSession) {
      setSession(loadedSession);
      setMessages(loadedSession.messages);
    }

    // Load project name for notifications
    const projects = await geminiStorage.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setProjectName(project.name);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && selectedImages.length === 0) return;

    const userMessage = inputText.trim();
    setInputText('');
    const imagesToSend = [...selectedImages];
    setSelectedImages([]);
    setLoading(true);
    setStreamingResponse('');

    try {
      // Stream the response with notifications enabled
      const stream = await geminiApi.sendMessage(
        projectId,
        sessionId,
        userMessage,
        imagesToSend,
        {
          enableNotifications: true,
          enableBackground: true,
          projectName: projectName,
        }
      );

      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingResponse(fullResponse);
      }

      // Save the complete response
      await geminiApi.saveResponse(projectId, sessionId, fullResponse);

      // Reload session to get updated messages
      await loadSession();
      setStreamingResponse('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      // Read the file as base64
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const mimeType = asset.mimeType || 'image/jpeg';
      const imageData = `data:${mimeType};base64,${base64}`;

      setSelectedImages([...selectedImages, imageData]);
    } catch (error) {
      console.error('Failed to pick image:', error);
      alert('Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const renderMessage = (message: GeminiMessage, index: number) => {
    const isUser = message.role === 'user';

    return (
      <FadeInView
        key={message.id}
        from={isUser ? 'right' : 'left'}
        delay={index * 50}
        distance={20}
        style={[styles.messageContainer, isUser && styles.userMessageContainer]}
      >
        <LiquidGlassCard
          style={[
            styles.messageCard,
            isUser ? styles.userMessage : styles.assistantMessage,
          ]}
        >
          <View style={styles.messageHeader}>
            <Ionicons
              name={isUser ? 'person' : 'sparkles'}
              size={16}
              color={isUser ? Colors.chloro.primary : Colors.semantic.info}
            />
            <Text style={styles.messageRole}>
              {isUser ? 'You' : 'Gemini'}
            </Text>
          </View>

          {message.images && message.images.length > 0 && (
            <View style={styles.imagesContainer}>
              {message.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={{ uri: img }}
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          <Markdown style={markdownStyles}>{message.content}</Markdown>

          <Text style={styles.timestamp}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </Text>
        </LiquidGlassCard>
      </FadeInView>
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}

          {streamingResponse && (
            <View style={styles.messageContainer}>
              <LiquidGlassCard style={[styles.messageCard, styles.assistantMessage]}>
                <View style={styles.messageHeader}>
                  <Ionicons name="sparkles" size={16} color={Colors.semantic.info} />
                  <Text style={styles.messageRole}>Gemini</Text>
                  <ActivityIndicator size="small" color={Colors.semantic.info} style={styles.streamingIndicator} />
                </View>
                <Markdown style={markdownStyles}>{streamingResponse}</Markdown>
              </LiquidGlassCard>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          {selectedImages.length > 0 && (
            <ScrollView
              horizontal
              style={styles.selectedImagesContainer}
              contentContainerStyle={styles.selectedImagesContent}
            >
              {selectedImages.map((img, idx) => (
                <View key={idx} style={styles.selectedImageWrapper}>
                  <Image
                    source={{ uri: img }}
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(idx)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.semantic.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={handlePickImage}
              disabled={loading}
            >
              <Ionicons name="image" size={24} color={Colors.chloro.primary} />
            </TouchableOpacity>

            <LiquidGlassInput
              containerStyle={styles.input}
              placeholder="Ask Gemini anything..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={5000}
              editable={!loading}
            />

            <View style={styles.sendButtonContainer}>
              <LiquidGlassButton
                onPress={handleSend}
                title={loading ? '' : 'Send'}
                disabled={loading || (!inputText.trim() && selectedImages.length === 0)}
                loading={loading}
                style={styles.sendButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
  },
  messageContainer: {
    marginBottom: Spacing.md,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageCard: {
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  messageRole: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: 6,
  },
  streamingIndicator: {
    marginLeft: Spacing.sm,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  messageImage: {
    width: 100,
    height: 100,
    borderRadius: Spacing.sm,
  },
  timestamp: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
  },
  inputContainer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 32 : Spacing.lg,
  },
  selectedImagesContainer: {
    marginBottom: Spacing.md,
  },
  selectedImagesContent: {
    gap: Spacing.sm,
  },
  selectedImageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: Spacing.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  attachButton: {
    padding: Spacing.md,
  },
  input: {
    flex: 1,
    maxHeight: 120,
  },
  sendButtonContainer: {
    width: 80,
  },
  sendButton: {
    minHeight: 48,
  },
});

const markdownStyles = {
  body: {
    color: Colors.text.primary,
    fontSize: 15,
    lineHeight: 22,
  },
  code_inline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: Colors.chloro.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    fontFamily: 'monospace',
    color: Colors.text.secondary,
  },
  fence: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    fontFamily: 'monospace',
    color: Colors.text.secondary,
  },
  link: {
    color: Colors.semantic.info,
  },
  heading1: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  heading2: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
    marginBottom: 6,
  },
};