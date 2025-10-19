import Link from "next/link";

import { constructMetadata } from "@/lib/constructMetadata";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { IconHeartHandshake } from "@tabler/icons-react";

type Friend = {
  name: string;
  description: string;
  href: string;
};

const friends: Friend[] = [
  {
    name: "Appsmith",
    description: "Build custom software on top of your data.",
    href: "https://www.appsmith.com/",
  },
  {
    name: "Aptabase",
    description:
      "Analytics for apps—open source, simple, and privacy-friendly. SDKs for Swift, React Native, Electron, Flutter, and more.",
    href: "https://www.aptabase.com/",
  },
  {
    name: "Argos",
    description:
      "Developer tools to debug tests and detect visual regressions.",
    href: "https://argos-ci.com/",
  },
  {
    name: "BoxyHQ",
    description:
      "APIs for security and privacy that help engineering teams ship compliant cloud applications faster.",
    href: "https://boxyhq.com/",
  },
  {
    name: "Cal.com",
    description:
      "Scheduling without the back-and-forth emails. Self-host or use the cloud.",
    href: "https://cal.com/",
  },
  {
    name: "ClassroomIO",
    description:
      "No-code teaching platform to build and scale your courses with ease.",
    href: "https://classroomio.com/",
  },
  {
    name: "Crowd.dev",
    description:
      "Centralize community, product, and customer data to understand who engages with your open source project.",
    href: "https://www.crowd.dev/",
  },
  {
    name: "DevHunt",
    description: "Discover the best dev tools upvoted by the community weekly.",
    href: "https://devhunt.org/",
  },
  {
    name: "Documenso",
    description:
      "The open-source DocuSign alternative—self-hostable and transparent.",
    href: "https://documenso.com/",
  },
  {
    name: "Dyrector.io",
    description:
      "Continuous delivery & deployment platform with version management.",
    href: "https://dyrector.io/",
  },
  {
    name: "Formbricks",
    description:
      "Open source survey software and experience management platform.",
    href: "https://formbricks.com/",
  },
  {
    name: "Firecamp",
    description:
      "VSCode for APIs—an open source Postman/Insomnia alternative.",
    href: "https://firecamp.io/",
  },
  {
    name: "Ghostfolio",
    description:
      "Privacy-first dashboard for managing personal finances and investments.",
    href: "https://ghostfol.io/",
  },
  {
    name: "GitWonk",
    description:
      "Open-source technical documentation tool focused on developer experience.",
    href: "https://gitwonk.com/",
  },
  {
    name: "Hanko",
    description:
      "Open-source authentication and user management for the passkey era.",
    href: "https://hanko.io/",
  },
  {
    name: "Hook0",
    description: "Webhooks-as-a-service to send reliable webhook events.",
    href: "https://www.hook0.com/",
  },
  {
    name: "Inbox Zero",
    description:
      "Clean up your inbox fast with AI automations, unsubscribe flows, and analytics.",
    href: "https://inboxzero.com/",
  },
  {
    name: "Infisical",
    description:
      "End-to-end encrypted secrets management for teams and infrastructure.",
    href: "https://infisical.com/",
  },
  {
    name: "KeepHQ",
    description: "Open-source AIOps platform for intelligent operations.",
    href: "https://www.keephq.dev/",
  },
  {
    name: "Langfuse",
    description:
      "LLM engineering platform to debug, analyze, and iterate together.",
    href: "https://langfuse.com/",
  },
  {
    name: "Lost Pixel",
    description:
      "Open source visual regression testing alternative to Percy and Chromatic.",
    href: "https://lost-pixel.com/",
  },
  {
    name: "Mockoon",
    description: "Design and run mock REST APIs quickly.",
    href: "https://mockoon.com/",
  },
  {
    name: "Novu",
    description:
      "Open-source notification infrastructure with unified components and APIs.",
    href: "https://novu.co/",
  },
  {
    name: "OpenBB",
    description:
      "Open source financial ecosystem with research tools for everyone.",
    href: "https://openbb.co/",
  },
  {
    name: "OpenStatus",
    description:
      "Open-source monitoring platform with beautiful status pages.",
    href: "https://openstatus.dev/",
  },
  {
    name: "Papermark",
    description:
      "Open source DocSend alternative with secure sharing and analytics.",
    href: "https://papermark.io/",
  },
  {
    name: "Portkey AI",
    description:
      "AI gateway with guardrails that routes to 250+ LLMs via one API.",
    href: "https://portkey.ai/",
  },
  {
    name: "Prisma",
    description:
      "Type-safe ORM with tooling to build, optimize, and scale applications.",
    href: "https://www.prisma.io/",
  },
  {
    name: "Requestly",
    description:
      "Accelerate frontend development with API client, mock server, and request interception.",
    href: "https://requestly.io/",
  },
  {
    name: "Rivet",
    description:
      "Open-source solution to deploy, scale, and operate multiplayer games.",
    href: "https://rivet.gg/",
  },
  {
    name: "Shelf.nu",
    description:
      "Asset and equipment tracking software with QR labels and location management.",
    href: "https://shelf.nu/",
  },
  {
    name: "Sniffnet",
    description:
      "Network monitoring tool to track internet traffic effortlessly.",
    href: "https://www.sniffnet.net/",
  },
  {
    name: "Spark.NET",
    description:
      "Full-stack .NET web framework for makers to build production-ready apps fast.",
    href: "https://spark.ultamma.com/",
  },
  {
    name: "Tiledesk",
    description:
      "Open-source framework for LLM-enabled chatbots and conversational AI agents.",
    href: "https://www.tiledesk.com/",
  },
  {
    name: "Tolgee",
    description:
      "Localization platform that streamlines translation from end to end.",
    href: "https://tolgee.io/",
  },
  {
    name: "Trigger.dev",
    description:
      "Create long-running jobs directly in your code with scheduling, webhooks, and delays.",
    href: "https://trigger.dev/",
  },
  {
    name: "Typebot",
    description:
      "Build powerful chat experiences and embed them anywhere with ease.",
    href: "https://www.typebot.io/",
  },
  {
    name: "Twenty",
    description:
      "Modern open-source CRM with advanced features and sleek design.",
    href: "https://twenty.com/",
  },
  {
    name: "UnInbox",
    description:
      "Modern email for teams that blends messaging speed with enterprise security.",
    href: "https://www.uninbox.com/",
  },
  {
    name: "Unkey",
    description:
      "API authentication and authorization platform to manage keys at scale.",
    href: "https://www.unkey.com/",
  },
  {
    name: "Webiny",
    description:
      "Open-source serverless CMS you can customize, scale, and own.",
    href: "https://www.webiny.com/",
  },
  {
    name: "Webstudio",
    description: "Open source alternative to Webflow for building web apps.",
    href: "https://webstudio.is/",
  },
];

export const metadata = constructMetadata({
  title: "OSS Friends – Social Forge",
  description:
    "Meet the open source teams Social Forge supports with contributions, sponsorships, and collaborations—discover tools we trust and partners we champion.",
});

export default function OssFriendsPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                OSS friends
              </span>
              <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                We build with—and cheer for—open source
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                These are the projects we lean on, contribute to, and highlight
                for our community. Explore their work, star their repos, and join
                the conversations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#friends">Explore our friends</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                >
                  <Link href="mailto:hello@socialforge.tech?subject=OSS%20Friend%20Introduction">
                    Add your project
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-primary/20 bg-card/60 p-8 text-center shadow-md">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <IconHeartHandshake className="size-8" aria-hidden="true" />
              </span>
              <p className="text-lg font-medium text-foreground">
                Open source fuels Social Forge. We commit time, sponsorships, and
                code to the builders who inspire us.
              </p>
              <p className="text-sm text-muted-foreground">
                Have an OSS project we should know about? Send us a note—we&apos;re
                always looking to collaborate.
              </p>
            </div>
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
            <div
              id="friends"
              className="px-6 py-16 md:py-24 lg:px-10"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Our OSS friends
                </h2>
                <p className="text-muted-foreground">
                  We love open source and so should you. Explore the teams making
                  incredible tools in the open.
                </p>
              </div>
              <div className="mt-12 grid gap-4 md:grid-cols-2">
                {friends.map((friend) => (
                  <Item key={friend.name} asChild variant="outline">
                    <Link
                      href={friend.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center gap-4 rounded-md"
                    >
                      <ItemMedia variant="icon">
                        <IconHeartHandshake
                          className="size-5"
                          stroke={1.75}
                          aria-hidden="true"
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{friend.name}</ItemTitle>
                        <ItemDescription>{friend.description}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button size="sm" variant="outline">
                          Learn more
                        </Button>
                      </ItemActions>
                    </Link>
                  </Item>
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
