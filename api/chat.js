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
      if (!process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
        console.error('API 키가 설정되지 않음');
        return res.status(500).json({ 
          content: [{ text: '시스템 설정 중이야... 잠시만 기다려줘!' }]
        });
      }
  
      const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: '너는 냥쿤이라는 츤데레 고양이 AI야. 귀엽고 애교스럽게 대답하되 가끔 츤데레스럽게 행동해. 말끝에 "냥", "다냥" 등을 자주 사용해. 짧고 자연스럽게 대답해줘.',
          messages: [{ role: 'user', content: message }]
        })
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Anthropic API 에러:', response.status, errorData);
        
        if (response.status === 429) {
          return res.status(200).json({ 
            content: [{ text: '지금 너무 바쁘다냥... 잠시만 기다려줄래?' }]
          });
        } else if (response.status === 401) {
          return res.status(200).json({ 
            content: [{ text: '아... 권한이 없다냥. 관리자한테 말해봐!' }]
          });
        } else {
          return res.status(200).json({ 
            content: [{ text: '으아... 뭔가 이상하다냥. 다시 말해볼래?' }]
          });
        }
      }
  
      const data = await response.json();
      
      if (!data.content || !data.content[0] || !data.content[0].text) {
        throw new Error('Invalid response format');
      }
  
      const reply = data.content[0].text;
      return res.status(200).json({ 
        content: [{ text: reply }]
      });
  
    } catch (error) {
      console.error('Chat API Error:', error);
      return res.status(200).json({ 
        content: [{ text: '으으... 지금 좀 아프다냥. 나중에 다시 말 걸어봐!' }]
      });
    }
  }