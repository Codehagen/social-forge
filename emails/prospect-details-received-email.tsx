import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type ProspectDetailsReceivedEmailProps = {
  siteName: string;
  prospectName?: string | null;
  prospectEmail: string;
  submittedAt: string;
  companyName: string;
  contactPhone?: string | null;
  requestedDomain?: string | null;
  dashboardUrl?: string | null;
};

const ProspectDetailsReceivedEmail = ({
  siteName,
  prospectName,
  prospectEmail,
  submittedAt,
  companyName,
  contactPhone,
  requestedDomain,
  dashboardUrl,
}: ProspectDetailsReceivedEmailProps) => {
  return (
    <EmailLayout
      heading="Deployment details received"
      preheader={`${companyName} is ready to move forward with ${siteName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Your prospect just wrapped up the handoff form for{" "}
        <span className="font-semibold">{siteName}</span>. Everything you need
        to launch is below—time to prep the deployment checklist.
      </Text>

      <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px] space-y-[12px]">
        <DetailRow label="Prospect">
          {prospectName || prospectEmail}
        </DetailRow>
        <DetailRow label="Email">
          <a
            href={`mailto:${prospectEmail}`}
            className="text-[#6366F1] font-medium no-underline"
          >
            {prospectEmail}
          </a>
        </DetailRow>
        <DetailRow label="Company">{companyName}</DetailRow>
        {contactPhone ? (
          <DetailRow label="Phone">
            <a
              href={`tel:${contactPhone}`}
              className="text-[#6366F1] font-medium no-underline"
            >
              {contactPhone}
            </a>
          </DetailRow>
        ) : null}
        {requestedDomain ? (
          <DetailRow label="Requested domain">
            <code className="bg-[#E5E7EB] px-[8px] py-[4px] rounded-[6px] text-[14px]">
              {requestedDomain}
            </code>
          </DetailRow>
        ) : (
          <DetailRow label="Domain choice">
            Using Social Forge subdomain (auto-provisioned)
          </DetailRow>
        )}
        <DetailRow label="Submitted">
          {submittedAt}
        </DetailRow>
      </div>

      {dashboardUrl ? (
        <div className="text-center">
          <Button
            href={dashboardUrl}
            className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            View Project in Dashboard
          </Button>
        </div>
      ) : null}

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Update the client on timing and next checkpoints so everyone knows what
        happens next.
      </Text>
    </EmailLayout>
  );
};

export default ProspectDetailsReceivedEmail;

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
};

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-[12px]">
      <span className="font-semibold">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
