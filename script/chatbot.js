import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-button');
  const chatLog = document.getElementById('chat-log');
  const emojiButtons = document.querySelectorAll('.emoji-bar button');

  const saveMessage = async (role, message) => {
    try {
      await addDoc(collection(db, "chats"), {
        sender: role,
        message: message,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error("메시지 저장 실패", e);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const reply = data?.content?.[0]?.text || '응답을 받을 수 없어요';
      
      removeTyping();
      appendMessage(reply, 'bot');
      saveMessage('bot', reply);
      
    } catch (err) {
      removeTyping();
      console.error('채팅 에러:', err);
      
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