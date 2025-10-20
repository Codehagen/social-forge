import { defineCollection, defineConfig } from "@content-collections/core"
import { compileMDX } from "@content-collections/mdx"
import { remarkGfm } from "fumadocs-core/mdx-plugins"
import GithubSlugger from "github-slugger"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeSlug from "rehype-slug"
import { z } from "zod"

const computedFields = () => ({
  slug: (document: Record<string, unknown>) => {
    const slugger = new GithubSlugger()
    return document.slug || slugger.slug(document.title)
  },
  tableOfContents: (document: Record<string, unknown>) => {
    const content =
      document.content || document.body?.raw || document.mdx?.code || ""
    const headings = content.match(/^##\s(.+)$/gm)
    const slugger = new GithubSlugger()
    return (
      headings?.map((heading: string) => {
        const title = heading.replace(/^##\s/, "")
        return {
          title,
          slug: slugger.slug(title),
        }
      }) || []
    )
  },
  images: (document: Record<string, unknown>) => {
    if (!document.body?.raw) return []
    return (
      document.body.raw.match(/(?<=<Image[^>]*\bsrc=")[^"]+(?="[^>]*\/>)/g) ||
      []
    )
  },
  tweetIds: (document: Record<string, unknown>) => {
    if (!document.body?.raw) return []
    const tweetMatches = document.body.raw.match(/<Tweet\sid="[0-9]+"\s\/>/g)
    return tweetMatches?.map((tweet: string) => tweet.match(/[0-9]+/g)[0]) || []
  },
  githubRepos: (document: Record<string, unknown>) => {
    if (!document.body?.raw) return []
    return (
      document.body.raw.match(
        /(?<=<GithubRepo[^>]*\burl=")[^"]+(?="[^>]*\/>)/g,
      ) || []
    )
  },
})

const BlogPost = defineCollection({
  name: "BlogPost",
  directory: "content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    categories: z
      .array(z.enum(["company", "valuation", "market-analysis", "casestudies"]))
      .default(["company"]),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    featured: z.boolean().default(false),
    image: z.string(),
    images: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    author: z.string(),
    summary: z.string(),
    related: z.array(z.string()).optional(),
    githubRepos: z.array(z.string()).optional(),
    tweetIds: z.array(z.string()).optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    try {
      const mdx = await compileMDX(context, document, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkGfm],
      })
      console.log("MDX compilation successful for:", document.title)
      const computed = computedFields()
      return {
        ...document,
        slug: computed.slug(document),
        mdx,
        seoTitle: document.seoTitle || document.title,
        seoDescription: document.seoDescription || document.summary,
        seoKeywords: document.seoKeywords || [],
        related: document.related || [],
        tableOfContents: computed.tableOfContents({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
        images: computed.images({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        tweetIds: computed.tweetIds({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        githubRepos: computed.githubRepos({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
      }
    } catch (error: unknown) {
      console.error("Error compiling MDX for:", document.title, error)
      console.error("Error details:", (error as Error).stack)
      throw error
    }
  },
})

const ChangelogPost = defineCollection({
  name: "ChangelogPost",
  directory: "content/changelog",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    summary: z.string(),
    image: z.string(),
    author: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    try {
      const mdx = await compileMDX(context, document, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkGfm],
      })
      console.log("MDX compilation successful for:", document.title)
      const computed = computedFields()
      return {
        ...document,
        slug: computed.slug(document),
        mdx,
        seoTitle: document.seoTitle || document.title,
        seoDescription: document.seoDescription || document.summary,
        seoKeywords: document.seoKeywords || [],
        tableOfContents: computed.tableOfContents({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
        images: computed.images({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        tweetIds: computed.tweetIds({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        githubRepos: computed.githubRepos({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
      }
    } catch (error: unknown) {
      console.error("Error compiling MDX for:", document.title, error)
      console.error("Error details:", (error as Error).stack)
      throw error
    }
  },
})

export const CustomersPost = defineCollection({
  name: "CustomersPost",
  directory: "content/customers",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    publishedAt: z.string(),
    summary: z.string(),
    image: z.string(),
    company: z.string(),
    companyLogo: z.string(),
    companyUrl: z.string(),
    companyDescription: z.string(),
    companyIndustry: z.string(),
    companySize: z.string(),
    companyFounded: z.number(),
    plan: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    try {
      const mdx = await compileMDX(context, document, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkGfm],
      })
      console.log("MDX compilation successful for:", document.title)
      const computed = computedFields()
      return {
        ...document,
        slug: computed.slug(document),
        mdx,
        seoTitle: document.seoTitle || document.title,
        seoDescription: document.seoDescription || document.summary,
        seoKeywords: document.seoKeywords || [],
        tableOfContents: computed.tableOfContents({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
        images: computed.images({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        tweetIds: computed.tweetIds({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        githubRepos: computed.githubRepos({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
      }
    } catch (error: unknown) {
      console.error("Error compiling MDX for:", document.title, error)
      console.error("Error details:", (error as Error).stack)
      throw error
    }
  },
})

export const HelpPost = defineCollection({
  name: "HelpPost",
  directory: "content/help",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    updatedAt: z.string(),
    summary: z.string(),
    author: z.string(),
    categories: z
      .array(
        z.enum([
          "overview",
          "getting-started",
          "terms",
          "for-investors",
          "analysis",
          "valuation",
        ]),
      )
      .default(["overview"]),
    related: z.array(z.string()).optional(),
    excludeHeadingsFromSearch: z.boolean().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    try {
      const mdx = await compileMDX(context, document, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkGfm],
      })

      const computed = computedFields()

      const result = {
        ...document,
        slug: computed.slug(document),
        mdx,
        seoTitle: document.seoTitle || document.title,
        seoDescription: document.seoDescription || document.summary,
        seoKeywords: document.seoKeywords || [],
        tableOfContents: computed.tableOfContents(document),
        images: computed.images(document),
        tweetIds: computed.tweetIds(document),
        githubRepos: computed.githubRepos(document),
      }

      return result
    } catch (error: unknown) {
      console.error("Error compiling MDX for:", document.title, error)
      console.error("Error details:", (error as Error).stack)
      throw error
    }
  },
})

export const LegalPost = defineCollection({
  name: "LegalPost",
  directory: "content/legal",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    updatedAt: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    try {
      const mdx = await compileMDX(context, document, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkGfm],
      })
      console.log("MDX compilation successful for:", document.title)
      const computed = computedFields()
      return {
        ...document,
        slug: computed.slug(document),
        mdx,
        seoTitle: document.seoTitle || document.title,
        seoDescription: document.seoDescription || document.seoTitle || document.title,
        seoKeywords: document.seoKeywords || [],
        tableOfContents: computed.tableOfContents({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
        images: computed.images({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        tweetIds: computed.tweetIds({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        githubRepos: computed.githubRepos({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
      }
    } catch (error: unknown) {
      console.error("Error compiling MDX for:", document.title, error)
      console.error("Error details:", (error as Error).stack)
      throw error
    }
  },
})

export const IntegrationsPost = defineCollection({
  name: "IntegrationsPost",
  directory: "content/integrations",
  include: "*.mdx",
  schema: z.object({
    title: z.string(),
    publishedAt: z.string(),
    summary: z.string(),
    image: z.string(),
    company: z.string(),
    companyLogo: z.string(),
    companyUrl: z.string(),
    companyDescription: z.string(),
    integrationType: z.string(),
    integrationDescription: z.string(),
    compatibility: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    try {
      const mdx = await compileMDX(context, document, {
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        remarkPlugins: [remarkGfm],
      })
      console.log("MDX compilation successful for:", document.title)
      const computed = computedFields()
      return {
        ...document,
        slug: computed.slug(document),
        mdx,
        seoTitle: document.seoTitle || document.title,
        seoDescription:
          document.seoDescription ||
          document.summary ||
          document.integrationDescription,
        seoKeywords: document.seoKeywords || [],
        tableOfContents: computed.tableOfContents({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
        images: computed.images({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        tweetIds: computed.tweetIds({ ...document, body: { raw: (mdx as { raw: string }).raw } }),
        githubRepos: computed.githubRepos({
          ...document,
          body: { raw: (mdx as { raw: string }).raw },
        }),
      }
    } catch (error: unknown) {
      console.error("Error compiling MDX for:", document.title, error)
      console.error("Error details:", (error as Error).stack)
      throw error
    }
  },
})

export default defineConfig({
  collections: [
    BlogPost,
    ChangelogPost,
    CustomersPost,
    HelpPost,
    LegalPost,
    IntegrationsPost,
  ],
})
