import Navbar from "@/components/marketing/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar hideLinks />
      <div className="flex-1 flex items-center justify-center pt-16">
        {children}
      </div>
    </div>
  );
}
