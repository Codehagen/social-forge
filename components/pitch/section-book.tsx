import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SectionBook() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>Let's talk</span>
        <Link href="/">
          <Button variant="outline">Visit Website</Button>
        </Link>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="h-[400px] md:h-[600px] px-4 md:px-0 text-center flex flex-col items-center justify-center">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Ready to scale your agency?
          </h2>
          <p className="text-xl text-[#878787] mb-8 max-w-2xl">
            Join our private beta and be among the first to experience the future of web agency operations.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <Link href="/contact">
              <Button size="lg" className="text-lg px-8">
                Schedule a Demo
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Join Waitlist
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
