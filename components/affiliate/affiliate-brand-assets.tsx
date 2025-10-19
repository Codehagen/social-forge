import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

import {
  IconBrandNotion,
  IconDownload,
  IconSpeakerphone,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

type Resource = {
  title: string;
  description: string;
  href: string;
  cta?: string;
  disabled?: boolean;
  disabledCta?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const resources: Resource[] = [
  {
    title: "Logo & wordmark",
    description: "SVG, PNG, and usage guidance in a single download.",
    href: "/brand/affiliate-kit.zip",
    cta: "Download",
    disabled: true,
    disabledCta: "Coming soon",
    icon: IconDownload,
  },
  {
    title: "Messaging & copy deck",
    description:
      "Headlines, boilerplate, and proof points for campaigns and landing pages.",
    href: "https://docs.socialforge.com/affiliate-messaging",
    cta: "View deck",
    icon: IconBrandNotion,
  },
  {
    title: "Ad creative & templates",
    description:
      "Editable ads, email snippets, and social posts sized for top channels.",
    href: "/brand/affiliate-creative.zip",
    cta: "Grab assets",
    disabled: true,
    disabledCta: "Coming soon",
    icon: IconSpeakerphone,
  },
];

export function AffiliateBrandAssets({
  className,
}: {
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-6xl px-6", className)}>
      <div className="flex flex-col gap-3 text-center md:text-left">
        <span className="text-sm font-medium uppercase text-muted-foreground">
          Brand assets
        </span>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Campaign-ready resources
        </h2>
        <p className="max-w-2xl text-balance text-muted-foreground">
          Access ready-to-launch logos, messaging, and creative so you can talk
          about Social Forge with confidence.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {resources.map(
          ({
            title,
            description,
            href,
            cta,
            disabled,
            disabledCta,
            icon: Icon,
          }) => {
            const isDisabled = Boolean(disabled);

            if (isDisabled) {
              return (
                <Item
                  key={title}
                  variant="outline"
                  aria-disabled="true"
                  className="cursor-not-allowed opacity-60"
                >
                  <div className="flex w-full items-center gap-4 rounded-md">
                    <ItemMedia variant="icon">
                      <Icon
                        className="size-5"
                        stroke={1.75}
                        aria-hidden="true"
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{title}</ItemTitle>
                      <ItemDescription>{description}</ItemDescription>
                    </ItemContent>
                    {cta || disabledCta ? (
                      <ItemActions>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          aria-disabled="true"
                        >
                          {disabledCta ?? cta}
                        </Button>
                      </ItemActions>
                    ) : null}
                  </div>
                </Item>
              );
            }

            const isExternal = href.startsWith("http");

            return (
              <Item key={title} asChild variant="outline">
                <Link
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className="flex w-full items-center gap-4 rounded-md"
                >
                  <ItemMedia variant="icon">
                    <Icon className="size-5" stroke={1.75} aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{title}</ItemTitle>
                    <ItemDescription>{description}</ItemDescription>
                  </ItemContent>
                  {cta ? (
                    <ItemActions>
                      <Button variant="outline" size="sm">
                        {cta}
                      </Button>
                    </ItemActions>
                  ) : null}
                </Link>
              </Item>
            );
          }
        )}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Need something bespoke? Email{" "}
        <a
          href="mailto:affiliates@socialforge.tech"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          affiliates@socialforge.tech
        </a>{" "}
        and we&apos;ll get you what you need.
      </p>
    </section>
  );
}
