import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { prisma } from "@/lib/db";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <InvalidLink message="Invalid or missing reset link." />;
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record) {
    return <InvalidLink message="This reset link is invalid or has already been used." />;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return <InvalidLink message="This reset link has expired. Please request a new one." />;
  }

  return (
    <div className="w-full max-w-sm space-y-6 px-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <ResetPasswordForm token={token} />
    </div>
  );
}

function InvalidLink({ message }: { message: string }) {
  return (
    <div className="w-full max-w-sm space-y-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Reset failed</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link
        href="/forgot-password"
        className="text-sm underline hover:text-foreground"
      >
        Request a new link
      </Link>
    </div>
  );
}
