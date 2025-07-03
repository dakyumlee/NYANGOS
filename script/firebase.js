// Firebase 설정 및 초기화
const firebaseConfig = {
  apiKey: "AIzaSyBDXhlzkrKOhs-ewl4IDkPL5Oi2bIv0vTg",
  authDomain: "nyangos-fdbe6.firebaseapp.com",
  projectId: "nyangos-fdbe6",
  storageBucket: "nyangos-fdbe6.firebasestorage.app",
  messagingSenderId: "349621507711",
  appId: "1:349621507711:web:2201669ae265cfbbfad14a",
  measurementId: "G-Y59YH5ZE5B"
};

let db = null;
let auth = null;
let storage = null;
let isInitialized = false;

// Firebase 초기화 함수
async function initializeFirebase() {
  if (isInitialized) {
    return { db, auth, storage };
  }

  try {
    console.log('🔥 Firebase 초기화 시작...');
    
    // Firebase 모듈 동적 임포트
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
    const { getStorage } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js");

    // Firebase 앱 초기화
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    isInitialized = true;
    console.log('✅ Firebase 초기화 성공');
    
    return { db, auth, storage };
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    throw error;
  }
}

async function testFirebaseConnection() {
  try {
    if (!db) {
      await initializeFirebase();
    }
    
    const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
    
    const testCollection = collection(db, 'chats');
    await getDocs(testCollection);
    
    console.log('✅ Firebase 연결 테스트 성공');
    return true;
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.initializeFirebase = initializeFirebase;
  window.testFirebaseConnection = testFirebaseConnection;

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await initializeFirebase();
      console.log('🔥 Firebase 자동 초기화 완료');
    } catch (error) {
      console.error('🔥 Firebase 자동 초기화 실패:', error);
    }
  });
}

export { db, auth, storage, initializeFirebase, testFirebaseConnection };