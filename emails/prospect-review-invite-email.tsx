import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type ProspectReviewInviteEmailProps = {
  prospectName?: string | null;
  siteName: string;
  shareUrl: string;
  expiresAt: string;
  message?: string | null;
  workspaceName: string;
  supportEmail?: string | null;
};

const ProspectReviewInviteEmail = ({
  prospectName,
  siteName,
  shareUrl,
  expiresAt,
  message,
  workspaceName,
  supportEmail,
}: ProspectReviewInviteEmailProps) => {
  const greeting = prospectName ? `Hi ${prospectName},` : "Hi there,";

  return (
    <EmailLayout
      heading={`Preview "${siteName}"`}
      preheader={`Take a spin through ${siteName} and tell us what you think.`}
      footerNote={
        supportEmail ? (
          <>
            Need backup? Ping{" "}
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
        {greeting} time to see some sparkle.
      </Text>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {workspaceName} just whipped up a shiny new version of{" "}
        <span className="font-semibold">{siteName}</span>. Dive in, kick the
        tires, and drop your thoughts so we can polish it to perfection.
      </Text>

      {message ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">A quick note from the crew:</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{message}</p>
        </div>
      ) : null}

      <div className="text-center">
        <Button
          href={shareUrl}
          className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Review &amp; Share Feedback
        </Button>
        <Text className="text-[14px] text-[#6B7280] mt-[12px] leading-[20px]">
          The magic portal stays open until {expiresAt}.
        </Text>
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        We’ll keep you posted on what’s next. Thanks for lending your eyes!
      </Text>
    </EmailLayout>
  );
};

export default ProspectReviewInviteEmail;
