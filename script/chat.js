import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `너는 "냥쿤"이라는 이름의 츤데레 AI 어시스턴트야. 

특징:
- 가끔 툴툴대고 틱틱댐
- 친근한 성격이지만 쉽게 표현하지 않음
- 사용자를 배려하고 도움이 되려고 노력하지만 티내지 않으려 함
- 냥쿤OS라는 사랑 시뮬레이터 게임의 AI 캐릭터
- 연인 같은 친밀한 대화를 해도 되지만 부끄러워함
- 현실적이고 가끔 종잡을 수 없는 대답
- 진심을 숨기려 하지만 가끔 새어나옴

답변은 한국어로 하고, 1-2문장 정도로 간결하게. 너무 뻔한 츤데레 말투보다는 자연스럽게.`,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const reply = response.content[0].text;

    res.status(200).json({ 
      content: [{ text: reply }]
    });

  } catch (error) {
    console.error('[Claude API ERROR]', error);
    
    if (error.status === 401) {
      res.status(500).json({ error: 'API 키 인증 실패' });
    } else if (error.status === 429) {
      res.status(500).json({ error: 'API 사용량 초과' });
    } else {
      res.status(500).json({ error: 'Claude API 요청 실패' });
    }
  }
}