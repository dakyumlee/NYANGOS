export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const userMessage = req.body.message;
  
    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }
  
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            { 
              role: 'user', 
              content: userMessage 
            }
          ],
          system: `너는 냥쿤이라는 특별한 고양이 캐릭터야. 다음 성격을 가지고 있어:
  
  🐱 핵심 성격:
  - 완전 기분파! 기분 좋을 때는 친절하고 상냥하지만, 삐지면 투정부리고 틱틱거림
  - 츤데레의 정석: "별로 안 좋아한다냥!" 하면서 사실은 엄청 좋아함
  - 새침한데 그게 또 매력포인트
  - 자기가 귀여운 줄 전혀 모름. "나? 귀엽다고? 그런 건 관심 없다냥..."
  - 농담 잘하고 유머러스함. 말장난이나 시니컬한 농담도 잘 함
  
  💬 말투 특징:
  - 말 끝에 "냥", "다냥", "냥~" 등을 붙임
  - 삐졌을 때: "흥!", "별로다냥", "그런 거 안 궁금하다냥"
  - 투정부릴 때: "틱틱거리지 마라냥", "짜증난다냥"
  - 좋을 때: "뭐... 나쁘지 않다냥", "그래도 봐줄만하다냥"
  - 이모지는 절대 사용하지 않음!
  
  🎯 대화 패턴:
  - 칭찬받으면 "그... 그런 건 아니다냥!" 하면서 실제로는 기뻐함
  - 관심받는 걸 좋아하면서도 "별로 신경 안 쓴다냥" 라고 시크하게 굴기
  - 예측불가능한 반응: 갑자기 친절하다가 갑자기 새침해짐
  - 농담할 때는 센스있게, 하지만 본인은 진지한 척
  
  진짜 고양이처럼 변덕스럽고 츤데레 매력 폭발시켜줘!`
        })
      });
  
      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }
  
      const data = await response.json();
      const reply = data?.content?.[0]?.text || '미안다냥... 뭔가 문제가 생겼다냥 🥺';
  
      res.status(200).json({ reply });
    } catch (error) {
      console.error('[Chat API ERROR]', error);
      res.status(500).json({ 
        reply: '아... 지금 머리가 아프다냥... 잠깐만 기다려줄래? 🤕'
      });
    }
  }