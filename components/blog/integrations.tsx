"use client"

import BlurImage from "@/lib/blog/blur-image"
import Link from "next/link"
import ExpandingArrow from "./icons/expanding-arrow"

export const Integration = ({
  slug,
  site,
  description,
}: {
  slug: string
  site?: string
  description?: string
}) => {
  return (
    <Link
      href={site || `/integrations/${slug}`}
      {...(site ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="group flex h-full flex-col items-center justify-between space-y-4 rounded-xl border border-warm-grey/10 bg-warm-white/5 p-8 backdrop-blur-sm transition-all hover:border-warm-grey/20 hover:bg-warm-white/10 sm:p-10 dark:border-warm-white/10 dark:bg-warm-grey-3/5 dark:hover:border-warm-white/20 dark:hover:bg-warm-grey-3/10"
    >
      <div className="flex flex-col items-center space-y-4">
        <BlurImage
          src={`/_static/integrations/${slug}.svg`}
          alt={slug.toUpperCase()}
          width={520}
          height={182}
          className="max-h-16 grayscale transition-all group-hover:grayscale-0"
        />
        {description && (
          <>
            <div className="h-px w-full bg-warm-grey/10 dark:bg-warm-white/10" />
            <p className="text-center text-sm text-warm-grey-2 dark:text-warm-grey-1">
              {description}
            </p>
          </>
        )}
      </div>
      <div className="flex space-x-1">
        <p className="text-sm font-medium text-warm-grey-2 transition-colors group-hover:text-warm-grey dark:text-warm-grey-1 dark:group-hover:text-warm-white">
          {site ? "Visit site" : "Learn more"}
        </p>
        <ExpandingArrow className="text-warm-grey-2 transition-colors group-hover:text-warm-grey dark:text-warm-grey-1 dark:group-hover:text-warm-white" />
      </div>
    </Link>
  )
}
