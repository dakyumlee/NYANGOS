import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;
    const data = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const blob = await put(filename, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
    });

    return res.status(200).json({ 
      url: blob.url,
      downloadUrl: blob.downloadUrl 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}