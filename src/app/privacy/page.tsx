import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Rongeka",
  description: "How Rongeka collects, uses, and protects your data.",
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

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-white/30">Last updated: {LAST_UPDATED}</p>
          <p className="text-white/50 leading-relaxed pt-2">
            Rongeka is a product of{" "}
            <span className="text-white/80 font-medium">Firdian Corp</span>.
            This policy explains what data we collect when you use Rongeka, why
            we collect it, and how we protect it.
          </p>
        </div>

        <Section title="1. Information we collect">
          <p>
            <span className="text-white/70 font-medium">Account data</span> —
            when you register, we store your name, email address, and a hashed
            password (or, for OAuth sign-ins, the provider token). We never
            store plain-text passwords.
          </p>
          <p>
            <span className="text-white/70 font-medium">Content data</span> —
            items, collections, tags, and uploaded files you create inside
            Rongeka are stored on our servers and in Cloudflare R2 object
            storage.
          </p>
          <p>
            <span className="text-white/70 font-medium">Usage data</span> —
            standard server logs (IP address, browser, pages visited,
            timestamps) for security and performance monitoring. These are
            retained for 30 days.
          </p>
          <p>
            <span className="text-white/70 font-medium">Payment data</span> —
            billing is handled entirely by Stripe. We never see or store your
            card details. We store your Stripe customer ID and subscription
            status to gate Pro features.
          </p>
        </Section>

        <Section title="2. How we use your information">
          <ul className="space-y-2">
            {[
              "To provide and operate the Rongeka service",
              "To authenticate you and protect your account",
              "To process payments and manage your subscription",
              "To send transactional emails (email verification, password reset)",
              "To improve reliability and fix bugs using aggregated, anonymised logs",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <p>
            We do not sell your data. We do not use your content to train AI
            models. AI features (auto-tagging, code explanation, prompt
            optimiser) send the relevant item content to OpenAI solely to
            generate the response for you; OpenAI&apos;s{" "}
            <a
              href="https://openai.com/policies/api-data-usage-policies"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              API data usage policy
            </a>{" "}
            applies to those requests.
          </p>
        </Section>

        <Section title="3. Data storage and security">
          <p>
            Your data is stored on Neon (PostgreSQL) and Cloudflare R2, both of
            which encrypt data at rest and in transit. Access to production
            systems is restricted to authorised Firdian Corp personnel.
          </p>
          <p>
            Despite our best efforts, no system is 100% secure. Please use a
            strong, unique password and enable two-factor authentication where
            available.
          </p>
        </Section>

        <Section title="4. Cookies and sessions">
          <p>
            Rongeka uses a single session cookie to keep you signed in. We do
            not use third-party advertising or tracking cookies.
          </p>
        </Section>

        <Section title="5. Data retention and deletion">
          <p>
            Your account and all associated content are retained for as long as
            your account is active. You can permanently delete your account from{" "}
            <span className="text-white/70">Settings → Delete Account</span>.
            Deletion removes your user record, all items, collections, and
            uploaded files. Stripe customer data is subject to Stripe&apos;s
            own retention policy.
          </p>
        </Section>

        <Section title="6. Third-party services">
          <ul className="space-y-2">
            {[
              { name: "Neon", purpose: "PostgreSQL database hosting" },
              { name: "Cloudflare R2", purpose: "File and image storage" },
              { name: "Stripe", purpose: "Payment processing" },
              { name: "Resend", purpose: "Transactional email delivery" },
              { name: "OpenAI", purpose: "AI features (Pro tier)" },
              { name: "GitHub OAuth", purpose: "Optional OAuth sign-in" },
            ].map(({ name, purpose }) => (
              <li key={name} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                <span>
                  <span className="text-white/70 font-medium">{name}</span> —{" "}
                  {purpose}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="7. Changes to this policy">
          <p>
            We may update this policy from time to time. When we do, we will
            update the &quot;Last updated&quot; date at the top of this page. Continued
            use of Rongeka after changes constitutes acceptance of the updated
            policy.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Questions about this policy? Email us at{" "}
            <a
              href="mailto:privacy@firdian.com"
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              privacy@firdian.com
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
