import { allBlogPosts } from "content-collections";
import { notFound } from "next/navigation";
import Link from "next/link";
import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import Author from "@/components/blog/author";
import { MDX } from "@/components/blog/mdx";
import { getBlurDataURL } from "@/lib/blog/images";
import { Metadata } from "next";
import { constructMetadata } from "@/lib/constructMetadata";
import BlurImage from "@/lib/blog/blur-image";
import { BLOG_CATEGORIES } from "@/lib/blog/content";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  return allBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = allBlogPosts.find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  const { title, seoTitle, summary, seoDescription, image } = post;

  return constructMetadata({
    title: `${seoTitle || title} – Social Forge`,
    description: seoDescription || summary,
    image,
  });
}

export default async function BlogArticle({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const data = allBlogPosts.find((post) => post.slug === slug);
  if (!data) {
    notFound();
  }

  const imageSources = Array.isArray(data.images) ? data.images : [];

  const [thumbnailBlurhash, images] = await Promise.all([
    getBlurDataURL(data.image),
    Promise.all(
      imageSources.map(async (src: string) => ({
        src,
        blurDataURL: await getBlurDataURL(src),
      }))
    ),
  ]);

  const category = BLOG_CATEGORIES.find(
    (category) => category.slug === data.categories[0]
  );

  const relatedArticles = (data.related || [])
    .map((slug) => allBlogPosts.find((post) => post.slug === slug))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));

  return (
    <>
      <MaxWidthWrapper className="pt-28">
        <div className="flex max-w-screen-md flex-col space-y-4">
          {category && (
            <Link
              href={`/blog/category/${category.slug}`}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              ← {category.title}
            </Link>
          )}
          <h1 className="font-display text-3xl font-extrabold text-gray-700 [text-wrap:balance] sm:text-4xl sm:leading-snug">
            {data.title}
          </h1>
          <p className="text-xl text-gray-500">{data.summary}</p>
        </div>
      </MaxWidthWrapper>

      <div className="relative pb-16">
        <div className="absolute top-52 h-[calc(100%-13rem)] w-full border border-gray-200 bg-white/50 shadow-[inset_10px_-50px_94px_0_rgb(199,199,199,0.2)] backdrop-blur-lg" />
        <MaxWidthWrapper className="grid grid-cols-4 gap-5 px-0 pt-10 lg:gap-10">
          <div className="relative col-span-4 flex flex-col space-y-8 bg-white sm:rounded-t-xl sm:border sm:border-gray-200 md:col-span-3">
            <BlurImage
              className="aspect-[1200/630] rounded-t-xl object-cover"
              src={data.image}
              blurDataURL={thumbnailBlurhash}
              width={1200}
              height={630}
              alt={data.title}
              priority // cause it's above the fold
            />
            <MDX
              code={data.mdx}
              images={images.map((image) => ({
                ...image,
                alt: data.title,
              }))}
              className="px-5 pb-20 pt-4 sm:px-10"
            />
          </div>
          <div className="sticky top-20 col-span-1 mt-48 hidden flex-col divide-y divide-gray-200 self-start sm:flex">
            <div className="flex flex-col space-y-4 py-5">
              <p className="text-sm text-gray-500">Written by</p>
              <Author username={data.author} updatedAt={data.publishedAt} />
            </div>
            {relatedArticles.length > 0 && (
              <div className="flex flex-col space-y-4 py-5">
                <p className="text-sm text-gray-500">Read more</p>
                <ul className="flex flex-col space-y-4">
                  {relatedArticles.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex flex-col space-y-2"
                      >
                        <p className="font-semibold text-gray-700 underline-offset-4 group-hover:underline">
                          {post.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-gray-500 underline-offset-2 group-hover:underline">
                          {post.summary}
                        </p>
                        <p className="text-xs text-gray-400 underline-offset-2 group-hover:underline">
                          {formatDate(post.publishedAt)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}
