"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createCheckoutSession, createPortalSession } from "@/actions/billing";

interface BillingActionsProps {
  isPro: boolean;
  hasSubscription: boolean;
}

export function BillingActions({ isPro, hasSubscription }: BillingActionsProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);

  async function handleCheckout(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      await createCheckoutSession(plan);
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      await createPortalSession();
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  if (isPro) {
    return (
      <div className="rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">Current Plan</h2>
          <Badge className="bg-violet-600/20 text-violet-400 border-0">Pro</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          You have access to all Pro features including unlimited items, collections, file uploads, and AI tools.
        </p>
        {hasSubscription && (
          <Button
            variant="outline"
            onClick={handlePortal}
            disabled={loading === "portal"}
          >
            {loading === "portal" ? "Redirecting…" : "Manage Subscription"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Upgrade to Pro</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Monthly */}
        <div className="rounded-lg border border-border p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Monthly</p>
            <p className="text-3xl font-semibold mt-1">$8<span className="text-base font-normal text-muted-foreground">/mo</span></p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Unlimited items &amp; collections</li>
            <li>File &amp; image uploads</li>
            <li>AI features</li>
          </ul>
          <Button
            className="w-full"
            onClick={() => handleCheckout("monthly")}
            disabled={loading !== null}
          >
            {loading === "monthly" ? "Redirecting…" : "Subscribe Monthly"}
          </Button>
        </div>

        {/* Yearly */}
        <div className="rounded-lg border border-violet-500/50 p-6 space-y-4 relative">
          <span className="absolute top-3 right-3 text-xs bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full">
            Save 25%
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Yearly</p>
            <p className="text-3xl font-semibold mt-1">$72<span className="text-base font-normal text-muted-foreground">/yr</span></p>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>Unlimited items &amp; collections</li>
            <li>File &amp; image uploads</li>
            <li>AI features</li>
          </ul>
          <Button
            className="w-full"
            onClick={() => handleCheckout("yearly")}
            disabled={loading !== null}
          >
            {loading === "yearly" ? "Redirecting…" : "Subscribe Yearly"}
          </Button>
        </div>
      </div>
    </div>
  );
}
