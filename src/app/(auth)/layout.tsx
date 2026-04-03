import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg w-fit">
          <span className="text-xl">⚡</span>
          <span>Rongeka</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
