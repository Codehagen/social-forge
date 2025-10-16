"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SendToProspectDialog } from "@/components/prospects/SendToProspectDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getProspectActionState, type ProspectReview } from "@/lib/prospect-helpers";
import { IconExternalLink } from "@tabler/icons-react";

interface ProspectActionButtonProps {
  siteId: string;
  siteName: string;
  reviews: ProspectReview[];
  className?: string;
  fullWidth?: boolean;
  onAction?: () => void;
}

export function ProspectActionButton({
  siteId,
  siteName,
  reviews,
  className,
  fullWidth = false,
  onAction,
}: ProspectActionButtonProps) {
  const [showDetails, setShowDetails] = useState(false);
  const actionState = getProspectActionState(reviews);
  const latestReview = reviews.length > 0 ? reviews[0] : null;
  const Icon = actionState.icon;

  // Handle different action types
  const handleClick = () => {
    switch (actionState.type) {
      case "send":
      case "declined":
      case "resend":
        // These are handled by the SendToProspectDialog wrapper
        break;

      case "awaiting":
      case "viewing":
        // Show review details in popover
        setShowDetails(true);
        break;

      case "collect-details":
        // TODO: Navigate to details collection form
        // For now, show info
        setShowDetails(true);
        break;

      case "deploy":
        // TODO: Trigger deployment flow
        onAction?.();
        break;

      case "deploying":
        // Show deployment status
        setShowDetails(true);
        break;

      case "live":
        // Open live site in new tab
        if (latestReview?.requestedDomain) {
          window.open(`https://${latestReview.requestedDomain}`, "_blank");
        }
        break;

      case "expired":
        // Resend handled by dialog
        break;
    }
  };

  // For send/declined/resend/expired, wrap in SendToProspectDialog
  if (
    actionState.type === "send" ||
    actionState.type === "declined" ||
    actionState.type === "resend" ||
    actionState.type === "expired"
  ) {
    return (
      <SendToProspectDialog
        siteId={siteId}
        siteName={siteName}
        trigger={
          <Button
            className={fullWidth ? "w-full" : className}
            variant={actionState.buttonVariant}
          >
            <Icon className="mr-2 h-4 w-4" />
            {actionState.buttonText}
          </Button>
        }
      />
    );
  }

  // For live site, direct button
  if (actionState.type === "live") {
    return (
      <Button
        className={fullWidth ? "w-full" : className}
        variant={actionState.buttonVariant}
        onClick={handleClick}
      >
        <Icon className="mr-2 h-4 w-4" />
        {actionState.buttonText}
      </Button>
    );
  }

  // For other states, show button with popover for details
  return (
    <Popover open={showDetails} onOpenChange={setShowDetails}>
      <PopoverTrigger asChild>
        <Button
          className={fullWidth ? "w-full" : className}
          variant={actionState.buttonVariant}
          onClick={handleClick}
        >
          <Icon className="mr-2 h-4 w-4" />
          {actionState.buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Review Status</h4>
          <p className="text-sm text-muted-foreground">
            {actionState.description}
          </p>
          {latestReview && (
            <div className="mt-3 rounded-md bg-muted p-3 text-xs">
              <div className="space-y-1">
                <div>
                  <span className="font-medium">Prospect:</span>{" "}
                  {latestReview.prospectName || latestReview.prospectEmail}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {latestReview.status}
                </div>
                {latestReview.requestedDomain && (
                  <div>
                    <span className="font-medium">Domain:</span>{" "}
                    {latestReview.requestedDomain}
                  </div>
                )}
                {latestReview.feedback && (
                  <div className="mt-2 italic">
                    "{latestReview.feedback}"
                  </div>
                )}
              </div>
            </div>
          )}
          {actionState.type === "collect-details" && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                The prospect needs to provide their domain and company details.
              </p>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <a
                  href={`${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/preview/${latestReview?.shareToken}?step=details`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconExternalLink className="mr-2 h-3 w-3" />
                  Open Details Form
                </a>
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
