import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";

interface ProUpgradeGateProps {
  feature: string;
}

export default function ProUpgradeGate({ feature }: ProUpgradeGateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 gap-6">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-violet-600/10 border border-violet-500/20">
        <Lock className="w-6 h-6 text-violet-400" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold">{feature} require Pro</h2>
        <p className="text-sm text-muted-foreground">
          Upgrade to Rongeka Pro to upload and manage {feature.toLowerCase()}, plus get unlimited items, collections, and AI features.
        </p>
      </div>
      <Link href="/dashboard/settings" className={buttonVariants({ variant: "default" }) + " bg-violet-600 hover:bg-violet-700 text-white"}>
        Upgrade to Pro
      </Link>
    </div>
  );
}
