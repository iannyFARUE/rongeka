import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "About — Rongeka",
  description:
    "Rongeka is a developer knowledge hub built by Firdian Corp — one fast, searchable, AI-enhanced workspace for snippets, prompts, commands, notes, files, and links.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white/70 fill-white/70" />
            </div>
            <span className="font-semibold">Rongeka</span>
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 pt-36 pb-24 space-y-12">
        <section className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">About Rongeka</h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Rongeka is a developer knowledge hub — one fast, searchable,
            AI-enhanced workspace for all the things developers accumulate:
            snippets, prompts, commands, notes, files, and links.
          </p>
          <p className="text-white/50 leading-relaxed">
            Developers scatter their essentials across VS Code, Notion, browser
            bookmarks, <code className="text-white/70 font-mono text-sm">.txt</code> files,
            GitHub Gists, and bash history. Rongeka consolidates everything into
            a single keyboard-friendly workspace so you spend less time hunting
            and more time building.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Firdian Corp</h2>
          <p className="text-white/50 leading-relaxed">
            Rongeka is a product of{" "}
            <span className="text-white/80 font-medium">Firdian Corp</span> — a
            software company focused on building tools that make developers more
            productive. We believe great tooling should be fast, opinionated,
            and enjoyable to use every day.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Built for developers</h2>
          <ul className="space-y-2 text-white/50">
            {[
              "Quickly grab snippets, commands, and links",
              "Save AI prompts, system messages, and context files",
              "Store code blocks, explanations, and course notes",
              "Collect patterns, boilerplates, and API examples",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="pt-4">
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
