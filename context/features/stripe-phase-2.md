# Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

## Status

Not started

## Prerequisites

Phase 1 must be complete:
- `src/lib/stripe.ts` exists
- `src/lib/usage-limits.ts` exists
- `src/actions/billing.ts` exists
- `session.user.isPro` is typed and synced from DB
- All Phase 1 tests passing

## Goals

Wire up the Stripe webhook handler, enforce free tier limits in server actions, and build the billing page. This phase requires the Stripe CLI running locally to test end-to-end.

## Implementation Steps

### 1. Webhook handler — `src/app/api/webhooks/stripe/route.ts`

Handles three events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

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

**Important:** This route must not be protected by auth middleware. Verify that `middleware.ts` does not intercept `/api/webhooks/stripe`. The raw body must be read via `req.text()` — not `req.json()` — for signature verification to work.

### 2. Enforce free tier limits in `src/actions/items.ts`

Inside `createItem`, after the auth check and before the Zod parse:

```typescript
const isPro = session.user.isPro;

// Block Pro-only item types
if (!isPro && isProOnlyType(payload.typeName)) {
  return { success: false, error: "File and image uploads require Rongeka Pro." };
}

// Enforce item count limit
if (!isPro) {
  const limited = await hasReachedItemLimit(session.user.id);
  if (limited) {
    return {
      success: false,
      error: `Free tier limit reached (${FREE_TIER_ITEM_LIMIT} items). Upgrade to Pro for unlimited items.`,
    };
  }
}
```

Imports to add:
```typescript
import { hasReachedItemLimit, isProOnlyType, PRO_ONLY_ITEM_TYPES } from "@/lib/usage-limits";
import { FREE_TIER_ITEM_LIMIT } from "@/lib/constants";
```

### 3. Enforce free tier limits in `src/actions/collections.ts`

Inside `createCollection`, after the auth check:

```typescript
const isPro = session.user.isPro;

if (!isPro) {
  const limited = await hasReachedCollectionLimit(session.user.id);
  if (limited) {
    return {
      success: false,
      error: `Free tier limit reached (${FREE_TIER_COLLECTION_LIMIT} collections). Upgrade to Pro for unlimited collections.`,
    };
  }
}
```

Imports to add:
```typescript
import { hasReachedCollectionLimit } from "@/lib/usage-limits";
import { FREE_TIER_COLLECTION_LIMIT } from "@/lib/constants";
```

### 4. Billing page — `src/app/(dashboard)/billing/page.tsx`

Server component. Reads user's `isPro` and `stripeSubscriptionId` from DB. Passes them to a client component for the interactive checkout/portal buttons.

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
      <BillingActions
        isPro={user?.isPro ?? false}
        hasSubscription={!!user?.stripeSubscriptionId}
      />
    </div>
  );
}
```

### 5. Billing actions component — `src/components/billing/BillingActions.tsx`

Client component with checkout plan selector and portal link.

- Free users: see monthly ($8/mo) and yearly ($72/yr, "Save 25%") options with Subscribe buttons
- Pro users: see a Pro status badge and "Manage Subscription" button (links to Stripe portal)
- Loading state on buttons while redirect is in progress
- Yearly plan visually highlighted (violet border, "Save 25%" label)

### 6. Add "Billing" to sidebar user dropdown in `src/components/layout/Sidebar.tsx`

Add between Profile and Sign out:

```tsx
<DropdownMenuItem asChild>
  <Link href="/dashboard/billing">Billing</Link>
</DropdownMenuItem>
```

## Testing (Stripe CLI Required)

These tests cannot be run with `npm test`. They require the Stripe CLI to forward webhook events locally.

### Setup

```bash
# Terminal 1 — dev server
npm run dev

# Terminal 2 — forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the signing secret it prints and set STRIPE_WEBHOOK_SECRET in .env.local
```

Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC.

### Checklist

**Checkout flow**
- [ ] Free user visits `/dashboard/billing` — sees Free plan with two Subscribe buttons
- [ ] Clicking "Subscribe Monthly" redirects to Stripe Checkout
- [ ] Completing checkout redirects to `/dashboard/billing?success=1`
- [ ] After reload, billing page shows Pro status
- [ ] `isPro = true` and `stripeSubscriptionId` are set in DB

**Webhook handler**
- [ ] `checkout.session.completed` → `isPro` set to `true`
- [ ] `customer.subscription.updated` with `status: past_due` → `isPro` set to `false`
- [ ] `customer.subscription.deleted` → `isPro` set to `false`, `stripeSubscriptionId` set to `null`
- [ ] Request with invalid `stripe-signature` → 400 response

**Feature gating**
- [ ] Free user with 50 items: creating item #51 shows error toast with upgrade message
- [ ] Free user with 3 collections: creating collection #4 shows error toast with upgrade message
- [ ] Free user: selecting "File" or "Image" type in NewItemDialog shows error toast
- [ ] Pro user: none of the above limits apply

**Customer portal**
- [ ] Pro user sees "Manage Subscription" button
- [ ] Clicking it redirects to Stripe customer portal
- [ ] Canceling subscription in portal triggers `customer.subscription.deleted` webhook
- [ ] After cancel + page reload, billing page shows Free plan again

**Middleware**
- [ ] Confirm `/api/webhooks/stripe` is not blocked by auth middleware (Stripe sends unauthenticated POSTs)

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] `npm test` passes (existing tests unbroken)
- [ ] All Stripe CLI checklist items above verified manually
- [ ] Free user cannot exceed 50 items / 3 collections / use file+image types
- [ ] Pro user has no restrictions

## Notes

- The billing page reads `isPro` from DB directly (not just session) to always show accurate state even if the session hasn't been refreshed since a webhook fired
- Do not show Stripe price IDs or any internal Stripe data in the UI
- Error toasts from limit checks should include a hint to upgrade (the message string in the action is sufficient — no extra UI needed)
- The Stripe Customer Portal must be enabled in the Stripe Dashboard before `createPortalSession` will work
