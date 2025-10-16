import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type WorkspaceInvitationEmailProps = {
  inviteeName?: string | null;
  inviterName?: string | null;
  workspaceName: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
  supportEmail?: string | null;
};

const WorkspaceInvitationEmail = ({
  inviteeName,
  inviterName,
  workspaceName,
  role,
  inviteUrl,
  expiresAt,
  supportEmail,
}: WorkspaceInvitationEmailProps) => {
  const greeting = inviteeName ? `Hi ${inviteeName},` : "Hi there,";

  return (
    <EmailLayout
      heading="You’ve been invited to Social Forge"
      preheader={`${inviterName || "A teammate"} invited you to join ${workspaceName}.`}
      footerNote={
        supportEmail ? (
          <>
            Questions? Email{" "}
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
        {inviterName || "A teammate"} invited you to collaborate in{" "}
        <span className="font-semibold">{workspaceName}</span> as a{" "}
        <span className="font-semibold">{role}</span>. Accept the invite to jump
        into active projects, share feedback, and keep launches moving.
      </Text>

      <div className="text-center">
        <Button
          href={inviteUrl}
          className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Accept Invitation
        </Button>
        <Text className="text-[14px] text-[#6B7280] mt-[12px] leading-[20px]">
          Invitation expires on {expiresAt}.
        </Text>
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Already have access? You can ignore this message safely.
      </Text>
    </EmailLayout>
  );
};

export default WorkspaceInvitationEmail;
