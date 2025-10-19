import { redirect } from "next/navigation";

import { getAffiliateDashboardData } from "@/app/actions/affiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ManagePayoutButton } from "@/components/affiliate/manage-payout-button";
import { ReferralLinkCard } from "@/components/affiliate/referral-link-card";
import { AffiliateBrandAssets } from "@/components/affiliate/affiliate-brand-assets";

const METRIC_LABELS: Record<string, string> = {
  totalReferrals: "Total referrals",
  convertedReferrals: "Converted referrals",
  paidReferrals: "Paid referrals",
  pendingCommissionCents: "Pending commission",
};

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

export default async function AffiliateDashboardPage() {
  const data = await getAffiliateDashboardData();

  if (!data.affiliate.onboardingCompleted) {
    redirect("/affiliate/onboarding");
  }

  const metrics = {
    totalReferrals: data.totals.totalReferrals,
    convertedReferrals: data.totals.convertedReferrals,
    paidReferrals: data.totals.paidReferrals,
    pendingCommissionCents: data.totals.pendingCommissionCents,
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech";

  return (
    <article className="space-y-12">
      <section
        aria-labelledby="referrals"
        className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Referrals
          </span>
          <h2
            id="referrals"
            className="scroll-mt-28 text-2xl font-semibold tracking-tight text-foreground"
          >
            Performance snapshot
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Monitor conversions and commission totals to see how Social Forge is
            resonating with your audience.
          </p>
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div
              key={key}
              className="rounded-2xl border border-border/60 bg-background p-5 shadow-sm"
            >
              <dt className="text-sm font-medium text-muted-foreground">
                {METRIC_LABELS[key]}
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-foreground">
                {key === "pendingCommissionCents"
                  ? formatCurrency(value as number)
                  : value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="payouts" className="space-y-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Tools
          </span>
          <h2
            id="payouts"
            className="scroll-mt-28 text-2xl font-semibold tracking-tight text-foreground"
          >
            Referral tools & payouts
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Share your unique link, keep payouts on track, and move fast when
            you win new customers.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Your referral link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReferralLinkCard
                referralCode={data.affiliate.referralCode}
                appUrl={appUrl}
              />
              <p className="text-sm text-muted-foreground">
                We credit referrals for 30 days and pay $100 for every new paid
                workspace you generate.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>Payout account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Stripe status:{" "}
                <span className="font-medium text-foreground">
                  {data.affiliate.stripeConnectStatus ?? "pending"}
                </span>
              </div>
              <ManagePayoutButton />
            </CardContent>
          </Card>
        </div>
      </section>

      <AffiliateBrandAssets
        className="mx-0 max-w-none rounded-3xl border border-border/70 bg-card px-6 py-10 shadow-sm sm:px-8"
        headingId="resources"
        headingClassName="scroll-mt-28 text-3xl font-semibold tracking-tight md:text-4xl"
      />
    </article>
  );
}
