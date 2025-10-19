import Link from "next/link";
import { Card } from "./ui";

export function SectionNext() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>What's coming next</span>
        <span className="text-[#878787]">
          <Link href="/">socialforge.com</Link>
        </span>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 md:pt-0 h-[580px] md:h-auto overflow-auto pb-[100px] md:pb-0">
          <div className="space-y-8">
            <Card className="min-h-[370px]">
              <h2 className="text-xl">Advanced AI Builder</h2>
              <p className="text-[#878787] text-sm text-center">
                Enhanced AI capabilities with multi-modal inputs, better design understanding, and voice-to-website generation.
              </p>
            </Card>

            <Card className="min-h-[370px]">
              <h2 className="text-xl">Template Marketplace</h2>
              <p className="text-[#878787] text-sm text-center">
                Community-driven marketplace for templates, components, and plugins. Revenue sharing for creators.
              </p>
            </Card>
          </div>
          <div className="space-y-8">
            <Card className="min-h-[370px]">
              <h2 className="text-xl">Client Portal</h2>
              <p className="text-[#878787] text-sm text-center">
                Dedicated portals for clients to review sites, request changes, and approve deliverables—streamlining agency-client communication.
              </p>
            </Card>

            <Card className="min-h-[370px]">
              <h2 className="text-xl">Integrations Hub</h2>
              <p className="text-[#878787] text-sm text-center">
                Connect with popular tools: CRMs, payment processors, analytics platforms, and marketing automation.
              </p>
            </Card>
          </div>

          <div className="ml-auto w-full max-w-[820px] h-full border border-border p-6 bg-[#0C0C0C]">
            <h2 className="mb-8 block text-xl">Roadmap Highlights</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg mb-2 flex items-center gap-2">
                  <span className="text-green-400">Q2 2025</span>
                </h3>
                <ul className="text-[#878787] text-sm space-y-1">
                  <li>• White-label capabilities</li>
                  <li>• Advanced SEO tools</li>
                  <li>• Performance analytics</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-2 flex items-center gap-2">
                  <span className="text-blue-400">Q3 2025</span>
                </h3>
                <ul className="text-[#878787] text-sm space-y-1">
                  <li>• Mobile app for iOS/Android</li>
                  <li>• E-commerce features</li>
                  <li>• Multi-language support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg mb-2 flex items-center gap-2">
                  <span className="text-purple-400">Q4 2025</span>
                </h3>
                <ul className="text-[#878787] text-sm space-y-1">
                  <li>• API for custom integrations</li>
                  <li>• Enterprise SSO</li>
                  <li>• Advanced team permissions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
