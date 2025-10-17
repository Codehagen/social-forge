import { notFound } from "next/navigation";

import { getCurrentUser } from "@/app/actions/user";
import { adminListAffiliates } from "@/app/actions/affiliate";

import { AdminAffiliateTable } from "./table";

export default async function AdminAffiliatesPage() {
  const user = await getCurrentUser();

  if (!user?.agent) {
    notFound();
  }

  const affiliates = await adminListAffiliates();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Affiliate approvals
        </h1>
        <p className="text-sm text-muted-foreground">
          Review new applications, approve partners, and monitor referral
          performance at a glance.
        </p>
      </div>

      <AdminAffiliateTable affiliates={affiliates} />
    </div>
  );
}
