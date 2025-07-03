import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const quotesRef = collection(db, "quotes");
const quoteText = document.getElementById("quote-text");
const nextBtn = document.getElementById("next-quote");

let quotes = [];

async function loadQuotes() {
  const snapshot = await getDocs(quotesRef);
  quotes = snapshot.docs.map(doc => doc.data().text);
  showRandomQuote();
}

function showRandomQuote() {
  if (quotes.length === 0) return;
  const index = Math.floor(Math.random() * quotes.length);
  quoteText.textContent = quotes[index];
}

nextBtn.addEventListener("click", showRandomQuote);

loadQuotes();
