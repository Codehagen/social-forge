import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Text,
  Button,
  Hr,
  Tailwind,
} from "@react-email/components";

const WelcomeEmail = () => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-[#F6F8FA] font-sans py-[40px]">
          <Container className="bg-[#FFFFFF] rounded-[8px] p-[40px] max-w-[600px] mx-auto">
            {/* Logo Section */}
            <div className="text-center mb-[32px]">
              <div className="flex items-center justify-center gap-[8px]">
                <span className="text-[20px] font-semibold text-[#020304]">
                  Social Forge
                </span>
              </div>
            </div>

            {/* Header Section */}
            <div className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-[#020304] m-0">
                Welcome aboard! 🎉
              </Heading>
            </div>

            {/* Body Copy */}
            <div className="text-center mb-[32px]">
              <Text className="text-[16px] text-[#020304] mb-[16px] leading-[24px]">
                Woohoo! You've just joined something pretty awesome, and we
                couldn't be more excited to have you here!
              </Text>

              <Text className="text-[16px] text-[#020304] mb-[32px] leading-[24px]">
                Ready to dive in? Let's get your account all set up so you can
                start exploring all the cool stuff we have in store.
              </Text>

              {/* CTA Button */}
              <Button
                href="https://socialforge.tech/"
                className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
              >
                Let's Do This!
              </Button>
            </div>

            {/* Support Message */}
            <Text className="text-[14px] text-[#020304] text-center mb-[24px] leading-[20px]">
              Got questions? Stuck somewhere? Our super helpful team is just a
              message away and ready to save the day!
            </Text>

            {/* Sign-off */}
            <Text className="text-[16px] text-[#020304] text-center mb-[32px] leading-[24px]">
              High fives,
              <br />
              Christer Hagen, Founder
            </Text>

            {/* Divider */}
            <Hr className="border-[#E5E7EB] border-solid my-[32px]" />

            {/* Footer */}
            <div className="text-center">
              <Text className="text-[14px] text-[#020304] mb-[8px] leading-[20px]">
                Social Forge helps agencies build AI-powered websites faster
                with collaborative workflows.
              </Text>

              <Text className="text-[12px] text-[#020304] m-0 leading-[16px]">
                © 2025 Social Forge. All rights reserved.
                <br />
                Dronningens gate 18, Norway
              </Text>
            </div>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
