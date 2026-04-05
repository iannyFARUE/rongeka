import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getProfileData } from "@/lib/db/profile";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { ChangePasswordDialog } from "@/components/profile/ChangePasswordDialog";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { EditorPreferencesForm } from "@/components/settings/EditorPreferencesForm";
import { BillingActions } from "@/components/billing/BillingActions";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const [profile, editorPreferences, billingUser] = await Promise.all([
    getProfileData(userId),
    getEditorPreferences(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPro: true, stripeSubscriptionId: true, subscriptionCancelAt: true },
    }),
  ]);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Editor Preferences */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Editor
        </h2>
        <EditorPreferencesForm initial={editorPreferences} />
      </section>

      {/* Billing */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Billing
        </h2>
        <BillingActions
          isPro={billingUser?.isPro ?? false}
          hasSubscription={!!billingUser?.stripeSubscriptionId}
          cancelAt={billingUser?.subscriptionCancelAt ?? null}
        />
      </section>

      {/* Account Actions */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Account
        </h2>
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {profile.hasPassword && (
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">Change your account password</p>
              </div>
              <ChangePasswordDialog />
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <DeleteAccountDialog />
          </div>
        </div>
      </section>
    </div>
  );
}
