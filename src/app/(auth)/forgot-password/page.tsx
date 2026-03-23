import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6 px-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        Remember it?{" "}
        <Link href="/sign-in" className="underline hover:text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  );
}
