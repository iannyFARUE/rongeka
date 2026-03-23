"use client";

import { useActionState } from "react";
import { resetPassword } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, action, pending] = useActionState(resetPassword, undefined);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <Input
        name="password"
        type="password"
        placeholder="New password"
        required
        autoComplete="new-password"
        minLength={8}
      />
      <Input
        name="confirmPassword"
        type="password"
        placeholder="Confirm new password"
        required
        autoComplete="new-password"
        minLength={8}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
