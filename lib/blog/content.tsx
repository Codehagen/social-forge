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
      "Stay current on Social Forge releases, roadmap milestones, and product improvements with context on how each update strengthens your launch stack.",
  },
  {
    title: "AI Playbooks",
    slug: "valuation",
    description:
      "Follow step-by-step AI playbooks that turn rough ideas into polished Social Forge sites, covering prompts, reviews, and launch-ready automation.",
  },
  {
    title: "Agency Insights",
    slug: "market-analysis",
    description:
      "Uncover market research, positioning tactics, and revenue strategies agencies use with Social Forge to deliver premium web projects at scale.",
  },
  {
    title: "Customer Stories",
    slug: "casestudies",
    description:
      "Explore real Social Forge customer wins, from faster go-lives to streamlined collaboration, with metrics and playbooks you can reuse.",
  },
];

export const POPULAR_ARTICLES = [
  "what-is-social-forge",
  "organize-with-labels",
  "azure-saml-sso",
  "verdivurdering-av-naringseiendom",
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
      "Launch quickly with setup checklists, workspace walkthroughs, and best practices for connecting your first Social Forge projects and inviting collaborators.",
    icon: <IconChartBar className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Key Concepts",
    slug: "terms",
    description:
      "Build fluency with Social Forge terminology, core objects, and workspace roles so every teammate knows how launches, automations, and permissions connect.",
    icon: <IconBook2 className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Agency Playbooks",
    slug: "for-investors",
    description:
      "Detailed playbooks for agencies orchestrating multiple Social Forge clients, with templates, automation tips, and workflow handoffs that scale.",
    icon: <IconFileAnalytics className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "AI Insights",
    slug: "analysis",
    description:
      "Dive into Social Forge AI workflows, enrichment techniques, and automation explainers to understand how data powers each step of your launch process.",
    icon: <IconChartPie className="h-6 w-6 text-gray-500" />,
  },
  {
    title: "Optimization Guides",
    slug: "valuation",
    description:
      "Optimize live Social Forge sites with guidance on performance tuning, design refinements, copy testing, and analytics workflows that keep launches improving.",
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
