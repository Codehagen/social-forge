import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/actions/user";
import { getAffiliateProfile } from "@/app/actions/affiliate";

import { ApplyAffiliateForm } from "./apply-form";

export default async function AffiliateApplyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?next=/affiliate/apply");
  }

  const affiliate = await getAffiliateProfile();

  if (affiliate && affiliate.status === "APPROVED") {
    redirect("/affiliate/dashboard");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Apply to become an affiliate
        </h1>
        <p className="text-muted-foreground">
          Tell us a little bit about your audience. Once approved, you&apos;ll
          receive a unique referral code and Stripe Connect onboarding link to
          start earning commissions.
        </p>
      </div>

      <div className="mt-8">
        <ApplyAffiliateForm affiliate={affiliate} />
      </div>
    </div>
  );
}
