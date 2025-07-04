const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-button');
const chatLog = document.getElementById('chat-log');
const emojiButtons = document.querySelectorAll('.emoji-bar button');

let chatLogs = [];

const saveChatToBlob = async (sender, message) => {
  try {
    const newLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      sender: sender,
      message: message,
      timestamp: new Date().toLocaleString('ko-KR')
    };
    
    chatLogs.push(newLog);
    
    if (chatLogs.length > 1000) {
      chatLogs = chatLogs.slice(-1000);
    }
    
    const response = await fetch('/api/data/load');
    let existingData = {};
    
    if (response.ok) {
      existingData = await response.json();
    }
    
    existingData.chatLogs = chatLogs;
    
    const filename = `nyangkun-data-${Date.now()}.json`;
    await fetch(`/api/data/upload?filename=${filename}`, {
      method: 'POST',
      body: JSON.stringify(existingData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('채팅 로그 blob 저장 완료:', newLog);
  } catch (error) {
    console.error('블롭 저장 실패:', error);
  }
};

const appendMessage = (text, role) => {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  saveChatToBlob(role, text);
  
  return div;
};

const showTyping = () => {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.textContent = '생각하는 중...';
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
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message: userText })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 응답:', data);
    
    let reply = '';
    if (data.reply) {
      reply = data.reply;
    } else if (data.content && data.content[0] && data.content[0].text) {
      reply = data.content[0].text;
    } else if (data.message) {
      reply = data.message;
    } else {
      reply = '죄송합니다. 응답을 생성할 수 없습니다.';
    }
    
    removeTyping();
    appendMessage(reply, 'bot');
    
  } catch (error) {
    console.error('전체 에러:', error);
    removeTyping();
    
    let errorMsg = '연결에 문제가 발생했습니다.';
    if (error.message.includes('404')) {
      errorMsg = 'API 엔드포인트를 찾을 수 없습니다.';
    } else if (error.message.includes('500')) {
      errorMsg = '서버 내부 오류가 발생했습니다.';
    }
    
    appendMessage(errorMsg, 'bot');
  }
};

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

if (emojiButtons.length > 0) {
  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      input.value += btn.textContent;
      input.focus();
    });
  });
}

window.addEventListener('load', async () => {
  try {
    const response = await fetch('/api/data/load');
    if (response.ok) {
      const data = await response.json();
      if (data.chatLogs && Array.isArray(data.chatLogs)) {
        chatLogs = data.chatLogs;
        const recentLogs = chatLogs.slice(-10);
        
        recentLogs.forEach(log => {
          const div = document.createElement('div');
          div.className = `message ${log.sender}`;
          div.textContent = log.message;
          chatLog.appendChild(div);
        });
        
        if (recentLogs.length > 0) {
          chatLog.scrollTop = chatLog.scrollHeight;
        }
        
        console.log('저장된 채팅 로그 복원:', recentLogs.length + '개');
      }
    }
    
    input.focus();
  } catch (error) {
    console.error('로그 복원 실패:', error);
    chatLogs = [];
  }
});