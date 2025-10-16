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
  const name = prospectName || prospectEmail;

  return (
    <EmailLayout
      heading="🎉 Prospect gave us the green light"
      preheader={`${name} approved ${siteName}. Time to keep the party rolling.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Boom! {name} just approved{" "}
        <span className="font-semibold">{siteName}</span> on {approvedAt}. Grab
        the final details and keep the launch train cruising.
      </Text>

      {feedback ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">Their shout-out</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">“{feedback}”</p>
        </div>
      ) : null}

      <div className="grid gap-[12px] text-[15px] text-[#020304] leading-[22px]">
        <div className="flex items-center justify-between">
          <span className="font-medium">Prospect</span>
          <span>{name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Email</span>
          <a
            href={`mailto:${prospectEmail}`}
            className="text-[#6366F1] font-medium no-underline"
          >
            {prospectEmail}
          </a>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Approved</span>
          <span>{approvedAt}</span>
        </div>
      </div>

      <div className="flex flex-col gap-[12px] sm:flex-row sm:justify-center">
        {detailsUrl ? (
          <Button
            href={detailsUrl}
            className="bg-[#6366F1] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Collect Final Details
          </Button>
        ) : null}
        {dashboardUrl ? (
          <Button
            href={dashboardUrl}
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
