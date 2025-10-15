"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconClock,
  IconX,
  IconCopy,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cancelProspectReviewAction, resendProspectReviewAction } from "@/app/actions/prospect";
import { ProspectReviewStatus } from "@prisma/client";

interface ProspectReview {
  id: string;
  prospectEmail: string;
  prospectName: string | null;
  shareToken: string;
  status: ProspectReviewStatus;
  createdAt: Date;
  approvedAt: Date | null;
  declinedAt: Date | null;
  viewedAt: Date | null;
  expiresAt: Date | null;
  requestedDomain: string | null;
  feedback: string | null;
}

interface ProspectReviewsListProps {
  reviews: ProspectReview[];
  onUpdate?: () => void;
}

export function ProspectReviewsList({ reviews, onUpdate }: ProspectReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No prospect reviews yet. Send your first review to get started.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ProspectReviewCard key={review.id} review={review} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function ProspectReviewCard({
  review,
  onUpdate,
}: {
  review: ProspectReview;
  onUpdate?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/preview/${review.shareToken}`;

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Review link copied", {
      description: "You can now share it with your prospect.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendProspectReviewAction(review.id);
      onUpdate?.();
      toast.success("Review email resent", {
        description: `${review.prospectEmail} will get a fresh copy shortly.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to resend review.";
      toast.error("Unable to resend review", {
        description: message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await cancelProspectReviewAction(review.id);
      onUpdate?.();
      toast.success("Review cancelled", {
        description: `${review.prospectEmail} can no longer access the link.`,
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel review.";
      toast.error("Unable to cancel review", {
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isPending = review.status === "PENDING" || review.status === "VIEWED";

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.prospectEmail}</span>
            <ReviewStatusBadge status={review.status} />
          </div>
          {review.prospectName && (
            <p className="text-sm text-muted-foreground">{review.prospectName}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Sent {new Date(review.createdAt).toLocaleDateString()}
            {review.viewedAt && ` • Viewed ${new Date(review.viewedAt).toLocaleDateString()}`}
            {review.approvedAt && ` • Approved ${new Date(review.approvedAt).toLocaleDateString()}`}
            {review.declinedAt && ` • Declined ${new Date(review.declinedAt).toLocaleDateString()}`}
          </p>

          {review.requestedDomain && (
            <p className="mt-2 text-sm">
              <span className="font-medium">Requested domain:</span>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {review.requestedDomain}
              </code>
            </p>
          )}

          {review.feedback && (
            <p className="mt-2 rounded bg-muted p-2 text-sm italic text-muted-foreground">
              "{review.feedback}"
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          {isPending && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyShareUrl}
                disabled={copied}
              >
                {copied ? (
                  <IconCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <Spinner className="size-4" />
                ) : (
                  <IconRefresh className="h-4 w-4" />
                )}
              </Button>
            </>
          )}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Spinner className="size-4" />
                ) : (
                  <IconTrash className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel this review?</AlertDialogTitle>
                <AlertDialogDescription>
                  The link will stop working for the prospect immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Keep review</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Spinner className="mr-2" /> : null}
                  Cancel review
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function ReviewStatusBadge({ status }: { status: ProspectReviewStatus }) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
          <IconCheck className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="destructive">
          <IconX className="mr-1 h-3 w-3" />
          Declined
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge variant="secondary">
          Viewed
        </Badge>
      );
    case "EXPIRED":
      return <Badge variant="outline">Expired</Badge>;
    default:
      return (
        <Badge variant="outline">
          <IconClock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
  }
}
