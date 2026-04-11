"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar({ hideLinks = false }: { hideLinks?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    const hash = href.startsWith("/") ? href.slice(1) : href;
    if (hash.startsWith("#")) {
      const el = document.querySelector(hash);
      if (el) {
        e.preventDefault();
        setMenuOpen(false);
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  const navLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#ai", label: "AI" },
    { href: "/#pricing", label: "Pricing" },
  ];

  return (
    <>
      {/* Desktop pill navbar */}
      <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-2xl border transition-all duration-300",
            scrolled
              ? "bg-[#0D0D0F]/90 backdrop-blur-xl border-white/8 shadow-xl shadow-black/40"
              : "bg-[#0D0D0F]/70 backdrop-blur-md border-white/5"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white/70 fill-white/70" />
            </div>
            <span className="font-semibold text-sm text-white/90">Rongeka</span>
          </Link>

          {/* Divider */}
          {!hideLinks && (
            <div className="hidden md:flex items-center">
              <div className="w-px h-4 bg-white/8 mx-2" />
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(e) => handleNavClick(e, href)}
                  className="text-sm text-white/45 hover:text-white/80 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="hidden md:flex items-center gap-1 ml-2">
            <Link
              href="/sign-in"
              className="text-sm text-white/45 hover:text-white/80 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-white hover:bg-white/90 text-[#09090B] px-4 py-1.5 rounded-xl transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-white/60"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-x-4 top-20 z-40 md:hidden bg-[#0D0D0F]/95 backdrop-blur-xl border border-white/8 rounded-2xl p-4 shadow-2xl shadow-black/60 flex flex-col gap-1">
          {!hideLinks &&
            navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNavClick(e, href)}
                className="text-sm text-white/60 hover:text-white/90 transition-colors px-3 py-2.5 rounded-xl hover:bg-white/5"
              >
                {label}
              </a>
            ))}
          <div className="border-t border-white/5 mt-2 pt-2 flex flex-col gap-1">
            <Link
              href="/sign-in"
              className="text-sm text-white/60 hover:text-white/90 transition-colors px-3 py-2.5 rounded-xl hover:bg-white/5"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-white hover:bg-white/90 text-[#09090B] px-4 py-2.5 rounded-xl transition-colors font-medium text-center"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
