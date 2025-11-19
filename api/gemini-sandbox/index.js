import { createClient } from '@supabase/supabase-js';
import { put, head } from '@vercel/blob';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Gemini CLI for a specific user sandbox
async function initializeUserSandbox(userId) {
  const sandboxId = randomUUID();
  const sandboxPath = `/tmp/gemini-sandbox-${userId}-${sandboxId}`;

  try {
    // Check if Gemini CLI is already installed for this user in Blob storage
    const blobKey = `gemini-cli/${userId}/gemini-cli`;

    try {
      const blobCheck = await head(blobKey);
      console.log('Gemini CLI already exists for user:', userId);
    } catch {
      // Install Gemini CLI for this user
      console.log('Installing Gemini CLI for user:', userId);

      // Create a temporary installation script
      const installScript = `
#!/bin/bash
set -e
cd /tmp
curl -fsSL https://cli.gemini.com/install.sh -o install-gemini.sh
chmod +x install-gemini.sh
./install-gemini.sh --path=${sandboxPath}
      `;

      // Upload the CLI installation to Vercel Blob
      const { url } = await put(blobKey, installScript, {
        access: 'public',
        contentType: 'text/plain',
      });

      console.log('Gemini CLI installed for user at:', url);
    }

    return {
      sandboxId,
      sandboxPath,
      userId,
    };
  } catch (error) {
    console.error('Error initializing user sandbox:', error);
    throw error;
  }
}

// Execute Gemini CLI command in user sandbox
async function executeGeminiCommand(sandboxPath, command, args = []) {
  return new Promise((resolve, reject) => {
    const geminiProcess = spawn(command, args, {
      cwd: sandboxPath,
      env: {
        ...process.env,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      },
    });

    let stdout = '';
    let stderr = '';

    geminiProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    geminiProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    geminiProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, exitCode: code });
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    geminiProcess.on('error', (error) => {
      reject(error);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, message, projectId, sessionId, action } = req.body;

    if (!userId || !message || !projectId) {
      return res.status(400).json({
        error: 'userId, message, and projectId are required'
      });
    }

    // Verify user authorization
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Initialize user sandbox
    const sandbox = await initializeUserSandbox(userId);

    // Store sandbox info in database
    await supabase.from('user_sandboxes').upsert({
      user_id: userId,
      sandbox_id: sandbox.sandboxId,
      sandbox_path: sandbox.sandboxPath,
      project_id: projectId,
      last_used_at: new Date().toISOString(),
    });

    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Get project context
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    // Get project files
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', projectId);

    // Store files in user's blob storage
    for (const file of files || []) {
      const blobKey = `projects/${userId}/${projectId}/${file.name}`;
      await put(blobKey, file.content || '', {
        access: 'public',
        contentType: 'text/plain',
      });
    }

    // Build Gemini prompt with context
    const contextPrompt = `
You are an AI development assistant for the project "${project?.name || 'Untitled'}".

Project Context:
- Project ID: ${projectId}
- User Sandbox: ${sandbox.sandboxId}
- Files: ${files?.length || 0} files in project

User Message: ${message}
`;

    // Call Gemini API with streaming
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: contextPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      res.write(`data: ${JSON.stringify({ error: 'Gemini API error', details: errorText })}\n\n`);
      return res.end();
    }

    const reader = geminiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const json = JSON.parse(line);
              if (json.candidates?.[0]?.content?.parts?.[0]?.text) {
                const content = json.candidates[0].content.parts[0].text;
                fullResponse += content;
                res.write(`data: ${JSON.stringify({ content, sandboxId: sandbox.sandboxId })}\n\n`);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: 'Streaming error', details: error.message })}\n\n`);
    }

    // Store message in database
    if (sessionId) {
      await supabase.from('messages').insert([
        {
          session_id: sessionId,
          role: 'user',
          content: message,
        },
        {
          session_id: sessionId,
          role: 'assistant',
          content: fullResponse,
        },
      ]);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Gemini sandbox error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        details: error.message
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Internal server error', details: error.message })}\n\n`);
      res.end();
    }
  }
}
