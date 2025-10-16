import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type SiteLiveAnnouncementEmailProps = {
  prospectName?: string | null;
  siteName: string;
  liveDomain: string;
  workspaceName: string;
  supportEmail?: string | null;
  launchNotes?: string | null;
  analyticsUrl?: string | null;
};

const SiteLiveAnnouncementEmail = ({
  prospectName,
  siteName,
  liveDomain,
  workspaceName,
  supportEmail,
  launchNotes,
  analyticsUrl,
}: SiteLiveAnnouncementEmailProps) => {
  const greeting = prospectName ? `Hi ${prospectName},` : "Hi there,";

  return (
    <EmailLayout
      heading="🚀 Your website is live!"
      preheader={`${siteName} just blasted off at ${liveDomain}.`}
      footerNote={
        supportEmail ? (
          <>
            Need anything? Reach us at{" "}
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
        Confetti time! <span className="font-semibold">{siteName}</span> is now
        live and ready for visitors. The {workspaceName} crew is on watch, so
        feel free to shout it from the rooftops.
      </Text>

      <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-center">
        <p className="m-0 text-[15px] text-[#6B7280]">Live domain</p>
        <p className="mt-[8px] mb-0 text-[18px] font-semibold">
          <a
            href={`https://${liveDomain}`}
            className="text-[#020304] no-underline"
          >
            {liveDomain}
          </a>
        </p>
      </div>

      {launchNotes ? (
        <div className="rounded-[8px] bg-[#ECFDF3] px-[20px] py-[16px] text-[15px] text-[#064E3B] leading-[22px]">
          <p className="m-0 font-semibold">Launch notes</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{launchNotes}</p>
        </div>
      ) : null}

      <div className="text-center">
        <Button
          href={`https://${liveDomain}`}
          className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Visit Your Website
        </Button>
        {analyticsUrl ? (
          <div className="mt-[12px]">
            <a
              href={analyticsUrl}
              className="text-[14px] text-[#6366F1] font-medium no-underline"
            >
              View launch analytics →
            </a>
          </div>
        ) : null}
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Share the news far and wide—and if you want a post-launch tune-up,
        we’re only a reply away.
      </Text>
    </EmailLayout>
  );
};

export default SiteLiveAnnouncementEmail;
