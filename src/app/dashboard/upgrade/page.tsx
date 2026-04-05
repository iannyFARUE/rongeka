"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X, Zap } from "lucide-react";
import { createCheckoutSession } from "@/actions/billing";
import { toast } from "sonner";

const FREE_FEATURES = [
  { text: "Up to 50 items", included: true },
  { text: "3 collections", included: true },
  { text: "All text item types", included: true },
  { text: "Basic search", included: true },
  { text: "Command palette (⌘K)", included: true },
  { text: "File & image uploads", included: false },
  { text: "AI features", included: false },
  { text: "Unlimited items", included: false },
];

const PRO_FEATURES = [
  { text: "Unlimited items", included: true },
  { text: "Unlimited collections", included: true },
  { text: "File & image uploads", included: true },
  { text: "AI auto-tagging", included: true },
  { text: "AI code explanation", included: true },
  { text: "Prompt optimizer", included: true },
  { text: "Export (JSON / ZIP)", included: true },
  { text: "Priority support", included: true },
];

export default function UpgradePage() {
  const [yearly, setYearly] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const proMonthly = yearly ? 6 : 8;
  const proNote = yearly ? "Billed $72/year — save 25%" : "Billed $8/month";

  async function handleUpgrade() {
    setLoading(true);
    try {
      await createCheckoutSession(yearly ? "yearly" : "monthly");
    } catch {
      // redirect throws, so only real errors land here
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4">
          <Zap className="w-4 h-4" />
          Upgrade to Pro
        </div>
        <h1 className="text-3xl font-bold mb-3">Unlock the full Rongeka experience</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Get unlimited items, file uploads, and AI-powered features.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={`text-sm font-medium ${!yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <Switch
          checked={yearly}
          onCheckedChange={setYearly}
          aria-label="Toggle yearly pricing"
        />
        <span className={`text-sm font-medium ${yearly ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
          {yearly && (
            <span className="ml-2 text-xs text-green-500 font-semibold">Save 25%</span>
          )}
        </span>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="rounded-xl border border-border bg-background p-8 flex flex-col">
          <div className="text-lg font-semibold mb-1">Free</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground mb-1">/mo</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Your current plan</p>
          <hr className="border-border mb-6" />
          <ul className="space-y-3 mb-8 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                {f.included ? (
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className={f.included ? "text-foreground" : "text-muted-foreground/60"}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            Stay on Free
          </Button>
        </div>

        {/* Pro */}
        <div className="rounded-xl border-2 border-[#3b82f6] bg-background p-8 flex flex-col relative shadow-lg shadow-blue-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white text-xs font-semibold px-3 py-1 rounded-full">
            ✦ Most Popular
          </div>
          <div className="text-lg font-semibold text-[#3b82f6] mb-1">Pro</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-bold">${proMonthly}</span>
            <span className="text-muted-foreground mb-1">/mo</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6 h-4">{proNote}</p>
          <hr className="border-border mb-6" />
          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-sm">
                <Check className="w-4 h-4 text-green-500 shrink-0" />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-white border-0 hover:opacity-90"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Redirecting…" : `Upgrade to Pro — $${yearly ? "72/yr" : "8/mo"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
