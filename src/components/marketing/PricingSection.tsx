"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";

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

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const proMonthly = yearly ? 6 : 8;
  const proNote = yearly ? "Billed $72/year — save 25%" : "";

  return (
    <section id="pricing" className="py-24 bg-muted/20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free. Upgrade when you&apos;re ready for AI and unlimited resources.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
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
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-xl border border-border bg-background p-8 flex flex-col">
            <div className="text-lg font-semibold mb-1">Free</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground mb-1">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Always free. No credit card.</p>
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
            <Link href="/register" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}>
              Get Started Free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-xl border-2 border-primary bg-background p-8 flex flex-col relative shadow-lg shadow-primary/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              ✦ Most Popular
            </div>
            <div className="text-lg font-semibold text-primary mb-1">Pro</div>
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
            <Link href="/register" className={cn(buttonVariants(), "w-full justify-center")}>
              Get Pro
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
