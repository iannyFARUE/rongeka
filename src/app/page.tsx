import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button-variants";
import Navbar from "@/components/marketing/Navbar";
import HeroChaosVisual from "@/components/marketing/HeroChaosVisual";
import AiTagsDemo from "@/components/marketing/AiTagsDemo";
import PricingSection from "@/components/marketing/PricingSection";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Developer Knowledge Hub
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Stop Losing Your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Developer Knowledge
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Snippets, AI prompts, commands, notes, files, and links — all in one fast,
            searchable workspace. Built for developers who hate losing things.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/register" className={buttonVariants({ size: "lg" })}>
              Start for Free
            </Link>
            <a href="#features" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* ── Chaos → Order Visual ──────────────────────────────── */}
      <HeroChaosVisual />

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Everything you need
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              One hub. All your resources.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Stop switching between 7 apps. Rongeka keeps everything accessible in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "💻",
                color: "#3b82f6",
                title: "Code Snippets",
                desc: "Save reusable code with full syntax highlighting, language tags, and one-click copy.",
              },
              {
                icon: "✨",
                color: "#f59e0b",
                title: "AI Prompts",
                desc: "Store your best system prompts and context files. Retrieve them instantly when you need them.",
              },
              {
                icon: "⚡",
                color: "#6366f1",
                title: "Instant Search (⌘K)",
                desc: "Cmd+K opens a fuzzy search palette. Find anything across all your items in milliseconds.",
              },
              {
                icon: "⌨️",
                color: "#06b6d4",
                title: "Commands",
                desc: "Never Google the same terminal command twice. Save, organize, and run them with context.",
              },
              {
                icon: "📁",
                color: "#94a3b8",
                title: "Files & Docs",
                desc: "Upload files, images, and documents alongside your text resources. Everything in one place.",
              },
              {
                icon: "📂",
                color: "#22c55e",
                title: "Collections",
                desc: "Group related items into collections. React Patterns, Interview Prep, Context Files — you decide.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors"
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-xl mb-4"
                  style={{ backgroundColor: feature.color + "20" }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: feature.color }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Section ────────────────────────────────────────── */}
      <section id="ai" className="py-24 bg-muted/20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <span className="inline-block text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full mb-6">
                ✨ Pro Feature
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Let AI do the heavy lifting
              </h2>
              <ul className="space-y-3 mb-8">
                {[
                  "Auto-tag suggestions based on your content",
                  "Generate short summaries for any item",
                  "Explain code in plain language",
                  "Optimize and rewrite your AI prompts",
                  "Context-aware search and recommendations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Unlock AI Features →
              </Link>
            </div>

            {/* Code mockup */}
            <AiTagsDemo />
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <PricingSection />

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Organize Your Knowledge?
          </h2>
          <p className="text-muted-foreground mb-10">
            Join developers who stopped losing track of their best work.
          </p>
          <Link href="/register" className={buttonVariants({ size: "lg" })}>
            Start for Free — No Credit Card
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg mb-3">
              <span>⚡</span> Rongeka
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A developer knowledge hub for snippets, prompts, commands, notes, files, and links.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#ai" className="hover:text-foreground transition-colors">AI Features</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["Documentation", "API", "Blog", "Status"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {["About", "Privacy", "Terms", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-foreground transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
            <span>© {year} Rongeka. All rights reserved.</span>
            <span>Built for developers, by developers.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
