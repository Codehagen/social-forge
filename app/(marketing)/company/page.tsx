import { constructMetadata } from "@/lib/constructMetadata";

export const metadata = constructMetadata({
  title: "Company – Social Forge",
  description:
    "Company updates, values, and team structure for Social Forge (coming soon).",
});

export default function CompanyPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="space-y-6 text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-primary">
              Company
            </span>
            <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
              Company hub coming soon
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We&apos;re putting together deep dives on our values, operating
              cadence, and how we build together. Stay tuned for the full hub.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted">
        <div className="mx-auto max-w-6xl border-x px-3">
          <div className="border-x">
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-24 text-center text-muted-foreground md:py-32">
              Until then, follow our progress on the{" "}
              <a
                href="/open"
                className="text-foreground underline underline-offset-4"
              >
                Open Startup
              </a>{" "}
              page or drop us a note at{" "}
              <a
                href="mailto:hello@socialforge.tech"
                className="text-foreground underline underline-offset-4"
              >
                hello@socialforge.tech
              </a>
              .
            </div>
            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
          </div>
        </div>
      </section>

      <section className="border-t border-foreground/10">
        <div className="mx-auto max-w-6xl border-x px-3">
          <div className="border-x h-0" />
        </div>
      </section>
    </main>
  );
}
