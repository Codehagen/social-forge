"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DnsRecordsList } from "./DnsRecordsList";
import { DomainStatus } from "./DomainStatus";
import { IconAlertCircle, IconExternalLink, IconRefresh } from "@tabler/icons-react";
import type { DnsRecord } from "@/lib/vercel/types";
import { DomainStatus as DomainStatusEnum } from "@prisma/client";
import { verifyDomainAction, refreshDomainStatusAction } from "@/app/actions/domain";
import { Spinner } from "@/components/ui/spinner";

interface DomainVerificationProps {
  domainId: string;
  domain: string;
  status: DomainStatusEnum;
  dnsRecords?: DnsRecord[] | null;
  verificationRecords?: DnsRecord[] | null;
  errorMessage?: string | null;
  onVerificationComplete?: () => void;
}

export function DomainVerification({
  domainId,
  domain,
  status,
  dnsRecords: initialDnsRecords,
  verificationRecords: initialVerificationRecords,
  errorMessage: initialErrorMessage,
  onVerificationComplete,
}: DomainVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(initialErrorMessage);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>(
    (initialDnsRecords as DnsRecord[]) || []
  );
  const [verificationRecords, setVerificationRecords] = useState<DnsRecord[]>(
    (initialVerificationRecords as DnsRecord[]) || []
  );

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyDomainAction(domainId);
      setCurrentStatus(result.status);

      if (result.verified) {
        toast.success("Domain verified", {
          description: "Great work—your DNS records look good.",
        });
        onVerificationComplete?.();
      } else if (result.error) {
        setError(result.error);
        toast.error("Verification failed", {
          description: result.error,
        });
      } else {
        toast("DNS still propagating", {
          description: "We’ll keep checking—try again in a few minutes.",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setError(message);
      toast.error("Verification failed", {
        description: message,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const result = await refreshDomainStatusAction(domainId);
      setDnsRecords(result.dnsRecords);
      setVerificationRecords(result.verificationRecords);

      if (result.verified) {
        setCurrentStatus("ACTIVE");
        toast.success("Domain connected", {
          description: "Records look good—your domain is now active.",
        });
        onVerificationComplete?.();
      } else {
        toast("DNS refreshed", {
          description: "Keep waiting a bit longer and verify again soon.",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to refresh status";
      setError(message);
      toast.error("Unable to refresh DNS", {
        description: message,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const isVerified = currentStatus === "ACTIVE";
  const isPending = currentStatus === "PENDING_VERIFICATION";
  const isFailed = currentStatus === "FAILED";

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{domain}</CardTitle>
              <CardDescription>Domain verification status</CardDescription>
            </div>
            <DomainStatus status={currentStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerified && (
            <div className="rounded-lg bg-green-500/10 p-4 text-sm text-green-700">
              <strong>Verified!</strong> Your domain is active and ready to use.
            </div>
          )}

          {isFailed && (
            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <strong>Verification Failed</strong>
                  {error && <p className="mt-1">{error}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleVerify}
              disabled={isVerifying || isRefreshing || isVerified}
              className="flex-1"
            >
              {isVerifying ? <Spinner className="mr-2" /> : null}
              Verify DNS Records
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isVerifying}
              variant="outline"
            >
              {isRefreshing ? (
                <IconRefresh className="h-4 w-4 animate-spin" />
              ) : (
                <IconRefresh className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DNS Configuration Instructions */}
      {!isVerified && (isPending || isFailed) && (
        <>
          {/* Verification Records (TXT for ownership) */}
          {verificationRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Step 1: Verify Domain Ownership
                </CardTitle>
                <CardDescription>
                  Add this TXT record to prove you own the domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DnsRecordsList
                  records={verificationRecords}
                  title=""
                />
              </CardContent>
            </Card>
          )}

          {/* DNS Records (A/CNAME for routing) */}
          {dnsRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Step 2: Point Domain to Vercel
                </CardTitle>
                <CardDescription>
                  Add these records to route traffic to your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DnsRecordsList
                  records={dnsRecords}
                  title=""
                />
              </CardContent>
            </Card>
          )}

          {/* Help Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
              <CardDescription>
                DNS changes can take up to 48 hours to propagate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="mb-2 text-muted-foreground">
                  Common DNS providers:
                </p>
                <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                  <li>
                    <a
                      href="https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      Cloudflare DNS Guide
                      <IconExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.godaddy.com/help/add-a-cname-record-19236"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      GoDaddy DNS Guide
                      <IconExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:underline"
                    >
                      Namecheap DNS Guide
                      <IconExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">How to verify:</p>
                <ol className="ml-4 mt-2 list-decimal space-y-1 text-muted-foreground">
                  <li>Log in to your domain provider&apos;s dashboard</li>
                  <li>Find the DNS settings or DNS management section</li>
                  <li>Add the records &quot;shown above&quot;</li>
                  <li>Wait 5-10 minutes for changes to propagate</li>
                  <li>Click &quot;Verify DNS Records&quot; button above</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {error && !isFailed && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
