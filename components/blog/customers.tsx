"use client";

import BlurImage from "@/lib/blog/blur-image";
import Link from "next/link";
import ExpandingArrow from "./icons/expanding-arrow";

export const Customer = ({ slug, site }: { slug: string; site?: string }) => {
  return (
    <Link
      href={site || `/customers/${slug}`}
      {...(site ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      className="group flex flex-col items-center justify-center space-y-2 rounded-xl border border-warm-grey/10 bg-warm-white/5 p-8 backdrop-blur-sm transition-all hover:border-warm-grey/20 hover:bg-warm-white/10 sm:p-10 dark:border-warm-white/10 dark:bg-warm-grey-3/5 dark:hover:border-warm-white/20 dark:hover:bg-warm-grey-3/10"
    >
      <BlurImage
        src={`/_static/customers/${slug}.svg`}
        alt={slug.toUpperCase()}
        width={520}
        height={182}
        className="max-h-16 grayscale transition-all group-hover:grayscale-0"
      />
      <div className="flex space-x-1">
        <p className="text-sm font-medium text-warm-grey-2 transition-colors group-hover:text-warm-grey dark:text-warm-grey-1 dark:group-hover:text-warm-white">
          {site ? "Besøk nettside" : "Les mer"}
        </p>
        <ExpandingArrow className="text-warm-grey-2 transition-colors group-hover:text-warm-grey dark:text-warm-grey-1 dark:group-hover:text-warm-white" />
      </div>
    </Link>
  );
};
