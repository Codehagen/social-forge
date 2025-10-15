"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconCheck, IconX } from "@tabler/icons-react";
import { respondToProspectReviewAction } from "@/app/actions/prospect";
import { Spinner } from "@/components/ui/spinner";

interface ProspectApprovalFormProps {
  token: string;
  siteName: string;
}

export function ProspectApprovalForm({
  token,
  siteName,
}: ProspectApprovalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"approve" | "decline" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (action: "approve" | "decline") => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setPendingAction(action);
    setError(null);

    try {
      const form = formRef.current;
      if (!form) {
        throw new Error("Unable to submit right now. Please try again.");
      }
      const formData = new FormData(form);

      const feedback = formData.get("feedback") as string;

      await respondToProspectReviewAction({
        token,
        action,
        feedback: feedback || undefined,
      });

      const successDescription =
        action === "approve"
          ? "Thanks for the approval—we'll take it from here."
          : "We've noted your feedback and will follow up shortly.";
      toast.success(
        action === "approve" ? "Review approved" : "Feedback sent",
        {
          description: successDescription,
        }
      );
      // Refresh the page to show success message
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error("Unable to submit response", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  return (
    <form ref={formRef} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="feedback">
          Feedback or Questions (Optional)
        </Label>
        <Textarea
          id="feedback"
          name="feedback"
          placeholder="Any comments or requests for changes..."
          className="min-h-[100px] w-full resize-none"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Share any thoughts or requests before we proceed
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={() => handleSubmit("approve")}
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting && pendingAction === "approve" ? (
            <Spinner className="mr-2" />
          ) : (
            <IconCheck className="mr-2 h-4 w-4" />
          )}
          Approve & Continue
        </Button>

        <Button
          type="button"
          onClick={() => handleSubmit("decline")}
          disabled={isSubmitting}
          variant="outline"
          className="w-full"
          size="lg"
        >
          {isSubmitting && pendingAction === "decline" ? (
            <Spinner className="mr-2" />
          ) : (
            <IconX className="mr-2 h-4 w-4" />
          )}
          Not Ready Yet
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By approving, you agree to proceed with this website design for{" "}
        <strong>{siteName}</strong>
      </p>
    </form>
  );
}
