import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PitchCard, PitchSlide } from "./ui";

export function SectionBook() {
  return (
    <PitchSlide
      label="Let's talk"
      action={
        <Button asChild size="sm" variant="outline" className="rounded-full px-4 py-1 text-xs uppercase tracking-wide">
          <Link href="/">Visit website</Link>
        </Button>
      }
    >
      <PitchCard className="items-center bg-muted/70 text-center">
        <h2 className="text-4xl font-semibold md:text-5xl">
          Ready to scale your agency?
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Join the private beta to co-build the operating system for AI-first
          agencies. We onboard new partners every month.
        </p>
        <div className="flex flex-col gap-3 md:flex-row">
          <Button asChild size="lg" className="text-base">
            <Link href="https://cal.com/socialforge/demo">Schedule a call</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-base">
            <Link href="/sign-up">Join the waitlist</Link>
          </Button>
        </div>
      </PitchCard>
    </PitchSlide>
  );
}
