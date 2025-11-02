import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import Markdown from 'react-native-markdown-display';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

type RootStackParamList = {
  Chat: { projectId: string; sessionId?: string };
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const { projectId, sessionId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (sessionId) {
      loadSessionMessages();
    }
  }, [sessionId]);

  const loadSessionMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setStreamingMessage('');

    try {
      // Create or get session
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            project_id: projectId,
            title: inputText.trim().slice(0, 50),
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        currentSessionId = sessionData.id;
      }

      // Save user message
      await supabase
        .from('messages')
        .insert({
          session_id: currentSessionId,
          role: 'user',
          content: userMessage.content,
        });

      // Stream response from Gemini API via serverless function
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          projectId,
          sessionId: currentSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let assistantMessage = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantMessage += parsed.content;
                setStreamingMessage(assistantMessage);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      // Save assistant message
      if (assistantMessage) {
        const { error } = await supabase
          .from('messages')
          .insert({
            session_id: currentSessionId,
            role: 'assistant',
            content: assistantMessage,
          });

        if (error) throw error;

        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: assistantMessage,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      setStreamingMessage('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setStreamingMessage('');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.role === 'user' ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text style={styles.messageRole}>
        {item.role === 'user' ? 'You' : 'Gemini'}
      </Text>
      <Markdown style={item.role === 'user' ? styles.userMarkdown : styles.assistantMarkdown}>
        {item.content}
      </Markdown>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {streamingMessage && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <Text style={styles.messageRole}>Gemini</Text>
            <Markdown style={styles.assistantMarkdown}>
              {streamingMessage}
            </Markdown>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#64748b"
          multiline
          maxLength={4000}
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          <Ionicons
            name={loading ? 'ellipsis-horizontal' : 'send'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-end',
    marginLeft: '15%',
  },
  assistantMessage: {
    backgroundColor: '#1e293b',
    alignSelf: 'flex-start',
    marginRight: '15%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  userMarkdown: {
    body: { color: '#fff', fontSize: 16 },
    paragraph: { marginBottom: 8 },
  },
  assistantMarkdown: {
    body: { color: '#e2e8f0', fontSize: 16 },
    paragraph: { marginBottom: 8 },
    code_inline: {
      backgroundColor: '#334155',
      color: '#f59e0b',
      paddingHorizontal: 4,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: '#334155',
      color: '#f59e0b',
      padding: 12,
      borderRadius: 8,
      fontFamily: 'monospace',
    },
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    maxHeight: 120,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#475569',
  },
});