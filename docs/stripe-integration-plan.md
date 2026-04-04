# Stripe Integration Plan — Rongeka Pro

## Overview

Integrate Stripe subscriptions for Rongeka Pro ($8/month or $72/year). Users on the free tier are limited to 50 items and 3 collections. Pro users get unlimited items/collections, file/image uploads, and AI features.

---

## Current State

### Already in place

- `User.isPro` (Boolean, default false) — the source of truth for Pro status
- `User.stripeCustomerId` (String, unique) — links user to Stripe customer
- `User.stripeSubscriptionId` (String, unique) — tracks active subscription
- Stripe env vars already documented in `.env.example`
- `isPro` already referenced in `Sidebar.tsx` to badge Pro item types

### Not yet enforced

- Free tier limits (50 items, 3 collections) are not checked anywhere
- No Stripe client, checkout, webhook handler, or billing UI exists
- `src/lib/stripe.ts` is referenced in project overview but does not exist

---

## Implementation Order

1. Stripe library setup
2. JWT callback — sync `isPro` from DB on every session validation
3. Checkout server action + success/cancel pages
4. Webhook handler
5. Billing page
6. Free tier limit enforcement

---

## 1. Stripe Library

**Create `src/lib/stripe.ts`**

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;
```

Install: `npm install stripe`

---

## 2. JWT Callback — Session Sync

**Modify `src/auth.ts`** — update the `jwt` callback so `isPro` is always read from the DB, not just on initial sign-in. This ensures Stripe webhook updates are reflected in the session after a page reload.

```typescript
// src/auth.ts — inside callbacks
async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
  }

  // Always sync isPro from DB to catch webhook-driven updates
  if (token.sub) {
    const dbUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { isPro: true },
    });
    token.isPro = dbUser?.isPro ?? false;
  }

  return token;
},

session({ session, token }) {
  if (token.sub) session.user.id = token.sub;
  if (token.isPro !== undefined) session.user.isPro = token.isPro as boolean;
  return session;
},
```

**Extend the Session type** in `src/types/next-auth.d.ts` (create if missing):

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      isPro: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isPro?: boolean;
  }
}
```

---

## 3. Checkout Server Action

**Create `src/actions/billing.ts`**

```typescript
"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function createCheckoutSession(plan: "monthly" | "yearly") {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });

  if (!user) return { success: false, error: "User not found." };

  // Reuse or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: user.email! });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=1`,
    metadata: { userId: session.user.id },
  });

  redirect(checkoutSession.url!);
}

export async function createPortalSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return { success: false, error: "No billing account found." };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  redirect(portalSession.url);
}
```

---

## 4. Webhook Handler

**Create `src/app/api/webhooks/stripe/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.metadata?.userId) {
        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            isPro: true,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const isPro = sub.status === "active" || sub.status === "trialing";
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: sub.customer as string },
        select: { id: true },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isPro, stripeSubscriptionId: sub.id },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: sub.customer as string },
        select: { id: true },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isPro: false, stripeSubscriptionId: null },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

**IMPORTANT**: This route must **not** use the `auth()` middleware — Stripe signs the raw body. Ensure `middleware.ts` does not block `/api/webhooks/stripe`.

---

## 5. Billing Page

**Create `src/app/(dashboard)/billing/page.tsx`**

```typescript
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { BillingActions } from "@/components/billing/BillingActions";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeSubscriptionId: true },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your Rongeka subscription.
        </p>
      </div>
      <BillingActions isPro={user?.isPro ?? false} hasSubscription={!!user?.stripeSubscriptionId} />
    </div>
  );
}
```

**Create `src/components/billing/BillingActions.tsx`** (client component):

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession, createPortalSession } from "@/actions/billing";

interface Props {
  isPro: boolean;
  hasSubscription: boolean;
}

export function BillingActions({ isPro, hasSubscription }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  if (isPro) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-4">
          <p className="font-medium text-violet-300">You are on Rongeka Pro</p>
          <p className="text-sm text-muted-foreground mt-1">
            Unlimited items, collections, file uploads, and AI features.
          </p>
        </div>
        {hasSubscription && (
          <form action={async () => { setLoading("portal"); await createPortalSession(); }}>
            <Button variant="outline" disabled={loading === "portal"}>
              {loading === "portal" ? "Redirecting..." : "Manage Subscription"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Upgrade to Pro to unlock unlimited items, file uploads, and AI features.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 space-y-3">
          <p className="font-medium">Monthly</p>
          <p className="text-2xl font-bold">$8<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          <form action={async () => { setLoading("monthly"); await createCheckoutSession("monthly"); }}>
            <Button className="w-full" disabled={loading === "monthly"}>
              {loading === "monthly" ? "Redirecting..." : "Subscribe Monthly"}
            </Button>
          </form>
        </div>
        <div className="rounded-lg border border-violet-500/40 p-4 space-y-3">
          <p className="font-medium">Yearly <span className="text-xs text-violet-400 ml-1">Save 25%</span></p>
          <p className="text-2xl font-bold">$72<span className="text-sm font-normal text-muted-foreground">/year</span></p>
          <form action={async () => { setLoading("yearly"); await createCheckoutSession("yearly"); }}>
            <Button className="w-full bg-violet-600 hover:bg-violet-700" disabled={loading === "yearly"}>
              {loading === "yearly" ? "Redirecting..." : "Subscribe Yearly"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

Add a "Billing" link to the sidebar user dropdown (in `Sidebar.tsx`) between Profile and Sign out.

---

## 6. Free Tier Limit Enforcement

### Constants

**Add to `src/lib/constants.ts`**:

```typescript
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

### Block item creation

**Modify `src/actions/items.ts`** — add a limit check inside `createItem` before the DB call:

```typescript
// After auth check, before Zod parse
const isPro = session.user.isPro;
if (!isPro) {
  const count = await prisma.item.count({ where: { userId: session.user.id } });
  if (count >= FREE_TIER_ITEM_LIMIT) {
    return {
      success: false,
      error: `Free tier limit reached (${FREE_TIER_ITEM_LIMIT} items). Upgrade to Pro for unlimited items.`,
    };
  }
}
```

Also block file/image types for free users:

```typescript
const PRO_ONLY_TYPES = new Set(["file", "image"]);
if (!isPro && PRO_ONLY_TYPES.has(payload.typeName)) {
  return { success: false, error: "File and image uploads require Rongeka Pro." };
}
```

### Block collection creation

**Modify `src/actions/collections.ts`** — add inside `createCollection`:

```typescript
const isPro = session.user.isPro;
if (!isPro) {
  const count = await prisma.collection.count({ where: { userId: session.user.id } });
  if (count >= FREE_TIER_COLLECTION_LIMIT) {
    return {
      success: false,
      error: `Free tier limit reached (${FREE_TIER_COLLECTION_LIMIT} collections). Upgrade to Pro for unlimited collections.`,
    };
  }
}
```

---

## 7. Environment Variables

Add to `.env.local` and `.env.example`:

```bash
# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."
```

---

## 8. Stripe Dashboard Setup

1. **Create a Product**: "Rongeka Pro"
2. **Create two Prices** on that product:
   - $8.00 USD / month (recurring) → copy ID to `STRIPE_PRICE_ID_MONTHLY`
   - $72.00 USD / year (recurring) → copy ID to `STRIPE_PRICE_ID_YEARLY`
3. **Configure Customer Portal**: Stripe Dashboard → Billing → Customer Portal → Enable
4. **Add Webhook Endpoint**:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`
5. **For local testing**: Use the Stripe CLI — `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

---

## 9. Files to Create

| File | Purpose |
|---|---|
| `src/lib/stripe.ts` | Stripe client singleton + price ID constants |
| `src/actions/billing.ts` | `createCheckoutSession`, `createPortalSession` server actions |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler for subscription events |
| `src/app/(dashboard)/billing/page.tsx` | Billing page (server component) |
| `src/components/billing/BillingActions.tsx` | Checkout/portal buttons (client component) |
| `src/types/next-auth.d.ts` | Extend Session type with `isPro` |

---

## 10. Files to Modify

| File | Change |
|---|---|
| `src/auth.ts` | Add `isPro` sync to JWT callback; add to session callback |
| `src/actions/items.ts` | Add free tier item/type limit checks in `createItem` |
| `src/actions/collections.ts` | Add free tier collection limit check in `createCollection` |
| `src/lib/constants.ts` | Add `FREE_TIER_ITEM_LIMIT` and `FREE_TIER_COLLECTION_LIMIT` |
| `src/components/layout/Sidebar.tsx` | Add "Billing" link to user dropdown |
| `middleware.ts` | Verify `/api/webhooks/stripe` is NOT protected by auth middleware |
| `.env.example` | Stripe vars already present — no change needed |

---

## 11. Testing Checklist

### Unit tests
- [ ] `createCheckoutSession` — unauthenticated returns error
- [ ] `createPortalSession` — user with no Stripe customer returns error
- [ ] `createItem` — returns limit error when free user has 50 items
- [ ] `createCollection` — returns limit error when free user has 3 collections

### Manual / Stripe CLI tests
- [ ] New free user: can create up to 50 items, blocked on 51st
- [ ] New free user: can create up to 3 collections, blocked on 4th
- [ ] Free user clicks "Subscribe Monthly" → redirected to Stripe checkout
- [ ] Successful checkout → `isPro` becomes true, page reload shows Pro status
- [ ] Customer portal → can cancel, downgrade
- [ ] `customer.subscription.deleted` webhook → `isPro` set to false
- [ ] `customer.subscription.updated` (status = `past_due`) → `isPro` set to false
- [ ] Billing page shows correct state for free vs Pro users
- [ ] Webhook rejects requests with invalid `stripe-signature`
