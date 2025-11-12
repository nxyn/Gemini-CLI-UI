import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeminiProject {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeminiSession {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
  messages: GeminiMessage[];
}

export interface GeminiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  images?: string[];
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedTime?: number;
  children?: FileNode[];
}

class GeminiStorageService {
  private baseDir: string;
  private projectsDir: string;

  constructor() {
    // Use document directory for direct file access without sandbox
    this.baseDir = FileSystem.documentDirectory + 'gemini/';
    this.projectsDir = this.baseDir + 'projects/';
  }

  /**
   * Initialize the storage system
   */
  async initialize(): Promise<void> {
    try {
      // Create base directories
      await this.ensureDirectoryExists(this.baseDir);
      await this.ensureDirectoryExists(this.projectsDir);

      console.log('Gemini storage initialized at:', this.baseDir);
    } catch (error) {
      console.error('Failed to initialize Gemini storage:', error);
      throw error;
    }
  }

  /**
   * Ensure a directory exists, create if it doesn't
   */
  private async ensureDirectoryExists(path: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<GeminiProject[]> {
    try {
      const projectsData = await AsyncStorage.getItem('gemini_projects');
      if (!projectsData) {
        return [];
      }
      return JSON.parse(projectsData);
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  /**
   * Create a new project
   */
  async createProject(name: string): Promise<GeminiProject> {
    const projectId = `project_${Date.now()}`;
    const projectPath = this.projectsDir + projectId + '/';

    await this.ensureDirectoryExists(projectPath);
    await this.ensureDirectoryExists(projectPath + 'sessions/');
    await this.ensureDirectoryExists(projectPath + 'files/');

    const project: GeminiProject = {
      id: projectId,
      name,
      path: projectPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const projects = await this.getProjects();
    projects.push(project);
    await AsyncStorage.setItem('gemini_projects', JSON.stringify(projects));

    return project;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (project) {
      await FileSystem.deleteAsync(project.path, { idempotent: true });
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      await AsyncStorage.setItem('gemini_projects', JSON.stringify(updatedProjects));
    }
  }

  /**
   * Get all sessions for a project
   */
  async getSessions(projectId: string): Promise<GeminiSession[]> {
    try {
      const projects = await this.getProjects();
      const project = projects.find((p) => p.id === projectId);

      if (!project) {
        return [];
      }

      const sessionsDir = project.path + 'sessions/';
      const files = await FileSystem.readDirectoryAsync(sessionsDir);

      const sessions: GeminiSession[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionData = await FileSystem.readAsStringAsync(
            sessionsDir + file
          );
          sessions.push(JSON.parse(sessionData));
        }
      }

      return sessions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  /**
   * Create a new session
   */
  async createSession(
    projectId: string,
    name: string
  ): Promise<GeminiSession> {
    const projects = await this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const sessionId = `session_${Date.now()}`;
    const session: GeminiSession = {
      id: sessionId,
      projectId,
      name,
      createdAt: new Date().toISOString(),
      messages: [],
    };

    const sessionPath = project.path + 'sessions/' + sessionId + '.json';
    await FileSystem.writeAsStringAsync(
      sessionPath,
      JSON.stringify(session, null, 2)
    );

    return session;
  }

  /**
   * Get a specific session
   */
  async getSession(
    projectId: string,
    sessionId: string
  ): Promise<GeminiSession | null> {
    try {
      const projects = await this.getProjects();
      const project = projects.find((p) => p.id === projectId);

      if (!project) {
        return null;
      }

      const sessionPath = project.path + 'sessions/' + sessionId + '.json';
      const sessionData = await FileSystem.readAsStringAsync(sessionPath);
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Add a message to a session
   */
  async addMessage(
    projectId: string,
    sessionId: string,
    message: Omit<GeminiMessage, 'id' | 'timestamp'>
  ): Promise<void> {
    const session = await this.getSession(projectId, sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    const newMessage: GeminiMessage = {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    session.messages.push(newMessage);

    const projects = await this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const sessionPath = project.path + 'sessions/' + sessionId + '.json';
    await FileSystem.writeAsStringAsync(
      sessionPath,
      JSON.stringify(session, null, 2)
    );
  }

  /**
   * Delete a session
   */
  async deleteSession(projectId: string, sessionId: string): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return;
    }

    const sessionPath = project.path + 'sessions/' + sessionId + '.json';
    await FileSystem.deleteAsync(sessionPath, { idempotent: true });
  }

  /**
   * Read file tree for a project
   */
  async getFileTree(projectId: string): Promise<FileNode[]> {
    const projects = await this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return [];
    }

    const filesDir = project.path + 'files/';
    return await this.readDirectory(filesDir);
  }

  /**
   * Recursively read directory contents
   */
  private async readDirectory(path: string): Promise<FileNode[]> {
    try {
      const items = await FileSystem.readDirectoryAsync(path);
      const nodes: FileNode[] = [];

      for (const item of items) {
        const itemPath = path + item;
        const info = await FileSystem.getInfoAsync(itemPath, { size: true });

        const node: FileNode = {
          name: item,
          path: itemPath,
          type: info.isDirectory ? 'directory' : 'file',
          size: info.size,
          modifiedTime: info.modificationTime,
        };

        if (info.isDirectory) {
          node.children = await this.readDirectory(itemPath + '/');
        }

        nodes.push(node);
      }

      return nodes;
    } catch (error) {
      console.error('Failed to read directory:', error);
      return [];
    }
  }

  /**
   * Read a file's contents
   */
  async readFile(path: string): Promise<string> {
    try {
      return await FileSystem.readAsStringAsync(path);
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  /**
   * Write to a file
   */
  async writeFile(path: string, content: string): Promise<void> {
    try {
      // Ensure parent directory exists
      const parentDir = path.substring(0, path.lastIndexOf('/') + 1);
      await this.ensureDirectoryExists(parentDir);

      await FileSystem.writeAsStringAsync(path, content);
    } catch (error) {
      console.error('Failed to write file:', error);
      throw error;
    }
  }

  /**
   * Create a new file
   */
  async createFile(
    projectId: string,
    relativePath: string,
    content: string = ''
  ): Promise<void> {
    const projects = await this.getProjects();
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    const filePath = project.path + 'files/' + relativePath;
    await this.writeFile(filePath, content);
  }

  /**
   * Delete a file or directory
   */
  async deleteFile(path: string): Promise<void> {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<{
    baseDir: string;
    totalSize: number;
    projectCount: number;
  }> {
    const projects = await this.getProjects();

    // Calculate total size (simplified - could be improved with recursive size calculation)
    let totalSize = 0;

    return {
      baseDir: this.baseDir,
      totalSize,
      projectCount: projects.length,
    };
  }
}

export const geminiStorage = new GeminiStorageService();
