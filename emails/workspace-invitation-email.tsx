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
  const safeInviteeName = inviteeName?.trim();
  const safeInviterName = inviterName?.trim() || "A teammate";
  const safeWorkspaceName = workspaceName?.trim() || "your workspace";
  const safeRole = role?.trim() || "collaborator";
  const safeInviteUrl = inviteUrl || "#";
  const safeExpiresAt = expiresAt || "soon";
  const safeSupportEmail = supportEmail?.trim() || null;
  const greeting = safeInviteeName ? `Hi ${safeInviteeName},` : "Hi there,";

  return (
    <EmailLayout
      heading="You’ve been invited to Social Forge"
      preheader={`${safeInviterName} wants you in on ${safeWorkspaceName}.`}
      footerNote={
        safeSupportEmail ? (
          <>
            Need help joining the party? Email{" "}
            <a
              href={`mailto:${safeSupportEmail}`}
              className="text-[#6366F1] font-medium no-underline"
            >
              {safeSupportEmail}
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
        {safeInviterName} wants you to jam with{" "}
        <span className="font-semibold">{safeWorkspaceName}</span> as a{" "}
        <span className="font-semibold">{safeRole}</span>. Hit accept to dive into
        builds, drop feedback, and help launch shiny sites.
      </Text>

      <div className="text-center">
        <Button
          href={safeInviteUrl}
          className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
        >
          Accept Invitation
        </Button>
        <Text className="text-[14px] text-[#6B7280] mt-[12px] leading-[20px]">
          Invitation expires on {safeExpiresAt}.
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
