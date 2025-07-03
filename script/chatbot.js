import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const saveMessage = async (role, message) => {
  try {
    await addDoc(collection(db, "chats"), {
      sender: role,
      message: message,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("💥 메시지 저장 실패", e);
  }
};


const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-button');
const chatLog = document.getElementById('chat-log');
const emojiButtons = document.querySelectorAll('.emoji-bar button');

const appendMessage = (text, role) => {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = role === 'bot' ? `💬 ${text}` : `😺 ${text}`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const showTyping = () => {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.textContent = '냥쿤이 생각 중...';
  typingDiv.id = 'typing';
  chatLog.appendChild(typingDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
};

const removeTyping = () => {
  const typingDiv = document.getElementById('typing');
  if (typingDiv) typingDiv.remove();
};

const sendMessage = async () => {const sendMessage = async () => {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage(userText, 'user');
  saveMessage('user', userText);
  input.value = '';
  showTyping();

  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await res.json();
    const reply = data?.content?.[0]?.text || '(응답 없음)';
    removeTyping();
    appendMessage(reply, 'bot');
    saveMessage('bot', reply);
  } catch (err) {
    removeTyping();
    appendMessage('(에러 발생)', 'bot');
    console.error(err);
  }
};


  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    const data = await res.json();
    removeTyping();

    if (data.reply) {
      appendMessage(data.reply, 'bot');
    } else {
      appendMessage('(응답 없음)', 'bot');
    }
  } catch (err) {
    removeTyping();
    appendMessage('(에러 발생)', 'bot');
    console.error(err);
  }
};

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMessage();
});

emojiButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    input.value += btn.textContent;
    input.focus();
  });
});
