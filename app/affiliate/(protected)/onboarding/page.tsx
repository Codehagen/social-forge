import { redirect } from "next/navigation";
import { IconInnerShadowTop } from "@tabler/icons-react";

import {
  getAffiliateProfile,
  refreshAffiliateAccountStatus,
} from "@/app/actions/affiliate";
import { AffiliateOnboardingFlow } from "@/components/affiliate/affiliate-onboarding-flow";

export default async function AffiliateOnboardingPage() {
  const profile = await getAffiliateProfile();

  if (!profile) {
    redirect("/affiliate/apply");
  }

  if (profile.status !== "APPROVED") {
    redirect("/affiliate/apply");
  }

  if (profile.onboardingCompleted) {
    redirect("/affiliate/dashboard");
  }

  let affiliate = profile;

  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const refreshed = await refreshAffiliateAccountStatus();
      affiliate = refreshed ?? profile;
    } catch (error) {
      console.error(
        "Unable to refresh Stripe status for affiliate onboarding",
        error
      );
    }
  }

  return (
    <div className="container relative flex min-h-screen flex-col justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <IconInnerShadowTop className="mr-2 h-6 w-6" />
          Social Forge Affiliates
        </div>
        <div className="relative z-20 mt-auto space-y-4">
          <blockquote className="space-y-2">
            <p className="text-lg">
              “We built the partner program we always wanted: transparent,
              generous, and designed to help agencies grow recurring revenue.”
            </p>
            <footer className="text-sm">— The Social Forge Team</footer>
          </blockquote>
          <p className="text-xs text-white/70">
            Finish the quick onboarding to unlock your referral link and start
            earning $100 per upgrade.
          </p>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[450px]">
          <AffiliateOnboardingFlow
            affiliate={{
              id: affiliate.id,
              referralCode: affiliate.referralCode,
              stripeConnectStatus: affiliate.stripeConnectStatus,
              onboardingCompleted: affiliate.onboardingCompleted,
            }}
          />
        </div>
      </div>
    </div>
  );
}
