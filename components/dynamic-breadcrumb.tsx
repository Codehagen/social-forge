"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/dashboard" }
    ];

    if (pathname === "/dashboard") {
      return [{ label: "Dashboard" }];
    }

    // Handle dashboard sub-routes
    if (pathname.startsWith("/dashboard/")) {
      const pathSegments = pathname.split("/").filter(Boolean);

      // Remove 'dashboard' from segments since it's already in breadcrumbs
      const subSegments = pathSegments.slice(1);

      subSegments.forEach((segment, index) => {
        // Create href for all segments except the last one
        const isLast = index === subSegments.length - 1;
        const href = isLast ? undefined : `/dashboard/${subSegments.slice(0, index + 1).join("/")}`;

        // Convert segment to display name
        const label = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        breadcrumbs.push({ label, href });
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if there's only one item (just "Dashboard")
  if (breadcrumbs.length <= 1) {
    return <span className="text-base font-medium">Dashboard</span>;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {crumb.href && index < breadcrumbs.length - 1 ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="text-base font-medium">{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}