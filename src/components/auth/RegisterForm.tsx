"use client";

import { useActionState } from "react";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [error, action, pending] = useActionState(registerUser, null);

  return (
    <form action={action} className="space-y-3">
      <Input
        name="name"
        placeholder="Name"
        required
        autoComplete="name"
      />
      <Input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
      />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        required
        autoComplete="new-password"
      />
      <Input
        name="confirmPassword"
        type="password"
        placeholder="Confirm password"
        required
        autoComplete="new-password"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
