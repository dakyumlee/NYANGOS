import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDXhlzkrKOhs-ewl4IDkPL5Oi2bIv0vTg",
  authDomain: "nyangos-fdbe6.firebaseapp.com",
  projectId: "nyangos-fdbe6",
  storageBucket: "nyangos-fdbe6.firebasestorage.app",
  messagingSenderId: "349621507711",
  appId: "1:349621507711:web:2201669ae265cfbbfad14a",
  measurementId: "G-Y59YH5ZE5B"
};

let app, db, auth, storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  
  console.log('✅ Firebase 초기화 성공');
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error);
  
  db = null;
  auth = null;
  storage = null;
}

const testFirebaseConnection = async () => {
  if (!db) {
    console.log('❌ Firebase DB 연결 안됨');
    return false;
  }
  
  try {
    await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js")
      .then(({ collection, getDocs }) => {
        return getDocs(collection(db, 'test'));
      });
    console.log('✅ Firebase 연결 테스트 성공');
    return true;
  } catch (error) {
    console.log('❌ Firebase 연결 테스트 실패:', error);
    return false;
  }
};

export { db, auth, storage, testFirebaseConnection };

if (typeof window !== 'undefined') {
  window.firebaseDB = db;
  window.firebaseAuth = auth;
  window.firebaseStorage = storage;
}