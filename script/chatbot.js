const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-button');
const chatLog = document.getElementById('chat-log');
const emojiButtons = document.querySelectorAll('.emoji-bar button');

const saveChatLog = (sender, message) => {
  try {
    const existingLogs = JSON.parse(localStorage.getItem('nyangkun_chat_logs') || '[]');
    const newLog = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      sender: sender,
      message: message,
      timestamp: new Date().toLocaleString('ko-KR')
    };
    
    existingLogs.push(newLog);
    
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('nyangkun_chat_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.error('로그 저장 실패:', error);
  }
};

const appendMessage = (text, role) => {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  
  saveChatLog(role, text);
  
  return div;
};

const showTyping = () => {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.textContent = '입력 중...';
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
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await res.json();
    
    let reply = '';
    if (data && data.reply) {
      reply = data.reply;
    } else if (data && data.content && Array.isArray(data.content) && data.content[0] && data.content[0].text) {
      reply = data.content[0].text;
    } else {
      reply = '응답을 받을 수 없습니다.';
    }
    
    removeTyping();
    appendMessage(reply, 'bot');
  } catch (err) {
    removeTyping();
    appendMessage('서버 연결에 문제가 발생했습니다.', 'bot');
    console.error('API 에러:', err);
  }
};

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});

emojiButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    input.value += btn.textContent;
    input.focus();
  });
});

window.addEventListener('load', () => {
  try {
    const savedLogs = JSON.parse(localStorage.getItem('nyangkun_chat_logs') || '[]');
    const recentLogs = savedLogs.slice(-10);
    
    recentLogs.forEach(log => {
      const div = document.createElement('div');
      div.className = `message ${log.sender}`;
      div.textContent = log.message;
      chatLog.appendChild(div);
    });
    
    if (recentLogs.length > 0) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  } catch (error) {
    console.error('로그 복원 실패:', error);
  }
});