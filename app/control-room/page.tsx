import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getControlRoomOverview } from "@/app/actions/control-room";

const numberFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ControlRoomOverviewPage() {
  const {
    totals,
    upcomingRenewalsCount,
    workspaceInvitesPending,
    delinquentSubscriptions,
    recentWorkspaces,
    upcomingRenewals,
    pendingAffiliates,
  } = await getControlRoomOverview();

  const stats = [
    {
      label: "Workspaces",
      value: numberFormatter.format(totals.workspaces),
      helper: `${numberFormatter.format(totals.members)} members`,
    },
    {
      label: "Active subscriptions",
      value: numberFormatter.format(totals.activeSubscriptions),
      helper: `${numberFormatter.format(upcomingRenewalsCount)} renewals in the next 30 days`,
    },
    {
      label: "Sites awaiting review",
      value: numberFormatter.format(totals.sitesAwaitingReview),
      helper: totals.sitesAwaitingReview > 0 ? "Route to builders" : "All sites are current",
    },
    {
      label: "Pending affiliate approvals",
      value: numberFormatter.format(totals.pendingAffiliates),
      helper: totals.pendingAffiliates > 0 ? "Review applications today" : "Queue is clear",
    },
  ];

  return (
    <div className="space-y-10">
      <section aria-labelledby="control-room-overview">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/80 bg-muted/10">
              <CardHeader className="space-y-1">
                <CardDescription className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">
                  {stat.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="workspace-management" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="workspace-management" className="text-xl font-semibold leading-tight">
              Workspace management
            </h2>
            <p className="text-sm text-muted-foreground">
              Monitor growth, seat allocation, and recently created workspaces—all one tap away.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/control-room/workspaces">Open workspaces</Link>
          </Button>
        </div>

        {recentWorkspaces.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No workspaces yet. As teams onboard, they will appear here with their health metrics.
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Workspace</th>
                  <th className="px-4 py-3 font-medium">Seats</th>
                  <th className="px-4 py-3 font-medium">Sites</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkspaces.map((workspace) => (
                  <tr key={workspace.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{workspace.name}</div>
                      <div className="text-xs text-muted-foreground">{workspace.slug}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {numberFormatter.format(workspace._count.members ?? 0)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {numberFormatter.format(workspace._count.sites ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {dateTimeFormatter.format(workspace.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/control-room/workspaces/${workspace.id}`}>
                          Manage
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="billing-overview" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="billing-overview" className="text-xl font-semibold leading-tight">
              Revenue & billing
            </h2>
            <p className="text-sm text-muted-foreground">
              Track upcoming renewals and spot delinquent accounts before revenue drops.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/control-room/subscriptions">Review subscriptions</Link>
          </Button>
        </div>

        {upcomingRenewals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No renewals scheduled. We’ll surface subscriptions that are approaching their next billing cycle.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-5">
            {upcomingRenewals.map((subscription) => (
              <Card key={subscription.id} className="bg-muted/10">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base font-semibold">
                    {subscription.plan ?? "Custom plan"}
                  </CardTitle>
                  <CardDescription className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {subscription.status}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Next renewal</p>
                    <p className="font-medium text-foreground">
                      {subscription.periodEnd ? dateTimeFormatter.format(subscription.periodEnd) : "TBD"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Seats</p>
                    <p className="tabular-nums font-medium">
                      {numberFormatter.format(subscription.seats ?? 0)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="secondary" className="w-full">
                    <Link href={`/control-room/subscriptions/${subscription.id}`}>
                      View details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="queues" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="queues" className="text-xl font-semibold leading-tight">
              Queues requiring attention
            </h2>
            <p className="text-sm text-muted-foreground">
              Keep approvals, support, and compliance moving without waiting for escalation.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base font-semibold">
                Affiliate approvals
                <Badge variant={totals.pendingAffiliates > 0 ? "default" : "outline"}>
                  {numberFormatter.format(totals.pendingAffiliates)}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Prioritize trusted partners and clear commission blockers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {pendingAffiliates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Queue is empty. New applications will land here automatically.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {pendingAffiliates.map((affiliate) => (
                      <li key={affiliate.id} className="rounded-lg border border-border/70 p-3">
                        <div className="text-sm font-medium">
                          {affiliate.user?.name ?? affiliate.user?.email ?? "Unknown partner"}
                        </div>
                        <div className="text-xs text-muted-foreground">{affiliate.user?.email}</div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Referral code:</span>
                          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                            {affiliate.referralCode}
                          </code>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button asChild size="sm" className="w-full">
                <Link href="/control-room/affiliates">Review queue</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base font-semibold">
                Workspace invites
                <Badge variant={workspaceInvitesPending > 0 ? "default" : "outline"}>
                  {numberFormatter.format(workspaceInvitesPending)}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Ensure operators onboard smoothly and complete compliance steps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Pending invites</p>
                <p className="text-lg font-semibold tabular-nums">
                  {numberFormatter.format(workspaceInvitesPending)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Visit the workspace management area to review outstanding invitations.
              </p>
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link href="/control-room/workspaces">Manage invitations</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base font-semibold">
                Billing alerts
                <Badge variant={delinquentSubscriptions > 0 ? "default" : "outline"}>
                  {numberFormatter.format(delinquentSubscriptions)}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Identify at-risk accounts and send proactive nudges.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Delinquent subscriptions</p>
                <p className="text-lg font-semibold tabular-nums">
                  {numberFormatter.format(delinquentSubscriptions)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Use Stripe Radar and internal playbooks to resolve payment failures within 24&nbsp;hours.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/control-room/subscriptions">Open billing center</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
