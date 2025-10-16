import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type ProspectDeclinedNotificationEmailProps = {
  siteName: string;
  prospectName?: string | null;
  prospectEmail: string;
  declinedAt: string;
  feedback?: string | null;
  dashboardUrl?: string | null;
};

const ProspectDeclinedNotificationEmail = ({
  siteName,
  prospectName,
  prospectEmail,
  declinedAt,
  feedback,
  dashboardUrl,
}: ProspectDeclinedNotificationEmailProps) => {
  const safeSiteName = siteName?.trim() || "your project";
  const safeProspectEmail = prospectEmail?.trim() || "prospect@example.com";
  const safeProspectName = prospectName?.trim() || safeProspectEmail;
  const safeDeclinedAt = declinedAt || "recently";
  const safeFeedback = feedback?.trim();
  const safeDashboardUrl = dashboardUrl || null;

  return (
    <EmailLayout
      heading="Prospect needs another round"
      preheader={`${safeProspectName} asked for tweaks to ${safeSiteName}. Let’s level it up.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {safeProspectName} checked out{" "}
        <span className="font-semibold">{safeSiteName}</span> on {safeDeclinedAt}{" "}
        and clicked “Not quite there.” No stress—scan their notes and line up the
        glow-up.
      </Text>

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
          <span className="font-medium">Declined</span>
          <span>{safeDeclinedAt}</span>
        </div>
      </div>

      {safeFeedback ? (
        <div className="rounded-[8px] bg-[#FEF3C7] px-[20px] py-[16px] text-[15px] text-[#78350F] leading-[22px]">
          <p className="m-0 font-semibold">Their wish list</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">“{safeFeedback}”</p>
        </div>
      ) : (
        <Text className="text-[15px] text-[#6B7280] leading-[22px]">
          They didn’t leave notes this time—grab a quick call to vibe on the next
          direction.
        </Text>
      )}

      {safeDashboardUrl ? (
        <div className="text-center">
          <Button
            href={safeDashboardUrl}
            className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Review Feedback in Dashboard
          </Button>
        </div>
      ) : null}

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Once you zhuzh things up, fire off a fresh preview link and keep the
        project buzzing.
      </Text>
    </EmailLayout>
  );
};

export default ProspectDeclinedNotificationEmail;
