"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createAffiliateOnboardingLink } from "@/app/actions/affiliate";
import { Button } from "@/components/ui/button";

export function ManagePayoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const { url } = await createAffiliateOnboardingLink();

        if (url) {
          window.location.href = url;
          return;
        }

        toast.error("Unable to generate Stripe onboarding link.");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create onboarding link."
        );
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "Opening Stripe…" : "Manage payout account"}
    </Button>
  );
}
