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
      const { sender, message } = req.body;
      
      if (!sender || !message) {
        return res.status(400).json({ error: 'Sender and message required' });
      }

      const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const chatData = {
        sender,
        message,
        timestamp: new Date().toISOString(),
        createdAt: Date.now()
      };

      await kv.hset(chatId, chatData);
      
      await kv.lpush('chats', chatId);
      await kv.ltrim('chats', 0, 99);
      
      console.log(`💬 채팅 저장 성공: ${chatId} - ${sender}: ${message.substring(0, 50)}...`);
      
      res.json({ 
        success: true, 
        id: chatId
      });

    } else if (req.method === 'GET') {
      const { limit = 50 } = req.query;
      
      console.log(`📖 채팅 히스토리 로드 (최근 ${limit}개)`);
      
      const chatIds = await kv.lrange('chats', 0, parseInt(limit) - 1) || [];
      
      const chats = [];
      for (const id of chatIds) {
        try {
          const chat = await kv.hgetall(id);
          if (chat && Object.keys(chat).length > 0) {
            chats.push({ id, ...chat });
          }
        } catch (error) {
          console.error(`채팅 로드 실패: ${id}`, error);
        }
      }
      
      chats.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      
      console.log(`📖 채팅 ${chats.length}개 로드 완료`);
      
      res.json(chats);

    } else if (req.method === 'DELETE') {
      const { id, clearAll } = req.body;
      
      if (clearAll) {
        const chatIds = await kv.lrange('chats', 0, -1) || [];
        
        for (const chatId of chatIds) {
          await kv.del(chatId);
        }
        
        await kv.del('chats');
        
        console.log(`🗑️ 전체 채팅 삭제 완료: ${chatIds.length}개`);
        
        res.json({ 
          success: true, 
          message: `${chatIds.length}개의 채팅이 모두 삭제되었습니다.`
        });
      } else if (id) {
        const deleted = await kv.del(id);
        
        if (deleted > 0) {
          await kv.lrem('chats', 1, id);
          
          console.log(`🗑️ 채팅 삭제 완료: ${id}`);
          
          res.json({ 
            success: true, 
            message: '채팅이 삭제되었습니다.' 
          });
        } else {
          res.status(404).json({ error: 'Chat not found' });
        }
      } else {
        res.status(400).json({ error: 'ID or clearAll flag required' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Chats API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}