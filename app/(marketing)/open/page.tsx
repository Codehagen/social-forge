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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import NumberFlow from "@number-flow/react";

export const metadata = constructMetadata({
  title: "Open Startup – Social Forge",
  description:
    "Track Social Forge metrics, revenue, salaries, and roadmap notes in real time as we share our open startup journey and invite feedback from builders.",
});

const metrics = [
  { label: "Stargazers", value: 11753 },
  { label: "Forks", value: 2050 },
  { label: "Open Issues", value: 145 },
  { label: "Merged PRs", value: 1011 },
];

const team = [
  {
    name: "Christer Hagen",
    role: "Founder, CEO",
    start: "Okt 19, 2025",
    location: "Norway",
    salary: 0,
    status: "Full-time",
  },
  {
    name: "Stian Walgermo",
    role: "Co-founder, CTO",
    start: "Okt 19, 2025",
    location: "Norway",
    salary: 0,
    status: "Full-time",
  },
];

const salaryBands = [
  { role: "Software Engineer", level: "Intern", salary: 30000 },
  { role: "Software Engineer", level: "I (Junior)", salary: 60000 },
  { role: "Software Engineer", level: "II (Mid)", salary: 80000 },
  { role: "Software Engineer", level: "III (Senior)", salary: 100000 },
  { role: "Software Engineer", level: "IV (Principal)", salary: 120000 },
  { role: "Designer", level: "III (Senior)", salary: 100000 },
  { role: "Designer", level: "IV (Principal)", salary: 120000 },
  { role: "Marketer", level: "I (Junior)", salary: 50000 },
  { role: "Marketer", level: "II (Mid)", salary: 65000 },
  { role: "Marketer", level: "III (Senior)", salary: 80000 },
];

const fundingRounds = [
  {
    amount: 0,
    date: "Bootstrapped",
    description:
      "We reinvest revenue and haven’t raised outside capital yet. Should we?",
  },
];

const capTable = [{ label: "Founders", percentage: 100 }];

const githubHighlights = [
  {
    title: "AI content generator",
    description: "Bringing prompt-driven automation into workspace flows.",
  },
  {
    title: "Affiliate dashboards v2",
    description: "Rebuilt payouts, analytics, and insights for partners.",
  },
  {
    title: "Realtime builder",
    description: "Collaborative editing with conflict-free change history.",
  },
];

export default function OpenStartupPage() {
  return (
    <main className="bg-muted overflow-hidden">
      <section className="border-b border-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Open startup
              </span>
              <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
                Building in public with full transparency
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Every metric, salary band, and funding milestone is open. We
                believe sharing the journey helps other teams build smarter and
                keeps us accountable to our community.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="#metrics">See the numbers</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="https://blog.socialforge.tech/open-metrics">
                    Announcing open metrics
                  </Link>
                </Button>
              </div>
            </div>
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="space-y-3">
                <CardTitle>Why open up?</CardTitle>
                <CardDescription>
                  A transparent operating cadence keeps our team focused on
                  impact and invites feedback from builders who rely on Social
                  Forge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  We publish KPIs each month, share raises in real time, and log
                  what’s working (and what isn’t) for partners to learn from our
                  decisions.
                </p>
                <p>
                  These reports go out in our investor briefings and community
                  newsletter. Subscribe to stay updated on new releases and
                  revenue milestones.
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
            <div id="metrics" className="px-6 py-16 md:py-24 lg:px-10">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Product traction
                </h2>
                <p className="text-muted-foreground">
                  GitHub signals updated weekly straight from our main repo.
                </p>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => (
                  <Card key={metric.label} className="text-center">
                    <CardHeader className="space-y-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </CardTitle>
                      <CardDescription className="text-4xl font-semibold text-foreground">
                        <NumberFlow
                          value={metric.value}
                          format={{ maximumFractionDigits: 0 }}
                        />
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-16 md:py-24 lg:px-10">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Team snapshots
                </h2>
                <p className="text-muted-foreground">
                  Hiring pauses, promotions, and compensation are logged the day
                  they happen.
                </p>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {team.map((member) => (
                  <Card key={member.name} className="h-full">
                    <CardHeader className="space-y-1">
                      <div className="flex items-center justify-between">
                        <CardTitle>{member.name}</CardTitle>
                        <Badge variant="outline">{member.status}</Badge>
                      </div>
                      <CardDescription>{member.role}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p className="flex justify-between">
                        <span>Start date</span>
                        <span className="font-medium text-foreground">
                          {member.start}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Location</span>
                        <span className="font-medium text-foreground">
                          {member.location}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Annual salary</span>
                        <span className="font-medium text-foreground">
                          <NumberFlow
                            value={member.salary}
                            format={{
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }}
                          />
                        </span>
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
            <div className="px-6 py-16 md:py-24 lg:px-10">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Global salary bands
                </h2>
                <p className="text-muted-foreground">
                  Transparent compensation mapped to level and role—updated each
                  quarter.
                </p>
              </div>
              <div className="mt-10 space-y-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead align="right">Salary (USD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryBands.map((band) => (
                      <TableRow key={`${band.role}-${band.level}`}>
                        <TableCell>{band.role}</TableCell>
                        <TableCell>{band.level}</TableCell>
                        <TableCell className="text-right">
                          <NumberFlow
                            value={band.salary}
                            format={{
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableCaption>
                    Salaries reflect base compensation; performance and profit
                    share are layered on top.
                  </TableCaption>
                </Table>
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-16 md:py-24 lg:px-10">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  Finances
                </h2>
                <p className="text-muted-foreground">
                  Funding history and cap table breakdown to keep ownership
                  clear.
                </p>
              </div>
              <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Total funding raised</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {fundingRounds.map((round) => (
                      <div
                        key={`${round.amount}-${round.date}`}
                        className="rounded-xl border bg-card/60 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="text-2xl font-semibold text-foreground">
                            <NumberFlow
                              value={round.amount}
                              format={{
                                style: "currency",
                                currency: "USD",
                                maximumFractionDigits: 0,
                              }}
                            />
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {round.date}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {round.description}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Cap table</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    {capTable.map((entry) => (
                      <div
                        key={entry.label}
                        className="flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">
                          {entry.label}
                        </span>
                        <span>{entry.percentage}%</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div
              aria-hidden
              className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
            />
            <div className="px-6 py-16 md:py-24 lg:px-10">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-semibold tracking-tight">
                  GitHub highlights
                </h2>
                <p className="text-muted-foreground">
                  A taste of what the team shipped over the last quarter.
                </p>
              </div>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {githubHighlights.map((highlight) => (
                  <Card key={highlight.title} className="h-full">
                    <CardHeader>
                      <CardTitle>{highlight.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {highlight.description}
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
