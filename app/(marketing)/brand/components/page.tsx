import { Suspense } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { ToastShowcase, ConfettiSection } from "@/components/brand/brand-components-interactions";
import { TableShowcase, EmptyStateShowcase, ChartShowcase } from "@/components/brand/brand-components-data";
import { IconCode, IconPalette, IconPointerCheck } from "@tabler/icons-react";
import { Sparkles, ArrowRight, Info } from "lucide-react";

export const metadata = constructMetadata({
  title: "Component Library – Social Forge",
  description:
    "A living library of the components we ship across Social Forge. Use it as a quick visual index or onboarding guide.",
});

const buttonVariants = [
  { label: "Default", props: { variant: "default" as const } },
  { label: "Outline", props: { variant: "outline" as const } },
  { label: "Secondary", props: { variant: "secondary" as const } },
  { label: "Ghost", props: { variant: "ghost" as const } },
  { label: "Destructive", props: { variant: "destructive" as const } },
  { label: "Icon", props: { variant: "outline" as const, size: "icon" as const } },
];

const badgeVariants = ["default", "secondary", "outline", "destructive"] as const;

export default function BrandComponentsPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Component library
              </span>
              <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                Our drop-in component index for designers and engineers
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Built on the shadcn/ui system with our tokens layered in. Once upon a time we used Storybook—now we keep a simple page with our most-used primitives, typography, and patterns. Browse, copy, and keep shipping fast.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#foundation">Browse components</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/brand">Back to brand kit</Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="space-y-3">
                <CardTitle>How to use this page</CardTitle>
                <CardDescription>
                  Think of it as a fast reference. Each section shows the live
                  component with default styling—no mock data needed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconPalette className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Visual source of truth</p>
                    <p>
                      Designers can point stakeholders here to see how components
                      behave in our current design token configuration.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconPointerCheck className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Engineer onboarding</p>
                    <p>
                      New teammates can scan what exists before adding net-new UI.
                      Less duplication, faster reviews.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <IconCode className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Copy-paste friendly</p>
                    <p>
                      All samples use the real import paths. Copy, tweak props, and
                      you&apos;re ready to ship.
                    </p>
                  </div>
                </div>
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

            <div id="foundation" className="px-6 py-16 md:py-24 lg:px-10 space-y-16">
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Buttons
                  </h2>
                  <p className="text-muted-foreground">
                    Core button variants that appear across dashboards, marketing, and onboarding.
                  </p>
                </div>
                <Card>
                  <CardContent className="space-y-6 p-6">
                    <div className="flex flex-wrap gap-3">
                      {buttonVariants.map(({ label, props }) => {
                        const isIcon = props.size === "icon";
                        return (
                          <div key={label} className="flex flex-col items-center gap-2">
                            <Button {...props} aria-label={isIcon ? label : undefined}>
                              {isIcon ? <Sparkles className="size-4" /> : label}
                            </Button>
                            <span className="text-xs text-muted-foreground">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Badges
                  </h2>
                  <p className="text-muted-foreground">
                    Lightweight status indicators and taxonomy chips.
                  </p>
                </div>
                <Card>
                  <CardContent className="flex flex-wrap gap-3 p-6">
                    {badgeVariants.map((variant) => (
                      <Badge key={variant} variant={variant}>
                        {variant}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Form fields
                  </h2>
                  <p className="text-muted-foreground">
                    Input primitives, ready for combinators like React Hook Form or server actions.
                  </p>
                </div>
                <Card>
                  <CardContent className="grid gap-6 p-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Jane Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="you@socialforge.tech" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={4} placeholder="Hello from Social Forge..." />
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox id="subscribe" defaultChecked />
                      <Label htmlFor="subscribe" className="text-sm text-muted-foreground">
                        Subscribe to release notes
                      </Label>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-dashed bg-muted/40 p-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">Magic link sign-in</p>
                        <p className="text-xs text-muted-foreground">
                          Toggle multi-factor prompts at the workspace level.
                        </p>
                      </div>
                      <Switch defaultChecked aria-label="Enable magic link sign in" />
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Tabs & navigation
                  </h2>
                  <p className="text-muted-foreground">
                    Use tabs for contextual settings or multi-step flows.
                  </p>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading tabs…</div>}>
                      <Tabs defaultValue="overview" className="max-w-md">
                        <TabsList className="w-full">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="analytics">Analytics</TabsTrigger>
                          <TabsTrigger value="billing">Billing</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
                          Ship new posts, automate scheduling, and track performance in a single hub.
                        </TabsContent>
                        <TabsContent value="analytics" className="pt-4 text-sm text-muted-foreground">
                          Engagement breakdowns, post insights, and channel comparisons all in one view.
                        </TabsContent>
                        <TabsContent value="billing" className="pt-4 text-sm text-muted-foreground">
                          Manage subscriptions, invoices, and credits with Stripe-powered billing.
                        </TabsContent>
                      </Tabs>
                    </Suspense>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Alerts
                  </h2>
                  <p className="text-muted-foreground">
                    Toast-style callouts that pair nicely with inline actions or modals.
                  </p>
                </div>
                <Card>
                  <CardContent className="space-y-3 p-6">
                    <Alert>
                      <Info className="text-primary" />
                      <AlertTitle>Heads up</AlertTitle>
                      <AlertDescription>
                        Your Stripe payout will be processed within 24 hours.
                      </AlertDescription>
                    </Alert>
                    <Alert variant="destructive">
                      <Info className="text-destructive" />
                      <AlertTitle>Action required</AlertTitle>
                      <AlertDescription>
                        Connect a bank account to keep payouts flowing. The link expires in 3 days.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Toasts & notifications
                  </h2>
                  <p className="text-muted-foreground">
                    Realtime feedback built on Sonner with theme-aware styling, polite announcements, and undo-friendly patterns.
                  </p>
                </div>
                <ToastShowcase />
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Celebrations & confetti
                  </h2>
                  <p className="text-muted-foreground">
                    Use lightweight confetti bursts alongside toasts to celebrate milestone events without interrupting flow.
                  </p>
                </div>
                <ConfettiSection />
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Data tables
                  </h2>
                  <p className="text-muted-foreground">
                    Semantic tables with selection, inline actions, and pagination. Keep column counts scannable and reinforce totals with tabular numerals.
                  </p>
                </div>
                <TableShowcase />
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Empty & loading states
                  </h2>
                  <p className="text-muted-foreground">
                    Pair skeletons with composable blank slates so users know what’s coming and how to get started.
                  </p>
                </div>
                <EmptyStateShowcase />
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Inline charts
                  </h2>
                  <p className="text-muted-foreground">
                    Reach charts lean on our Recharts wrapper with motion-aware theming. Always accompany visuals with readable summaries.
                  </p>
                </div>
                <ChartShowcase />
              </section>

              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    Lists & items
                  </h2>
                  <p className="text-muted-foreground">
                    The `Item` primitive keeps iconography, copy, and actions aligned.
                  </p>
                </div>
                <Card>
                  <CardContent className="space-y-4 p-6">
                    <Item variant="outline" className="flex w-full items-center gap-4">
                      <ItemMedia variant="icon">
                        <Sparkles className="size-5" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>AI suggestions</ItemTitle>
                        <ItemDescription>
                          Draft, schedule, and repurpose content in seconds. Human-friendly editing, no hallucinations.
                        </ItemDescription>
                      </ItemContent>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/builder">
                          Explore
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </Item>
                    <Item variant="outline" className="flex w-full items-center gap-4">
                      <ItemMedia variant="icon">
                        <IconPalette className="size-5" />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>Template presets</ItemTitle>
                        <ItemDescription>
                          Hundreds of launch-ready layouts, wired to your brand colors and typography out of the box.
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </CardContent>
                </Card>
              </section>

              <Separator />

              <section className="space-y-4 text-center">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Missing something?
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  This library evolves with the product. If you need a component showcased—or want to sunset an old pattern—ping the design systems channel or{" "}
                  <Link href="mailto:design@socialforge.tech" className="text-foreground underline underline-offset-4">
                    email the design team
                  </Link>
                  .
                </p>
              </section>
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
