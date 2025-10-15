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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconPlus } from "@tabler/icons-react";
import { addDomainToEnvironmentAction } from "@/app/actions/domain";
import { DomainVerification } from "./DomainVerification";
import type { DnsRecord } from "@/lib/vercel/types";
import { DomainStatus } from "@prisma/client";
import { Spinner } from "@/components/ui/spinner";

interface DomainSetupDialogProps {
  environmentId: string;
  siteName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function DomainSetupDialog({
  environmentId,
  siteName,
  onSuccess,
  trigger,
}: DomainSetupDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"input" | "verification">("input");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Domain data after creation
  const [createdDomain, setCreatedDomain] = useState<{
    id: string;
    domain: string;
    status: DomainStatus;
    dnsRecords: DnsRecord[];
    verificationRecords: DnsRecord[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const domain = formData.get("domain") as string;
    const isPrimary = formData.get("isPrimary") === "on";

    try {
      const result = await addDomainToEnvironmentAction(
        environmentId,
        domain,
        { isPrimary }
      );

      setCreatedDomain({
        id: result.domain.id,
        domain: result.domain.domain,
        status: result.domain.status,
        dnsRecords: result.dnsRecords,
        verificationRecords: result.verificationRecords,
      });

      if (result.verificationNeeded) {
        setStep("verification");
        toast.success("Domain added", {
          description: "Verification required—follow the steps below.",
        });
      } else {
        // Domain was immediately verified
        onSuccess?.();
        setOpen(false);
        toast.success("Domain connected", {
          description: `${result.domain.domain} is ready to use.`,
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add domain";
      setError(message);
      toast.error("Unable to add domain", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("input");
      setCreatedDomain(null);
      setError(null);
    }, 200);
  };

  const handleVerificationComplete = () => {
    onSuccess?.();
    toast.success("Domain verified", {
      description: "DNS records look good—domain is now active.",
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Custom Domain
        </Button>
      )}

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === "input" ? (
          <>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Connect a custom domain to {siteName}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name *</Label>
                <Input
                  id="domain"
                  name="domain"
                  type="text"
                  placeholder="www.example.com or example.com"
                  required
                  disabled={isSubmitting}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your domain (e.g., example.com or www.example.com)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  name="isPrimary"
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isSubmitting}
                />
                <Label htmlFor="isPrimary" className="font-normal">
                  Set as primary domain
                </Label>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

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
                  Continue
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Verify Domain Ownership</DialogTitle>
              <DialogDescription>
                Add DNS records to verify and activate your domain
              </DialogDescription>
            </DialogHeader>

            {createdDomain && (
              <DomainVerification
                domainId={createdDomain.id}
                domain={createdDomain.domain}
                status={createdDomain.status}
                dnsRecords={createdDomain.dnsRecords}
                verificationRecords={createdDomain.verificationRecords}
                onVerificationComplete={handleVerificationComplete}
              />
            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={handleClose}>
                I'll verify later
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
