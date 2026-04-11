"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function StatusBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("verified") === "1") {
    return (
      <p className="text-sm text-center text-emerald-500">
        Email verified! You can now sign in.
      </p>
    );
  }
  if (searchParams.get("reset") === "1") {
    return (
      <p className="text-sm text-center text-emerald-500">
        Password updated! Sign in with your new password.
      </p>
    );
  }
  return null;
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGitHub() {
    await signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="space-y-5">
      <Suspense>
        <StatusBanner />
      </Suspense>

      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-white/90">Sign in</h1>
        <p className="text-sm text-white/35">Welcome back to Rongeka</p>
      </div>

      <form onSubmit={handleCredentials} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-white/50 uppercase tracking-wide">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="bg-white/4 border-white/10 text-white/80 placeholder:text-white/20 focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-white/50 uppercase tracking-wide">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="bg-white/4 border-white/10 text-white/80 placeholder:text-white/20 focus-visible:ring-white/20 focus-visible:border-white/20"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full bg-white hover:bg-white/90 text-[#09090B] font-medium mt-1" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0D0D0F] px-2 text-white/25">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full border-white/10 bg-white/4 text-white/60 hover:bg-white/8 hover:text-white/80"
        onClick={handleGitHub}
      >
        Sign in with GitHub
      </Button>

      <p className="text-center text-sm text-white/30">
        No account?{" "}
        <Link href="/register" className="text-white/60 hover:text-white/90 transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}
