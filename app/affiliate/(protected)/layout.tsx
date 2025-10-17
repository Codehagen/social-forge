import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/actions/user";
import { getAffiliateProfile } from "@/app/actions/affiliate";

export default async function AffiliateProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?next=/affiliate/dashboard");
  }

  const affiliate = await getAffiliateProfile();

  if (!affiliate) {
    redirect("/affiliate/apply");
  }

  if (affiliate.status !== "APPROVED") {
    redirect("/affiliate/apply");
  }

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

      <main className="space-y-8">{children}</main>
    </div>
  );
}
