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
import { createCheckoutSession, createPortalSession } from "@/actions/billing";

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCheckoutSession", () => {
  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await createCheckoutSession("monthly");
    expect(result).toEqual({ success: false, error: "Not authenticated." });
  });
});

describe("createPortalSession", () => {
  it("returns error when user has no stripeCustomerId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user1" } });
    mockFindUnique.mockResolvedValue({ stripeCustomerId: null });
    const result = await createPortalSession();
    expect(result).toEqual({ success: false, error: "No billing account found." });
  });
});
