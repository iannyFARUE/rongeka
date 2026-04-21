import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import Navbar from "@/components/marketing/Navbar";
import AiTagsDemo from "@/components/marketing/AiTagsDemo";
import PricingSection from "@/components/marketing/PricingSection";
import CommandPaletteDemo from "@/components/marketing/CommandPaletteDemo";
import {
  Code,
  Sparkles,
  Search,
  Terminal,
  Folder,
  Check,
  ArrowRight,
  Zap,
  StickyNote,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#09090B] text-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-6">
        <div className="relative max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium bg-white/6 text-white/50 border border-white/10 px-3 py-1.5 rounded-full mb-8">
                <Sparkles className="w-3 h-3" />
                AI-powered developer memory
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-[1.07] tracking-tight mb-6">
                Your second brain,
                <br />
                <span className="text-white/90">built for code.</span>
              </h1>

              <p className="text-lg text-white/45 max-w-md mb-10 leading-relaxed">
                Snippets, prompts, commands, notes, files, and links — one
                keyboard-first workspace. Find anything in milliseconds with{" "}
                <kbd className="font-mono text-white/60 bg-white/8 px-1.5 py-0.5 rounded text-sm">
                  ⌘K
                </kbd>
                .
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-14">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#09090B] px-6 py-3 rounded-xl font-medium transition-all text-sm"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="text-sm text-white/45 hover:text-white/70 transition-colors flex items-center gap-1.5"
                >
                  See how it works
                </a>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  ["⌘K", "instant search"],
                  ["7", "resource types"],
                  ["Free", "to start"],
                ].map(([num, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-lg font-bold text-white/90">{num}</div>
                    <div className="text-xs text-white/30 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Command palette demo */}
            <CommandPaletteDemo />
          </div>
        </div>
      </section>

      {/* ── Item type badges ──────────────────────────────────────── */}
      <div className="border-y border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { Icon: Code, color: "#3b82f6", label: "Snippets" },
            { Icon: Sparkles, color: "#8b5cf6", label: "Prompts" },
            { Icon: Terminal, color: "#f97316", label: "Commands" },
            { Icon: StickyNote, color: "#fde047", label: "Notes" },
            { Icon: FileIcon, color: "#6b7280", label: "Files" },
            { Icon: ImageIcon, color: "#ec4899", label: "Images" },
            { Icon: LinkIcon, color: "#10b981", label: "Links" },
          ].map(({ Icon, color, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium"
              style={{
                borderColor: color + "25",
                backgroundColor: color + "0d",
                color: color + "cc",
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features bento grid ────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-4 block">
              Everything you need
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              One hub. All your resources.
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Stop switching between 7 apps. Rongeka keeps everything accessible in seconds.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* ⌘K Search — large card */}
            <div className="md:col-span-5 rounded-2xl border border-white/6 bg-[#0D0D0F] p-6 flex flex-col gap-5 group hover:border-white/12 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center mb-4 group-hover:bg-white/8 transition-colors">
                  <Search className="w-5 h-5 text-white/60" />
                </div>
                <h3 className="font-semibold text-white/85 mb-1.5">Instant Search ⌘K</h3>
                <p className="text-sm text-white/35 leading-relaxed">
                  Fuzzy search across all items and collections in milliseconds. Never hunt for anything again.
                </p>
              </div>
              {/* Mini search mockup */}
              <div className="rounded-xl border border-white/6 bg-[#080809] p-3 space-y-1.5 mt-auto">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 text-xs text-white/30 font-mono">
                  <Search className="w-3 h-3" />
                  <span>useCallback</span>
                </div>
                {[
                  { icon: Code, color: "#3b82f6", label: "useCallback hook pattern" },
                  { icon: Terminal, color: "#f97316", label: "npx create-react-app" },
                ].map(({ icon: Icon, color, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/4 transition-colors"
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: color + "18" }}
                    >
                      <Icon className="w-3 h-3" style={{ color }} />
                    </div>
                    <span className="text-xs text-white/50 truncate">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Snippets — large card */}
            <div className="md:col-span-7 rounded-2xl border border-white/6 bg-[#0D0D0F] p-6 flex flex-col gap-5 group hover:border-blue-500/30 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/15 transition-colors">
                  <Code className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white/85 mb-1.5">Code Snippets</h3>
                <p className="text-sm text-white/35 leading-relaxed">
                  Full syntax highlighting, language tags, and one-click copy. Stop Googling the same code.
                </p>
              </div>
              {/* Mini code block */}
              <div className="rounded-xl border border-white/6 bg-[#1e1e1e] overflow-hidden font-mono text-xs mt-auto">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d] border-b border-white/8">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                  </div>
                  <span className="text-white/25">useCallback.ts</span>
                </div>
                <div className="p-4 leading-6">
                  <div>
                    <span className="text-[#e06c75]">const </span>
                    <span className="text-[#61afef]">handleClick</span>
                    <span className="text-white/60"> = </span>
                    <span className="text-[#e06c75]">useCallback</span>
                    <span className="text-white/60">{"(() => {"}</span>
                  </div>
                  <div>
                    <span className="text-white/20 mr-4">2</span>
                    <span className="text-[#61afef]">doSomething</span>
                    <span className="text-white/60">(id);</span>
                  </div>
                  <div>
                    <span className="text-white/60">{"}, [id]);"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Commands */}
            <div className="md:col-span-4 rounded-2xl border border-white/6 bg-[#0D0D0F] p-6 group hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/15 transition-colors">
                <Terminal className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white/85 mb-1.5">Commands</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-4">
                Never Google the same terminal command twice.
              </p>
              <div className="space-y-1.5 font-mono text-xs">
                {["git stash pop", "docker ps -a", "npx prisma migrate dev"].map((cmd) => (
                  <div key={cmd} className="flex items-center gap-2 text-white/40">
                    <span className="text-orange-500/60">$</span>
                    <span>{cmd}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Prompts */}
            <div className="md:col-span-4 rounded-2xl border border-white/6 bg-[#0D0D0F] p-6 group hover:border-white/12 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center mb-4 group-hover:bg-white/8 transition-colors">
                <Sparkles className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="font-semibold text-white/85 mb-1.5">AI Prompts</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-4">
                Store your best system prompts. Retrieve them instantly.
              </p>
              <div className="rounded-lg border border-white/8 bg-white/3 p-3 text-xs text-white/40 leading-relaxed font-mono">
                {`You are a senior TypeScript engineer. Review the following code for bugs, performance issues...`}
              </div>
            </div>

            {/* Collections */}
            <div className="md:col-span-4 rounded-2xl border border-white/6 bg-[#0D0D0F] p-6 group hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:bg-emerald-500/15 transition-colors">
                <Folder className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white/85 mb-1.5">Collections</h3>
              <p className="text-sm text-white/35 leading-relaxed mb-4">
                Group items into collections. React Patterns, Interview Prep — you decide.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: "React Patterns", color: "#3b82f6" },
                  { name: "Interview Prep", color: "#8b5cf6" },
                  { name: "Context Files", color: "#f97316" },
                  { name: "Python Snippets", color: "#10b981" },
                ].map(({ name, color }) => (
                  <div
                    key={name}
                    className="rounded-lg border-l-2 bg-white/3 px-2 py-1.5 text-[10px] text-white/45 truncate"
                    style={{ borderLeftColor: color }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Section ─────────────────────────────────────────────── */}
      <section id="ai" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full mb-8">
                <Sparkles className="w-3 h-3" />
                Pro Feature
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                Let AI do the heavy lifting.
              </h2>
              <p className="text-white/40 mb-8 leading-relaxed">
                Powered by GPT-4o-mini, Rongeka can understand your content and help you
                organize, summarize, and improve it — automatically.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "Auto-tag suggestions based on your content",
                  "Generate short summaries for any item",
                  "Explain code snippets in plain language",
                  "Optimize and rewrite your AI prompts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/50">
                    <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white/60" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#09090B] px-6 py-3 rounded-xl font-medium transition-all text-sm"
              >
                <Zap className="w-4 h-4" />
                Unlock AI Features
              </Link>
            </div>

            {/* Right: AI tags demo */}
            <AiTagsDemo />
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl border border-white/8 bg-[#0D0D0F] p-16">
            <div className="w-12 h-12 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6 text-white/70 fill-white/70" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Stop losing your best work.
            </h2>
            <p className="text-white/40 mb-10 max-w-md mx-auto">
              Join developers who use Rongeka as their second brain. Free to start, no credit card required.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#09090B] px-8 py-3.5 rounded-xl font-medium transition-all text-sm"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white/70 fill-white/70" />
              </div>
              <span className="font-semibold">Rongeka</span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed">
              A developer knowledge hub for snippets, prompts, commands, notes, files, and links.
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "AI Features", href: "#ai" },
                { label: "Changelog", href: null },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Documentation", href: null },
                { label: "API", href: null },
                { label: "Blog", href: null },
                { label: "Status", href: null },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Contact", href: null },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm text-white/30 hover:text-white/60 transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className="text-sm text-white/20 cursor-not-allowed">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/20">
            <span>© {year} Rongeka. All rights reserved.</span>
            <span>Built for developers, by developers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
