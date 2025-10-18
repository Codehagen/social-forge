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
    <main className="mx-auto max-w-6xl space-y-16 px-6 py-16 md:py-24">
      <section className="space-y-6 text-center">
        <div className="inline-flex items-center rounded-full border px-4 py-1 text-sm text-muted-foreground">
          Affiliate Program
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Join the Social Forge affiliate program
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Share your unique referral link, help agencies build faster, and earn
          $100 for every new paying workspace that joins within 30 days.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href={primaryCtaHref}>
              {affiliate ? "View dashboard" : "Join now"}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#how-it-works">How it works</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {reasons.map((reason) => (
          <Card key={reason.title}>
            <CardHeader>
              <CardTitle>{reason.title}</CardTitle>
              <CardDescription>{reason.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section id="how-it-works" className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <p className="text-muted-foreground">
            Apply once, share your link wherever you publish, and earn recurring
            commissions.
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
      </section>
    </main>
  );
}
