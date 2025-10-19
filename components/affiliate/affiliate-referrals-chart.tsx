"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Minus } from "lucide-react";

type TrendPoint = {
  month: string;
  total: number;
  converted: number;
};

const chartConfig = {
  total: {
    label: "New referrals",
    color: "var(--chart-1)",
  },
  converted: {
    label: "Converted",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

function calcDelta(data: TrendPoint[]) {
  if (data.length < 2) {
    return null;
  }
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  if (!prev || prev.total === 0) {
    return last.total > 0 ? Infinity : null;
  }
  const change = ((last.total - prev.total) / Math.max(prev.total, 1)) * 100;
  return Math.round(change * 10) / 10;
}

export function AffiliateReferralsChart({ data }: { data: TrendPoint[] }) {
  const isEmpty = !data.length || data.every((point) => point.total === 0 && point.converted === 0);
  const delta = React.useMemo(() => calcDelta(data), [data]);
  const { displayValue, ariaLabel } = React.useMemo(() => {
    if (delta === Infinity) {
      return {
        displayValue: "New lift",
        ariaLabel: "First month of recorded referral activity",
      };
    }
    if (typeof delta === "number") {
      const formatted = `${delta > 0 ? "+" : ""}${delta}%`;
      return {
        displayValue: formatted,
        ariaLabel: `Referrals changed ${formatted} versus the previous month`,
      };
    }
    return {
      displayValue: null,
      ariaLabel: "Waiting for at least two months of referral data",
    };
  }, [delta]);

  return (
    <Card className="border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          Referral momentum
          {displayValue ? (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-transparent bg-emerald-500/10 text-emerald-600"
              aria-label={ariaLabel}
            >
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
              <span>{displayValue}</span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="flex items-center gap-1 border-transparent bg-muted text-muted-foreground"
              aria-label={ariaLabel}
            >
              <Minus className="size-3.5" aria-hidden="true" />
              <span>Awaiting data</span>
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Last six months of referral activity, highlighting conversions that reached payout eligibility.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 text-center">
            <p className="text-sm font-medium text-foreground">Awaiting data</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Share your link and conversions will appear once you’ve generated at least one referral.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <AreaChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <defs>
                <linearGradient id="affiliate-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="affiliate-converted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-converted)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-converted)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="total"
                name="New referrals"
                stroke="var(--color-total)"
                strokeWidth={1.6}
                fill="url(#affiliate-total)"
                fillOpacity={0.24}
              />
              <Area
                type="monotone"
                dataKey="converted"
                name="Converted"
                stroke="var(--color-converted)"
                strokeWidth={1.6}
                fill="url(#affiliate-converted)"
                fillOpacity={0.24}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
