import { put } from '@vercel/blob';

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
    const { file, filename, type } = req.body;
    
    if (!file || !filename) {
      return res.status(400).json({ error: 'File and filename required' });
    }
    
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uniqueFilename = `nyangkun-${type || 'file'}-${timestamp}-${filename}`;
  
    const { url } = await put(uniqueFilename, buffer, {
      access: 'public',
    });
    
    return res.status(200).json({ 
      success: true, 
      url,
      filename: uniqueFilename 
    });
  } catch (error) {
    console.error('파일 업로드 실패:', error);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}