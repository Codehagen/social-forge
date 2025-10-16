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
  return (
    <EmailLayout
      heading="You now collaborate on a new project"
      preheader={`${inviterName || "A partner"} added ${collaboratorWorkspaceName} as a ${role} on ${siteName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {inviterName || "A partner"} just plugged{" "}
        <span className="font-semibold">{collaboratorWorkspaceName}</span> into{" "}
        <span className="font-semibold">{siteName}</span> with{" "}
        <span className="font-semibold">{role}</span> powers. Time to hop in,
        track the magic, and ship updates together.
      </Text>

      <div className="text-center">
        <Button
          href={dashboardUrl}
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
