"use client";

import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [error, action, pending] = useActionState(registerUser, null);

  const inputClass = "bg-white/4 border-white/10 text-white/80 placeholder:text-white/20 focus-visible:ring-white/20 focus-visible:border-white/20";
  const labelClass = "text-xs font-medium text-white/50 uppercase tracking-wide";

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="name" className={labelClass}>Name</label>
        <Input id="name" name="name" placeholder="Your name" required autoComplete="name" className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="reg-email" className={labelClass}>Email</label>
        <Input id="reg-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="reg-password" className={labelClass}>Password</label>
        <Input id="reg-password" name="password" type="password" placeholder="••••••••" required autoComplete="new-password" className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required autoComplete="new-password" className={inputClass} />
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="w-full bg-white hover:bg-white/90 text-[#09090B] font-medium mt-1" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

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
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
      >
        Sign up with GitHub
      </Button>
    </form>
  );
}
