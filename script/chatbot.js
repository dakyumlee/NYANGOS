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
};

const showTyping = () => {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.textContent = '...';
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
    const reply = data?.text || '(응답 없음)';
    removeTyping();
    appendMessage(reply, 'bot');
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
