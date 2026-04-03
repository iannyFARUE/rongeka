"use client";

import { useEffect, useRef } from "react";

interface IconDef {
  bg: string;
  src: string;
  label: string;
}

interface Particle {
  def: IconDef;
  img: HTMLImageElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  scale: number;
  scalePulse: number;
}

const ICON_DEFS: IconDef[] = [
  { bg: "#000000", src: "https://cdn.simpleicons.org/notion/ffffff",                label: "Notion"   },
  { bg: "#161b22", src: "https://cdn.simpleicons.org/github/ffffff",                label: "GitHub"   },
  { bg: "#4a154b", src: "https://cdn.simpleicons.org/slack/ffffff",                 label: "Slack"    },
  { bg: "#1e1e1e", src: "https://cdn.simpleicons.org/visualstudiocode/007acc",      label: "VS Code"  },
  { bg: "#1a1a2e", src: "https://cdn.simpleicons.org/googlechrome/4285f4",          label: "Chrome"   },
  { bg: "#0d1117", src: "https://cdn.simpleicons.org/gnubash/4ade80",               label: "Terminal" },
  { bg: "#1a1200", src: "https://cdn.simpleicons.org/obsidian/7c3aed",              label: "Obsidian" },
  { bg: "#0f172a", src: "https://cdn.simpleicons.org/markdown/94a3b8",             label: "Markdown" },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function HeroChaosVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const _ctx = canvas.getContext("2d");
    if (!_ctx) return;
    const ctx: CanvasRenderingContext2D = _ctx;

    // Preload all brand images then start
    let loaded = 0;
    const images = ICON_DEFS.map((def) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === ICON_DEFS.length) startAnim();
      };
      img.src = def.src;
      return img;
    });

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    }

    function initParticles() {
      if (!canvas) return;
      particlesRef.current = ICON_DEFS.map((def, i) => ({
        def,
        img: images[i],
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

    function drawParticle(p: Particle) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const s = p.size * p.scale;
      const r = 7;

      // Background box
      ctx.beginPath();
      ctx.roundRect(-s / 2, -s / 2, s, s, r);
      ctx.fillStyle = p.def.bg;
      ctx.fill();

      // Border
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Brand icon image
      const pad = s * 0.2;
      const iconSize = s - pad * 2;
      if (p.img.complete && p.img.naturalWidth > 0) {
        ctx.drawImage(p.img, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
      }

      ctx.restore();
    }

    function tick() {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const REPEL_RADIUS = 100;
      const REPEL_STRENGTH = 0.6;
      const MAX_SPEED = 1.4;

      for (const p of particlesRef.current) {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

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

        p.scalePulse += 0.025;
        p.scale = 1 + Math.sin(p.scalePulse) * 0.04;
        p.rot += p.rotSpeed;

        drawParticle(p);
      }

      animRef.current = requestAnimationFrame(tick);
    }

    function startAnim() {
      resize();
      tick();
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvasRef.current!.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chaos box */}
        <div className="flex-1 rounded-xl border border-border bg-muted/30 overflow-hidden">
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            Your knowledge today...
          </div>
          <canvas ref={canvasRef} className="w-full h-48 block" aria-hidden="true" />
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="animate-pulse" style={{ color: "#3b82f6" }}>
            <svg
              width="48"
              height="24"
              viewBox="0 0 48 24"
              fill="none"
              className="rotate-90 md:rotate-0"
            >
              <path
                d="M0 12H40M40 12L30 4M40 12L30 20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Organize</span>
        </div>

        {/* Dashboard preview */}
        <div className="flex-1 rounded-xl border border-border bg-background overflow-hidden">
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            ...with Rongeka
          </div>
          <div className="flex h-48">
            {/* Sidebar */}
            <div className="w-28 border-r border-border p-3 flex flex-col gap-1.5 shrink-0">
              {[
                { label: "Snippets", color: "#3b82f6" },
                { label: "Prompts", color: "#f59e0b" },
                { label: "Commands", color: "#06b6d4" },
                { label: "Notes", color: "#fde047" },
                { label: "Images", color: "#ec4899" },
                { label: "Links", color: "#10b981" },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${i === 0 ? "bg-muted" : ""}`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-foreground/80">{item.label}</span>
                </div>
              ))}
            </div>
            {/* Cards */}
            <div className="flex-1 p-3 grid grid-cols-2 gap-2 content-start overflow-hidden">
              {[
                { title: "useCallback", tags: "#react", color: "#3b82f6" },
                { title: "GPT-4 prompt", tags: "#ai", color: "#f59e0b" },
                { title: "docker compose", tags: "#docker", color: "#06b6d4" },
                { title: "Interview notes", tags: "#career", color: "#fde047" },
                { title: "Prisma relations", tags: "#db", color: "#3b82f6" },
                { title: "MDN Array docs", tags: "#js", color: "#10b981" },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded border-t-2 bg-muted/50 px-2 py-1.5"
                  style={{ borderTopColor: card.color }}
                >
                  <div className="text-xs font-medium truncate">{card.title}</div>
                  <div className="text-[10px] text-muted-foreground">{card.tags}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
