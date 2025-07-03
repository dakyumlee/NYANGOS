document.addEventListener('DOMContentLoaded', async () => {
  console.log('🤖 채팅봇 초기화 시작');

  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-button');
  const chatLog = document.getElementById('chat-log');
  const emojiButtons = document.querySelectorAll('.emoji-bar button');

  let firebaseReady = false;
  try {
    if (typeof window.initializeFirebase === 'function') {
      await window.initializeFirebase();
      firebaseReady = await window.testFirebaseConnection();
      console.log('🔥 Firebase 상태:', firebaseReady ? '연결됨' : '연결 실패');
    }
  } catch (error) {
    console.log('🔥 Firebase 초기화 실패:', error);
  }

  const appendMessage = (text, role) => {
    if (!chatLog) return;
    
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
   
    if (firebaseReady) {
      saveMessageToFirebase(role, text);
    }
    
    return div;
  };

  const showTyping = () => {
    if (!chatLog) return;
    
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

  const saveMessageToFirebase = async (role, message) => {
    try {
      if (!firebaseReady || typeof window.initializeFirebase !== 'function') {
        return;
      }

      const { db } = await window.initializeFirebase();
      const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
      
      await addDoc(collection(db, "chats"), {
        sender: role,
        message: message,
        timestamp: serverTimestamp()
      });
      
      console.log('💾 메시지 저장 완료:', role, message);
    } catch (error) {
      console.log('💾 메시지 저장 실패:', error);
    }
  };

  const sendMessage = async () => {
    if (!input) return;
    
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user');
    input.value = '';
    showTyping();

    try {
      console.log('📤 메시지 전송:', userText);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userText })
      });

      console.log('📥 API 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 API 응답 데이터:', data);

      const reply = data?.content?.[0]?.text || '응답을 받을 수 없어요냥...';
      
      removeTyping();
      appendMessage(reply, 'bot');
      
    } catch (error) {
      removeTyping();
      console.error('💥 채팅 에러:', error);
      
      let errorMessage = '어... 뭔가 이상한데? 다시 말해봐냥.';
      
      if (error.message.includes('404')) {
        errorMessage = '아직 시스템 준비 중이야냥... 좀 기다려줄래?';
      } else if (error.message.includes('fetch')) {
        errorMessage = '네트워크가 이상하다냥. 잠시 후에 다시 해볼까?';
      } else if (error.message.includes('500')) {
        errorMessage = '서버가 아픈 것 같다냥... 관리자한테 말해봐!';
      }
      
      appendMessage(errorMessage, 'bot');
    }
  };

  const testApiConnection = async () => {
    try {
      console.log('🧪 API 연결 테스트 시작');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test' })
      });
      
      if (response.ok) {
        console.log('✅ API 연결 성공');
        return true;
      } else {
        console.log('❌ API 연결 실패:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ API 연결 테스트 실패:', error);
      return false;
    }
  };

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    setTimeout(() => input.focus(), 100);
  }

  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (input) {
        input.value += btn.textContent;
        input.focus();
      }
    });
  });

  setTimeout(async () => {
    appendMessage('안녕하다냥! 나는 냥쿤이야~ 무엇을 도와줄까냥? 🐱', 'bot');
    
    const apiConnected = await testApiConnection();
    if (!apiConnected) {
      setTimeout(() => {
        appendMessage('아직 API 연결이 안 되었다냥... 관리자가 확인해볼게!', 'bot');
      }, 1000);
    }
  }, 1000);

  console.log('🤖 채팅봇 초기화 완료');
});