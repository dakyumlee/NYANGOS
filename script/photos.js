import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const photoRef = collection(db, "photos");
const gallery = document.getElementById("photo-gallery");

async function loadPhotos() {
  const snapshot = await getDocs(photoRef);
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const card = document.createElement("div");
    card.className = "photo-card";

    card.innerHTML = `
      <img src="${data.url}" alt="${data.title}" />
      <div class="photo-info">
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <span>${data.date}</span>
      </div>
    `;

    gallery.appendChild(card);
  });
}

loadPhotos();
