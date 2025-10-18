"use client";

import * as React from "react";
import {
  IconBuildingSkyscraper,
  IconCreditCard,
  IconGauge,
  IconShieldCheckFilled,
  IconUsersGroup,
  IconAlertTriangle,
  IconChartBar,
  IconClipboardList,
  IconFileDollar,
  IconInbox,
  IconSettingsFilled,
  IconClockHour4,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { NavUser } from "@/components/nav-user";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

type ControlRoomSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user:
    | {
        name: string;
        email: string;
        agent?: boolean;
        superAdmin?: boolean;
        image?: string | null;
      }
    | null;
  metrics?: {
    pendingWorkspaceApprovals?: number;
    billingAlerts?: number;
    supportQueue?: number;
    moderationQueue?: number;
    payoutReviews?: number;
  };
};

export function ControlRoomSidebar({
  user,
  metrics,
  className,
  ...props
}: ControlRoomSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const operationsNav: NavItem[] = [
    {
      title: "Admin overview",
      href: "/control-room",
      icon: IconGauge,
    },
    {
      title: "Workspaces",
      href: "/control-room/workspaces",
      icon: IconBuildingSkyscraper,
      badge: metrics?.pendingWorkspaceApprovals,
    },
    {
      title: "People & roles",
      href: "/control-room/people",
      icon: IconUsersGroup,
    },
    {
      title: "Platform settings",
      href: "/control-room/settings",
      icon: IconSettingsFilled,
    },
  ];

  const revenueNav: NavItem[] = [
    {
      title: "Subscriptions",
      href: "/control-room/subscriptions",
      icon: IconCreditCard,
      badge: metrics?.billingAlerts,
    },
    {
      title: "Invoices & payouts",
      href: "/control-room/payouts",
      icon: IconFileDollar,
      badge: metrics?.payoutReviews,
    },
    {
      title: "Affiliate program",
      href: "/control-room/affiliates",
      icon: IconChartBar,
    },
  ];

  const trustNav: NavItem[] = [
    {
      title: "Moderation queue",
      href: "/control-room/moderation",
      icon: IconShieldCheckFilled,
      badge: metrics?.moderationQueue,
    },
    {
      title: "Support desk",
      href: "/control-room/support",
      icon: IconInbox,
      badge: metrics?.supportQueue,
    },
    {
      title: "Audit log",
      href: "/control-room/audit-log",
      icon: IconClipboardList,
    },
    {
      title: "Incident log",
      href: "/control-room/incidents",
      icon: IconAlertTriangle,
    },
  ];

  const quickActions = [
    {
      label: "Add workspace",
      icon: IconBuildingSkyscraper,
      onSelect: () => router.push("/control-room/workspaces/new"),
    },
    {
      label: "Invite operator",
      icon: IconUsersGroup,
      onSelect: () => router.push("/control-room/people/invite"),
    },
    {
      label: "Escalate issue",
      icon: IconAlertTriangle,
      onSelect: () => router.push("/control-room/incidents/new"),
    },
  ];

  const renderNavItems = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={pathname === item.href}>
            <a href={item.href}>
              <item.icon />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
          {typeof item.badge === "number" && item.badge > 0 ? (
            <SidebarMenuBadge className="bg-primary/10 text-primary">
              {item.badge}
            </SidebarMenuBadge>
          ) : null}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar
      className={className}
      {...props}
      aria-label="Control room navigation"
      collapsible="offcanvas"
    >
      <SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Control room
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Create from template"
                  onClick={() => router.push("/control-room/workspaces/templates")}
                >
                  <IconClockHour4 className="text-muted-foreground" />
                  <span>Playbooks & templates</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>{renderNavItems(operationsNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Revenue</SidebarGroupLabel>
          <SidebarGroupContent>{renderNavItems(revenueNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Trust & support</SidebarGroupLabel>
          <SidebarGroupContent>{renderNavItems(trustNav)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Quick actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.label}>
                  <SidebarMenuButton onClick={action.onSelect}>
                    <action.icon className="text-muted-foreground" />
                    <span>{action.label}</span>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    showOnHover
                    aria-label={`Run ${action.label}`}
                    onClick={action.onSelect}
                  >
                    <IconClockHour4 className="size-4" />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        {user ? (
          <NavUser user={user} />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Sign in to manage
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
