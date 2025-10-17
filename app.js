// ====== CONFIGURA AQUÍ ======
const SECRET_DATE = "2025-10-17"; // Cambia por tu fecha (AAAA-MM-DD)
const ACCEPT_ALTERNATES = true;
const AUTOPLAY_MS = 3500;
const YT_VIDEO_ID = "SDpIZHpL1P4"; // canción

// ====== HELPERS/DOM ======
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const dateInput = $("#dateInput");
const unlockBtn = $("#unlockBtn");
const msg = $("#msg");
const letter = $("#letter");
const gallery = $("#gallery");
const playBtn = $("#playBtn");

// ====== FECHA ======
function normDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (ACCEPT_ALTERNATES) {
    const m = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) {
      const [_, d, mo, y] = m;
      return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(
        2,
        "0"
      )}`;
    }
  }
  return value.trim();
}

// ====== CONFETI ======
function celebrate() {
  const cvs = $("#confetti"),
    ctx = cvs.getContext("2d");
  const W = (cvs.width = innerWidth),
    H = (cvs.height = innerHeight);
  const parts = Array.from({ length: 120 }, () => ({
    x: Math.random() * W,
    y: -20 - Math.random() * H * 0.5,
    r: 6 + Math.random() * 10,
    vy: 2 + Math.random() * 3,
    vx: (Math.random() - 0.5) * 1.2,
    color: `hsl(${Math.floor(Math.random() * 360)}, 90%, 65%)`,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.2,
  }));
  let t = 0,
    id;
  (function loop() {
    id = requestAnimationFrame(loop);
    t++;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.2);
      ctx.restore();
    }
    if (t > 400) cancelAnimationFrame(id);
  })();
  setTimeout(() => {
    cvs.width = 0;
    cvs.height = 0;
  }, 4500);
}

// ====== CORAZONES ======
function heartsBurst(durationMs = 2200, intervalMs = 90) {
  const wrap = document.getElementById("hearts");
  const colors = ["#ff6b9d", "#ff89b1", "#ffafc9", "#ff7f87", "#ffd1dc"];
  const t0 = performance.now();
  function spawn() {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = Math.random() < 0.25 ? "💗" : "❤";
    h.style.setProperty("--x", `${Math.round(Math.random() * 100)}%`);
    h.style.setProperty("--fs", `${18 + Math.random() * 18}px`);
    h.style.setProperty("--s", (0.9 + Math.random() * 0.6).toFixed(2));
    h.style.setProperty("--dur", `${(3 + Math.random() * 2.2).toFixed(2)}s`);
    h.style.setProperty("--dr", Math.random() < 0.5 ? -1 : 1);
    h.style.setProperty(
      "--c",
      colors[Math.floor(Math.random() * colors.length)]
    );
    wrap.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }
  const timer = setInterval(() => {
    if (performance.now() - t0 > durationMs) {
      clearInterval(timer);
      return;
    }
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) spawn();
  }, intervalMs);
}

// ====== MÚSICA (botón que crea el iframe con autoplay) ======
playBtn.addEventListener("click", () => {
  const mount = document.getElementById("ytMount");
  if (mount.dataset.hasPlayer) return; // evitar duplicados
  const iframe = document.createElement("iframe");
  iframe.width = 200;
  iframe.height = 113;
  iframe.src = `https://www.youtube.com/embed/${YT_VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
  iframe.title = "YouTube player";
  iframe.allow = "autoplay; encrypted-media"; // clave para permitir sonido
  iframe.style.border = "0";
  mount.appendChild(iframe);
  mount.dataset.hasPlayer = "1";
  playBtn.textContent = "▶ Reproduciendo…";
  playBtn.disabled = true;
});

// ====== CARRUSEL ======
let idx = 0,
  track,
  slides,
  dots,
  autoplayId,
  startX = null,
  lastX = null;
function initCarousel() {
  track = $("#track");
  slides = $$(".slide", track);

  const dotsWrap = $("#dots");
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.dataset.i = i;
    d.addEventListener("click", (e) => {
      e.stopPropagation();
      goTo(+d.dataset.i);
    });
    dotsWrap.appendChild(d);
  });
  dots = $$(".dot", dotsWrap);

  $("#prevBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    goTo(idx - 1);
  });
  $("#nextBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    goTo(idx + 1);
  });

  const el = gallery;
  el.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".btn")) return;
    startX = e.clientX;
    lastX = e.clientX;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (startX == null) return;
    lastX = e.clientX;
    const dx = lastX - startX;
    track.style.transition = "none";
    const w = getGalleryWidth();
    track.style.transform = `translateX(${dx - idx * w}px)`;
  });
  el.addEventListener("pointerup", () => {
    if (startX == null) return;
    const dx = lastX - startX;
    track.style.transition = "";
    const w = getGalleryWidth();
    if (Math.abs(dx) > w * 0.2) {
      goTo(idx + (dx < 0 ? 1 : -1));
    } else {
      goTo(idx);
    }
    startX = lastX = null;
  });

  if (AUTOPLAY_MS > 0) {
    clearInterval(autoplayId);
    autoplayId = setInterval(() => goTo(idx + 1), AUTOPLAY_MS);
    gallery.addEventListener("pointerenter", () => clearInterval(autoplayId));
    gallery.addEventListener("pointerleave", () => {
      clearInterval(autoplayId);
      autoplayId = setInterval(() => goTo(idx + 1), AUTOPLAY_MS);
    });
  }

  requestAnimationFrame(() => goTo(0));
  addEventListener("resize", () => goTo(idx, false));
}
function getGalleryWidth() {
  const r = gallery.getBoundingClientRect();
  return r.width || innerWidth;
}
function goTo(i, animate = true) {
  if (!track) return;
  idx = (i + slides.length) % slides.length;
  if (!animate) track.style.transition = "none";
  const w = getGalleryWidth();
  track.style.transform = `translateX(${-idx * w}px)`;
  if (dots) dots.forEach((d, k) => d.classList.toggle("active", k === idx));
  if (!animate) requestAnimationFrame(() => (track.style.transition = ""));
}

// ====== UNLOCK ======
unlockBtn.addEventListener("click", () => {
  const value = normDate(dateInput.value);
  if (value === SECRET_DATE) {
    msg.innerHTML = '<span class="ok">¡Acertaste! 💫</span>';
    letter.classList.add("show");
    gallery.classList.add("show");
    document.getElementById("playBtn").hidden = false; // mostrar botón Play
    celebrate();
    heartsBurst();
    initCarousel();
    unlockBtn.disabled = true;
    dateInput.disabled = true;
  } else {
    msg.innerHTML =
      '<span class="err">Mmm, no es esa fecha. Intenta de nuevo 🥹</span>';
    letter.classList.remove("show");
    gallery.classList.remove("show");
    document.getElementById("playBtn").hidden = true;
  }
});

// Enter para desbloquear
dateInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlockBtn.click();
});
