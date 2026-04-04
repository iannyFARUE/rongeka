# Stripe Integration — Phase 1: Core Infrastructure

## Status

Not started

## Goals

Set up all foundational Stripe pieces: the library, environment variables, session sync, usage-limit module, and server actions for checkout and portal. No webhook processing or UI in this phase — just the building blocks that Phase 2 depends on.

## Implementation Steps

### 1. Install Stripe SDK

```bash
npm install stripe
```

### 2. Add environment variables

Add to `.env.local` (already stubbed in `.env.example`):

```bash
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # needed in Phase 2, add now
STRIPE_PRICE_ID_MONTHLY="price_..."
STRIPE_PRICE_ID_YEARLY="price_..."
```

### 3. Create `src/lib/stripe.ts`

Stripe client singleton + price ID constants.

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

### 4. Extend Session type — `src/types/next-auth.d.ts`

Create if it doesn't exist:

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

### 5. Update JWT callback in `src/auth.ts`

Always sync `isPro` from the DB on every session validation. This ensures webhook-driven updates are reflected after a page reload without relying on `trigger === "update"` (which is unreliable for our use case).

```typescript
async jwt({ token, user }) {
  if (user) {
    token.sub = user.id;
  }

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

### 6. Add free tier constants to `src/lib/constants.ts`

```typescript
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

### 7. Create `src/lib/usage-limits.ts`

Pure functions that check DB counts and return whether a free user has hit a limit. Kept separate from actions so they're easy to unit test.

```typescript
import { prisma } from "@/lib/db";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "@/lib/constants";

export async function hasReachedItemLimit(userId: string): Promise<boolean> {
  const count = await prisma.item.count({ where: { userId } });
  return count >= FREE_TIER_ITEM_LIMIT;
}

export async function hasReachedCollectionLimit(userId: string): Promise<boolean> {
  const count = await prisma.collection.count({ where: { userId } });
  return count >= FREE_TIER_COLLECTION_LIMIT;
}

export const PRO_ONLY_ITEM_TYPES = new Set(["file", "image"]);

export function isProOnlyType(typeName: string): boolean {
  return PRO_ONLY_ITEM_TYPES.has(typeName);
}
```

### 8. Create `src/actions/billing.ts`

`createCheckoutSession` and `createPortalSession` server actions.

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

## Unit Tests

Write tests in `src/lib/__tests__/usage-limits.test.ts`. Mock `@/lib/db` (Prisma).

### Cases to cover

**`hasReachedItemLimit`**
- returns `false` when count is below 50
- returns `true` when count equals 50
- returns `true` when count exceeds 50

**`hasReachedCollectionLimit`**
- returns `false` when count is below 3
- returns `true` when count equals 3
- returns `true` when count exceeds 3

**`isProOnlyType`**
- returns `true` for `"file"`
- returns `true` for `"image"`
- returns `false` for `"snippet"`, `"prompt"`, `"command"`, `"note"`, `"link"`

### `createCheckoutSession` action
- returns `{ success: false, error: "Not authenticated." }` when no session
- returns `{ success: false, error: "No billing account found." }` for `createPortalSession` when user has no `stripeCustomerId`

Run with: `npm test`

## Acceptance Criteria

- [ ] `npm run build` passes
- [ ] `npm test` passes — all usage-limits tests green
- [ ] `session.user.isPro` is present in the session type (TypeScript compiles without errors)
- [ ] Manually verify: sign in, open DevTools Application > Cookies, decode the session JWT — `isPro` field should be present

## Notes

- Do not create the billing page or webhook handler in this phase — those are Phase 2
- The `STRIPE_WEBHOOK_SECRET` env var should be added to `.env.local` now even though the webhook route is not yet built
- `src/types/next-auth.d.ts` may already exist — check before creating
