import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
  },
}));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findFirst: vi.fn(), update: vi.fn() },
  },
}));

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { POST } from "../route";

const mockConstructEvent = stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>;
const mockFindFirst = prisma.user.findFirst as ReturnType<typeof vi.fn>;
const mockUpdate = prisma.user.update as ReturnType<typeof vi.fn>;

function makeRequest(body: string, sig: string | null) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: sig ? { "stripe-signature": sig } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Signature validation ────────────────────────────────────────────────────

describe("POST /api/webhooks/stripe — signature validation", () => {
  it("returns 400 when stripe-signature header is missing", async () => {
    const res = await POST(makeRequest("{}", null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing signature");
  });

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => { throw new Error("Bad signature"); });
    const res = await POST(makeRequest("{}", "bad-sig"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid signature");
  });
});

// ─── checkout.session.completed ──────────────────────────────────────────────

describe("POST /api/webhooks/stripe — checkout.session.completed", () => {
  it("upgrades user to Pro when mode is subscription and userId is in metadata", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          metadata: { userId: "user-1" },
          customer: "cus_123",
          subscription: "sub_123",
        },
      },
    };
    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeRequest("{}", "sig"));
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { isPro: true, stripeCustomerId: "cus_123", stripeSubscriptionId: "sub_123" },
    });
  });

  it("does not update DB when mode is not subscription", async () => {
    const event = {
      type: "checkout.session.completed",
      data: { object: { mode: "payment", metadata: { userId: "user-1" }, customer: "cus_123", subscription: null } },
    };
    mockConstructEvent.mockReturnValue(event);

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("does not update DB when userId is missing from metadata", async () => {
    const event = {
      type: "checkout.session.completed",
      data: { object: { mode: "subscription", metadata: {}, customer: "cus_123", subscription: "sub_123" } },
    };
    mockConstructEvent.mockReturnValue(event);

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ─── customer.subscription.updated ───────────────────────────────────────────

describe("POST /api/webhooks/stripe — customer.subscription.updated", () => {
  it("sets isPro true when status is active", async () => {
    const event = {
      type: "customer.subscription.updated",
      data: { object: { id: "sub_123", status: "active", customer: "cus_123" } },
    };
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "user-1" });

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { isPro: true, stripeSubscriptionId: "sub_123" },
    });
  });

  it("sets isPro true when status is trialing", async () => {
    const event = {
      type: "customer.subscription.updated",
      data: { object: { id: "sub_123", status: "trialing", customer: "cus_123" } },
    };
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "user-1" });

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isPro: true }) })
    );
  });

  it("sets isPro false when status is past_due", async () => {
    const event = {
      type: "customer.subscription.updated",
      data: { object: { id: "sub_123", status: "past_due", customer: "cus_123" } },
    };
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "user-1" });

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ isPro: false }) })
    );
  });

  it("does not update DB when user is not found", async () => {
    const event = {
      type: "customer.subscription.updated",
      data: { object: { id: "sub_123", status: "active", customer: "cus_unknown" } },
    };
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue(null);

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ─── customer.subscription.deleted ───────────────────────────────────────────

describe("POST /api/webhooks/stripe — customer.subscription.deleted", () => {
  it("sets isPro false and clears stripeSubscriptionId", async () => {
    const event = {
      type: "customer.subscription.deleted",
      data: { object: { customer: "cus_123" } },
    };
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue({ id: "user-1" });

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { isPro: false, stripeSubscriptionId: null },
    });
  });

  it("does not update DB when user is not found", async () => {
    const event = {
      type: "customer.subscription.deleted",
      data: { object: { customer: "cus_unknown" } },
    };
    mockConstructEvent.mockReturnValue(event);
    mockFindFirst.mockResolvedValue(null);

    await POST(makeRequest("{}", "sig"));
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

// ─── Unknown event ────────────────────────────────────────────────────────────

describe("POST /api/webhooks/stripe — unknown event", () => {
  it("returns 200 without touching the DB for unhandled event types", async () => {
    const event = { type: "invoice.paid", data: { object: {} } };
    mockConstructEvent.mockReturnValue(event);

    const res = await POST(makeRequest("{}", "sig"));
    expect(res.status).toBe(200);
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});
