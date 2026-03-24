"use client";

import { useActionState, useState } from "react";
import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleAction(
    prevState: string | null | undefined,
    formData: FormData
  ) {
    const result = await changePassword(prevState, formData);
    if (result === null) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    }
    return result;
  }

  const [error, action, pending] = useActionState(handleAction, undefined);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setSuccess(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Change Password
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        {success ? (
          <p className="text-sm text-green-500 py-2">Password updated successfully.</p>
        ) : (
          <form action={action} className="space-y-3 pt-1">
            <Input
              name="currentPassword"
              type="password"
              placeholder="Current password"
              required
              autoComplete="current-password"
            />
            <Input
              name="newPassword"
              type="password"
              placeholder="New password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Update Password"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
