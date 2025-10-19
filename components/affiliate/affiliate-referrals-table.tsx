"use client";

import * as React from "react";
import {
  IconBan,
  IconCircleCheck,
  IconClockHour4,
  IconCoin,
  IconLockCheck,
  IconUserPlus,
} from "@tabler/icons-react";

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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ReferralStatus =
  | "PENDING"
  | "LOCKED_IN"
  | "CONVERTED"
  | "PAID"
  | "CANCELLED";

type ReferralRow = {
  id: string;
  referralCode: string;
  status: ReferralStatus;
  commissionAmount: number;
  commissionCurrency: string;
  createdAt: string;
  convertedAt: string | null;
  lockedInAt: string | null;
  user: {
    name: string | null;
    email: string | null;
  } | null;
};

const statusConfig: Record<
  ReferralStatus,
  {
    label: string;
    tone: "neutral" | "info" | "success" | "warning" | "danger";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PENDING: {
    label: "Pending",
    tone: "info",
    icon: IconClockHour4,
  },
  LOCKED_IN: {
    label: "Locked in",
    tone: "info",
    icon: IconLockCheck,
  },
  CONVERTED: {
    label: "Converted",
    tone: "success",
    icon: IconCircleCheck,
  },
  PAID: {
    label: "Paid out",
    tone: "success",
    icon: IconCoin,
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "warning",
    icon: IconBan,
  },
};

function toneClasses(tone: (typeof statusConfig)[ReferralStatus]["tone"]) {
  switch (tone) {
    case "success":
      return "bg-emerald-500/10 text-emerald-600";
    case "info":
      return "bg-blue-500/10 text-blue-600";
    case "warning":
      return "bg-amber-500/10 text-amber-600";
    case "danger":
      return "bg-rose-500/10 text-rose-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format((amount ?? 0) / 100);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  const dt = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

function displayName(row: ReferralRow) {
  if (row.user?.name) return row.user.name;
  if (row.user?.email) return row.user.email;
  return "Awaiting signup";
}

export function AffiliateReferralsTable({
  data,
}: {
  data: ReferralRow[];
}) {
  if (!data.length) {
    return (
      <Card className="border-dashed border-border/80 bg-card/60 text-center">
        <CardHeader>
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
            <IconUserPlus className="size-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-semibold">Bring in your first referral</CardTitle>
          <CardDescription>
            Share your affiliate link to start tracking leads. As soon as people join, they&apos;ll appear here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">Latest referrals</CardTitle>
        <CardDescription>
          Status and commission progress for the most recent signups credited to your link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Lead</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Commission</TableHead>
              <TableHead scope="col">Latest activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const config = statusConfig[row.status] ?? statusConfig.PENDING;
              const Icon = config.icon;
              const activityDate =
                row.status === "PAID"
                  ? row.convertedAt ?? row.createdAt
                  : row.status === "CONVERTED"
                    ? row.convertedAt ?? row.createdAt
                    : row.lockedInAt ?? row.createdAt;

              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{displayName(row)}</span>
                      <span className="text-xs text-muted-foreground">
                        Code • {row.referralCode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("flex items-center gap-1 border-transparent", toneClasses(config.tone))}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      <span>{config.label}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {row.commissionAmount
                      ? formatCurrency(row.commissionAmount, row.commissionCurrency)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(activityDate)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
