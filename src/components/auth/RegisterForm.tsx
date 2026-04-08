"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [error, action, pending] = useActionState(registerUser, null);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          required
          autoComplete="name"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

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
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      >
        Sign up with GitHub
      </Button>
    </form>
  );
}
