document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-button');
  const chatLog = document.getElementById('chat-log');
  const emojiButtons = document.querySelectorAll('.emoji-bar button');

  const appendMessage = (text, role) => {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  };

  const showTyping = () => {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.textContent = '냥쿤이 입력중...';
    typingDiv.id = 'typing';
    chatLog.appendChild(typingDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
  };

  const removeTyping = () => {
    const typingDiv = document.getElementById('typing');
    if (typingDiv) typingDiv.remove();
  };

  const sendMessage = async () => {
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user');
    input.value = '';
    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });

      let data;
      try {
        const text = await res.text();
        if (text) {
          data = JSON.parse(text);
        } else {
          throw new Error('빈 응답');
        }
      } catch (parseError) {
        console.log('JSON 파싱 에러:', parseError);
        throw new Error('서버 응답을 처리할 수 없어요');
      }

      if (!res.ok) {
        throw new Error(data?.error || `서버 에러: ${res.status}`);
      }

      const reply = data?.content?.[0]?.text || '응답을 받을 수 없어요';
      
      removeTyping();
      appendMessage(reply, 'bot');
      
    } catch (err) {
      removeTyping();
      console.log('채팅 에러:', err);
      
      let errorMessage = '어... 뭔가 이상한데? 다시 말해봐.';
      
      if (err.message.includes('404')) {
        errorMessage = '아직 시스템 준비 중이야... 좀 기다려줄래?';
      } else if (err.message.includes('fetch')) {
        errorMessage = '네트워크가 이상해. 잠시 후에 다시 해볼까?';
      }
      
      appendMessage(errorMessage, 'bot');
    }
  };

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (input) {
        input.value += btn.textContent;
        input.focus();
      }
    });
  });

  setTimeout(() => {
    appendMessage('안녕! 나는 냥쿤이야. 지금은 시스템 점검 중이라 간단한 대화만 할 수 있어.', 'bot');
  }, 1000);
});