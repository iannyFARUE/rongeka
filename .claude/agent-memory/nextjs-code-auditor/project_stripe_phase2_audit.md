---
name: Stripe Phase 2 Audit Findings
description: Issues found during Stripe Phase 2 code review on 2026-04-04
type: project
---

Stripe Phase 2 introduced the webhook handler, free-tier gating in actions, and the billing page/UI.

**Known issues (confirmed, not yet fixed):**

1. `src/actions/items.ts` — isProOnlyType and isPro checks run before Zod validation. If Zod later rejects the payload, the DB count query was wasted. Minor ordering issue.

2. `src/app/api/webhooks/stripe/route.ts` line 10 — `stripe-signature` header read with `!` (non-null assertion). If the header is absent, `constructEvent` throws, which is caught — so the behavior is safe, but the assertion is misleading (could mask if the try/catch were removed).

3. `checkout.session.completed` handler only sets `stripeCustomerId` indirectly (via metadata.userId lookup), but does NOT sync `stripeCustomerId` from the session object. The customer ID is already saved in `createCheckoutSession` so this is not a gap in practice.

4. `BillingActions.tsx` — redirect actions (`createCheckoutSession`, `createPortalSession`) use Next.js `redirect()` which throws internally. The `setLoading(null)` line after `await` is unreachable on success (redirect throws before it returns). Loading state is never reset on successful redirect — harmless since the page navigates away, but the code is misleading.

**How to apply:** When modifying billing/auth actions, remember redirect() never returns — code after it is dead on the success path.
