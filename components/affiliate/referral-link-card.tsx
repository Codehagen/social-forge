"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ReferralLinkCardProps = {
  referralCode: string;
  appUrl: string;
};

export function ReferralLinkCard({
  referralCode,
  appUrl,
}: ReferralLinkCardProps) {
  const [origin, setOrigin] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return appUrl;
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const referralLink = `${origin}/?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        throw new Error("Clipboard access unavailable");
      }

      setCopied(true);
      toast.success("Referral link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to copy referral link"
      );
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={referralLink}
        readOnly
        className="font-mono text-xs"
        onFocus={(event) => event.currentTarget.select()}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          variant={copied ? "secondary" : "outline"}
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <IconCheck className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <IconCopy className="h-4 w-4" />
              Copy link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
