import { list } from '@vercel/blob';

export default async function handler(req, res) {
  const { method } = req;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;
  
  if (!type) {
    return res.status(400).json({ error: 'type parameter is required' });
  }

  try {
    const { blobs } = await list({
      prefix: `nyangkun-${type}-`
    });
    
    if (blobs.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [], 
        message: `${type} 데이터가 없습니다` 
      });
    }

    const latestBlob = blobs.sort((a, b) => 
      new Date(b.uploadedAt) - new Date(a.uploadedAt)
    )[0];

    const response = await fetch(latestBlob.url);
    const data = await response.json();
    
    return res.status(200).json({ 
      success: true, 
      data: data || [],
      lastUpdated: latestBlob.uploadedAt,
      message: `${type} 데이터 로드 성공`
    });
    
  } catch (error) {
    console.error(`${type} 데이터 조회 실패:`, error);
    return res.status(500).json({ 
      success: false,
      data: [],
      error: `${type} 데이터를 불러올 수 없습니다`,
      details: error.message
    });
  }
}