import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PitchSlideProps = {
  label: string;
  children: ReactNode;
  href?: string;
  action?: ReactNode;
  className?: string;
  innerClassName?: string;
};

export function PitchSlide({
  label,
  children,
  href = "/",
  action,
  className,
  innerClassName,
}: PitchSlideProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[min(95svh,760px)] items-center bg-transparent",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-6xl px-6 py-12 md:py-16 lg:py-20",
          innerClassName
        )}
      >
        <div className="flex flex-col gap-8 md:gap-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-muted/70 px-4 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {label}
            </span>
            {action ?? (
              <Link
                href={href}
                className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground"
              >
                socialforge.com
              </Link>
            )}
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}

export function PitchCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-2xl border border-foreground/10 bg-card/95 px-6 py-8 text-left shadow-[0_25px_65px_-35px_rgba(15,23,42,0.55)] backdrop-blur-sm md:px-8",
        "[font-variant-numeric:tabular-nums]",
        className
      )}
    >
      {children}
    </div>
  );
}
