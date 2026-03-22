import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyResult error="Invalid verification link." />;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return <VerifyResult error="Verification link is invalid or has already been used." />;
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return <VerifyResult error="Verification link has expired. Please register again." />;
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  redirect("/sign-in?verified=1");
}

function VerifyResult({ error }: { error: string }) {
  return (
    <div className="w-full max-w-sm space-y-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Verification failed</h1>
      <p className="text-sm text-muted-foreground">{error}</p>
      <Link href="/register" className="text-sm underline hover:text-foreground">
        Back to register
      </Link>
    </div>
  );
}
