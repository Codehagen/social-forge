"use client"

import { MDXContent } from "@content-collections/mdx/react"
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBulb,
  IconChartBar,
  IconChartLine,
  IconCircleCheck,
  IconInfoCircle,
  IconListCheck,
  IconMathFunction,
  IconScale,
} from "@tabler/icons-react"
import {
  allBlogPosts,
  allChangelogPosts,
  allHelpPosts,
} from "content-collections"
import Link from "next/link"

import BlurImage from "@/lib/blog/blur-image"
import { HELP_CATEGORIES, POPULAR_ARTICLES } from "@/lib/blog/content"
import { cn, formatDate } from "@/lib/utils"

import "katex/dist/katex.min.css"
import { InlineMath, BlockMath } from "react-katex"

const DcfChart = (props: Record<string, unknown>) => (
  <div className="text-warm-white/80">DCF Chart placeholder</div>
)
import CategoryCard from "./category-card"
import CopyBox from "./copy-box"
import HelpArticleLink from "./help-article-link"
import ExpandingArrow from "./icons/expanding-arrow"
import ZoomImage from "./zoom-image"

const CustomLink = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const href = props.href

  if (href.startsWith("/")) {
    return (
      <Link {...props} href={href}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith("#")) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function AnimatedCTA(props: {
  badge?: string
  title: string
  description: string
  primaryAction?: {
    label: string
    href: string
  }
  secondaryAction?: {
    label: string
    href: string
  }
  size?: "default" | "large"
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-warm-grey-2/10 p-8 shadow-lg shadow-warm-grey-2/5 ring-1 ring-warm-grey-2/20 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-warm-grey-2/5",
        props.size === "large" && "min-h-[400px]",
      )}
    >
      <div className="relative flex h-full flex-col items-center justify-center gap-6 text-center">
        {props.badge && (
          <span className="inline-flex items-center rounded-full border border-warm-grey-2/20 bg-warm-grey-2/10 px-3 py-1 text-xs font-medium text-warm-white/80">
            {props.badge}
          </span>
        )}
        <h3 className="text-2xl font-semibold tracking-tight text-warm-white">
          {props.title}
        </h3>
        <p className="text-warm-white/80">{props.description}</p>
        {(props.primaryAction || props.secondaryAction) && (
          <div className="flex gap-4">
            {props.primaryAction && (
              <Link
                href={props.primaryAction.href}
                className="inline-flex items-center justify-center rounded-full bg-warm-grey-2/20 px-6 py-2 font-medium text-warm-white transition-colors hover:bg-warm-grey-2/30"
              >
                {props.primaryAction.label}
              </Link>
            )}
            {props.secondaryAction && (
              <Link
                href={props.secondaryAction.href}
                className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 font-medium text-warm-white/80 ring-1 ring-warm-grey-2/20 transition-colors hover:bg-warm-grey-2/10 hover:text-warm-white"
              >
                {props.secondaryAction.label}
                <IconArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const components = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mb-4 mt-8 text-2xl font-semibold text-warm-white underline-offset-4 hover:underline"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mb-3 mt-6 text-xl font-medium text-warm-white underline-offset-4 hover:underline"
      {...props}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <CustomLink
      className="font-medium text-warm-white/80 underline underline-offset-4 hover:text-warm-white"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="rounded-md border border-warm-grey-2/20 bg-warm-grey-2/10 px-2 py-1 font-medium text-warm-white before:hidden after:hidden"
      {...props}
    />
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="text-lg text-warm-white" {...props} />
  ),
  th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th className="p-4 text-left font-medium text-warm-white" {...props} />
  ),
  td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="border-t border-warm-grey-2/20 p-4 text-warm-white/80"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="my-4 text-base leading-relaxed text-warm-white/80"
      {...props}
    />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li
      className="mb-2 text-base leading-relaxed text-warm-white/80 marker:text-warm-white/60"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-2 list-disc space-y-2 pl-6" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-2 list-decimal space-y-2 pl-6" {...props} />
  ),
  Note: (props: {
    variant?: "info" | "warning" | "success"
    children: React.ReactNode
  }) => {
    const icons = {
      info: IconInfoCircle,
      warning: IconAlertTriangle,
      success: IconCircleCheck,
    }
    const Icon = icons[props.variant || "info"]

    return (
      <div
        className={cn(
          "mt-6 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-600 shadow-sm",
          {
            "border-blue-200 bg-blue-50": props.variant === "info",
            "border-yellow-200 bg-yellow-50": props.variant === "warning",
            "border-green-200 bg-green-50": props.variant === "success",
          },
        )}
      >
        <div className="flex items-start gap-3">
          <Icon
            className={cn("mt-0.5 h-5 w-5", {
              "text-blue-500": props.variant === "info",
              "text-yellow-500": props.variant === "warning",
              "text-green-500": props.variant === "success",
            })}
          />
          <div className="flex-1 text-gray-600">{props.children}</div>
        </div>
      </div>
    )
  },
  Quote: (props: {
    author: string
    authorSrc: string
    title: string
    company: string
    companySrc: string
    text: string
  }) => (
    <div className="my-10 flex flex-col items-center justify-center space-y-6 rounded-md border border-warm-grey-2/20 bg-warm-grey-2/10 p-10">
      <div className="w-fit rounded-full bg-gradient-to-r from-warm-grey-2/20 to-warm-grey-1/20 p-1.5">
        <BlurImage
          className="h-20 w-20 rounded-full border-2 border-warm-grey-2/20"
          src={props.authorSrc}
          alt={props.author}
          width={80}
          height={80}
        />
      </div>
      <p className="text-center text-lg leading-relaxed text-warm-white/80 [text-wrap:balance]">
        &ldquo;{props.text}&rdquo;
      </p>
      <div className="flex items-center justify-center space-x-4">
        <BlurImage
          className="h-12 w-12 rounded-md border-2 border-warm-grey-2/20"
          src={props.companySrc}
          alt={props.company}
          width={48}
          height={48}
        />
        <div className="flex flex-col">
          <p className="font-semibold text-warm-white">{props.author}</p>
          <p className="text-sm text-warm-white/80">{props.title}</p>
        </div>
      </div>
    </div>
  ),
  Prerequisites: (props: { children: React.ReactNode }) => (
    <div className="my-8 rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <IconListCheck className="h-5 w-5 text-warm-white/60" />
        <h4 className="font-display text-lg font-semibold text-warm-white">
          Forutsetninger
        </h4>
      </div>
      <div className="prose prose-invert max-w-none">{props.children}</div>
    </div>
  ),
  CopyBox,
  GithubRepo: (props: { url: string }) => (
    <div className="not-prose my-6 rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-4">
      <p className="text-sm text-warm-white/70">Explore the project on GitHub</p>
      <Link
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center text-sm font-semibold text-warm-white underline-offset-4 hover:underline"
      >
        {props.url}
      </Link>
    </div>
  ),
  HelpArticles: (props: { articles: string[] }) => (
    <div className="grid gap-2 rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-4">
      {(props.articles || POPULAR_ARTICLES).map((slug) => (
        <HelpArticleLink
          key={slug}
          article={allHelpPosts.find((post) => post.slug === slug)!}
        />
      ))}
    </div>
  ),
  Tweet: (props: { id: string }) => (
    <div className="not-prose my-6 rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-4">
      <p className="text-sm text-warm-white/70">
        Embedded tweets are currently unavailable.
      </p>
      <Link
        href={`https://twitter.com/i/web/status/${props.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center text-sm font-semibold text-warm-white underline-offset-4 hover:underline"
      >
        View on X ↗
      </Link>
    </div>
  ),
  HelpCategories: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {HELP_CATEGORIES.map((category) => (
        <CategoryCard
          key={category.slug}
          href={`/help/category/${category.slug}`}
          name={category.title}
          description={category.description}
          icon={category.icon}
          pattern={{
            y: 16,
            squares: [
              [0, 1],
              [1, 3],
            ],
          }}
        />
      ))}
    </div>
  ),
  Changelog: (props: { before: string; count: number }) => (
    <ul className="grid list-none rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-4">
      {[...allBlogPosts, ...allChangelogPosts]
        .filter((post) => post.publishedAt <= props.before)
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, props.count)
        .map((post: Record<string, unknown>) => (
          <li key={post.slug}>
            <Link
              href={`/${post.type === "BlogPost" ? "blog" : "changelog"}/${
                post.slug
              }`}
              className="group flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-warm-grey-2/20 active:bg-warm-grey-2/30 sm:px-4"
            >
              <div>
                <p className="text-xs font-medium text-warm-white/60 group-hover:text-warm-white/80">
                  {formatDate(post.publishedAt)}
                </p>
                <h3 className="my-px text-base font-medium text-warm-white">
                  {post.title}
                </h3>
                <p className="line-clamp-1 text-sm text-warm-white/80 group-hover:text-warm-white">
                  {post.summary}
                </p>
              </div>
              <ExpandingArrow className="-ml-4 h-4 w-4 text-warm-white/60 group-hover:text-warm-white/80" />
            </Link>
          </li>
        ))}
    </ul>
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-warm-white" {...props} />
  ),
  Info: (props: { children: React.ReactNode }) => (
    <div className="my-6 flex items-start gap-4 rounded-lg border border-warm-grey-2/20 bg-warm-grey-2/10 p-6 backdrop-blur-sm">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        <IconInfoCircle className="h-6 w-6 text-warm-white/60" />
      </div>
      <div className="flex-1 text-[0.95rem] leading-relaxed">
        <div className="font-medium text-warm-white">Fun fact:</div>
        <div className="mt-1 text-warm-white/80">{props.children}</div>
      </div>
    </div>
  ),
  Math: (props: {
    formula: string
    description?: string
    mode?: "inline" | "block"
    className?: string
  }) => (
    <div
      className={cn(
        "my-6 flex flex-col space-y-2 rounded-lg border border-warm-grey-2/20 bg-warm-grey-2/10 px-6 py-4 backdrop-blur-sm",
        props.className,
      )}
    >
      <div className="flex items-center gap-3">
        <IconMathFunction className="h-5 w-5 text-warm-white/60" />
        <div className="text-lg font-medium text-warm-white">Formel</div>
      </div>
      <div className="w-full overflow-x-auto">
        <div
          className={cn(
            "min-w-fit text-center",
            props.mode === "inline" ? "py-2" : "py-4",
          )}
        >
          {props.mode === "inline" ? (
            <InlineMath math={props.formula} />
          ) : (
            <BlockMath math={props.formula} />
          )}
        </div>
      </div>
      {props.description && (
        <p className="text-sm text-warm-white/70">{props.description}</p>
      )}
    </div>
  ),
  // For inline math within text
  InlineMath: (props: { formula: string }) => (
    <span className="mx-1">
      <InlineMath math={props.formula} />
    </span>
  ),
  FormulaDisplay: (props: {
    formula: string
    description?: string
    mode?: "inline" | "block"
    className?: string
  }) => (
    <div
      className={cn(
        "my-6 flex flex-col space-y-2 rounded-lg border border-warm-grey-2/20 bg-warm-grey-2/10 px-6 py-4 backdrop-blur-sm",
        props.className,
      )}
    >
      <div className="flex items-center gap-3">
        <IconMathFunction className="h-5 w-5 text-warm-white/60" />
        <div className="text-lg font-medium text-warm-white">Formel</div>
      </div>
      <div className="w-full overflow-x-auto">
        <div
          className={cn(
            "min-w-fit text-center",
            props.mode === "inline" ? "py-2" : "py-4",
          )}
        >
          {props.mode === "inline" ? (
            <InlineMath math={props.formula} />
          ) : (
            <BlockMath math={props.formula} />
          )}
        </div>
      </div>
      {props.description && (
        <p className="text-sm text-warm-white/70">{props.description}</p>
      )}
    </div>
  ),
  Stepper: (props: {
    items: {
      title: string
      content: React.ReactNode
      image?: {
        src: string
        alt: string
        width?: number
        height?: number
      }
      formula?: {
        math: string
        description?: string
        mode?: "inline" | "block"
      }
    }[]
  }) => {
    const MDXImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
      return <ZoomImage {...props} />
    }

    return (
      <div className="my-8 flex flex-col space-y-12">
        {props.items.map((item, idx) => (
          <div key={idx} className="flex gap-6">
            <div className="flex-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-warm-grey-2/20 bg-warm-grey-2/10 text-lg font-semibold text-warm-white">
                {idx + 1}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold text-warm-white">
                {item.title}
              </h3>
              <div className="text-base text-warm-white/80">{item.content}</div>
              {item.image && (
                <div className="mt-4 overflow-hidden rounded-lg">
                  <MDXImage
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.width || 800}
                    height={item.image.height || 400}
                  />
                </div>
              )}
              {item.formula && (
                <div className="mt-4">
                  <components.FormulaDisplay
                    formula={item.formula.math}
                    description={item.formula.description}
                    mode={item.formula.mode}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  },
  Example: (props: {
    title?: string
    steps: {
      label: string
      value: string | number
      calculation?: string
      isResult?: boolean
    }[]
  }) => (
    <div className="my-8 rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-6 backdrop-blur-sm">
      {props.title && (
        <h4 className="font-display mb-4 text-lg font-semibold text-warm-white">
          {props.title}
        </h4>
      )}
      <div className="flex flex-col space-y-3">
        {props.steps.map((step, idx) => (
          <div
            key={idx}
            className={cn("flex flex-col space-y-1", {
              "mt-4 border-t border-warm-grey-2/20 pt-4": step.isResult,
            })}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-warm-white/80">{step.label}</span>
              <span
                className={cn(
                  "font-mono text-lg",
                  step.isResult
                    ? "font-semibold text-warm-white"
                    : "text-warm-white/80",
                )}
              >
                {typeof step.value === "number"
                  ? new Intl.NumberFormat("nb-NO").format(step.value)
                  : step.value}
              </span>
            </div>
            {step.calculation && (
              <div className="text-sm text-warm-white/60">
                {step.calculation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ),
  Summary: (props: {
    title?: string
    points: {
      title: string
      description?: string
      iconName?: string
    }[]
  }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      barChart: <IconChartBar className="h-5 w-5 text-warm-white/60" />,
      scales: <IconScale className="h-5 w-5 text-warm-white/60" />,
      lineChart: <IconChartLine className="h-5 w-5 text-warm-white/60" />,
      lightbulb: <IconBulb className="h-5 w-5 text-warm-white/60" />,
    }

    return (
      <div className="my-8 rounded-xl border border-warm-grey-2/20 bg-warm-grey-2/10 p-6 backdrop-blur-sm">
        {props.title && (
          <h4 className="font-display mb-6 text-xl font-semibold text-warm-white">
            {props.title}
          </h4>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {props.points.map((point, idx) => (
            <div
              key={idx}
              className="flex flex-col space-y-2 rounded-lg border border-warm-grey-2/20 bg-warm-grey-2/5 p-4 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                {point.iconName && iconMap[point.iconName]}
                <h5 className="font-medium text-warm-white">{point.title}</h5>
              </div>
              {point.description && (
                <p className="text-sm leading-relaxed text-warm-white/70">
                  {point.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  },
  CTA: (props: {
    badge?: string
    title: string
    description: string
    primaryAction?: {
      label: string
      href: string
    }
    secondaryAction?: {
      label: string
      href: string
    }
    size?: "default" | "large"
  }) => <AnimatedCTA {...props} />,
  DcfChart: (props: Record<string, unknown>) => (
    <div className="">
      <DcfChart {...props} />
    </div>
  ),
}

interface MDXProps {
  code: string
  images?: { alt: string; src: string; blurDataURL: string }[]
  className?: string
}

export function MDX({ code, images, className }: MDXProps) {
  const MDXImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!images) return null
    const blurDataURL = images.find(
      (image) => image.src === props.src,
    )?.blurDataURL

    return <ZoomImage {...props} blurDataURL={blurDataURL} />
  }

  return (
    <article
      data-mdx-container
      className={cn(
        "prose max-w-none transition-all",
        "prose-headings:relative prose-headings:scroll-mt-20 prose-headings:font-display prose-headings:font-bold prose-headings:text-warm-white",
        "prose-p:text-warm-white/80 prose-p:leading-relaxed prose-p:my-4",
        "prose-a:text-warm-white/80 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-warm-white",
        "prose-code:text-warm-white prose-code:bg-warm-grey-2/10 prose-code:px-2 prose-code:py-1",
        "prose-li:text-warm-white/80 prose-li:leading-relaxed prose-li:mb-2",
        "prose-ul:my-8 prose-ul:space-y-6",
        "prose-ol:my-4 prose-ol:space-y-2",
        className,
      )}
    >
      <MDXContent
        code={code}
        components={{
          ...components,
          Image: MDXImage,
        }}
      />
    </article>
  )
}
