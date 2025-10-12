import Link from "next/link";
import { Metadata } from "next";

import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import BlurImage from "@/lib/blog/blur-image";
import { MDX } from "@/components/blog/mdx";
import { getBlurDataURL } from "@/lib/blog/images";
import { cn } from "@/lib/utils";
import { constructMetadata } from "@/lib/constructMetadata";
import { allIntegrationsPosts } from "content-collections";
import { notFound } from "next/navigation";

type IntegrationEntry = (typeof allIntegrationsPosts)[number];

export async function generateStaticParams() {
  return allIntegrationsPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = allIntegrationsPosts.find((item) => item.slug === slug);
  if (!post) {
    return;
  }

  const { title, summary, image } = post;

  return constructMetadata({
    title: `${title} – Social Forge Integrations`,
    description: summary,
    image,
  });
}

export default async function IntegrationStory({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = allIntegrationsPosts.find((item) => item.slug === slug);

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

  return (
    <>
      <MaxWidthWrapper className="pt-28">
        <div className="flex max-w-screen-md flex-col space-y-4">
          <Link
            href="/integrations"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← All Integrations
          </Link>
          <h1 className="font-display text-3xl font-extrabold text-gray-700 [text-wrap:balance] sm:text-4xl sm:leading-snug">
            {data.title}
          </h1>
          <p className="text-xl text-gray-500">{data.summary}</p>
        </div>
      </MaxWidthWrapper>

      <div className="relative">
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
              priority
            />
            <div className="grid grid-cols-2 gap-5 px-5 md:hidden">
              <div className="col-span-2 flex items-center space-x-4 py-2">
                <BlurImage
                  className="h-12 w-12 rounded-full"
                  src={data.companyLogo}
                  alt={data.company}
                  width={48}
                  height={48}
                />
                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">{data.company}</p>
                  {data.companyUrl && (
                    <a
                      href={data.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 underline-offset-4 hover:underline"
                    >
                      {data.companyUrl}
                    </a>
                  )}
                </div>
              </div>
              {sidebarContent.map(({ title, value }) => (
                <div
                  key={title}
                  className={cn(`col-span-1 flex flex-col space-y-2`, {
                    "col-span-2": value === "integrationDescription",
                  })}
                >
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-500">{data[value]}</p>
                </div>
              ))}
            </div>
            <MDX
              code={data.mdx}
              images={images}
              className="px-5 pb-20 pt-4 sm:px-10"
            />
          </div>
          <div className="sticky top-20 col-span-1 mt-48 hidden flex-col divide-y divide-gray-200 self-start md:flex">
            <div className="flex items-center space-x-4 py-5">
              <BlurImage
                className="h-12 w-12 rounded-full"
                src={data.companyLogo}
                alt={data.company}
                width={48}
                height={48}
              />
              <div className="flex flex-col">
                <p className="font-medium text-gray-900">{data.company}</p>
                {data.companyUrl && (
                  <a
                    href={data.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 underline-offset-4 hover:underline"
                  >
                    {data.companyUrl}
                  </a>
                )}
              </div>
            </div>
            {sidebarContent.map(({ title, value }) => (
              <div key={title} className="flex flex-col space-y-2 py-5">
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{data[value]}</p>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </div>
    </>
  );
}

const sidebarContent: Array<{ title: string; value: keyof IntegrationEntry }> = [
  {
    title: "Integration Type",
    value: "integrationType",
  },
  {
    title: "What it does",
    value: "integrationDescription",
  },
  {
    title: "Ideal for",
    value: "compatibility",
  },
];
