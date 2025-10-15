"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { IconBuilding, IconMail, IconPhone, IconWorld } from "@tabler/icons-react";
import { submitProspectDetailsAction } from "@/app/actions/prospect-details";
import { Spinner } from "@/components/ui/spinner";

interface ProspectDetailsFormProps {
  token: string;
  siteName: string;
  prospectEmail: string;
  prospectName?: string | null;
}

export function ProspectDetailsForm({
  token,
  siteName,
  prospectEmail,
  prospectName,
}: ProspectDetailsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wantsDomain, setWantsDomain] = useState<boolean | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);

      await submitProspectDetailsAction({
        token,
        companyName: formData.get("companyName") as string,
        contactPhone: formData.get("contactPhone") as string,
        customDomain: wantsDomain ? (formData.get("customDomain") as string) : undefined,
      });

      toast.success("Details submitted", {
        description: "Thanks! We'll keep you updated as the site goes live.",
      });
      // Refresh to show success
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error("Unable to submit details", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-700">
        <strong>Great! Your website is approved.</strong>
        <p className="mt-1 text-blue-600">
          Please provide a few more details so we can get your site live.
        </p>
      </div>

      {/* Company Name */}
      <div className="space-y-2">
        <Label htmlFor="companyName">
          Company Name *
        </Label>
        <InputGroup>
          <InputGroupInput
            id="companyName"
            name="companyName"
            type="text"
            placeholder="Acme Inc."
            required
            disabled={isSubmitting}
          />
          <InputGroupAddon>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Contact Email (pre-filled) */}
      <div className="space-y-2">
        <Label htmlFor="contactEmail">
          Contact Email
        </Label>
        <InputGroup>
          <InputGroupInput
            id="contactEmail"
            type="email"
            value={prospectEmail}
            disabled
          />
          <InputGroupAddon>
            <IconMail className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="contactPhone">
          Phone Number (Optional)
        </Label>
        <InputGroup>
          <InputGroupInput
            id="contactPhone"
            name="contactPhone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          <InputGroupAddon>
            <IconPhone className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Domain Choice */}
      <div className="space-y-3">
        <Label>Website Address</Label>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <input
              type="radio"
              name="domainChoice"
              value="subdomain"
              checked={wantsDomain === false}
              onChange={() => setWantsDomain(false)}
              className="h-4 w-4"
              disabled={isSubmitting}
            />
            <div>
              <div className="font-medium">Use Free Subdomain</div>
              <div className="text-sm text-muted-foreground">
                We'll assign you a free subdomain: <strong>{siteName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.socialforge.tech</strong>
              </div>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
            <input
              type="radio"
              name="domainChoice"
              value="custom"
              checked={wantsDomain === true}
              onChange={() => setWantsDomain(true)}
              className="h-4 w-4"
              disabled={isSubmitting}
            />
            <div>
              <div className="font-medium">Use My Custom Domain</div>
              <div className="text-sm text-muted-foreground">
                Connect your own domain (e.g., www.example.com)
              </div>
            </div>
          </label>
        </div>

        {wantsDomain === true && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="customDomain">
              Your Domain *
            </Label>
            <InputGroup>
              <InputGroupInput
                id="customDomain"
                name="customDomain"
                type="text"
                placeholder="www.example.com"
                required={wantsDomain}
                disabled={isSubmitting}
              />
              <InputGroupAddon>
                <IconWorld className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
            <p className="text-xs text-muted-foreground">
              You'll need to configure DNS records after submission.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting || wantsDomain === null}
          size="lg"
          className="w-full sm:w-auto"
        >
          {isSubmitting ? <Spinner className="mr-2" /> : null}
          Submit & Go Live
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By submitting, you confirm the details are correct for <strong>{siteName}</strong>
      </p>
    </form>
  );
}
