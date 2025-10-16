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
      preheader={`${siteName} is still waiting on your thumbs-up—${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left.`}
      footerNote={
        supportEmail ? (
          <>
            Need a hand? Give{" "}
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
        {greeting} quick pulse check!
      </Text>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Your preview of <span className="font-semibold">{siteName}</span> from{" "}
        {workspaceName} is still patiently waiting. The link taps out on{" "}
        {expiresAt}, so toss in your notes before the curtain falls.
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
            ? "Heads-up: the link closes today."
            : `Only ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} of VIP access left.`}
        </Text>
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Need a little extra runway? Reply and we’ll happily extend the preview.
      </Text>
    </EmailLayout>
  );
};

export default ProspectReviewReminderEmail;
