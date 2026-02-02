// صوت الخلفية
const music = document.getElementById("bgMusic");
const btn = document.getElementById("audioToggleBtn");
music.volume = 0.35;

btn.addEventListener("click", () => {
  if (music.paused) {
    music.play().catch(() => {});
    btn.innerText = "🔇 إيقاف الصوت";
    btn.classList.replace("bg-green-700", "bg-gray-600");
  } else {
    music.pause();
    btn.innerText = "🔊 تشغيل الصوت";
    btn.classList.replace("bg-gray-600", "bg-green-700");
  }
});

// اقتباسات متغيرة
const quotes = [
  "«وتعاونوا على البر والتقوى»",
  "«قفة صغيرة، أثرها كبير»",
  "«في رمضان، التكافل عبادة»",
];

let i = 0;
const quoteEl = document.getElementById("quote");

function changeQuote() {
  quoteEl.innerText = quotes[i % quotes.length];
  i++;
}

changeQuote();
setInterval(changeQuote, 3000);

// العد التنازلي
function updateCountdown() {
  const endDate = new Date("2026-02-09T23:59:59");
  const now = new Date();
  let diff = endDate - now;
  const el = document.getElementById("countdown");

  if (diff <= 0) {
    el.innerText = "انتهت الحملة 🤍";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  el.innerText = `${days} يوم`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// زر إظهار وإخفاء المواد المقاطعة
const toggleBtn = document.getElementById("toggleBlockedBtn");
const blockedDiv = document.getElementById("blockedMaterials");

toggleBtn.addEventListener("click", () => {
  blockedDiv.classList.toggle("hidden");
  if (blockedDiv.classList.contains("hidden")) {
    toggleBtn.innerText = "اضغط هنا لعرض أهم المواد المقاطعة";
  } else {
    toggleBtn.innerText = "إخفاء المواد المقاطعة";
  }
});
