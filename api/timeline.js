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
      const { date, title, content, position } = req.body;
      
      if (!date || !title) {
        return res.status(400).json({ error: 'Date and title required' });
      }

      const eventId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const eventData = {
        date,
        title,
        content: content || '',
        position: position || '50%',
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
      };

      await kv.hset(eventId, eventData);

      await kv.lpush('timeline', eventId);
      
      console.log(`🌟 타임라인 이벤트 저장 성공: ${eventId}`);
      
      res.json({ 
        success: true, 
        id: eventId,
        message: '타임라인 이벤트가 저장되었습니다!'
      });

    } else if (req.method === 'GET') {
      console.log('📖 타임라인 로드 시작');
      
      const eventIds = await kv.lrange('timeline', 0, -1) || [];
      
      const events = [];
      for (const id of eventIds) {
        try {
          const event = await kv.hgetall(id);
          if (event && Object.keys(event).length > 0) {
            events.push({ id, ...event });
          }
        } catch (error) {
          console.error(`타임라인 이벤트 로드 실패: ${id}`, error);
        }
      }
      
      events.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });
      
      console.log(`📖 타임라인 이벤트 ${events.length}개 로드 완료`);
      
      res.json(events);

    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Event ID required' });
      }

      const deleted = await kv.del(id);
      
      if (deleted > 0) {
        await kv.lrem('timeline', 1, id);
        
        console.log(`🗑️ 타임라인 이벤트 삭제 완료: ${id}`);
        
        res.json({ 
          success: true, 
          message: '타임라인 이벤트가 삭제되었습니다.' 
        });
      } else {
        res.status(404).json({ error: 'Event not found' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Timeline API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}