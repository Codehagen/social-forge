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
  const name = prospectName || prospectEmail;

  return (
    <EmailLayout
      heading="Prospect needs revisions"
      preheader={`${name} declined ${siteName}. Review their notes and plan the next draft.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {name} reviewed <span className="font-semibold">{siteName}</span> on{" "}
        {declinedAt} and marked it as “Not ready yet.” Give their feedback a
        look and plan the next iteration so we can re-engage quickly.
      </Text>

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
          <span className="font-medium">Declined</span>
          <span>{declinedAt}</span>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-[8px] bg-[#FEF3C7] px-[20px] py-[16px] text-[15px] text-[#78350F] leading-[22px]">
          <p className="m-0 font-semibold">What they said</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">“{feedback}”</p>
        </div>
      ) : (
        <Text className="text-[15px] text-[#6B7280] leading-[22px]">
          No written feedback was provided this time—consider scheduling a quick
          call to clarify next steps.
        </Text>
      )}

      {dashboardUrl ? (
        <div className="text-center">
          <Button
            href={dashboardUrl}
            className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Review Feedback in Dashboard
          </Button>
        </div>
      ) : null}

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Once you update the build, resend the preview so the project keeps its
        momentum.
      </Text>
    </EmailLayout>
  );
};

export default ProspectDeclinedNotificationEmail;
