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
      preheader={`${fromWorkspaceName} wants to transfer ${siteName} to ${toWorkspaceName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {fromWorkspaceName} requested to transfer{" "}
        <span className="font-semibold">{siteName}</span> into{" "}
        <span className="font-semibold">{toWorkspaceName}</span> on{" "}
        {requestedAt}. Review the handoff details to accept or decline the
        transfer.
      </Text>

      {notes ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">Notes from {fromWorkspaceName}</p>
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
        Need more time? Transfers stay pending until you respond, but acting now
        keeps projects moving smoothly.
      </Text>
    </EmailLayout>
  );
};

export default SiteTransferRequestEmail;
