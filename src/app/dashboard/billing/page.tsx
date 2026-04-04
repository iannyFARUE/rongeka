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
