import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, projectId, sessionId } = req.body;

    if (!message || !projectId) {
      return res.status(400).json({ error: 'Message and projectId are required' });
    }

    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Get project context from database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      res.write(`data: ${JSON.stringify({ error: 'Project not found' })}\n\n`);
      return res.end();
    }

    // Get project files for context
    const { data: files } = await supabase
      .from('files')
      .select('name, content')
      .eq('project_id', projectId);

    // Build context for Gemini
    const context = {
      projectName: project.name,
      files: files || [],
      sessionId: sessionId,
    };

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI development assistant helping with the project "${project.name}". Here's the project context:\n\n${JSON.stringify(context, null, 2)}\n\nUser message: ${message}`,
                },
              ],
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
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: 'Streaming error', details: error.message })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat API error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Internal server error', details: error.message })}\n\n`);
    res.end();
  }
}