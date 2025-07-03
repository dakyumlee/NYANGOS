import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDXhlzkrKOhs-ewl4IDkPL5Oi2bIv0vTg",
  authDomain: "nyangos-fdbe6.firebaseapp.com",
  projectId: "nyangos-fdbe6",
  storageBucket: "nyangos-fdbe6.firebasestorage.app",
  messagingSenderId: "349621507711",
  appId: "1:349621507711:web:2201669ae265cfbbfad14a",
  measurementId: "G-Y59YH5ZE5B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);