import { refreshAffiliateAccountStatus } from "@/app/actions/affiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ManagePayoutButton } from "../dashboard/manage-payout-button";

export default async function AffiliateOnboardingPage() {
  const affiliate = await refreshAffiliateAccountStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish Stripe Connect onboarding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We use Stripe Connect to pay commissions directly to your bank
          account. Complete the onboarding flow to verify your details and start
          receiving payouts.
        </p>

        <div className="rounded-md border bg-muted/40 p-4 text-sm">
          Current status:{" "}
          <span className="font-medium text-foreground">
            {affiliate?.stripeConnectStatus ?? "pending"}
          </span>
        </div>

        <ManagePayoutButton />
      </CardContent>
    </Card>
  );
}
