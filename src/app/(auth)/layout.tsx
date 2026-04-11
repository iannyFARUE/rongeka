import Link from "next/link";
import { Zap } from "lucide-react";
import Navbar from "@/components/marketing/Navbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col bg-[#09090B]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <Navbar hideLinks />

      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        {/* Logo mark */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white/70 fill-white/70" />
          </div>
          <span className="font-semibold text-white/80 text-sm">Rongeka</span>
        </Link>

        {/* Card */}
        <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-[#0D0D0F] p-8 shadow-2xl shadow-black/50">
          {children}
        </div>

        {/* Bottom link strip */}
        <p className="mt-6 text-xs text-white/20">
          By continuing, you agree to our{" "}
          <span className="text-white/30">Terms</span> &amp;{" "}
          <span className="text-white/30">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
