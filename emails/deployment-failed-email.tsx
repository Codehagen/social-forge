import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

type DeploymentFailedEmailProps = {
  siteName: string;
  environmentName: string;
  failedAt: string;
  errorSummary?: string | null;
  logsUrl?: string | null;
  retryUrl?: string | null;
  supportEmail?: string | null;
};

const DeploymentFailedEmail = ({
  siteName,
  environmentName,
  failedAt,
  errorSummary,
  logsUrl,
  retryUrl,
  supportEmail,
}: DeploymentFailedEmailProps) => {
  const safeSiteName = siteName?.trim() || "your project";
  const safeEnvironmentName = environmentName?.trim() || "production";
  const safeFailedAt = failedAt || "just now";
  const safeErrorSummary = errorSummary?.trim();
  const safeLogsUrl = logsUrl || null;
  const safeRetryUrl = retryUrl || null;
  const safeSupportEmail = supportEmail?.trim() || null;

  return (
    <EmailLayout
      heading="Deployment failed"
      preheader={`${safeSiteName} (${safeEnvironmentName}) hit a snag—let’s fix it and relaunch.`}
      footerNote={
        safeSupportEmail ? (
          <>
            Want a second set of eyes? Message{" "}
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
        The deploy for <span className="font-semibold">{safeSiteName}</span> (
        {safeEnvironmentName}) face-planted at {safeFailedAt}. Peek at the logs, squash
        the culprit, and give it another run so the latest glow-ups can ship.
      </Text>

      {safeErrorSummary ? (
        <div className="rounded-[8px] bg-[#FEF2F2] px-[20px] py-[16px] text-[15px] text-[#991B1B] leading-[22px]">
          <p className="m-0 font-semibold">Error highlight reel</p>
          <p className="mt-[8px] mb-0 whitespace-pre-line">{safeErrorSummary}</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-[12px] sm:flex-row sm:justify-center">
        {safeLogsUrl ? (
          <Button
            href={safeLogsUrl}
            className="bg-[#6366F1] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            View Deployment Logs
          </Button>
        ) : null}
        {safeRetryUrl ? (
          <Button
            href={safeRetryUrl}
            className="bg-[#020304] text-white px-[24px] py-[14px] rounded-[8px] text-[16px] font-semibold no-underline inline-block"
          >
            Retry Deployment
          </Button>
        ) : null}
      </div>

      <Text className="text-[16px] text-[#020304] leading-[24px]">
        Once it sticks the landing, we’ll shoot over a confirmation so you can
        loop in the client with good news.
      </Text>
    </EmailLayout>
  );
};

export default DeploymentFailedEmail;
