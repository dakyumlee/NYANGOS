export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
  
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: '너는 냥쿤이라는 츤데레 AI야. 자연스럽고 짧게 대답해줘.',
          messages: [{ role: 'user', content: message }]
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'API 요청 실패');
      }
  
      const reply = data.content[0].text;
      return res.status(200).json({ 
        content: [{ text: reply }]
      });
  
    } catch (error) {
      console.error('Claude API Error:', error);
      return res.status(500).json({ 
        content: [{ text: '아... 지금 좀 바빠. 나중에 다시 말 걸어봐.' }]
      });
    }
  }