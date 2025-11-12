import AsyncStorage from '@react-native-async-storage/async-storage';
import { geminiStorage, GeminiMessage } from './geminiStorage';

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

class GeminiApiService {
  private apiKey: string | null = null;
  private model: string = 'gemini-2.5-flash';
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/';

  /**
   * Initialize the Gemini API service
   */
  async initialize(): Promise<void> {
    const apiKey = await AsyncStorage.getItem('gemini_api_key');
    const model = await AsyncStorage.getItem('gemini_model');

    if (apiKey) {
      this.apiKey = apiKey;
    }

    if (model) {
      this.model = model;
    }
  }

  /**
   * Set API key
   */
  async setApiKey(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    await AsyncStorage.setItem('gemini_api_key', apiKey);
  }

  /**
   * Get API key
   */
  async getApiKey(): Promise<string | null> {
    if (!this.apiKey) {
      this.apiKey = await AsyncStorage.getItem('gemini_api_key');
    }
    return this.apiKey;
  }

  /**
   * Set model
   */
  async setModel(model: string): Promise<void> {
    this.model = model;
    await AsyncStorage.setItem('gemini_model', model);
  }

  /**
   * Get model
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Send a message to Gemini
   */
  async sendMessage(
    projectId: string,
    sessionId: string,
    message: string,
    images?: string[]
  ): Promise<AsyncGenerator<string, void, unknown>> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please configure your Gemini API key in settings.');
    }

    // Add user message to storage
    await geminiStorage.addMessage(projectId, sessionId, {
      role: 'user',
      content: message,
      images,
    });

    // Get session history
    const session = await geminiStorage.getSession(projectId, sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Build contents for API request
    const contents = this.buildContents(session.messages);

    // Make API request with streaming
    return this.streamGeneration(contents);
  }

  /**
   * Build contents array from messages
   */
  private buildContents(messages: GeminiMessage[]): any[] {
    const contents = [];

    for (const msg of messages) {
      const parts: any[] = [];

      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // Add images if present
      if (msg.images && msg.images.length > 0) {
        for (const imageBase64 of msg.images) {
          // Extract mime type and data from base64
          const matches = imageBase64.match(/^data:(.+);base64,(.+)$/);
          if (matches) {
            const mimeType = matches[1];
            const data = matches[2];
            parts.push({
              inlineData: {
                mimeType,
                data,
              },
            });
          }
        }
      }

      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts,
      });
    }

    return contents;
  }

  /**
   * Stream generation from Gemini API
   */
  private async *streamGeneration(
    contents: any[]
  ): AsyncGenerator<string, void, unknown> {
    const url = `${this.baseUrl}${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const text =
                parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text) {
                yield text;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Execute a Gemini command (for CLI-like operations)
   */
  async executeCommand(
    projectId: string,
    sessionId: string,
    command: string
  ): Promise<AsyncGenerator<string, void, unknown>> {
    // Format the command as a message
    const formattedMessage = `Execute the following command:\n\`\`\`\n${command}\n\`\`\`\n\nYou have direct access to the mobile file system. The project files are stored at the project's file directory. Please execute this command and provide the results.`;

    return this.sendMessage(projectId, sessionId, formattedMessage);
  }

  /**
   * Save the assistant's response to storage
   */
  async saveResponse(
    projectId: string,
    sessionId: string,
    response: string
  ): Promise<void> {
    await geminiStorage.addMessage(projectId, sessionId, {
      role: 'assistant',
      content: response,
    });
  }
}

export const geminiApi = new GeminiApiService();
