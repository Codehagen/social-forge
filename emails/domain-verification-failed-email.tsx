import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type DomainVerificationFailedEmailProps = {
  domain: string;
  projectName: string;
  errorMessage?: string | null;
  lastCheckedAt: string;
  dnsRecordsUrl?: string | null;
  supportEmail?: string | null;
};

const DomainVerificationFailedEmail = ({
  domain,
  projectName,
  errorMessage,
  lastCheckedAt,
  dnsRecordsUrl,
  supportEmail,
}: DomainVerificationFailedEmailProps) => {
  return (
    <EmailLayout
      heading="Domain verification needs attention"
      preheader={`${domain} is still pending verification—adjust DNS and retry.`}
      footerNote={
        supportEmail ? (
          <>
            Need a hand? Contact{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#6366F1] font-medium no-underline"
            >
              {supportEmail}
            </a>
            .
          </>
        ) : null
      }
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        We checked <span className="font-semibold">{domain}</span> for{" "}
        <span className="font-semibold">{projectName}</span> at {lastCheckedAt},
        but DNS records still aren’t lining up. Make the tweaks below and run
        verification again.
      </Text>

      {errorMessage ? (
        <div className="rounded-[8px] bg-[#FEF2F2] px-[20px] py-[16px] text-[15px] text-[#991B1B] leading-[22px]">
          <p className="m-0 font-semibold">What we saw</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{errorMessage}</p>
        </div>
      ) : (
        <Text className="text-[15px] text-[#6B7280] leading-[22px]">
          DNS records are missing or misconfigured. Double-check your TXT and
          CNAME entries and try again.
        </Text>
      )}

      {dnsRecordsUrl ? (
        <div className="text-center">
          <Button
            href={dnsRecordsUrl}
            className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Review Required DNS Records
          </Button>
        </div>
      ) : null}

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Once the records are in place, click “Verify DNS” in the dashboard. We’ll
        confirm and flip the domain to active as soon as everything resolves.
      </Text>
    </EmailLayout>
  );
};

export default DomainVerificationFailedEmail;
