import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { title, description, date, imageData } = req.body;
      
      if (!title || !imageData) {
        return res.status(400).json({ error: 'Title and image data required' });
      }

      if (imageData.length > 1024 * 1024) {
        return res.status(400).json({ error: 'Image too large (max 1MB)' });
      }

      const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const photoData = {
        title,
        description: description || '',
        date: date || new Date().toLocaleDateString('ko-KR'),
        imageData, // Base64 문자열
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
      };

      await kv.hset(photoId, photoData);
      
      await kv.lpush('photos', photoId);
      
      console.log(`📸 사진 저장 성공: ${photoId}`);
      
      res.json({ 
        success: true, 
        id: photoId,
        url: imageData,
        message: '사진이 성공적으로 업로드되었습니다!'
      });

    } else if (req.method === 'GET') {
      console.log('📖 사진 목록 로드 시작');
      
      const photoIds = await kv.lrange('photos', 0, -1) || [];
      
      const photos = [];
      for (const id of photoIds) {
        try {
          const photo = await kv.hgetall(id);
          if (photo && Object.keys(photo).length > 0) {
            photos.push({ 
              id, 
              ...photo,
              url: photo.imageData 
            });
          }
        } catch (error) {
          console.error(`사진 로드 실패: ${id}`, error);
        }
      }
      
      photos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      console.log(`📖 사진 ${photos.length}개 로드 완료`);
      
      res.json(photos);

    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Photo ID required' });
      }

      const deleted = await kv.del(id);
      
      if (deleted > 0) {
        await kv.lrem('photos', 1, id);
        
        console.log(`🗑️ 사진 삭제 완료: ${id}`);
        
        res.json({ 
          success: true, 
          message: '사진이 삭제되었습니다.' 
        });
      } else {
        res.status(404).json({ error: 'Photo not found' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Photos API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}