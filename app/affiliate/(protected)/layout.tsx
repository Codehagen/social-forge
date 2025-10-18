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

  return <>{children}</>;
}
