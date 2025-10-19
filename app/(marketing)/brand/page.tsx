import Link from "next/link";

import { constructMetadata } from "@/lib/constructMetadata";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  IconBrandNotion,
  IconDownload,
  IconPalette,
  IconSpeakerphone,
} from "@tabler/icons-react";

export const metadata = constructMetadata({
  title: "Brand – Social Forge",
  description:
    "Download official Social Forge logos, colors, and messaging guardrails so every deck, landing page, and integration stays on-brand and accessible.",
});

const assets = [
  {
    title: "Logo & wordmark",
    description: "Primary and monochrome marks in SVG, PNG, and EPS formats.",
    href: "/brand/social-forge-logo-kit.zip",
    cta: "Download kit",
    disabled: true,
    disabledCta: "Coming soon",
    icon: IconDownload,
  },
  {
    title: "Messaging & copy guide",
    description:
      "Voice, tone, and boilerplate copy for press, partnerships, and product screens.",
    href: "#guidelines",
    cta: "Open guide",
    icon: IconBrandNotion,
  },
  {
    title: "Campaign templates",
    description:
      "Editable ads, presentation slides, and email snippets sized for common placements.",
    href: "/brand/social-forge-campaign-assets.zip",
    cta: "Grab assets",
    disabled: true,
    disabledCta: "Coming soon",
    icon: IconSpeakerphone,
  },
  {
    title: "Component library",
    description:
      "Storybook-style index of the live components powering Social Forge.",
    href: "/brand/components",
    cta: "Browse components",
    icon: IconPalette,
  },
];

const colorPalette = [
  {
    name: "Forge Emerald",
    value: "#00B380",
    description: "Primary accent for buttons, highlights, and success states.",
  },
  {
    name: "Graphite",
    value: "#121212",
    description: "Primary text color for light themes.",
  },
  {
    name: "Slate Mist",
    value: "#5E6B7E",
    description: "Muted text, dividers, and secondary icons.",
  },
  {
    name: "Glacier",
    value: "#E6F2F0",
    description: "Surface backgrounds and subtle section tints.",
  },
];

const usagePrinciples = [
  {
    title: "Give space to the mark",
    description:
      "Maintain clear-space equal to the height of the \"S\" around the logo. Do not crowd it with other elements or place it on busy imagery.",
  },
  {
    title: "Keep contrast high",
    description:
      "Always pair text with backgrounds that meet APCA contrast recommendations. Use the emerald accent on neutral backgrounds for maximum legibility.",
  },
  {
    title: "Name it Social Forge",
    description:
      "Use the full name in copy and accessible labels—even when the shortened logo appears without text.",
  },
];

export default function BrandPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-start gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Brand kit
              </span>
              <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                Everything you need to represent Social Forge
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Download official marks, learn our voice, and keep visuals
                consistent across every touchpoint. These resources update
                quarterly—bookmark for the latest guidance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#assets">Download assets</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#guidelines">Read guidelines</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/brand/components">Browse components</Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="space-y-3">
                <CardTitle>Brand at a glance</CardTitle>
                <CardDescription>
                  Core elements that define the Social Forge look and feel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconPalette className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Palette first</p>
                    <p>
                      Emerald and charcoal anchor the system. Use Glacier for
                      spacious backgrounds.
                    </p>
                  </div>
                </div>
                <p>
                  Typography uses{" "}
                  <span className="font-medium text-foreground">Geist</span> for
                  UI, with Geist Mono for numeric display. Keep letter spacing
                  tight and leading relaxed for readability.
                </p>
                <p>
                  Motion is purposeful and anchored to user input. Honor
                  <span className="font-medium"> prefers-reduced-motion</span>{" "}
                  by swapping to fades or instant states when requested.
                </p>
              </CardContent>
            </Card>
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
            <div id="assets" className="px-6 py-16 md:py-24">
              <div className="space-y-4 text-center md:text-left">
                <span className="text-sm font-medium uppercase text-muted-foreground">
                  Assets
                </span>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Download official brand files
                </h2>
                <p className="mx-auto max-w-2xl text-balance text-muted-foreground md:mx-0">
                  Use these files for press, partnerships, and co-marketing.
                  Need something bespoke? Email{" "}
                  <Link
                    href="mailto:brand@socialforge.tech"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    brand@socialforge.tech
                  </Link>
                  .
                </p>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-2">
                {assets.map((asset) => {
                  const Icon = asset.icon;
                  const isDisabled = Boolean(asset.disabled);

                  if (isDisabled) {
                    return (
                      <Item
                        key={asset.title}
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
                            <ItemTitle>{asset.title}</ItemTitle>
                            <ItemDescription>{asset.description}</ItemDescription>
                          </ItemContent>
                          <ItemActions>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              aria-disabled="true"
                            >
                              {asset.disabledCta ?? asset.cta}
                            </Button>
                          </ItemActions>
                        </div>
                      </Item>
                    );
                  }

                  const isExternal = asset.href.startsWith("http");

                  return (
                    <Item key={asset.title} asChild variant="outline">
                      <Link
                        href={asset.href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        className="flex w-full items-center gap-4 rounded-md"
                      >
                        <ItemMedia variant="icon">
                          <Icon
                            className="size-5"
                            stroke={1.75}
                            aria-hidden="true"
                          />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>{asset.title}</ItemTitle>
                          <ItemDescription>{asset.description}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Button variant="outline" size="sm">
                            {asset.cta}
                          </Button>
                        </ItemActions>
                      </Link>
                    </Item>
                  );
                })}
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-16 md:py-24 lg:px-10">
              <div className="space-y-4 text-center md:text-left">
                <span className="text-sm font-medium uppercase text-muted-foreground">
                  Palette
                </span>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Color foundations
                </h2>
                <p className="max-w-2xl text-balance text-muted-foreground">
                  Use this base palette across UI and marketing materials. Keep
                  tints consistent by referencing the exact values below.
                </p>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {colorPalette.map((color) => (
                  <Card key={color.name} className="overflow-hidden">
                    <div
                      className="h-20 w-full"
                      style={{ backgroundColor: color.value }}
                      aria-hidden="true"
                    />
                    <CardContent className="space-y-1.5 p-6">
                      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                        {color.value}
                      </p>
                      <CardTitle className="text-lg">{color.name}</CardTitle>
                      <CardDescription>{color.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div
              id="guidelines"
              className="px-6 py-16 md:py-24 lg:px-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Usage principles
                </h2>
                <p className="text-muted-foreground">
                  Keep Social Forge visuals recognizable and accessible everywhere
                  they appear.
                </p>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {usagePrinciples.map((principle) => (
                  <Card key={principle.title} className="h-full">
                    <CardHeader>
                      <CardTitle>{principle.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {principle.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
