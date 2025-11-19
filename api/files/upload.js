import { createClient } from '@supabase/supabase-js';
import { put } from '@vercel/blob';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, projectId, fileName, content } = req.body;

    if (!userId || !projectId || !fileName || content === undefined) {
      return res.status(400).json({
        error: 'userId, projectId, fileName, and content are required'
      });
    }

    // Verify user authorization
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(userId);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Upload to Vercel Blob
    const blobKey = `projects/${userId}/${projectId}/${fileName}`;
    const { url, downloadUrl } = await put(blobKey, content, {
      access: 'public',
      contentType: 'text/plain',
      addRandomSuffix: false,
    });

    // Store file metadata in Supabase
    const { data: file, error: dbError } = await supabase
      .from('files')
      .upsert({
        project_id: projectId,
        name: fileName,
        content: content,
        blob_url: url,
        blob_download_url: downloadUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save file metadata' });
    }

    res.status(200).json({
      success: true,
      file,
      blobUrl: url,
      downloadUrl: downloadUrl,
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
