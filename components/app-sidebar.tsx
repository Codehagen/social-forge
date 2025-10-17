"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconPlus,
  IconShieldCheck,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AppSidebar({
  user,
  workspaces = [],
  currentWorkspace = null,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    agent?: boolean;
    superAdmin?: boolean;
    image?: string | null;
  } | null;
  workspaces?: any[];
  currentWorkspace?: any;
}) {
  const router = useRouter();

  const handleWorkspaceSwitch = async (workspaceId: string) => {
    try {
      const response = await fetch("/api/workspace/switch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workspaceId }),
      });

      if (response.ok) {
        // Reload the page to update the workspace context
        window.location.reload();
      } else {
        console.error("Failed to switch workspace");
      }
    } catch (error) {
      console.error("Error switching workspace:", error);
    }
  };

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: IconUsers,
    },
  ];

  const navSecondary = [
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: IconChartBar,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ];

  if (user?.superAdmin) {
    navSecondary.unshift({
      title: "Control room",
      url: "/control-room",
      icon: IconShieldCheck,
    });
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {currentWorkspace?.name || "Social Forge"}
                </span>
              </a>
            </SidebarMenuButton>
            {workspaces.length > 1 && (
              <SidebarMenuAction
                onClick={() => router.push("/dashboard/workspaces")}
              >
                <IconPlus className="h-4 w-4" />
              </SidebarMenuAction>
            )}
          </SidebarMenuItem>
          {workspaces.length > 1 && (
            <SidebarMenuSub>
              {workspaces.map((workspace) => (
                <SidebarMenuSubItem key={workspace.id}>
                  <SidebarMenuSubButton
                    onClick={() => handleWorkspaceSwitch(workspace.id)}
                    isActive={currentWorkspace?.id === workspace.id}
                  >
                    <span>{workspace.name}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
