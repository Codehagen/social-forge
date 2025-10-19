import { Metadata } from "next";
import { notFound } from "next/navigation";
import { allLegalPosts } from "content-collections";
import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import { MDX } from "@/components/blog/mdx";
import { constructMetadata } from "@/lib/constructMetadata";

export async function generateStaticParams() {
  return allLegalPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = allLegalPosts.find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  const { title, seoDescription } = post;

  return constructMetadata({
    title: `${title} – Social Forge`,
    description: seoDescription,
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;
  const data = allLegalPosts.find((post) => post.slug === slug);

  if (!data) {
    notFound();
  }

  return (
    <MaxWidthWrapper className="py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 space-y-4">
          <h1 className="font-display text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {data.title}
          </h1>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(data.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <MDX code={data.mdx} />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
