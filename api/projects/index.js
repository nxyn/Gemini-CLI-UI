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

    if (req.method === 'GET') {
      // Get user's projects
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          sessions(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      const projectsWithSessionCount = data.map(project => ({
        ...project,
        session_count: project.sessions?.[0]?.count || 0
      }));

      return res.status(200).json({ projects: projectsWithSessionCount });
    }

    if (req.method === 'POST') {
      // Create new project
      const { name, displayName } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Project name is required' });
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          display_name: displayName?.trim() || name.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ project: data });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}