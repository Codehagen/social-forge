"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconCheck, IconX } from "@tabler/icons-react";
import { respondToProspectReviewAction } from "@/app/actions/prospect";

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

  const handleSubmit = async (action: "approve" | "decline") => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(
        document.querySelector("form") as HTMLFormElement
      );

      const feedback = formData.get("feedback") as string;
      const requestedDomain =
        action === "approve" ? (formData.get("domain") as string) : undefined;

      await respondToProspectReviewAction({
        token,
        action,
        feedback: feedback || undefined,
        requestedDomain: requestedDomain || undefined,
      });

      // Refresh the page to show success message
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="domain">
          Custom Domain (Optional)
        </Label>
        <Input
          id="domain"
          name="domain"
          type="text"
          placeholder="www.example.com"
          className="w-full"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          If you own a domain, enter it here. We'll guide you through setup
          after approval.
        </p>
      </div>

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
          {isSubmitting ? (
            "Processing..."
          ) : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Approve & Continue
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={() => handleSubmit("decline")}
          disabled={isSubmitting}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <IconX className="mr-2 h-4 w-4" />
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
