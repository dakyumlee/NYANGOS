import { put, del, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({ error: 'Type parameter required' });
    }
    
    const { blobs } = await list({
      prefix: `nyangkun-${type}-`,
    });
    
    const latestBlob = blobs
      .filter(blob => blob.pathname.startsWith(`nyangkun-${type}-`))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    
    if (!latestBlob) {
      return res.status(200).json({ data: [] });
    }
    
    const response = await fetch(latestBlob.url);
    const data = await response.json();
    
    return res.status(200).json({ data });
  } catch (error) {
    console.error('데이터 조회 실패:', error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}

async function handlePost(req, res) {
  try {
    const { type, data } = req.body;
    
    if (!type || !data) {
      return res.status(400).json({ error: 'Type and data required' });
    }
    
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `nyangkun-${type}-${timestamp}.json`;
    
    const { url } = await put(filename, blob, {
      access: 'public',
    });
    
    return res.status(200).json({ 
      success: true, 
      url,
      filename 
    });
  } catch (error) {
    console.error('데이터 저장 실패:', error);
    return res.status(500).json({ error: 'Failed to save data' });
  }
}

async function handleDelete(req, res) {
  try {
    const { type } = req.query;
    
    if (!type) {
      return res.status(400).json({ error: 'Type parameter required' });
    }

    const { blobs } = await list({
      prefix: `nyangkun-${type}-`,
    });
    
    for (const blob of blobs) {
      await del(blob.url);
    }
    
    return res.status(200).json({ 
      success: true, 
      deletedCount: blobs.length 
    });
  } catch (error) {
    console.error('데이터 삭제 실패:', error);
    return res.status(500).json({ error: 'Failed to delete data' });
  }
}