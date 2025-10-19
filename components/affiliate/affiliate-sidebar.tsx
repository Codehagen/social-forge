"use client";

import * as React from "react";
import {
  IconBrandNotion,
  IconCheck,
  IconGauge,
  IconHelpCircle,
  IconLink,
  IconMailForward,
  IconUsersGroup,
  IconWallet,
  IconCopy,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type AffiliateSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user:
    | {
        name: string;
        email: string;
        image?: string | null;
      }
    | null;
  affiliate: {
    referralCode: string;
    stripeConnectStatus: string | null;
    onboardingCompleted: boolean;
  };
  appUrl: string;
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tooltip?: string;
};

export function AffiliateSidebar({
  user,
  affiliate,
  appUrl,
  className,
  ...props
}: AffiliateSidebarProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = React.useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.hash;
  });
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">(
    "idle"
  );

  React.useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash);
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  React.useEffect(() => {
    if (copyState === "copied") {
      const timeout = window.setTimeout(() => setCopyState("idle"), 2500);
      return () => window.clearTimeout(timeout);
    }
    return;
  }, [copyState]);

  const navSections: { label: string; items: NavItem[] }[] = [
    {
      label: "Program",
      items: [
        {
          title: "Dashboard",
          href: "/affiliate/dashboard",
          icon: IconGauge,
          tooltip: "Overview and performance",
        },
      ],
    },
    {
      label: "Focus areas",
      items: [
        {
          title: "Referrals",
          href: "#referrals",
          icon: IconUsersGroup,
          tooltip: "Track referral metrics",
        },
        {
          title: "Payouts",
          href: "#payouts",
          icon: IconWallet,
          tooltip: "Manage Stripe payouts",
        },
        {
          title: "Resources",
          href: "#resources",
          icon: IconBrandNotion,
          tooltip: "Find brand assets",
        },
      ],
    },
    {
      label: "Support",
      items: [
        {
          title: "Affiliate guide",
          href: "/affiliate#faq",
          icon: IconHelpCircle,
          tooltip: "Open documentation",
        },
        {
          title: "Email program team",
          href: "mailto:affiliates@socialforge.tech",
          icon: IconMailForward,
          tooltip: "Contact support",
        },
      ],
    },
  ];

  const referralUrl = React.useMemo(() => {
    const normalized = appUrl.endsWith("/")
      ? appUrl.slice(0, -1)
      : appUrl || "https://socialforge.tech";
    return `${normalized}/?ref=${affiliate.referralCode}`;
  }, [affiliate.referralCode, appUrl]);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopyState("copied");
    } catch (error) {
      console.error("Unable to copy referral link", error);
      setCopyState("error");
    }
  }, [referralUrl]);

  const renderNavItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const isAnchor = item.href.startsWith("#");
        const isActive = isAnchor
          ? activeHash === item.href
          : pathname === item.href ||
            pathname.startsWith(`${item.href.replace(/\/$/, "")}/`);

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.tooltip ?? item.title}
              isActive={isActive}
            >
              <a href={item.href}>
                <item.icon />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar
      aria-label="Affiliate program navigation"
      collapsible="offcanvas"
      className={className}
      {...props}
    >
      <SidebarHeader className="gap-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Affiliate HQ
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-3">
            <div className="rounded-xl border border-border/80 bg-sidebar-accent/40 p-4 text-sm shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Referral link
                  </p>
                  <p
                    className="mt-1 break-all font-medium leading-tight"
                    title={referralUrl}
                  >
                    {referralUrl}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCopy}
                >
                  {copyState === "copied" ? (
                    <>
                      <IconCheck className="mr-2 size-4" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <IconCopy className="mr-2 size-4" aria-hidden="true" />
                      Copy
                    </>
                  )}
                  <span className="sr-only">Copy referral link</span>
                </Button>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-background/60 px-3 py-2 text-xs">
                <IconLink className="size-4 text-muted-foreground" />
                <div className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium uppercase text-muted-foreground">
                    Stripe status
                  </span>
                  <span className="font-medium capitalize text-foreground">
                    {affiliate.stripeConnectStatus ?? "pending"}
                  </span>
                </div>
              </div>
              <p
                aria-live="polite"
                className="sr-only"
                role="status"
              >
                {copyState === "copied"
                  ? "Referral link copied to clipboard."
                  : copyState === "error"
                    ? "Unable to copy referral link."
                    : ""}
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="gap-6">
        {navSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>{renderNavItems(section.items)}</SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      {user ? (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
