import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PANELS = [
  {
    title: "Affiliate program",
    description:
      "Review pending applications, approve partners, and monitor commission performance.",
    href: "/control-room/affiliates",
    cta: "Manage affiliates",
  },
];

export default function ControlRoomOverviewPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2">
        {PANELS.map((panel) => (
          <Card key={panel.href}>
            <CardHeader>
              <CardTitle>{panel.title}</CardTitle>
              <CardDescription>{panel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={panel.href}
                className="text-sm font-medium text-primary hover:underline"
              >
                {panel.cta} →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Coming soon</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Add revenue dashboards, moderation tools, and operational runbooks as
          the team grows. This page gives you quick access to every lever.
        </p>
      </section>
    </div>
  );
}
