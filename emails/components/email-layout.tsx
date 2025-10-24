import * as React from "react";
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
  Hr,
} from "@react-email/components";

type EmailLayoutProps = {
  heading: React.ReactNode;
  children: React.ReactNode;
  preheader?: string;
  footerNote?: React.ReactNode;
};

export function EmailLayout({
  heading,
  children,
  preheader,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        {preheader ? <Preview>{stripHtml(preheader)}</Preview> : null}
        <Body className="bg-[#F6F8FA] font-sans py-[40px]">
          <Container className="bg-[#FFFFFF] rounded-[8px] p-[40px] max-w-[600px] mx-auto">
            <div className="text-center mb-[32px]">
              <div className="flex items-center justify-center gap-[8px]">
                <span className="text-[20px] font-semibold text-[#020304]">
                  Social Forge
                </span>
              </div>
            </div>

            <div className="text-center mb-[32px]">
              {typeof heading === "string" ? (
                <Text className="text-[28px] font-bold text-[#020304] m-0 leading-[32px]">
                  {heading}
                </Text>
              ) : (
                heading
              )}
            </div>

            <div className="space-y-[24px] text-left">{children}</div>

            <footer className="mt-[40px] text-center">
              {footerNote ? (
                <div className="mb-[16px] text-[14px] text-[#020304] leading-[20px]">
                  {footerNote}
                </div>
              ) : null}
              <Hr className="border-[#E5E7EB] border-solid my-[24px]" />
              <Text className="text-[14px] text-[#020304] mb-[12px] leading-[20px]">
                Keep forging brilliant web experiences—we&apos;ll handle the heavy
                lifting.
              </Text>
              <Text className="text-[14px] text-[#020304] mb-[8px] leading-[20px]">
                Social Forge helps agencies build AI-powered websites faster
                with collaborative workflows.
              </Text>
              <Text className="text-[12px] text-[#020304] m-0 leading-[16px]">
                © 2025 Social Forge. All rights reserved.
                <br />
                Dronningens gate 18, Norway
              </Text>
            </footer>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, "");
}
