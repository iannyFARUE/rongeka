// ── Navbar scroll opacity ────────────────────────────────────────
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Chaos canvas animation ───────────────────────────────────────
const canvas = document.getElementById('chaosCanvas');
const ctx = canvas.getContext('2d');

// Brand icons: bg color + SVG from Simple Icons CDN
const ICON_DEFS = [
  { bg: '#000000', src: 'https://cdn.simpleicons.org/notion/ffffff', label: 'Notion' },
  { bg: '#161b22', src: 'https://cdn.simpleicons.org/github/ffffff', label: 'GitHub' },
  { bg: '#4a154b', src: 'https://cdn.simpleicons.org/slack/ffffff',  label: 'Slack' },
  { bg: '#1e1e1e', src: 'https://cdn.simpleicons.org/visualstudiocode/007acc', label: 'VS Code' },
  { bg: '#1a1a2e', src: 'https://cdn.simpleicons.org/googlechrome/4285f4', label: 'Chrome' },
  { bg: '#0d1117', src: 'https://cdn.simpleicons.org/gnubash/4ade80', label: 'Terminal' },
  { bg: '#1a1200', src: 'https://cdn.simpleicons.org/obsidian/7c3aed', label: 'Obsidian' },
  { bg: '#0f172a', src: 'https://cdn.simpleicons.org/markdown/94a3b8', label: 'Markdown' },
];

// Preload all images before starting animation
let imagesLoaded = 0;
const iconImages = ICON_DEFS.map(def => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { imagesLoaded++; if (imagesLoaded === ICON_DEFS.length) startAnim(); };
  img.onerror = () => { imagesLoaded++; if (imagesLoaded === ICON_DEFS.length) startAnim(); };
  img.src = def.src;
  return img;
});

let mouse = { x: -9999, y: -9999 };
let particles = [];
let animId;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function rand(min, max) { return Math.random() * (max - min) + min; }

function initParticles() {
  particles = ICON_DEFS.map((def, idx) => ({
    def,
    img: iconImages[idx],
    x: rand(30, canvas.width - 30),
    y: rand(30, canvas.height - 30),
    vx: rand(-0.8, 0.8),
    vy: rand(-0.8, 0.8),
    size: 46,
    rot: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.008, 0.008),
    scale: 1,
    scalePulse: rand(0, Math.PI * 2),
  }));
}

function drawParticle(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  const s = p.size * p.scale;
  const r = 7;

  // Background box
  ctx.beginPath();
  ctx.roundRect(-s/2, -s/2, s, s, r);
  ctx.fillStyle = p.def.bg;
  ctx.fill();

  // Border
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Brand icon image (padded inside box)
  const pad = s * 0.2;
  const iconSize = s - pad * 2;
  if (p.img.complete && p.img.naturalWidth > 0) {
    ctx.drawImage(p.img, -iconSize/2, -iconSize/2, iconSize, iconSize);
  }

  ctx.restore();
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const REPEL_RADIUS = 100;
  const REPEL_STRENGTH = 0.6;
  const MAX_SPEED = 1.4;

  for (const p of particles) {
    // Repel from mouse
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < REPEL_RADIUS && dist > 0) {
      const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_STRENGTH;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    // Speed cap
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > MAX_SPEED) {
      p.vx = (p.vx / speed) * MAX_SPEED;
      p.vy = (p.vy / speed) * MAX_SPEED;
    }

    // Friction (slow down when no repel)
    if (dist >= REPEL_RADIUS) {
      p.vx *= 0.995;
      p.vy *= 0.995;
    }

    p.x += p.vx;
    p.y += p.vy;

    const half = p.size / 2;
    if (p.x < half) { p.x = half; p.vx = Math.abs(p.vx); }
    if (p.x > canvas.width - half) { p.x = canvas.width - half; p.vx = -Math.abs(p.vx); }
    if (p.y < half) { p.y = half; p.vy = Math.abs(p.vy); }
    if (p.y > canvas.height - half) { p.y = canvas.height - half; p.vy = -Math.abs(p.vy); }

    // Subtle scale pulse
    p.scalePulse += 0.025;
    p.scale = 1 + Math.sin(p.scalePulse) * 0.04;

    p.rot += p.rotSpeed;

    drawParticle(p);
  }

  animId = requestAnimationFrame(tick);
}

function getCanvasMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

canvas.addEventListener('mousemove', getCanvasMousePos);
canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

function startAnim() {
  initParticles();
  tick();
}

// Init
resizeCanvas();
startAnim();

// Handle resize
const resizeObs = new ResizeObserver(() => {
  resizeCanvas();
  initParticles();
});
resizeObs.observe(canvas.parentElement);

// ── Scroll fade-in ───────────────────────────────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => io.observe(el));

// ── Pricing toggle ───────────────────────────────────────────────
const toggleBtn = document.getElementById('pricingToggle');
const monthlyLabel = document.getElementById('monthlyLabel');
const yearlyLabel = document.getElementById('yearlyLabel');
const proPrice = document.getElementById('proPrice');
const proPeriod = document.getElementById('proPeriod');
const proNote = document.getElementById('proNote');

let isYearly = false;

toggleBtn.addEventListener('click', () => {
  isYearly = !isYearly;
  toggleBtn.classList.toggle('on', isYearly);
  monthlyLabel.classList.toggle('active', !isYearly);
  yearlyLabel.classList.toggle('active', isYearly);

  if (isYearly) {
    proPrice.textContent = '$72';
    proPeriod.textContent = '/year';
    proNote.textContent = 'Save $24 — that\'s 2 months free';
  } else {
    proPrice.textContent = '$8';
    proPeriod.textContent = '/mo';
    proNote.textContent = '';
  }
});
