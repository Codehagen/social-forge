"use client";
import { Beacon } from "@/components/logos/beacon";
import { Bolt } from "@/components/logos/bolt";
import { Cisco } from "@/components/logos/cisco";
import { Hulu } from "@/components/logos/hulu";
import { OpenAIFull } from "@/components/logos/open-ai";
import { Primevideo } from "@/components/logos/prime";
import { Stripe } from "@/components/logos/stripe";
import { Supabase } from "@/components/logos/supabase";
import { Polars } from "@/components/logos/polars";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { VercelFull } from "@/components/logos/vercel";
import { Spotify } from "@/components/logos/spotify";
import { PayPal } from "@/components/logos/paypal";
import { LeapWallet } from "@/components/logos/leap-wallet";

const aiLogos: React.ReactNode[] = [
  <OpenAIFull height={24} width="auto" />,
  <Bolt height={20} width="auto" />,
  <Cisco height={32} width="auto" />,
  <Hulu height={22} width="auto" />,
  <Spotify height={24} width="auto" />,
];

const hostingLogos: React.ReactNode[] = [
  <Supabase height={24} width="auto" />,
  <Cisco height={32} width="auto" />,
  <Hulu height={22} width="auto" />,
  <Spotify height={24} width="auto" />,
  <VercelFull height={20} width="auto" />,
];

const paymentsLogos: React.ReactNode[] = [
  <Stripe height={24} width="auto" />,
  <PayPal height={24} width="auto" />,
  <LeapWallet height={24} width="auto" />,
  <Beacon height={20} width="auto" />,
  <Polars height={24} width="auto" />,
];

const streamingLogos: React.ReactNode[] = [
  <Primevideo height={28} width="auto" />,
  <Hulu height={22} width="auto" />,
  <Spotify height={24} width="auto" />,
  <Cisco height={32} width="auto" />,
  <Beacon height={20} width="auto" />,
];

const logos: Record<
  "ai" | "hosting" | "streaming" | "payments",
  React.ReactNode[]
> = {
  ai: aiLogos,
  hosting: hostingLogos,
  payments: paymentsLogos,
  streaming: streamingLogos,
};

type LogoGroup = keyof typeof logos;

export default function LogoCloudTwo() {
  const [currentGroup, setCurrentGroup] = useState<LogoGroup>("ai");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGroup((prev) => {
        const groups = Object.keys(logos) as LogoGroup[];
        const currentIndex = groups.indexOf(prev);
        const nextIndex = (currentIndex + 1) % groups.length;
        return groups[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
        <div className="py-8 md:py-16">
          <div className="mx-auto mb-12 max-w-xl text-balance text-center md:mb-16">
            <p
              data-current={currentGroup}
              className="text-muted-foreground mt-4 md:text-lg"
            >
              Powered by industry-leading technology from{" "}
              <span className="in-data-[current=ai]:text-foreground transition-colors duration-200">
                AI Companies,
              </span>{" "}
              <span className="in-data-[current=hosting]:text-foreground transition-colors duration-200">
                Hosting Providers,
              </span>{" "}
              <span className="in-data-[current=payments]:text-foreground transition-colors duration-200">
                Payment Processors,
              </span>{" "}
              <span className="in-data-[current=streaming]:text-foreground transition-colors duration-200">
                and Content Platforms
              </span>
            </p>
          </div>
          <div className="perspective-dramatic mx-auto grid max-w-5xl grid-cols-3 items-center gap-8 md:h-10 md:grid-cols-5">
            <AnimatePresence initial={false} mode="popLayout">
              {logos[currentGroup].map((logo, i) => (
                <motion.div
                  key={`${currentGroup}-${i}`}
                  className="**:fill-foreground! flex items-center justify-center"
                  initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(6px)", scale: 0.5 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  {logo}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
    </>
  );
}
