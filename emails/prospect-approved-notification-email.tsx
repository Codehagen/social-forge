import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type ProspectApprovedNotificationEmailProps = {
  siteName: string;
  prospectName?: string | null;
  prospectEmail: string;
  approvedAt: string;
  feedback?: string | null;
  detailsUrl?: string | null;
  dashboardUrl?: string | null;
};

const ProspectApprovedNotificationEmail = ({
  siteName,
  prospectName,
  prospectEmail,
  approvedAt,
  feedback,
  detailsUrl,
  dashboardUrl,
}: ProspectApprovedNotificationEmailProps) => {
  const safeSiteName = siteName?.trim() || "your project";
  const safeProspectEmail = prospectEmail?.trim() || "prospect@example.com";
  const safeProspectName = prospectName?.trim() || safeProspectEmail;
  const safeApprovedAt = approvedAt || "just now";
  const safeFeedback = feedback?.trim();
  const safeDetailsUrl = detailsUrl || null;
  const safeDashboardUrl = dashboardUrl || null;

  return (
    <EmailLayout
      heading="🎉 Prospect gave us the green light"
      preheader={`${safeProspectName} approved ${safeSiteName}. Time to keep the party rolling.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Boom! {safeProspectName} just approved{" "}
        <span className="font-semibold">{safeSiteName}</span> on {safeApprovedAt}.
        Grab the final details and keep the launch train cruising.
      </Text>

      {safeFeedback ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">Their shout-out</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">“{safeFeedback}”</p>
        </div>
      ) : null}

      <div className="grid gap-[12px] text-[15px] text-[#020304] leading-[22px]">
        <div className="flex items-center justify-between">
          <span className="font-medium">Prospect</span>
          <span>{safeProspectName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Email</span>
          <a
            href={`mailto:${safeProspectEmail}`}
            className="text-[#6366F1] font-medium no-underline"
          >
            {safeProspectEmail}
          </a>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Approved</span>
          <span>{safeApprovedAt}</span>
        </div>
      </div>

      <div className="flex flex-col gap-[12px] sm:flex-row sm:justify-center">
        {safeDetailsUrl ? (
          <Button
            href={safeDetailsUrl}
            className="bg-[#6366F1] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Collect Final Details
          </Button>
        ) : null}
        {safeDashboardUrl ? (
          <Button
            href={safeDashboardUrl}
            className="bg-[#020304] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Open Project Dashboard
          </Button>
        ) : null}
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Give the client a celebratory nudge—momentum is our best friend right
        now.
      </Text>
    </EmailLayout>
  );
};

export default ProspectApprovedNotificationEmail;
