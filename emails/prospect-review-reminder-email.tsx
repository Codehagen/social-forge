import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type ProspectReviewReminderEmailProps = {
  prospectName?: string | null;
  siteName: string;
  shareUrl: string;
  expiresAt: string;
  daysRemaining: number;
  workspaceName: string;
  supportEmail?: string | null;
};

const ProspectReviewReminderEmail = ({
  prospectName,
  siteName,
  shareUrl,
  expiresAt,
  daysRemaining,
  workspaceName,
  supportEmail,
}: ProspectReviewReminderEmailProps) => {
  const greeting = prospectName ? `Hi ${prospectName},` : "Hi there,";

  return (
    <EmailLayout
      heading="Friendly reminder to review"
      preheader={`${siteName} is waiting for your feedback—${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left.`}
      footerNote={
        supportEmail ? (
          <>
            Questions? Reach out to{" "}
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
        {greeting}
      </Text>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Just a heads-up that your preview of{" "}
        <span className="font-semibold">{siteName}</span> from {workspaceName}{" "}
        expires on {expiresAt}. We’d love to hear your thoughts so we can keep
        the project on track.
      </Text>

      <div className="text-center">
        <Button
          href={shareUrl}
          className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Jump Back Into the Preview
        </Button>
        <Text className="text-[14px] text-[#6B7280] mt-[12px] leading-[20px]">
          {daysRemaining === 0
            ? "The link closes today."
            : `Only ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left before the link closes.`}
        </Text>
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Need more time? Just reply to this email and we’ll happily extend it.
      </Text>
    </EmailLayout>
  );
};

export default ProspectReviewReminderEmail;
