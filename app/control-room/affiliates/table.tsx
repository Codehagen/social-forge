"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import type { Affiliate } from "@prisma/client";

import { adminUpdateAffiliateStatus } from "@/app/actions/affiliate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type AdminAffiliate = Affiliate & {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};

type AdminAffiliateTableProps = {
  affiliates: AdminAffiliate[];
};

const STATUS_OPTIONS: Array<Affiliate["status"]> = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

export function AdminAffiliateTable({ affiliates }: AdminAffiliateTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (
    affiliateId: string,
    status: Affiliate["status"]
  ) => {
    startTransition(async () => {
      try {
        await adminUpdateAffiliateStatus(affiliateId, status);
        toast.success("Affiliate status updated");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      }
    });
  };

  if (affiliates.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No affiliate applications yet. Share the program to start receiving
        referrals.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left">
            <th className="p-3 font-medium">Affiliate</th>
            <th className="p-3 font-medium">Referral code</th>
            <th className="p-3 font-medium">Stripe status</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map((affiliate) => (
            <tr key={affiliate.id} className="border-t">
              <td className="p-3 align-top">
                <div className="font-medium text-foreground">
                  {affiliate.user.name ?? affiliate.user.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  {affiliate.user.email}
                </div>
              </td>
              <td className="p-3 align-top font-mono text-xs">
                {affiliate.referralCode}
              </td>
              <td className="p-3 align-top text-xs text-muted-foreground">
                {affiliate.stripeConnectStatus ?? "pending"}
              </td>
              <td className="p-3 align-top space-y-2">
                <Badge variant="secondary">{affiliate.status}</Badge>
                <Badge variant={affiliate.onboardingCompleted ? "default" : "outline"}>
                  {affiliate.onboardingCompleted ? "Onboarded" : "Needs onboarding"}
                </Badge>
              </td>
              <td className="p-3 align-top">
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={status === affiliate.status ? "default" : "outline"}
                      disabled={isPending}
                      onClick={() => handleStatusChange(affiliate.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
