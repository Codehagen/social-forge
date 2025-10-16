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
  const safeSiteName = siteName?.trim() || "your project";
  const safeFromWorkspaceName = fromWorkspaceName?.trim() || "A workspace";
  const safeToWorkspaceName = toWorkspaceName?.trim() || "your workspace";
  const safeRequestedAt = requestedAt || "recently";
  const safeNotes = notes?.trim();
  const safeReviewUrl = reviewUrl || "#";

  return (
    <EmailLayout
      heading="Transfer request waiting on you"
      preheader={`${safeFromWorkspaceName} wants ${safeSiteName} to live inside ${safeToWorkspaceName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {safeFromWorkspaceName} just asked to hand off{" "}
        <span className="font-semibold">{safeSiteName}</span> to{" "}
        <span className="font-semibold">{safeToWorkspaceName}</span>. The request
        arrived on {safeRequestedAt}—take a peek and decide if it’s a go or a no.
      </Text>

      {safeNotes ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">
            Passing note from {safeFromWorkspaceName}
          </p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{safeNotes}</p>
        </div>
      ) : null}

      <div className="text-center">
        <Button
          href={safeReviewUrl}
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
