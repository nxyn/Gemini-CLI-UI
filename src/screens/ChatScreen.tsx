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
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassCard, LiquidGlassInput, LiquidGlassButton } from '../components/liquid';
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
      // Stream the response
      const stream = await geminiApi.sendMessage(
        projectId,
        sessionId,
        userMessage,
        imagesToSend
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

  const renderMessage = (message: GeminiMessage) => {
    const isUser = message.role === 'user';

    return (
      <View
        key={message.id}
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
              color={isUser ? '#14b8a6' : '#3b82f6'}
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
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={styles.container}
    >
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
                  <Ionicons name="sparkles" size={16} color="#3b82f6" />
                  <Text style={styles.messageRole}>Gemini</Text>
                  <ActivityIndicator size="small" color="#3b82f6" style={styles.streamingIndicator} />
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
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
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
              <Ionicons name="image" size={24} color="#14b8a6" />
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
    </LinearGradient>
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
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
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
    marginBottom: 8,
  },
  messageRole: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  streamingIndicator: {
    marginLeft: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  messageImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 8,
  },
  inputContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  selectedImagesContainer: {
    marginBottom: 12,
  },
  selectedImagesContent: {
    gap: 8,
  },
  selectedImageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    padding: 12,
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
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
  },
  code_inline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#14b8a6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    color: '#e5e7eb',
  },
  fence: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    color: '#e5e7eb',
  },
  link: {
    color: '#3b82f6',
  },
  heading1: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
  },
};