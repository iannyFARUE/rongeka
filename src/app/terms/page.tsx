import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Terms of Service — Rongeka",
  description: "The terms governing your use of Rongeka.",
};

const LAST_UPDATED = "April 20, 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white/90">{title}</h2>
      <div className="text-white/50 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white/70 fill-white/70" />
            </div>
            <span className="font-semibold">Rongeka</span>
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-white/50 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 pt-36 pb-24 space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-white/30">Last updated: {LAST_UPDATED}</p>
          <p className="text-white/50 leading-relaxed pt-2">
            These Terms of Service (&quot;Terms&quot;) govern your use of Rongeka, a
            product of{" "}
            <span className="text-white/80 font-medium">Firdian Corp</span>{" "}
            (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating an account or using Rongeka, you
            agree to these Terms.
          </p>
        </div>

        <Section title="1. Eligibility">
          <p>
            You must be at least 16 years old to use Rongeka. By using the
            service you represent that you meet this requirement and that the
            information you provide is accurate.
          </p>
        </Section>

        <Section title="2. Your account">
          <p>
            You are responsible for keeping your credentials secure and for all
            activity that occurs under your account. Notify us immediately at{" "}
            <a
              href="mailto:support@firdian.com"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              support@firdian.com
            </a>{" "}
            if you suspect unauthorised access.
          </p>
          <p>
            You may not share your account, create accounts by automated means,
            or impersonate any person or entity.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to use Rongeka to:</p>
          <ul className="space-y-2">
            {[
              "Upload or store illegal, harmful, or infringing content",
              "Attempt to gain unauthorised access to our systems or other users' data",
              "Reverse-engineer, scrape, or abuse the service in a way that degrades performance for others",
              "Resell or sublicense access to Rongeka without our written permission",
              "Violate any applicable law or regulation",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these rules, with or without notice.
          </p>
        </Section>

        <Section title="4. Your content">
          <p>
            You retain ownership of all content you create in Rongeka —
            snippets, notes, files, and everything else. By uploading content
            you grant Firdian Corp a limited, non-exclusive licence to store,
            process, and display it solely to provide the service to you.
          </p>
          <p>
            You are solely responsible for your content and must ensure you have
            the right to store and use it.
          </p>
        </Section>

        <Section title="5. Free and Pro plans">
          <p>
            Rongeka offers a free tier with usage limits and a Pro subscription
            billed monthly or annually via Stripe. Pricing is displayed on the{" "}
            <Link
              href="/#pricing"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              Pricing
            </Link>{" "}
            page and may change with 30 days&apos; notice.
          </p>
          <p>
            Subscriptions renew automatically. You can cancel at any time from
            your account settings; cancellation takes effect at the end of the
            current billing period with no refund for the remaining time unless
            required by applicable law.
          </p>
        </Section>

        <Section title="6. Intellectual property">
          <p>
            Rongeka, its logo, design, and underlying code are the property of
            Firdian Corp and are protected by copyright and other intellectual
            property laws. Nothing in these Terms grants you a licence to use
            our trademarks or branding.
          </p>
        </Section>

        <Section title="7. Service availability">
          <p>
            We aim for high availability but do not guarantee uninterrupted
            access. We may modify, suspend, or discontinue any part of the
            service at any time. Where feasible we will provide advance notice
            of significant changes.
          </p>
        </Section>

        <Section title="8. Disclaimer of warranties">
          <p>
            Rongeka is provided &quot;as is&quot; and &quot;as available&quot; without warranties
            of any kind, express or implied, including fitness for a particular
            purpose or non-infringement.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the fullest extent permitted by law, Firdian Corp will not be
            liable for any indirect, incidental, special, or consequential
            damages arising from your use of Rongeka. Our total liability to you
            for any claim will not exceed the amount you paid us in the 12
            months preceding the claim.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            These Terms are governed by the laws of the jurisdiction in which
            Firdian Corp is incorporated. Any disputes will be resolved in the
            courts of that jurisdiction.
          </p>
        </Section>

        <Section title="11. Changes to these Terms">
          <p>
            We may update these Terms from time to time. When we do, we will
            update the &quot;Last updated&quot; date above. Continued use of Rongeka
            after changes are posted constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about these Terms? Email us at{" "}
            <a
              href="mailto:legal@firdian.com"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              legal@firdian.com
            </a>
            .
          </p>
        </Section>

        <div className="pt-4">
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
