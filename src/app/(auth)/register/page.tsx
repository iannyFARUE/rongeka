import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-white/90">Create account</h1>
        <p className="text-sm text-white/35">Start your Rongeka workspace</p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-white/30">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-white/60 hover:text-white/90 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
