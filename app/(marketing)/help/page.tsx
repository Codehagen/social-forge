import { constructMetadata } from "@/lib/constructMetadata";
import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import { HELP_CATEGORIES, getPopularArticles } from "@/lib/blog/content";
import SearchButton from "@/components/blog/search-button";
import CategoryCard from "@/components/blog/category-card";
import HelpArticleLink from "@/components/blog/help-article-link";

export const metadata = constructMetadata({
  title: "Social Forge Help Center",
  description:
    "Find Social Forge guides, troubleshooting steps, and expert workflows that help teams ship launches faster, stay organized, and resolve roadblocks.",
});

export default function HelpCenter() {
  const popularArticles = getPopularArticles();

  return (
    <>
      <MaxWidthWrapper className="max-w-screen-lg pt-28">
        <div className="flex flex-col space-y-4 pb-10">
          <h1 className="font-display text-xl font-bold text-gray-700 sm:text-3xl">
            👋 How can we help you ship faster with Social Forge?
          </h1>
          <SearchButton />
        </div>
      </MaxWidthWrapper>

      <div className="relative">
        <div className="absolute top-28 h-full w-full border border-gray-200 bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg" />
        <MaxWidthWrapper className="max-w-screen-lg pb-20">
          <div className="relative mb-10 rounded-xl border border-gray-200 bg-white px-4 py-6">
            <h2 className="px-4 font-display text-2xl font-bold text-gray-700">
              Popular Articles
            </h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {popularArticles.map((article) => (
                <HelpArticleLink key={article.slug} article={article} />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
        </MaxWidthWrapper>
      </div>
    </>
  );
}
