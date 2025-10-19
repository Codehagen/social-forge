import { MetadataRoute } from "next";

import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/api/",
        "/sign-in",
        "/sign-up",
        "/builder",
        "/dashboard/",
        "/onboarding",
        "/control-room/",
        "/preview/",
      ],
      allow: "/api/og/",
    },
    sitemap: `${siteConfig.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
