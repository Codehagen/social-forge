"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconSend, IconCopy, IconCheck } from "@tabler/icons-react";
import { createProspectReviewAction } from "@/app/actions/prospect";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface SendToProspectDialogProps {
  siteId: string;
  siteName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function SendToProspectDialog({
  siteId,
  siteName,
  onSuccess,
  trigger,
}: SendToProspectDialogProps) {
  const defaultMessage = `Hi there! I'm excited to share ${siteName} with you. Please take a look, leave any feedback, or approve so we can keep things moving. If anything feels off, just reply to this email and I'll handle it.`;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const prospectEmail = formData.get("prospectEmail") as string;
    const prospectName = formData.get("prospectName") as string;
    const prospectPhone =
      (formData.get("prospectPhone") as string | null) ?? "";
    const message = formData.get("message") as string;

    try {
      const result = await createProspectReviewAction({
        siteId,
        prospectEmail,
        prospectName: prospectName || undefined,
        prospectPhone: prospectPhone.trim() ? prospectPhone.trim() : undefined,
        message: message || undefined,
      });

      setShareUrl(result.shareUrl);
      setStep("success");
      onSuccess?.();
      toast.success("Review link created", {
        description: "Share it with your prospect whenever you're ready.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create review";
      setError(message);
      toast.error("Unable to create review link", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyShareUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied", {
        description: "The review link is ready to paste.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("form");
      setShareUrl(null);
      setError(null);
      setCopied(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <IconSend className="mr-2 h-4 w-4" />
          Send to Prospect
        </Button>
      )}

      <DialogContent className="max-w-lg">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Send to Prospect for Review</DialogTitle>
              <DialogDescription>
                Create a shareable link for {siteName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup className="gap-6 sm:grid sm:grid-cols-[1.35fr_minmax(0,1fr)]">
                <Field className="sm:col-span-1">
                  <FieldLabel htmlFor="prospectName">Prospect Name</FieldLabel>
                  <Input
                    id="prospectName"
                    name="prospectName"
                    type="text"
                    placeholder="Alex Smith"
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                </Field>

                <Field className="sm:col-span-1">
                  <FieldLabel htmlFor="prospectPhone">Prospect Phone</FieldLabel>
                  <Input
                    id="prospectPhone"
                    name="prospectPhone"
                    type="tel"
                    inputMode="tel"
                    placeholder="+1 (555) 123-4567"
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="prospectEmail">
                    Prospect Email *
                  </FieldLabel>
                  <Input
                    id="prospectEmail"
                    name="prospectEmail"
                    type="email"
                    placeholder="client@example.com"
                    required
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  <FieldDescription>
                    We&apos;ll send the review link to this inbox.
                  </FieldDescription>
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="message">Personal Message</FieldLabel>
                  <Textarea
                    id="message"
                    name="message"
                    defaultValue={defaultMessage}
                    className="min-h-[100px] resize-none"
                    disabled={isSubmitting}
                  />
                  <FieldDescription>
                    This greeting appears when the prospect opens the review.
                  </FieldDescription>
                </Field>
              </FieldGroup>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">What happens next?</p>
                <ul className="ml-4 mt-2 list-disc space-y-1 text-muted-foreground">
                  <li>Prospect receives a unique review link (valid for 14 days)</li>
                  <li>They can preview the website and provide feedback</li>
                  <li>They can approve and optionally provide their domain</li>
                  <li>You'll be notified of their response</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner className="mr-2" /> : null}
                  Create Review Link
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Review Link Created!</DialogTitle>
              <DialogDescription>
                Share this link with your prospect
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-700">
                <strong>Success!</strong> The review link has been created.
                {/* TODO: Add "Email sent to prospect" message when email is integrated */}
              </div>

              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl || ""}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={copyShareUrl}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? (
                      <IconCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <IconCopy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this link and send it to your prospect via email, Slack, or any messaging platform
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">Next Steps:</p>
                <ol className="ml-4 mt-2 list-decimal space-y-1 text-muted-foreground">
                  <li>Share the link above with your prospect</li>
                  <li>They'll be able to preview the website</li>
                  <li>You'll receive a notification when they respond</li>
                  <li>If approved with a domain, you can set up DNS</li>
                </ol>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleClose}>Done</Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
