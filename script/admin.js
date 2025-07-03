import { db, storage } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

const timelineRef = collection(db, "timeline");
const timelineForm = document.getElementById("timeline-form");
const timelineList = document.getElementById("timeline-list");

async function loadTimeline() {
  timelineList.innerHTML = "";
  const snapshot = await getDocs(timelineRef);
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <b>${data.date}</b> - ${data.title} (${data.position})<br>
      <small>${data.content}</small><br>
      <button data-id="${docSnap.id}" class="edit">수정</button>
      <button data-id="${docSnap.id}" class="delete">삭제</button>
    `;
    timelineList.appendChild(li);
  });
}

timelineForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    date: document.getElementById("date").value,
    title: document.getElementById("title").value,
    content: document.getElementById("content").value,
    position: document.getElementById("position").value
  };
  await addDoc(timelineRef, data);
  timelineForm.reset();
  loadTimeline();
});

timelineList.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("delete")) {
    await deleteDoc(doc(db, "timeline", id));
    loadTimeline();
  }
  if (e.target.classList.contains("edit")) {
    const newTitle = prompt("수정할 제목:");
    const newContent = prompt("수정할 내용:");
    const newPosition = prompt("좌표 %:");
    if (newTitle && newContent && newPosition) {
      await updateDoc(doc(db, "timeline", id), {
        title: newTitle,
        content: newContent,
        position: newPosition
      });
      loadTimeline();
    }
  }
});

loadTimeline();

const photoRef = collection(db, "photos");
const photoForm = document.getElementById("photo-form");
const photoList = document.getElementById("photo-list");

photoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("photo-file").files[0];
  const title = document.getElementById("photo-title").value;
  const description = document.getElementById("photo-description").value;
  const date = document.getElementById("photo-date").value;

  if (!file) return;

  const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(photoRef, { url, title, description, date });
  photoForm.reset();
  loadPhotos();
});

async function loadPhotos() {
  photoList.innerHTML = "";
  const snapshot = await getDocs(photoRef);
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${data.url}" width="100" /><br>
      <b>${data.title}</b> - ${data.date}<br>
      <small>${data.description}</small><br>
      <button data-id="${docSnap.id}" class="delete-photo">삭제</button>
    `;
    photoList.appendChild(li);
  });
}

photoList.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("delete-photo")) {
    const confirmDelete = confirm("정말 삭제할까요?");
    if (!confirmDelete) return;
    await deleteDoc(doc(db, "photos", id));
    loadPhotos();
  }
});

loadPhotos();

const quotesRef = collection(db, "quotes");
const quoteForm = document.getElementById("quote-form");
const quoteList = document.getElementById("quote-list");

quoteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("quote-input").value;
  if (!text) return;
  await addDoc(quotesRef, { text });
  quoteForm.reset();
  loadQuotes();
});

async function loadQuotes() {
  quoteList.innerHTML = "";
  const snapshot = await getDocs(quotesRef);
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      \u201C${data.text}\u201D <button data-id="${docSnap.id}" class="delete-quote">삭제</button>
    `;
    quoteList.appendChild(li);
  });
}

quoteList.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains("delete-quote")) {
    await deleteDoc(doc(db, "quotes", id));
    loadQuotes();
  }
});

loadQuotes();
