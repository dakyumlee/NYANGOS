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
      const { type, title, content, name, password } = req.body;
      
      if (!type || (!title && !content)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const letterId = `letter_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const letterData = {
        type,
        title: title || '',
        content: content || '',
        name: name || 'Anonymous',
        password: password || '',
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
      };

      await kv.hset(letterId, letterData);
      
      await kv.lpush(`letters_${type}`, letterId);
      
      console.log(`✅ 편지 저장 성공: ${letterId}`);
      
      res.json({ 
        success: true, 
        id: letterId,
        message: '편지가 성공적으로 저장되었습니다!'
      });

    } else if (req.method === 'GET') {
      const { type } = req.query;
      
      if (!type) {
        return res.status(400).json({ error: 'Type parameter required' });
      }

      console.log(`📖 편지 목록 로드: ${type}`);
      
      const letterIds = await kv.lrange(`letters_${type}`, 0, -1) || [];
      
      const letters = [];
      for (const id of letterIds) {
        try {
          const letter = await kv.hgetall(id);
          if (letter && Object.keys(letter).length > 0) {
            letters.push({ id, ...letter });
          }
        } catch (error) {
          console.error(`편지 로드 실패: ${id}`, error);
        }
      }
      
      letters.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      console.log(`📖 ${type} 편지 ${letters.length}개 로드 완료`);
      
      res.json(letters);

    } else if (req.method === 'DELETE') {
      const { id, password } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Letter ID required' });
      }

      const letter = await kv.hgetall(id);
      
      if (!letter || Object.keys(letter).length === 0) {
        return res.status(404).json({ error: 'Letter not found' });
      }

      if (letter.password && letter.password !== password) {
        return res.status(403).json({ error: 'Invalid password' });
      }

      await kv.del(id);
      
      if (letter.type) {
        await kv.lrem(`letters_${letter.type}`, 1, id);
      }
      
      console.log(`🗑️ 편지 삭제 완료: ${id}`);
      
      res.json({ 
        success: true, 
        message: '편지가 삭제되었습니다.' 
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Letters API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}