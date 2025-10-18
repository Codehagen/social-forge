import { notFound } from "next/navigation";

import { getCurrentUser } from "@/app/actions/user";
import { adminListAffiliates } from "@/app/actions/affiliate";

import { AdminAffiliateTable } from "./table";

export default async function ControlRoomAffiliatesPage() {
  const user = await getCurrentUser();

  if (!user || (!user.superAdmin && !user.agent)) {
    notFound();
  }

  const affiliates = await adminListAffiliates();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Affiliate approvals</h2>
        <p className="text-sm text-muted-foreground">
          Approve new partners, monitor referral health, and step in if accounts need attention.
        </p>
      </div>

      <AdminAffiliateTable affiliates={affiliates} />
    </div>
  );
}
