"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { createAffiliateOnboardingLink } from "@/app/actions/affiliate";
import { Button, type ButtonProps } from "@/components/ui/button";

type ManagePayoutButtonProps = {
  label?: string;
  pendingLabel?: string;
} & Omit<ButtonProps, "onClick">;

export function ManagePayoutButton({
  label = "Manage payout account",
  pendingLabel = "Opening Stripe…",
  ...buttonProps
}: ManagePayoutButtonProps) {
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
    <Button
      onClick={handleClick}
      disabled={isPending || buttonProps.disabled}
      {...buttonProps}
    >
      {isPending ? pendingLabel : label}
    </Button>
  );
}
