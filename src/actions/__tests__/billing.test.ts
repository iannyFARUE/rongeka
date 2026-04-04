import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
  STRIPE_PRICES: { monthly: "price_monthly", yearly: "price_yearly" },
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { createCheckoutSession, createPortalSession } from "@/actions/billing";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.user.update as ReturnType<typeof vi.fn>;
const mockCustomersCreate = stripe.customers.create as ReturnType<typeof vi.fn>;
const mockSessionsCreate = stripe.checkout.sessions.create as ReturnType<typeof vi.fn>;
const mockPortalCreate = stripe.billingPortal.sessions.create as ReturnType<typeof vi.fn>;
const mockRedirect = redirect as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── createCheckoutSession ───────────────────────────────────────────────────

describe("createCheckoutSession", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await createCheckoutSession("monthly");
    expect(result).toEqual({ success: false, error: "Not authenticated." });
    expect(mockSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns error when user is not found in DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);
    const result = await createCheckoutSession("monthly");
    expect(result).toEqual({ success: false, error: "User not found." });
  });

  it("creates a new Stripe customer when stripeCustomerId is null", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ email: "test@example.com", stripeCustomerId: null });
    mockCustomersCreate.mockResolvedValue({ id: "cus_new" });
    mockUpdate.mockResolvedValue({});
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test" });

    await createCheckoutSession("monthly");

    expect(mockCustomersCreate).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { stripeCustomerId: "cus_new" },
    });
  });

  it("reuses existing Stripe customer when stripeCustomerId is set", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ email: "test@example.com", stripeCustomerId: "cus_existing" });
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test" });

    await createCheckoutSession("monthly");

    expect(mockCustomersCreate).not.toHaveBeenCalled();
    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" })
    );
  });

  it("creates checkout session with the monthly price", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ email: "test@example.com", stripeCustomerId: "cus_123" });
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test" });

    await createCheckoutSession("monthly");

    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        line_items: [{ price: STRIPE_PRICES.monthly, quantity: 1 }],
        metadata: { userId: "user-1" },
      })
    );
  });

  it("creates checkout session with the yearly price", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ email: "test@example.com", stripeCustomerId: "cus_123" });
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test" });

    await createCheckoutSession("yearly");

    expect(mockSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: STRIPE_PRICES.yearly, quantity: 1 }],
      })
    );
  });

  it("redirects to the checkout URL on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ email: "test@example.com", stripeCustomerId: "cus_123" });
    mockSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/pay/cs_test" });

    await createCheckoutSession("monthly");

    expect(mockRedirect).toHaveBeenCalledWith("https://checkout.stripe.com/pay/cs_test");
  });
});

// ─── createPortalSession ─────────────────────────────────────────────────────

describe("createPortalSession", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await createPortalSession();
    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });

  it("returns error when user has no stripeCustomerId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ stripeCustomerId: null });
    const result = await createPortalSession();
    expect(result).toEqual({ success: false, error: "No billing account found." });
    expect(mockPortalCreate).not.toHaveBeenCalled();
  });

  it("returns error when user is not found", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue(null);
    const result = await createPortalSession();
    expect(result).toEqual({ success: false, error: "No billing account found." });
  });

  it("creates a portal session with the customer ID", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ stripeCustomerId: "cus_123" });
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session/xxx" });

    await createPortalSession();

    expect(mockPortalCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_123" })
    );
  });

  it("redirects to the portal URL on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockFindUnique.mockResolvedValue({ stripeCustomerId: "cus_123" });
    mockPortalCreate.mockResolvedValue({ url: "https://billing.stripe.com/session/xxx" });

    await createPortalSession();

    expect(mockRedirect).toHaveBeenCalledWith("https://billing.stripe.com/session/xxx");
  });
});
