import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type TransferStatus = "accepted" | "declined" | "cancelled";

type SiteTransferStatusEmailProps = {
  siteName: string;
  status: TransferStatus;
  actedByName?: string | null;
  actedAt: string;
  notes?: string | null;
  dashboardUrl?: string | null;
};

const statusCopy: Record<
  TransferStatus,
  { heading: string; highlight: string; summary: string; ctaLabel?: string }
> = {
  accepted: {
    heading: "Transfer completed",
    highlight: "gave a big yes to the hand-off",
    summary:
      "Everything now lives in the new workspace. Sanity-check domains, collaborators, and deploy settings just to be safe.",
    ctaLabel: "Open site in new workspace",
  },
  declined: {
    heading: "Transfer declined",
    highlight: "hit pause on the transfer",
    summary:
      "The site stays where it is. Peek at the notes and sync up before sending another request.",
    ctaLabel: "Review transfer notes",
  },
  cancelled: {
    heading: "Transfer cancelled",
    highlight: "cancelled the transfer",
    summary:
      "No changes were made. Restart the process whenever it feels right.",
    ctaLabel: "View site details",
  },
};

const fallbackCopy = {
  heading: "Transfer update",
  highlight: "updated the transfer",
  summary:
    "Something changed in the transfer flow. Pop into the project to see what’s new.",
  ctaLabel: "Open site dashboard",
} as const;

const SiteTransferStatusEmail = ({
  siteName,
  status,
  actedByName,
  actedAt,
  notes,
  dashboardUrl,
}: SiteTransferStatusEmailProps) => {
  const copy = statusCopy[status] ?? fallbackCopy;

  return (
    <EmailLayout
      heading={copy.heading}
      preheader={`${siteName} transfer was ${copy.highlight}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {actedByName || "A teammate"} {copy.highlight} for{" "}
        <span className="font-semibold">{siteName}</span> on {actedAt}.{" "}
        {copy.summary}
      </Text>

      {notes ? (
        <div className="rounded-[8px] bg-[#F6F8FA] px-[20px] py-[16px] text-[15px] text-[#020304] leading-[22px]">
          <p className="m-0 font-semibold">Shared notes</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{notes}</p>
        </div>
      ) : null}

      {dashboardUrl && copy.ctaLabel ? (
        <div className="text-center">
          <Button
            href={dashboardUrl}
            className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            {copy.ctaLabel}
          </Button>
        </div>
      ) : null}

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        If anything feels off, give the receiving workspace a quick ping so
        everyone stays locked in.
      </Text>
    </EmailLayout>
  );
};

export default SiteTransferStatusEmail;
