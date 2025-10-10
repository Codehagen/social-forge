// import { Logo } from "#/ui/icons";
import {
  IconBook2,
  IconBuildingSkyscraper,
  IconChartBar,
  IconChartPie,
  IconFileAnalytics,
  IconScale,
} from "@tabler/icons-react";
import { allHelpPosts } from "content-collections";

export const BLOG_CATEGORIES = [
  {
    title: "Product Updates",
    slug: "company",
    description:
      "Release notes, roadmap highlights, and announcements from the Social Forge product team.",
  },
  {
    title: "AI Playbooks",
    slug: "valuation",
    description:
      "Step-by-step guides for turning ideas into polished sites with Social Forge's guided workflows.",
  },
  {
    title: "Agency Insights",
    slug: "market-analysis",
    description:
      "Proven tactics for agencies scaling high-quality web projects with AI and automation.",
  },
  {
    title: "Customer Stories",
    slug: "casestudies",
    description:
      "Real-world transformations and measurable wins delivered with Social Forge.",
  },
];

export const POPULAR_ARTICLES = [
  "hva-er-advanti",
  "hva-er-yield",
  "netto-leieinntekter",
  "sensitivitetsanalyse",
];

export const HELP_CATEGORIES: {
  title: string;
  slug:
    | "overview"
    | "getting-started"
    | "terms"
    | "for-investors"
    | "analysis"
    | "valuation";
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    title: "Social Forge Overview",
    slug: "overview",
    description:
      "Understand the Social Forge platform, core capabilities, and the problems it solves for modern teams.",
    icon: <IconBuildingSkyscraper className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Getting Started",
    slug: "getting-started",
    description:
      "Set up your workspace, connect your first project, and launch a Social Forge site in minutes.",
    icon: <IconChartBar className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Key Concepts",
    slug: "terms",
    description:
      "Learn the terminology and building blocks that power Social Forge's AI-assisted workflow.",
    icon: <IconBook2 className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Agency Playbooks",
    slug: "for-investors",
    description:
      "Blueprints for agencies and service teams delivering multiple client sites with Social Forge.",
    icon: <IconFileAnalytics className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "AI Insights",
    slug: "analysis",
    description:
      "Deep dives into the AI workflows, data enrichment, and automation powering Social Forge.",
    icon: <IconChartPie className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Optimization Guides",
    slug: "valuation",
    description:
      "Best practices for refining copy, design, and performance once your Social Forge site is live.",
    icon: <IconScale className="h-6 w-6 text-gray-500" />,
  },
];

export const getPopularArticles = () => {
  const popularArticles = POPULAR_ARTICLES.map((slug) => {
    const post = allHelpPosts.find((post) => post.slug === slug);
    if (!post) {
      console.warn(`Popular article with slug "${slug}" not found`);
    }
    return post;
  }).filter((post) => post != null);

  return popularArticles;
};
