export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

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
            stripeCustomerId: session.customer as string,
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
