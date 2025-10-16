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
      preheader={`${inviterName || "A partner"} granted ${collaboratorWorkspaceName} ${role} access to ${siteName}.`}
    >
      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {inviterName || "A partner"} just added{" "}
        <span className="font-semibold">{collaboratorWorkspaceName}</span> to{" "}
        <span className="font-semibold">{siteName}</span> with{" "}
        <span className="font-semibold">{role}</span> permissions. You can now
        jump in, track progress, and ship updates together.
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
        Need different access? Ask the project owner to adjust permissions from
        the collaborators panel.
      </Text>
    </EmailLayout>
  );
};

export default SiteCollaboratorAddedEmail;
