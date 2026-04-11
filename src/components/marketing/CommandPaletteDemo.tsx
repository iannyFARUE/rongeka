"use client";

import { useEffect, useState } from "react";
import { Code, Sparkles, Terminal, StickyNote, Link as LinkIcon, Search } from "lucide-react";

const QUERIES = ["useCallback", "docker compose up", "GPT-4 system prompt", "React patterns", "fetch API error"];

const RESULTS = [
  { Icon: Code, color: "#3b82f6", type: "snippet", title: "useCallback hook pattern", tags: "#react · #hooks" },
  { Icon: Sparkles, color: "#8b5cf6", type: "prompt", title: "GPT-4 system prompt", tags: "#ai · #llm" },
  { Icon: Terminal, color: "#f97316", type: "command", title: "docker compose up -d", tags: "#docker" },
  { Icon: StickyNote, color: "#fde047", type: "note", title: "Interview prep notes", tags: "#career · #react" },
  { Icon: LinkIcon, color: "#10b981", type: "link", title: "MDN Array.prototype.map()", tags: "#js · #mdn" },
];

export default function CommandPaletteDemo() {
  const [queryIdx, setQueryIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing">("typing");

  const target = QUERIES[queryIdx];

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typed.length < target.length) {
        t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 75);
      } else {
        t = setTimeout(() => setPhase("pausing"), 1600);
      }
    } else if (phase === "pausing") {
      t = setTimeout(() => setPhase("erasing"), 800);
    } else {
      if (typed.length > 0) {
        t = setTimeout(() => setTyped(typed.slice(0, -1)), 35);
      } else {
        setQueryIdx((i) => (i + 1) % QUERIES.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(t);
  }, [typed, phase, target]);

  return (
    <div className="relative">

      <div className="relative rounded-2xl border border-white/8 bg-[#0D0D0F] overflow-hidden shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0A0A0C]">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-xs text-white/25 font-mono">Command Palette</span>
          <span className="ml-auto text-[10px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded font-mono">⌘K</span>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5 bg-white/4 border border-white/6 rounded-xl px-3 py-2.5">
            <Search className="w-4 h-4 text-white/25 shrink-0" />
            <span className="font-mono text-sm text-white/70 flex-1">
              {typed}
              <span className="animate-pulse text-white/50">|</span>
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="p-2 pb-3">
          <div className="text-[10px] text-white/25 font-semibold uppercase tracking-widest px-3 py-2">
            Items — 5 results
          </div>
          <div className="space-y-0.5">
            {RESULTS.map((item, i) => (
              <div
                key={item.title}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  i === 0
                    ? "bg-white/6 border border-white/10"
                    : "hover:bg-white/4"
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: item.color + "18" }}
                >
                  <item.Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/75 truncate font-medium">{item.title}</div>
                  <div className="text-[10px] text-white/30 mt-0.5 font-mono">{item.tags}</div>
                </div>
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
                  style={{ color: item.color + "99", backgroundColor: item.color + "10" }}
                >
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-white/5 bg-[#0A0A0C] flex items-center gap-4 text-[10px] text-white/20 font-mono">
          <span><kbd className="bg-white/8 px-1 rounded">↵</kbd> open</span>
          <span><kbd className="bg-white/8 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-white/8 px-1 rounded">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
