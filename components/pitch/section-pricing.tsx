import Link from "next/link";
import { Card } from "./ui";

export function SectionPricing() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>How we will make money</span>
        <span className="text-[#878787]">
          <Link href="/">socialforge.com</Link>
        </span>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="px-4 md:px-0 md:pt-0 h-[580px] md:h-auto overflow-auto pb-[100px] md:pb-0">
          <div className="mb-4">
            <h2 className="text-2xl">Subscription Tiers</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 md:pt-0 md:mb-[80px] mb-12">
            <Card className="pb-8">
              <span className="py-1 px-4 bg-white text-black rounded-lg text-sm font-medium mb-4">
                Starter
              </span>

              <h2 className="text-2xl">$29/mo</h2>
              <p className="text-[#878787] text-sm text-center">
                Perfect for freelancers and solo agencies. Up to 3 workspaces, 10 sites per workspace, and basic AI features.
              </p>
            </Card>

            <Card className="pb-8">
              <span className="py-1 px-4 border border-purple-500 bg-purple-500/10 rounded-lg text-sm font-medium mb-4">
                Professional
              </span>

              <h2 className="text-2xl">$99/mo</h2>
              <p className="text-[#878787] text-sm text-center">
                For growing agencies. Unlimited workspaces, 50 sites per workspace, advanced AI, priority support.
              </p>
            </Card>

            <Card className="pb-8">
              <span className="py-1 px-4 border border-border rounded-lg text-sm font-medium mb-4">
                Enterprise
              </span>

              <h2 className="text-2xl">Custom</h2>
              <p className="text-[#878787] text-sm text-center">
                White-label solution for large agencies. Custom limits, dedicated support, and custom integrations.
              </p>
            </Card>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl">Additional Revenue Streams</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 md:pt-0">
            <Card className="pb-8">
              <h2>Team Seats</h2>
              <p className="text-[#878787] text-sm text-center">
                $10 per additional team member per month. Collaborate with unlimited team members across workspaces.
              </p>
            </Card>

            <Card className="pb-8">
              <h2>AI Usage</h2>
              <p className="text-[#878787] text-sm text-center">
                Usage-based pricing for advanced AI features beyond base tier limits. Transparent per-generation pricing.
              </p>
            </Card>

            <Card className="pb-8">
              <h2>Premium Templates</h2>
              <p className="text-[#878787] text-sm text-center">
                Marketplace for premium templates and components. Revenue share with creators, expanding the ecosystem.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
