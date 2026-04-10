"use server";

import { redirect } from "next/navigation";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/action-utils";

export async function createCheckoutSession(plan: "monthly" | "yearly") {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { email: true, stripeCustomerId: true },
  });

  if (!dbUser) return { success: false, error: "User not found." };

  let customerId = dbUser.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: dbUser.email! });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: STRIPE_PRICES[plan], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=1`,
    metadata: { userId: user.userId },
  });

  redirect(checkoutSession.url!);
}

export async function createPortalSession() {
  const user = await requireAuth();
  if (!user) return { success: false, error: "Not authenticated." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return { success: false, error: "No billing account found." };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  redirect(portalSession.url);
}
