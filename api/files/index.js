import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.method === 'GET') {
      // Get project files
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('project_id', projectId)
        .order('type', { ascending: false })
        .order('name', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ files: data || [] });
    }

    if (req.method === 'POST') {
      // Create new file
      const { name, content, type = 'file' } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'File name is required' });
      }

      const { data, error } = await supabase
        .from('files')
        .insert({
          project_id: projectId,
          name: name.trim(),
          path: name.trim(),
          content: content || '',
          type,
          size: content ? Buffer.byteLength(content, 'utf8') : 0,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ file: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Files API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}