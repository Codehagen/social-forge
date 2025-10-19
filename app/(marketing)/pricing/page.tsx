import Link from "next/link";

import { constructMetadata } from "@/lib/constructMetadata";
import Pricing from "@/components/pricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, MessageCircle, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = constructMetadata({
  title: "Pricing – Social Forge",
  description:
    "Choose the Social Forge plan that fits your team. Transparent tiers, generous usage, and tooling for agencies.",
});

const inclusions = [
  {
    icon: Check,
    title: "Unlimited collaborators",
    description:
      "Invite clients and contractors without surprise seat fees. Every plan includes unlimited viewers and commenters.",
  },
  {
    icon: Timer,
    title: "Fast support SLAs",
    description:
      "Get priority responses from our product specialists in under four business hours on Pro and Business.",
  },
  {
    icon: MessageCircle,
    title: "Dedicated onboarding",
    description:
      "Business plans ship with a migration session, workspace audit, and best-practice playbooks for your agency.",
  },
];

export default function PricingPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Pricing
              </span>
              <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                Plans built for solo founders and scaled agencies
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Start free and upgrade only when you need more capacity. Every plan includes custom domains, AI-assisted builder tooling, and client-ready exports.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#plans">Compare plans</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Talk to sales</Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="space-y-3">
                <CardTitle>What’s included on every plan?</CardTitle>
                <CardDescription>
                  No matter where you start, Social Forge gives you the same core platform our internal teams rely on.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                {inclusions.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <item.icon className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
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
            <div id="plans" className="px-6 py-16 md:py-24">
              <Pricing />
            </div>
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-16 md:pb-24 md:pt-0">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl font-semibold tracking-tight">
                    Ready when you are
                  </CardTitle>
                  <CardDescription>
                    Need help choosing a plan or migrating existing sites? Our team will respond within one business day.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg">
                    <Link href="/sign-up">Start for free</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/contact">Get in touch</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
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
