"use client";

import Link from "next/link";
import { Card } from "./ui";

export function SectionTraction() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>Where we are</span>
        <span className="text-[#878787]">
          <Link href="/">socialforge.com</Link>
        </span>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 md:pt-0 h-[580px] md:h-auto overflow-auto pb-[100px] md:pb-0">
          <div className="space-y-8">
            <Card className="min-h-[365px]">
              <h2 className="text-2xl">Beta Users</h2>

              <p className="text-[#878787] text-sm text-center">
                Early adopters testing the platform and providing valuable feedback for product development.
              </p>

              <span className="mt-auto font-mono text-[80px] md:text-[122px]">
                50+
              </span>
            </Card>

            <Card className="min-h-[365px]">
              <h2 className="text-2xl">Active Workspaces</h2>

              <p className="text-[#878787] text-sm text-center">
                Agencies and freelancers managing their clients on the platform.
              </p>

              <div className="flex items-center space-x-4">
                <span className="relative ml-auto flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="mt-auto font-mono text-[80px] md:text-[122px]">
                  25+
                </span>
              </div>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="min-h-[365px]">
              <h2 className="text-2xl">Sites Built</h2>

              <p className="text-[#878787] text-sm text-center">
                Total number of websites created using the AI builder platform.
              </p>

              <div className="flex items-center space-x-4">
                <span className="relative ml-auto flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-green-400" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>

                <span className="mt-auto font-mono text-[80px] md:text-[122px]">
                  100+
                </span>
              </div>
            </Card>

            <Card className="min-h-[365px]">
              <h2 className="text-2xl">Development Stage</h2>

              <p className="text-[#878787] text-sm text-center">
                Currently in private beta with active development and weekly updates.
              </p>

              <span className="mt-auto text-xl font-semibold text-green-400">
                Private Beta
              </span>
            </Card>
          </div>

          <div className="ml-auto w-full max-w-[820px] h-full border border-border p-6 bg-[#0C0C0C]">
            <h2 className="mb-8 block text-[38px] font-medium">
              Momentum
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl mb-2">Growing Interest</h3>
                <p className="text-[#878787] text-sm">
                  Agencies are actively seeking AI-powered solutions to streamline their workflow and scale operations.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-2">Market Validation</h3>
                <p className="text-[#878787] text-sm">
                  Beta users report 50% time savings on website creation and improved client satisfaction.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-2">Product-Market Fit</h3>
                <p className="text-[#878787] text-sm">
                  Strong retention among early users with consistent feature requests guiding our roadmap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
