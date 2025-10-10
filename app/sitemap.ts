import { MetadataRoute } from "next";

import {
  allBlogPosts,
  allCustomersPosts,
  allHelpPosts,
  allIntegrationsPosts,
  allLegalPosts,
} from "content-collections";

import { siteConfig } from "@/lib/config";
import { BLOG_CATEGORIES, HELP_CATEGORIES } from "@/lib/blog/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/customers`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/integrations`,
      lastModified: new Date(),
    },
  ];

  entries.push(
    ...BLOG_CATEGORIES.map((category) => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastModified: new Date(),
    })),
    ...allBlogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...allCustomersPosts.map((post) => ({
      url: `${baseUrl}/customers/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...HELP_CATEGORIES.map((category) => ({
      url: `${baseUrl}/help/category/${category.slug}`,
      lastModified: new Date(),
    })),
    ...allHelpPosts.map((post) => ({
      url: `${baseUrl}/help/article/${post.slug}`,
      lastModified: new Date(post.updatedAt),
    })),
    ...allIntegrationsPosts.map((post) => ({
      url: `${baseUrl}/integrations/${post.slug}`,
      lastModified: new Date(post.publishedAt),
    })),
    ...allLegalPosts.map((post) => ({
      url: `${baseUrl}/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt ?? new Date()),
    }))
  );

  return entries;
}
