"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [error, action, pending] = useActionState(requestPasswordReset, undefined);

  // null return from action means success (even if email not found)
  if (error === null) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm text-emerald-500">
          If that email is registered, a reset link is on its way.
        </p>
        <p className="text-xs text-muted-foreground">Check your inbox (and spam folder).</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <Input
        name="email"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
