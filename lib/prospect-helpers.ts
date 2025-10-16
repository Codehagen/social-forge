import { ProspectReviewStatus } from "@prisma/client";
import type { ComponentType } from "react";
import {
  IconSend,
  IconClock,
  IconEye,
  IconFileText,
  IconRocket,
  IconLoader,
  IconExternalLink,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";

export type ProspectReview = {
  id: string;
  status: ProspectReviewStatus;
  prospectEmail: string;
  prospectName: string | null;
  shareToken: string;
  createdAt: Date | string;
  viewedAt: Date | string | null;
  approvedAt: Date | string | null;
  declinedAt: Date | string | null;
  expiresAt: Date | string | null;
  requestedDomain: string | null;
  feedback: string | null;
};

export type ProspectActionState = {
  type:
    | "send"
    | "awaiting"
    | "viewing"
    | "collect-details"
    | "deploy"
    | "deploying"
    | "live"
    | "declined"
    | "resend"
    | "expired";
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary" | "destructive";
  icon: ComponentType<{ className?: string }>;
  description?: string;
  priority: number; // Lower = higher priority for display
};

/**
 * Gets the most relevant active review from a list of reviews
 * Priority: LIVE > DEPLOYING > DETAILS_SUBMITTED > APPROVED > VIEWED > PENDING > DECLINED > EXPIRED
 */
export function getLatestActiveReview(
  reviews: ProspectReview[]
): ProspectReview | null {
  if (!reviews || reviews.length === 0) return null;

  // Sort by priority (status-based) and then by date
  const priorityOrder: Record<ProspectReviewStatus, number> = {
    LIVE: 1,
    DEPLOYING: 2,
    DETAILS_SUBMITTED: 3,
    APPROVED: 4,
    VIEWED: 5,
    PENDING: 6,
    DECLINED: 7,
    EXPIRED: 8,
  };

  const sorted = [...reviews].sort((a, b) => {
    const priorityDiff = priorityOrder[a.status] - priorityOrder[b.status];
    if (priorityDiff !== 0) return priorityDiff;

    // If same priority, sort by most recent
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return sorted[0];
}

/**
 * Determines the primary action state based on prospect reviews
 */
export function getProspectActionState(
  reviews: ProspectReview[]
): ProspectActionState {
  const latestReview = getLatestActiveReview(reviews);

  // No reviews - send initial review
  if (!latestReview) {
    return {
      type: "send",
      buttonText: "Send to Prospect",
      buttonVariant: "default",
      icon: IconSend,
      description: "Create a review link for your prospect",
      priority: 10,
    };
  }

  // Switch based on status
  switch (latestReview.status) {
    case "LIVE":
      return {
        type: "live",
        buttonText: "View Live Site",
        buttonVariant: "default",
        icon: IconExternalLink,
        description: "Site is live and accessible",
        priority: 1,
      };

    case "DEPLOYING":
      return {
        type: "deploying",
        buttonText: "Deployment in Progress...",
        buttonVariant: "outline",
        icon: IconLoader,
        description: "Site is being deployed",
        priority: 2,
      };

    case "DETAILS_SUBMITTED":
      return {
        type: "deploy",
        buttonText: "Deploy to Production",
        buttonVariant: "default",
        icon: IconRocket,
        description: "Ready to deploy with provided details",
        priority: 3,
      };

    case "APPROVED":
      // Check if domain details are needed
      if (!latestReview.requestedDomain) {
        return {
          type: "collect-details",
          buttonText: "Collect Domain Details",
          buttonVariant: "default",
          icon: IconFileText,
          description: "Prospect approved - collect deployment details",
          priority: 4,
        };
      }
      // Has domain but not submitted yet
      return {
        type: "deploy",
        buttonText: "Deploy to Production",
        buttonVariant: "default",
        icon: IconRocket,
        description: "Ready to deploy",
        priority: 3,
      };

    case "VIEWED":
      return {
        type: "viewing",
        buttonText: "Prospect Viewing",
        buttonVariant: "secondary",
        icon: IconEye,
        description: "Waiting for prospect response",
        priority: 5,
      };

    case "PENDING":
      return {
        type: "awaiting",
        buttonText: "Awaiting Response",
        buttonVariant: "outline",
        icon: IconClock,
        description: "Review link sent to prospect",
        priority: 6,
      };

    case "DECLINED":
      return {
        type: "declined",
        buttonText: "Send Revision",
        buttonVariant: "outline",
        icon: IconSend,
        description: "Prospect declined - send updated version",
        priority: 7,
      };

    case "EXPIRED":
      return {
        type: "expired",
        buttonText: "Resend Review",
        buttonVariant: "outline",
        icon: IconRefresh,
        description: "Review link expired",
        priority: 8,
      };

    default:
      // Fallback
      return {
        type: "send",
        buttonText: "Send to Prospect",
        buttonVariant: "default",
        icon: IconSend,
        description: "Send review to prospect",
        priority: 10,
      };
  }
}

/**
 * Formats time ago for prospect status
 */
export function getProspectTimeDescription(review: ProspectReview): string {
  const getTimeDiff = (date: Date | string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  switch (review.status) {
    case "VIEWED":
      return review.viewedAt
        ? `Viewed ${getTimeDiff(review.viewedAt)}`
        : "Recently viewed";
    case "APPROVED":
      return review.approvedAt
        ? `Approved ${getTimeDiff(review.approvedAt)}`
        : "Recently approved";
    case "DECLINED":
      return review.declinedAt
        ? `Declined ${getTimeDiff(review.declinedAt)}`
        : "Recently declined";
    case "PENDING":
      return `Sent ${getTimeDiff(review.createdAt)}`;
    default:
      return `Updated ${getTimeDiff(review.createdAt)}`;
  }
}
