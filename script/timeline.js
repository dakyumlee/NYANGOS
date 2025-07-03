import { db } from "../script/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const container = document.getElementById("timeline-events");
const timelineRef = collection(db, "timeline");

async function loadTimeline() {
  try {
    const snapshot = await getDocs(timelineRef);
    snapshot.forEach((doc) => {
      const data = doc.data();
      const eventEl = document.createElement("div");
      eventEl.className = "timeline-event";
      eventEl.style.left = data.position || "50%";

      eventEl.innerHTML = `
        <div class="dot"></div>
        <div class="popup">
          <h3>${data.date || "(날짜 없음)"}</h3>
          <p>${data.title ? `<b>${data.title}</b><br>` : ""}${data.content || ""}</p>
        </div>
      `;
      container.appendChild(eventEl);
    });
  } catch (e) {
    console.error("타임라인 불러오기 실패:", e);
  }
}

loadTimeline();
