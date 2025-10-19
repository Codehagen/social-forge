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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Headphones,
  HelpCircle,
  Mail,
  MessageSquare,
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Contact – Social Forge",
  description:
    "Talk with the Social Forge team. Reach support, sales, or partnerships and get the answers you need.",
});

const contactChannels = [
  {
    icon: Mail,
    title: "General inquiries",
    description: "Questions about product capabilities, partnerships, or press.",
    href: "mailto:hello@socialforge.tech",
    cta: "Email hello@socialforge.tech",
  },
  {
    icon: MessageSquare,
    title: "Support",
    description: "Existing customers can open a ticket for prioritized help.",
    href: "/help",
    cta: "Visit the help center",
  },
  {
    icon: Calendar,
    title: "Talk to sales",
    description: "Book time with our team to explore pricing and implementation.",
    href: "https://cal.com/socialforge/demo",
    cta: "Schedule a call",
  },
];

const faqs = [
  {
    icon: HelpCircle,
    question: "Need status updates?",
    answer:
      "Check the control room for workspace health, usage, and upcoming releases.",
  },
  {
    icon: Headphones,
    question: "Enterprise support?",
    answer:
      "Enterprise plans include a shared Slack channel and 24-hour response SLAs.",
  },
];

export default function ContactPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Contact
              </span>
              <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                We’re here to help you ship faster
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Reach the Social Forge team for support, sales, or partnerships.
                Drop us a note and we’ll respond within one business day.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#contact-form">Send a message</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/help">Browse help center</Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="space-y-2">
                <CardTitle>Office hours</CardTitle>
                <CardDescription>
                  Monday to Friday · 9am – 6pm PT (48-hour response on weekends)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Email responses land from{" "}
                  <span className="font-medium text-foreground">
                    hello@socialforge.tech
                  </span>
                  . Add us to your allowlist so updates never miss your inbox.
                </p>
                <p>
                  For live collaboration, book a call—we’re happy to jump into a
                  shared workspace or walk through your use case.
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
            <div className="px-6 py-16 md:py-24">
              <div className="grid gap-6 md:grid-cols-3">
                {contactChannels.map((channel) => (
                  <Card key={channel.title} className="h-full">
                    <CardHeader className="space-y-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <channel.icon className="size-5" aria-hidden="true" />
                      </span>
                      <CardTitle>{channel.title}</CardTitle>
                      <CardDescription>{channel.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild variant="outline" className="w-full">
                        <Link
                          href={channel.href}
                          target={
                            channel.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            channel.href.startsWith("http")
                              ? "noreferrer"
                              : undefined
                          }
                        >
                          {channel.cta}
                        </Link>
                      </Button>
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
              id="contact-form"
              className="grid gap-12 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24 lg:px-10"
            >
              <div className="space-y-5">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Send us a message
                </h2>
                <p className="text-muted-foreground">
                  Tell us about your team, your goals, and how we can help. We’ll
                  reply with next steps or book time to go deeper.
                </p>
                <div className="space-y-6 rounded-2xl border bg-card/60 p-6 text-sm text-muted-foreground shadow-sm backdrop-blur-sm md:p-8">
                  {faqs.map((faq) => (
                    <div key={faq.question} className="flex gap-4">
                      <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-muted text-primary">
                        <faq.icon className="size-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {faq.question}
                        </p>
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="shadow-md">
                <CardContent className="space-y-6 p-6 md:p-8">
                  <form className="space-y-5" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Alex Rivera"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company or team</Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        autoComplete="organization"
                        placeholder="Social Forge"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">How can we help?</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tell us about your project, timeline, or questions."
                        rows={5}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hear-about">How did you hear about us?</Label>
                      <Input
                        id="hear-about"
                        name="hear-about"
                        type="text"
                        placeholder="Podcast, referral, social, etc."
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full touch-manipulation"
                    >
                      Submit message
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground">
                    By submitting, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
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
