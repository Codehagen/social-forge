import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type SiteCollaboratorAddedEmailProps = {
  collaboratorWorkspaceName: string;
  siteName: string;
  role: string;
  inviterName?: string | null;
  dashboardUrl: string;
};

const SiteCollaboratorAddedEmail = ({
  collaboratorWorkspaceName,
  siteName,
  role,
  inviterName,
  dashboardUrl,
}: SiteCollaboratorAddedEmailProps) => {
  const safeCollaboratorWorkspaceName =
    collaboratorWorkspaceName?.trim() || "your workspace";
  const safeSiteName = siteName?.trim() || "your project";
  const safeRole = role?.trim() || "collaborator";
  const safeInviterName = inviterName?.trim() || "A partner";
  const safeDashboardUrl = dashboardUrl || "#";

  return (
    <EmailLayout
      heading="You now collaborate on a new project"
      preheader={`${safeInviterName} added ${safeCollaboratorWorkspaceName} as a ${safeRole} on ${safeSiteName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {safeInviterName} just plugged{" "}
        <span className="font-semibold">{safeCollaboratorWorkspaceName}</span> into{" "}
        <span className="font-semibold">{safeSiteName}</span> with{" "}
        <span className="font-semibold">{safeRole}</span> powers. Time to hop in,
        track the magic, and ship updates together.
      </Text>

      <div className="text-center">
        <Button
          href={safeDashboardUrl}
          className="bg-[#6366F1] text-white px-[28px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Open Project Dashboard
        </Button>
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Need different access? Nudge the project owner and they’ll tweak it in a
        snap.
      </Text>
    </EmailLayout>
  );
};

export default SiteCollaboratorAddedEmail;
