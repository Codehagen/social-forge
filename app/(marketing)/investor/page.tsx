import { InvestorCarousel } from "@/components/pitch/investor-carousel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Pitch | Social Forge",
  description: "Building the future of web agency operations with AI-powered website creation and workspace management.",
};

export default function InvestorPage() {
  return <InvestorCarousel />;
}
