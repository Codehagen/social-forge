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
      preheader={`${inviterName || "A teammate"} wants you in on ${workspaceName}.`}
      footerNote={
        supportEmail ? (
          <>
            Need help joining the party? Email{" "}
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
        {greeting} we saved you a seat!
      </Text>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        {inviterName || "A teammate"} wants you to jam with{" "}
        <span className="font-semibold">{workspaceName}</span> as a{" "}
        <span className="font-semibold">{role}</span>. Hit accept to dive into
        builds, drop feedback, and help launch shiny sites.
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
        Already plugged in? Feel free to ignore this—it just means we’re excited
        to have you around.
      </Text>
    </EmailLayout>
  );
};

export default WorkspaceInvitationEmail;
