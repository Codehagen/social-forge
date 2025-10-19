import Link from "next/link";

import { getCurrentUser } from "@/app/actions/user";
import { getAffiliateProfile } from "@/app/actions/affiliate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeroIllustration } from "@/components/hero-illustration";
import { AffiliateBrandAssets } from "@/components/affiliate/affiliate-brand-assets";
import { AffiliateEarningsCalculator } from "@/components/affiliate/affiliate-earnings-calculator";
import { AffiliateFaqs } from "@/components/affiliate/affiliate-faqs";

const reasons = [
  {
    title: "Get a $100 commission",
    description:
      "Earn a generous payout for every new Social Forge subscriber you bring onboard.",
  },
  {
    title: "Unlimited referrals",
    description:
      "No caps. Track performance in real time and cash out quickly.",
  },
  {
    title: "Dedicated support",
    description:
      "Work directly with our affiliate success team to grow your audience.",
  },
];

const steps = [
  {
    title: "Sign up",
    description:
      "Apply for the program and receive your unique referral code once approved.",
  },
  {
    title: "Share",
    description:
      "Promote Social Forge to your audience using your link and marketing assets.",
  },
  {
    title: "Track",
    description:
      "Monitor referrals, conversions, and commissions inside your affiliate dashboard.",
  },
  {
    title: "Earn",
    description:
      "Collect $100 for every new paid workspace you refer within the attribution window.",
  },
];

export default async function AffiliateLandingPage() {
  const user = await getCurrentUser();
  const affiliate = user ? await getAffiliateProfile().catch(() => null) : null;

  const primaryCtaHref = affiliate
    ? "/affiliate/dashboard"
    : user
    ? "/affiliate/apply"
    : "/sign-in?next=/affiliate/apply";

  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10 bg-muted">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="max-md:text-center">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Affiliate program
              </span>
              <h1 className="mt-5 text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                Earn $100 for every Social Forge referral
              </h1>
              <p className="mb-6 mt-4 max-w-xl text-balance text-lg text-muted-foreground max-md:mx-auto">
                Share your unique link, help marketers move faster, and get paid
                for the new workspaces you bring onboard—no caps, no complexity.
              </p>
              <div className="flex flex-wrap items-center gap-3 max-md:justify-center">
                <Button asChild size="lg">
                  <Link href={primaryCtaHref}>
                    {affiliate ? "View dashboard" : "Join now"}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#how-it-works">How it works</Link>
                </Button>
              </div>
              <div className="mt-12 grid max-w-sm grid-cols-2 gap-6 text-left max-md:mx-auto max-md:text-center">
                <div className="space-y-2">
                  <span className="text-lg font-semibold">
                    $100{" "}
                    <span className="text-lg text-muted-foreground">USD</span>
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Commission on every new paying workspace you refer.
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-lg font-semibold">
                    30{" "}
                    <span className="text-lg text-muted-foreground">days</span>
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Attribution window to credit referrals from your link.
                  </p>
                </div>
              </div>
            </div>

            <HeroIllustration />
          </div>
        </div>
      </section>

      <section className="bg-muted">
        <div className="mx-auto max-w-6xl border-x px-3">
          <div className="border-x">
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-16 md:py-24">
              <div className="grid gap-6 md:grid-cols-3">
                {reasons.map((reason) => (
                  <Card key={reason.title}>
                    <CardHeader>
                      <CardTitle>{reason.title}</CardTitle>
                      <CardDescription>{reason.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div
              id="how-it-works"
              className="space-y-8 px-6 py-16 md:py-24 lg:px-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  How it works
                </h2>
                <p className="text-muted-foreground">
                  Apply once, share your link wherever you publish, and earn
                  recurring commissions.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {steps.map((step, index) => (
                  <Card key={step.title}>
                    <CardHeader className="flex flex-row items-start gap-4">
                      <span className="text-4xl font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <CardTitle>{step.title}</CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <AffiliateEarningsCalculator className="py-16 md:py-24" />

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <AffiliateBrandAssets className="py-16 md:py-24" />

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <AffiliateFaqs className="py-16 md:py-24" />

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/10">
        <div className="mx-auto max-w-6xl border-x px-3">
          <div className="border-x h-0" />
        </div>
      </section>
    </main>
  );
}
