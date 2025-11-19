import { supabase } from '../utils/supabase';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API base URL - automatically detects environment
const getApiBaseUrl = () => {
  // In production (Vercel), use relative URLs
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Check if we're on localhost or production
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    // Production - use relative URLs for same-origin requests
    return '';
  }

  // For mobile, use the API URL from environment
  return Constants.expoConfig?.extra?.apiUrl || 'https://your-app.vercel.app';
};

const API_BASE_URL = getApiBaseUrl();

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface FileUpload {
  projectId: string;
  fileName: string;
  content: string;
}

export class ApiService {
  /**
   * Send a message to Gemini AI with streaming response
   */
  static async sendMessage(
    projectId: string,
    sessionId: string,
    message: string,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/gemini-sandbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          projectId,
          sessionId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const json = JSON.parse(data);
              if (json.error) {
                onError(new Error(json.error));
              } else if (json.content) {
                onChunk(json.content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Upload a file to Vercel Blob storage
   */
  static async uploadFile(upload: FileUpload): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          projectId: upload.projectId,
          fileName: upload.fileName,
          content: upload.content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Get all projects for the current user
   */
  static async getProjects(): Promise<Project[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  static async createProject(name: string, description?: string): Promise<Project> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          name,
          description: description || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  }

  /**
   * Get a single project by ID
   */
  static async getProject(projectId: string): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get project error:', error);
      throw error;
    }
  }

  /**
   * Update a project
   */
  static async updateProject(
    projectId: string,
    updates: { name?: string; description?: string }
  ): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }

  /**
   * Get all files for a project
   */
  static async getProjectFiles(projectId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get project files error:', error);
      throw error;
    }
  }

  /**
   * Create a chat session
   */
  static async createSession(projectId: string, name?: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          project_id: projectId,
          name: name || 'New Session',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Get all sessions for a project
   */
  static async getProjectSessions(projectId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get project sessions error:', error);
      throw error;
    }
  }

  /**
   * Get all messages for a session
   */
  static async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get session messages error:', error);
      throw error;
    }
  }
}

export default ApiService;
