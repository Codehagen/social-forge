"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import {
  CheckCircle2,
  Clock3,
  MoreVertical,
  Search,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

type Campaign = {
  id: number;
  name: string;
  status: "Scheduled" | "Draft" | "Sent";
  channel: "LinkedIn" | "TikTok" | "Instagram" | "YouTube";
  reach: string;
  owner: string;
};

const tableData: Campaign[] = [
  {
    id: 1,
    name: "AI launch countdown",
    status: "Scheduled",
    channel: "LinkedIn",
    reach: "42.1K",
    owner: "Nia",
  },
  {
    id: 2,
    name: "Template marketplace teaser",
    status: "Draft",
    channel: "TikTok",
    reach: "–",
    owner: "Rowan",
  },
  {
    id: 3,
    name: "Founder AMA clips",
    status: "Sent",
    channel: "YouTube",
    reach: "128K",
    owner: "Jaden",
  },
  {
    id: 4,
    name: "Referral booster drip",
    status: "Scheduled",
    channel: "Instagram",
    reach: "64.9K",
    owner: "Nia",
  },
  {
    id: 5,
    name: "Back-to-school kit",
    status: "Draft",
    channel: "LinkedIn",
    reach: "–",
    owner: "Marta",
  },
  {
    id: 6,
    name: "Agency partner onboarding",
    status: "Sent",
    channel: "TikTok",
    reach: "210K",
    owner: "Luis",
  },
];

export const TableShowcase = () => {
  const pageSize = 3;
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const pageCount = Math.ceil(tableData.length / pageSize);

  const pageData = useMemo(
    () =>
      tableData.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [pageIndex]
  );

  const toggleRow = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const pageIds = pageData.map((row) => row.id);
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        pageData.forEach((row) => next.delete(row.id));
        return next;
      });
    }
  };

  const allPageSelected =
    pageData.length > 0 && pageData.every((row) => selected.has(row.id));
  const somePageSelected =
    !allPageSelected && pageData.some((row) => selected.has(row.id));

  const statusIcon = (status: Campaign["status"]) => {
    switch (status) {
      case "Sent":
        return <CheckCircle2 aria-hidden className="size-4 text-emerald-500" />;
      case "Scheduled":
        return <Clock3 aria-hidden className="size-4 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Data table pattern</CardTitle>
        <CardDescription>
          Lightweight table built on <code>&lt;table&gt;</code> semantics with selectable rows, toolbar filters, and pagination that fall back gracefully on mobile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns"
              className="pl-9"
              aria-label="Search campaigns"
            />
          </div>
          <Badge variant="secondary" className="ml-auto">
            {selected.size} selected
          </Badge>
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full caption-bottom text-sm">
            <caption className="bg-muted/60 px-4 py-3 text-left text-xs uppercase tracking-wide text-muted-foreground">
              Active campaign queue
            </caption>
            <thead className="bg-muted">
              <tr className="*:px-4 *:py-3 *:text-left">
                <th scope="col" className="w-10 text-center">
                  <Checkbox
                    checked={
                      allPageSelected
                        ? true
                        : somePageSelected
                          ? "indeterminate"
                          : false
                    }
                    aria-label="Select all campaigns on this page"
                    onCheckedChange={(value) => toggleAll(!!value)}
                  />
                </th>
                <th scope="col">Campaign</th>
                <th scope="col">Channel</th>
                <th scope="col" className="text-right">
                  Reach
                </th>
                <th scope="col">Owner</th>
                <th scope="col" className="w-12 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="*:border-t">
              {pageData.map((row) => (
                <tr
                  key={row.id}
                  className="*:px-4 *:py-3 data-[state=selected]:bg-primary/5"
                  data-state={selected.has(row.id) ? "selected" : undefined}
                >
                  <td className="text-center">
                    <Checkbox
                      checked={selected.has(row.id)}
                      aria-label={`Select ${row.name}`}
                      onCheckedChange={(value) =>
                        toggleRow(row.id, !!value)
                      }
                    />
                  </td>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      {statusIcon(row.status)}
                      <span>{row.name}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {row.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{row.channel}</td>
                  <td className="text-right tabular-nums">{row.reach}</td>
                  <td className="text-muted-foreground">{row.owner}</td>
                  <td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="size-4" aria-hidden />
                          <span className="sr-only">Open row actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View details</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-3 border-t bg-background px-4 py-3 text-sm text-muted-foreground">
            <span className="tabular-nums">
              Showing {pageIndex * pageSize + 1}&nbsp;–&nbsp;
              {Math.min((pageIndex + 1) * pageSize, tableData.length)} of{" "}
              {tableData.length}
            </span>
            <Pagination className="ml-auto">
              <PaginationContent>
                <PaginationPrevious
                  aria-label="Previous page"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPageIndex((index) => Math.max(index - 1, 0));
                  }}
                  className="cursor-pointer"
                />
                {Array.from({ length: pageCount }).map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={index === pageIndex}
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPageIndex(index);
                      }}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationNext
                  aria-label="Next page"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    setPageIndex((index) => Math.min(index + 1, pageCount - 1));
                  }}
                  className="cursor-pointer"
                />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Keyboard:</span>{" "}
            Header checkboxes toggle the current page; menu buttons remain focusable even when rows are selected.
          </li>
          <li>
            <span className="font-medium text-foreground">Density:</span>{" "}
            Tabular numbers keep metrics aligned, and we cap page size at 25 rows for readability.
          </li>
          <li>
            <span className="font-medium text-foreground">Feedback:</span>{" "}
            Pair destructive row actions with confirmation toasts or modals.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export const EmptyStateShowcase = () => {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Empty & loading states</CardTitle>
        <CardDescription>
          Use the <code>&lt;Empty&gt;</code> primitive for structured blank slates. Pair with skeletons to avoid layout shift while content loads.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-lg border bg-muted/40 p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-full max-w-md" />
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Empty className="border bg-background">
          <EmptyMedia variant="icon">
            <TrendingUp className="size-6" aria-hidden />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No campaigns yet</EmptyTitle>
            <EmptyDescription>
              Kick off your first launch to see live analytics here. Import from CSV or{" "}
              <a href="mailto:support@socialforge.tech">ask for help</a>.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">Create campaign</Button>
            <Button size="sm" variant="ghost">
              View templates
            </Button>
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
};

const chartData = [
  { month: "January", desktop: 3200, mobile: 1800 },
  { month: "February", desktop: 3600, mobile: 2100 },
  { month: "March", desktop: 4200, mobile: 2400 },
  { month: "April", desktop: 4600, mobile: 2600 },
  { month: "May", desktop: 5100, mobile: 2900 },
  { month: "June", desktop: 5600, mobile: 3200 },
];

const chartConfig = {
  desktop: {
    label: "Desktop reach",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile reach",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export const ChartShowcase = () => {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Inline charts</CardTitle>
        <CardDescription>
          Charts run on Recharts with a themable <code>ChartContainer</code>, so legends, tooltips, and colors stay consistent across dashboards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-background p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Audience growth
              </p>
              <p className="text-2xl font-semibold text-foreground">
                +18.4% MoM
              </p>
            </div>
            <Badge variant="outline" className="ml-auto">
              Honours prefers-reduced-motion
            </Badge>
          </div>
          <ChartContainer config={chartConfig} className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="desktop" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="mobile" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-2))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  type="natural"
                  dataKey="desktop"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#desktop)"
                  strokeWidth={2}
                  dot={false}
                />
                <Area
                  type="natural"
                  dataKey="mobile"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#mobile)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex items-start gap-3 text-sm text-muted-foreground">
            <TrendingUp className="mt-0.5 size-4" aria-hidden />
            <p>
              Tooltips announce with <code>aria-live</code>, color pairs clear APCA contrast targets, and we fall back to a tabular summary when motion is disabled.
            </p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Scale:</span>{" "}
            Inline charts stay within a single card; defer to full dashboards for dense comparisons.
          </li>
          <li>
            <span className="font-medium text-foreground">Accessibility:</span>{" "}
            Always accompany visuals with labels, summaries, or data tables.
          </li>
          <li>
            <span className="font-medium text-foreground">Performance:</span>{" "}
            Suspend chart bundles until the card scrolls into view on marketing pages.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
