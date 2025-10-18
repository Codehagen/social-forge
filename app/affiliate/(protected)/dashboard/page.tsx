import { redirect } from "next/navigation";

import { getAffiliateDashboardData } from "@/app/actions/affiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ManagePayoutButton } from "@/components/affiliate/manage-payout-button";
import { ReferralLinkCard } from "@/components/affiliate/referral-link-card";

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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Affiliate dashboard
        </h1>
        <p className="text-muted-foreground">
          Track referrals, monitor payouts, and manage your Stripe Connect
          account.
        </p>
      </header>

      <main className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(metrics).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {METRIC_LABELS[key]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {key === "pendingCommissionCents"
                    ? formatCurrency(value as number)
                    : value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Your referral link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReferralLinkCard
                referralCode={data.affiliate.referralCode}
                appUrl={appUrl}
              />
              <p className="text-sm text-muted-foreground">
                Share this link wherever you publish. We credit referrals for 30
                days and pay $100 per new paid workspace.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Stripe account status:{" "}
                <span className="font-medium text-foreground">
                  {data.affiliate.stripeConnectStatus ?? "pending"}
                </span>
              </div>
              <ManagePayoutButton />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
