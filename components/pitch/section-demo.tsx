import Link from "next/link";
import Image from "next/image";

export function SectionDemo() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>Platform Demo</span>
        <span className="text-[#878787]">
          <Link href="/">socialforge.com</Link>
        </span>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="px-4 md:px-0">
          <div className="border border-border bg-[#0C0C0C] p-8 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Build Professional Websites in Minutes
            </h2>
            <p className="text-[#878787] text-center mb-8 max-w-2xl mx-auto">
              Our AI-powered platform transforms simple prompts into complete, professional websites. Manage multiple clients, deploy instantly, and scale your agency effortlessly.
            </p>

            <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={80}
                  height={80}
                  fill="none"
                  className="mx-auto mb-4 opacity-50"
                >
                  <path
                    fill="#F5F5F3"
                    d="M40 73.333c-4.611 0-8.944-.875-13-2.625-4.055-1.75-7.583-4.125-10.583-7.125S11.042 57.056 9.292 53s-2.625-8.389-2.625-13c0-4.611.875-8.944 2.625-13 1.75-4.056 4.125-7.583 7.125-10.583S22.944 11.042 27 9.292s8.389-2.625 13-2.625c4.611 0 8.944.875 13 2.625 4.056 1.75 7.583 4.125 10.583 7.125S68.958 22.944 70.708 27s2.625 8.389 2.625 13c0 4.611-.875 8.944-2.625 13-1.75 4.056-4.125 7.583-7.125 10.583S57.056 68.958 53 70.708s-8.389 2.625-13 2.625Zm-3.333-20V26.667L56.667 40 36.667 53.333Z"
                  />
                </svg>
                <p className="text-[#878787]">Product demo video coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
