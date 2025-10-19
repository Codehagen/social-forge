import Link from "next/link";
import { Card } from "./ui";

export function SectionTeam() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>Who we are</span>
        <span className="text-[#878787]">
          <Link href="/">socialforge.com</Link>
        </span>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 md:pt-0 h-[580px] md:h-auto overflow-auto pb-[100px] md:pb-0">
          <div className="space-y-8">
            <Card className="items-start space-y-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 flex items-center justify-center text-3xl font-bold">
                SF
              </div>

              <h2 className="text-xl">Founder</h2>
              <span>Technical Lead</span>

              <p className="text-[#878787] text-sm !mt-2">
                Experienced full-stack developer with a passion for building tools that empower agencies and entrepreneurs. Previous experience in SaaS and web development.
              </p>
            </Card>
          </div>
          <div className="ml-auto w-full space-y-8 md:col-span-2 flex items-center">
            <div className="w-full">
              <h2 className="text-[64px] font-medium text-center leading-tight mb-8">
                "Building the future of web agency operations."
              </h2>

              <div className="border border-border p-6 bg-[#0C0C0C]">
                <h3 className="text-2xl mb-4">Our Mission</h3>
                <p className="text-[#878787]">
                  We're on a mission to democratize web development and empower agencies of all sizes to scale their operations with AI. By combining cutting-edge technology with intuitive design, we're making professional website creation accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
