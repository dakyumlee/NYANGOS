import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDXhlzkrKOhs-ewl4IDkPL5Oi2bIv0vTg",
  authDomain: "nyangos-fdbe6.firebaseapp.com",
  projectId: "nyangos-fdbe6",
  storageBucket: "nyangos-fdbe6.appspot.com",
  messagingSenderId: "349621507711",
  appId: "1:349621507711:web:2201669ae265cfbbfad14a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const statusText = document.getElementById('login-status');

loginButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    statusText.textContent = "✅ 로그인 성공!";
    window.location.href = "admin.html";
  } catch (error) {
    console.error(error);
    statusText.textContent = "❌ 로그인 실패. 다시 확인하세요.";
  }
});
