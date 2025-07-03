let db = null;

async function initFirebase() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
    const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
    
    const firebaseConfig = {
      apiKey: "AIzaSyBDXhlzkrKOhs-ewl4IDkPL5Oi2bIv0vTg",
      authDomain: "nyangos-fdbe6.firebaseapp.com",
      projectId: "nyangos-fdbe6",
      storageBucket: "nyangos-fdbe6.firebasestorage.app",
      messagingSenderId: "349621507711",
      appId: "1:349621507711:web:2201669ae265cfbbfad14a"
    };

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    window.addDoc = addDoc;
    window.collection = collection;
    window.serverTimestamp = serverTimestamp;
    
    console.log('Firebase 초기화 성공');
  } catch (error) {
    console.log('Firebase 초기화 실패:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initFirebase();
  
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-button');
  const chatLog = document.getElementById('chat-log');
  const emojiButtons = document.querySelectorAll('.emoji-bar button');

  const saveMessage = async (role, message) => {
    if (!db || !window.addDoc) return;
    
    try {
      await window.addDoc(window.collection(db, "chats"), {
        sender: role,
        message: message,
        timestamp: window.serverTimestamp()
      });
    } catch (e) {
      console.log("메시지 저장 실패", e);
    }
  };

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
    saveMessage('user', userText);
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
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.log('Non-JSON response:', text);
        throw new Error('서버에서 올바르지 않은 응답을 받았어요');
      }

      if (!res.ok) {
        throw new Error(data.error || `서버 에러: ${res.status}`);
      }

      const reply = data?.content?.[0]?.text || '응답을 받을 수 없어요';
      
      removeTyping();
      appendMessage(reply, 'bot');
      saveMessage('bot', reply);
      
    } catch (err) {
      removeTyping();
      console.log('채팅 에러:', err);
      
      const errorReplies = [
        '어... 뭔가 이상한데? 다시 말해봐.',
        '지금 좀 컨디션이 안 좋아... 나중에 해줄게.',
        '아 진짜, 시스템이 이상해. 잠깐만!',
        '뭔가 꼬였네... 다시 시도해봐.',
        '아직 준비가 안 된 것 같아. 기다려줄래?'
      ];
      
      const randomError = errorReplies[Math.floor(Math.random() * errorReplies.length)];
      appendMessage(randomError, 'bot');
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
    appendMessage('안녕! 나는 냥쿤이야. 뭔가 궁금한 거 있어?', 'bot');
  }, 1000);
});