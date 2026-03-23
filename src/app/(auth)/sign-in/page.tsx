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
    <div className="w-full max-w-sm space-y-6 px-4">
      <Suspense>
        <StatusBanner />
      </Suspense>

      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back to Rongeka
        </p>
      </div>

      <form onSubmit={handleCredentials} className="space-y-3">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGitHub}
      >
        Sign in with GitHub
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="underline hover:text-foreground">
          Register
        </Link>
      </p>
    </div>
  );
}
