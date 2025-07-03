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
    typingDiv.className = 'message bot typing-indicator';
    typingDiv.innerHTML = '냥쿤이 생각중... <span class="dots">...</span>';
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
      console.log('메시지 전송 중:', userText);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });

      console.log('응답 상태:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      let data;
      const responseText = await res.text();
      console.log('원본 응답:', responseText);
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 에러:', parseError);
        throw new Error('서버 응답을 처리할 수 없어요');
      }

      const reply = data?.content?.[0]?.text || '응답을 받을 수 없어요...';
      
      removeTyping();
      appendMessage(reply, 'bot');
      
    } catch (err) {
      removeTyping();
      console.error('채팅 에러:', err);
      
      let errorMessage = '어... 뭔가 이상한데? 다시 말해봐.';
      
      if (err.message.includes('404')) {
        errorMessage = '아직 시스템 준비 중이야... 좀 기다려줄래?';
      } else if (err.message.includes('fetch')) {
        errorMessage = '네트워크가 이상해. 잠시 후에 다시 해볼까?';
      } else if (err.message.includes('500')) {
        errorMessage = '서버가 아픈 것 같아... 관리자한테 말해봐!';
      }
      
      appendMessage(errorMessage, 'bot');
    }
  };

  const saveMessage = async (role, message) => {
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        await firebase.firestore().collection('chats').add({
          sender: role,
          message: message,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    } catch (e) {
      console.log('메시지 저장 실패 (Firebase 미연결):', e);
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
    
    input.focus();
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
    appendMessage('안녕하다냥! 나는 냥쿤이야~ 무엇을 도와줄까냥? 🐱', 'bot');
  }, 1000);

  const testConnection = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test' })
      });
      
      if (res.ok) {
        console.log('✅ API 연결 성공');
      } else {
        console.log('❌ API 연결 실패:', res.status);
      }
    } catch (e) {
      console.log('❌ API 연결 테스트 실패:', e);
    }
  };

  testConnection();
});