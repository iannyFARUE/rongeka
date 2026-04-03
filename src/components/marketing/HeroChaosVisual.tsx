"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  label: string;
}

const ITEMS = [
  { label: "{ }", color: "#3b82f6" },
  { label: "✨", color: "#f59e0b" },
  { label: ">_", color: "#06b6d4" },
  { label: "📝", color: "#fde047" },
  { label: "🖼", color: "#ec4899" },
  { label: "🔗", color: "#10b981" },
  { label: "📁", color: "#6b7280" },
  { label: "⚡", color: "#8b5cf6" },
];

export default function HeroChaosVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    }

    function initParticles() {
      if (!canvas) return;
      particles.current = ITEMS.map((item) => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        color: item.color,
        radius: 22,
        label: item.label,
      }));
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles.current) {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off walls
        if (p.x - p.radius < 0) { p.x = p.radius; p.vx = Math.abs(p.vx); }
        if (p.x + p.radius > canvas.width) { p.x = canvas.width - p.radius; p.vx = -Math.abs(p.vx); }
        if (p.y - p.radius < 0) { p.y = p.radius; p.vy = Math.abs(p.vy); }
        if (p.y + p.radius > canvas.height) { p.y = canvas.height - p.radius; p.vy = -Math.abs(p.vy); }

        // Draw circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "22";
        ctx.fill();
        ctx.strokeStyle = p.color + "88";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw label
        ctx.fillStyle = p.color;
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.label, p.x, p.y);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chaos box */}
        <div className="flex-1 rounded-xl border border-border bg-muted/30 overflow-hidden animate-fade-in">
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            Your knowledge today...
          </div>
          <canvas ref={canvasRef} className="w-full h-48 block" />
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div className="animate-pulse text-primary">
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
        <div className="flex-1 rounded-xl border border-border bg-background overflow-hidden animate-fade-in">
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
