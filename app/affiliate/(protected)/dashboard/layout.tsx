import * as React from "react";

import { getCurrentUser } from "@/app/actions/user";
import { getAffiliateProfile } from "@/app/actions/affiliate";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { AffiliateSidebar } from "@/components/affiliate/affiliate-sidebar";

type AffiliateDashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function AffiliateDashboardLayout({
  children,
}: AffiliateDashboardLayoutProps) {
  const user = await getCurrentUser();
  const affiliate = await getAffiliateProfile();

  if (!affiliate) {
    throw new Error("Affiliate profile is required for dashboard layout.");
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://socialforge.tech";

  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AffiliateSidebar
        variant="inset"
        user={
          user
            ? {
                name: user.name ?? "Affiliate",
                email: user.email ?? "",
                image: user.image ?? null,
              }
            : null
        }
        affiliate={{
          referralCode: affiliate.referralCode,
          stripeConnectStatus: affiliate.stripeConnectStatus,
          onboardingCompleted: affiliate.onboardingCompleted ?? false,
        }}
        appUrl={appUrl}
      />
      <SidebarInset className="min-h-screen bg-background">
        <header className="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="size-8 rounded-full border border-border/60 bg-transparent text-muted-foreground transition-colors hover:text-foreground" />
              <div>
                <h1 className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                  Affiliate dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track performance, manage payouts, and access everything you
                  need to grow Social Forge.
                </p>
              </div>
            </div>
          </div>
          <SidebarSeparator className="mx-auto max-w-6xl bg-border/80" />
        </header>
        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
