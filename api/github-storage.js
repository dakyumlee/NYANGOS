export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    const { type, action, data } = req.body || {};
    const { type: queryType } = req.query || {};
  
    try {
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
      const GITHUB_REPO = process.env.GITHUB_REPO || 'leedakyums/NYANGOS';
      const GITHUB_BRANCH = 'main';
  
      if (!GITHUB_TOKEN) {
        return res.status(200).json({
          error: 'GitHub token not configured',
          fallback: 'local',
          message: '로컬 스토리지 모드로 작동합니다'
        });
      }
  
      const baseURL = `https://api.github.com/repos/${GITHUB_REPO}/contents/data`;
  
      if (req.method === 'GET') {
        const fileType = queryType || 'chats';
        const filePath = `${baseURL}/${fileType}.json`;
  
        try {
          const response = await fetch(filePath, {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
  
          if (response.status === 404) {
            return res.json([]);
          }
  
          if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
          }
  
          const fileData = await response.json();
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          const jsonData = JSON.parse(content);
  
          console.log(`📖 ${fileType} 데이터 로드: ${jsonData.length}개`);
          res.json(jsonData);
  
        } catch (error) {
          console.error(`데이터 로드 실패 (${fileType}):`, error);
          res.json([]);
        }
  
      } else if (req.method === 'POST' || req.method === 'PUT') {

        if (!type || !data) {
          return res.status(400).json({ error: 'Type and data required' });
        }
  
        const filePath = `${baseURL}/${type}.json`;

        let existingData = [];
        let fileSha = null;
  
        try {
          const response = await fetch(filePath, {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
  
          if (response.ok) {
            const fileData = await response.json();
            fileSha = fileData.sha;
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            existingData = JSON.parse(content);
          }
        } catch (error) {
          console.log('기존 파일 없음, 새로 생성');
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

        const content = Buffer.from(JSON.stringify(existingData, null, 2)).toString('base64');
  
        const updateData = {
          message: `Update ${type} data - ${new Date().toISOString()}`,
          content: content,
          branch: GITHUB_BRANCH
        };
  
        if (fileSha) {
          updateData.sha = fileSha;
        }
  
        const updateResponse = await fetch(filePath, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
  
        if (!updateResponse.ok) {
          throw new Error(`GitHub update failed: ${updateResponse.status}`);
        }
  
        console.log(`✅ ${type} 데이터 저장 성공: ${newItem.id}`);
  
        res.json({
          success: true,
          id: newItem.id,
          message: '데이터가 성공적으로 저장되었습니다!'
        });
  
      } else if (req.method === 'DELETE') {
        const { id } = req.body;
  
        if (!type || !id) {
          return res.status(400).json({ error: 'Type and ID required' });
        }
  
        const filePath = `${baseURL}/${type}.json`;
  
        const response = await fetch(filePath, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
  
        if (!response.ok) {
          return res.status(404).json({ error: 'Data file not found' });
        }
  
        const fileData = await response.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        let existingData = JSON.parse(content);
  
        const originalLength = existingData.length;
        existingData = existingData.filter(item => item.id !== id);
  
        if (existingData.length === originalLength) {
          return res.status(404).json({ error: 'Item not found' });
        }
  
        const newContent = Buffer.from(JSON.stringify(existingData, null, 2)).toString('base64');
  
        const updateResponse = await fetch(filePath, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Delete item from ${type} - ${new Date().toISOString()}`,
            content: newContent,
            sha: fileData.sha,
            branch: GITHUB_BRANCH
          })
        });
  
        if (!updateResponse.ok) {
          throw new Error(`GitHub delete failed: ${updateResponse.status}`);
        }
  
        console.log(`🗑️ ${type} 항목 삭제 성공: ${id}`);
  
        res.json({
          success: true,
          message: '항목이 삭제되었습니다.'
        });
  
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
  
    } catch (error) {
      console.error('GitHub Storage API Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error.message,
        fallback: 'local'
      });
    }
  }