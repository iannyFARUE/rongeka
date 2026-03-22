import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="w-full max-w-sm space-y-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent a verification link to your email address. Click the link to
        activate your account. The link expires in 24 hours.
      </p>
      <p className="text-xs text-muted-foreground">
        Already verified?{" "}
        <Link href="/sign-in" className="underline hover:text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  );
}
