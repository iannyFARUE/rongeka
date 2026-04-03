"use client";

import { useEffect, useRef, useState } from "react";

const TAGS = [
  { label: "#typescript", color: "#3b82f6" },
  { label: "#async", color: "#f59e0b" },
  { label: "#fetch", color: "#22c55e" },
  { label: "#error-handling", color: "#ec4899" },
  { label: "#api", color: "#6366f1" },
];

export default function AiTagsDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          observer.disconnect();
          // Reveal tags one by one
          TAGS.forEach((_, i) => {
            setTimeout(() => setVisibleCount(i + 1), i * 300 + 400);
          });
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-xl border border-border overflow-hidden bg-[#1e1e1e] font-mono text-sm"
    >
      {/* Editor header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-xs text-white/40">typescript</span>
      </div>

      {/* Code */}
      <div className="p-4 text-[13px] leading-6">
        <div>
          <span className="text-[#e06c75]">async function </span>
          <span className="text-[#61afef]">fetchUserData</span>
          <span className="text-white/70">(</span>
          <span className="text-[#d19a66]">userId</span>
          <span className="text-white/70">: string) {"{"}</span>
        </div>
        <div>
          <span className="text-white/30 mr-4">2</span>
          <span className="text-[#e06c75]">const </span>
          <span className="text-white/70">res = </span>
          <span className="text-[#e06c75]">await </span>
          <span className="text-[#61afef]">fetch</span>
          <span className="text-white/70">(</span>
          <span className="text-[#98c379]">{"`/api/users/${userId}`"}</span>
          <span className="text-white/70">);</span>
        </div>
        <div>
          <span className="text-white/30 mr-4">3</span>
          <span className="text-[#e06c75]">if </span>
          <span className="text-white/70">(!res.ok) </span>
          <span className="text-[#e06c75]">throw new </span>
          <span className="text-[#61afef]">Error</span>
          <span className="text-white/70">(</span>
          <span className="text-[#98c379]">&apos;Not found&apos;</span>
          <span className="text-white/70">);</span>
        </div>
        <div>
          <span className="text-white/30 mr-4">4</span>
          <span className="text-[#e06c75]">return </span>
          <span className="text-white/70">res.</span>
          <span className="text-[#61afef]">json</span>
          <span className="text-white/70">();</span>
        </div>
        <div>
          <span className="text-white/70">{"}"}</span>
        </div>
      </div>

      {/* AI tags area */}
      <div className="border-t border-white/10 px-4 py-3 bg-[#161616]">
        <div className="flex items-center gap-2 mb-2.5 text-xs text-white/40">
          <span>✨</span>
          <span>AI Generated Tags</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag, i) => (
            <span
              key={tag.label}
              className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all duration-500"
              style={{
                color: tag.color,
                borderColor: tag.color + "50",
                backgroundColor: tag.color + "14",
                opacity: i < visibleCount ? 1 : 0,
                transform: i < visibleCount ? "translateY(0)" : "translateY(6px)",
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
