import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type SiteTransferRequestEmailProps = {
  siteName: string;
  fromWorkspaceName: string;
  toWorkspaceName: string;
  requestedAt: string;
  notes?: string | null;
  reviewUrl: string;
};

const SiteTransferRequestEmail = ({
  siteName,
  fromWorkspaceName,
  toWorkspaceName,
  requestedAt,
  notes,
  reviewUrl,
}: SiteTransferRequestEmailProps) => {
  return (
    <EmailLayout
      heading="Transfer request waiting on you"
      preheader={`${fromWorkspaceName} wants ${siteName} to live inside ${toWorkspaceName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {fromWorkspaceName} just asked to hand off{" "}
        <span className="font-semibold">{siteName}</span> to{" "}
        <span className="font-semibold">{toWorkspaceName}</span>. The request
        arrived on {requestedAt}—take a peek and decide if it’s a go or a no.
      </Text>

      {notes ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">Passing note from {fromWorkspaceName}</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{notes}</p>
        </div>
      ) : null}

      <div className="text-center">
        <Button
          href={reviewUrl}
          className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Review Transfer Request
        </Button>
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Need a minute? Transfers wait patiently, but quick decisions keep
        projects humming.
      </Text>
    </EmailLayout>
  );
};

export default SiteTransferRequestEmail;
