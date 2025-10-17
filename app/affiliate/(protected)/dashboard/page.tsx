import { redirect } from "next/navigation";

import { getAffiliateDashboardData } from "@/app/actions/affiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ManagePayoutButton } from "@/components/affiliate/manage-payout-button";

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

  return (
    <>
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
            <div className="rounded-md border bg-muted/40 p-4">
              <code className="block text-sm">
                {`${process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech"}/?ref=${data.affiliate.referralCode}`}
              </code>
            </div>
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
    </>
  );
}
