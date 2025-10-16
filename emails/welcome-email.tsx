import * as React from "react";
import { Button, Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

const WelcomeEmail = () => {
  return (
    <EmailLayout heading="Welcome aboard! 🎉">
      <div className="text-center space-y-[24px]">
        <Text className="text-[16px] text-[#020304] leading-[24px]">
          Woohoo! You've just joined something pretty awesome, and we couldn't
          be more excited to have you here!
        </Text>
        <Text className="text-[16px] text-[#020304] leading-[24px]">
          Ready to dive in? Let's get your account all set up so you can start
          exploring all the cool stuff we have in store.
        </Text>
        <Button
          href="https://socialforge.tech/"
          className="bg-[#6366F1] text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
        >
          Let's Do This!
        </Button>
      </div>

      <Text className="text-[14px] text-[#020304] text-center leading-[20px]">
        Got questions? Stuck somewhere? Our super helpful team is just a
        message away and ready to save the day!
      </Text>

      <Text className="text-[16px] text-[#020304] text-center leading-[24px]">
        High fives,
        <br />
        Christer Hagen, Founder
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;
