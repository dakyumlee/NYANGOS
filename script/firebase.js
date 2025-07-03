const firebaseConfig = {
  apiKey: "AIzaSyBDXhlzkrKOhs-ewl4IDkPL5Oi2bIv0vTg",
  authDomain: "nyangos-fdbe6.firebaseapp.com",
  projectId: "nyangos-fdbe6",
  storageBucket: "nyangos-fdbe6.appspot.com",
  messagingSenderId: "349621507711",
  appId: "1:349621507711:web:2201669ae265cfbbfad14a"
};

let db = null;
let auth = null;
let storage = null;
let isInitialized = false;

async function initializeFirebase() {
  if (isInitialized && db) {
    return { db, auth, storage };
  }

  try {
    console.log('🔥 Firebase 초기화 시작...');
    
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
    const { getFirestore, connectFirestoreEmulator } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js");
    const { getStorage } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js");

    const app = initializeApp(firebaseConfig);

    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    
    isInitialized = true;
    console.log('✅ Firebase 초기화 성공');

    await testConnection();
    
    return { db, auth, storage };
  } catch (error) {
    console.error('❌ Firebase 초기화 실패:', error);
    
    db = createDummyDB();
    isInitialized = true;
    
    return { db, auth: null, storage: null };
  }
}

function createDummyDB() {
  return {
    collection: () => ({
      add: async () => ({ id: 'dummy_' + Date.now() }),
      get: async () => ({ empty: true, docs: [] }),
      doc: () => ({
        set: async () => {},
        get: async () => ({ exists: false }),
        delete: async () => {}
      })
    })
  };
}

async function testConnection() {
  try {
    if (!db) {
      throw new Error('DB not initialized');
    }
    
    const { collection, getDocs, addDoc } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
 
    const testRef = collection(db, 'test');
    await addDoc(testRef, { 
      test: true, 
      timestamp: new Date(),
      message: 'Firebase connection test'
    });
    
    console.log('✅ Firebase 연결 테스트 성공 - 쓰기 가능');
    return true;
  } catch (error) {
    console.error('❌ Firebase 연결 테스트 실패:', error);
    
    try {
      const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
      const testRef = collection(db, 'chats');
      await getDocs(testRef);
      console.log('⚠️ Firebase 읽기는 가능, 쓰기 권한 없음');
      return 'readonly';
    } catch (readError) {
      console.error('❌ Firebase 읽기도 실패:', readError);
      return false;
    }
  }
}

async function forceReconnect() {
  isInitialized = false;
  db = null;
  auth = null;
  storage = null;
  
  console.log('🔄 Firebase 강제 재연결 시도...');
  return await initializeFirebase();
}

if (typeof window !== 'undefined') {
  window.initializeFirebase = initializeFirebase;
  window.testFirebaseConnection = testConnection;
  window.forceReconnectFirebase = forceReconnect;
  
  setTimeout(async () => {
    try {
      await initializeFirebase();
    } catch (error) {
      console.error('자동 Firebase 초기화 실패:', error);
    }
  }, 1000);
}

export { db, auth, storage, initializeFirebase, testConnection as testFirebaseConnection };