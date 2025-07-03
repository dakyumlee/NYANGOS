import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { type, action, data, id } = req.body || {};
    const { type: queryType } = req.query || {};

    if (req.method === 'GET') {
      const dataType = queryType || 'chats';
      
      try {
        const { blobs } = await list({ prefix: `${dataType}/` });
        
        if (blobs.length === 0) {
          return res.json([]);
        }

        const latestBlob = blobs.sort((a, b) => 
          new Date(b.uploadedAt) - new Date(a.uploadedAt)
        )[0];

        const response = await fetch(latestBlob.url);
        const jsonData = await response.json();

        console.log(`📖 ${dataType} 데이터 로드: ${jsonData.length}개`);
        res.json(jsonData);

      } catch (error) {
        console.error(`데이터 로드 실패 (${dataType}):`, error);
        res.json([]);
      }

    } else if (req.method === 'POST') {
      if (!type || !data) {
        return res.status(400).json({ error: 'Type and data required' });
      }

      let existingData = [];
      try {
        const { blobs } = await list({ prefix: `${type}/` });
        if (blobs.length > 0) {
          const latestBlob = blobs.sort((a, b) => 
            new Date(b.uploadedAt) - new Date(a.uploadedAt)
          )[0];
          const response = await fetch(latestBlob.url);
          existingData = await response.json();
        }
      } catch (error) {
        console.log('기존 데이터 없음, 새로 생성');
      }

      const newItem = {
        id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
      };

      existingData.unshift(newItem);

      const maxItems = {
        chats: 100,
        letters_to: 50,
        letters_from: 50,
        photos: 30,
        timeline: 20
      };

      const limit = maxItems[type] || 50;
      if (existingData.length > limit) {
        existingData = existingData.slice(0, limit);
      }
 
      const filename = `${type}/${Date.now()}.json`;
      const blob = await put(filename, JSON.stringify(existingData), {
        access: 'public',
        contentType: 'application/json'
      });

      console.log(`✅ ${type} 데이터 저장 성공: ${newItem.id}`);

      res.json({
        success: true,
        id: newItem.id,
        blobUrl: blob.url,
        message: '데이터가 성공적으로 저장되었습니다!'
      });

    } else if (req.method === 'DELETE') {
  
      if (!type || !id) {
        return res.status(400).json({ error: 'Type and ID required' });
      }
 
      const { blobs } = await list({ prefix: `${type}/` });
      if (blobs.length === 0) {
        return res.status(404).json({ error: 'Data not found' });
      }

      const latestBlob = blobs.sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
      )[0];

      const response = await fetch(latestBlob.url);
      let existingData = await response.json();
 
      const originalLength = existingData.length;
      existingData = existingData.filter(item => item.id !== id);

      if (existingData.length === originalLength) {
        return res.status(404).json({ error: 'Item not found' });
      }
 
      const filename = `${type}/${Date.now()}.json`;
      await put(filename, JSON.stringify(existingData), {
        access: 'public',
        contentType: 'application/json'
      });

      console.log(`🗑️ ${type} 항목 삭제 성공: ${id}`);

      res.json({
        success: true,
        message: '항목이 삭제되었습니다.'
      });

    } else if (req.method === 'PUT') {
 
      if (action === 'clear_all') {
 
        if (!type) {
          return res.status(400).json({ error: 'Type required for clear_all' });
        }

        const { blobs } = await list({ prefix: `${type}/` });
 
        for (const blob of blobs) {
          await del(blob.url);
        }

        console.log(`🗑️ ${type} 전체 데이터 삭제 완료: ${blobs.length}개 파일`);

        res.json({
          success: true,
          message: `${blobs.length}개의 ${type} 데이터가 모두 삭제되었습니다.`
        });

      } else {
        res.status(400).json({ error: 'Invalid action' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Blob Storage API Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}