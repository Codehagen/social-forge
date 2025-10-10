import { constructMetadata } from "@/lib/constructMetadata";
import { Customer } from "@/components/blog/customers";
import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import { Suspense } from "react";

export const metadata = constructMetadata({
  title: "Customers – Social Forge",
  description: "Meet our customers and learn how they use Social Forge.",
});

export default function Customers() {
  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-16 text-center">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="font-display text-4xl font-extrabold text-black sm:text-5xl">
            Meet our{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              customers
            </span>
          </h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Social Forge empowers teams to build, manage, and grow their social
            presence – from startups to enterprises.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 py-5 md:grid-cols-4">
          {customers.map((customer) => (
            <Customer key={customer.slug} {...customer} />
          ))}
        </div>
      </MaxWidthWrapper>
    </>
  );
}

const customers = [
  {
    slug: "vercel",
    site: "https://vercel.com",
  },
  {
    slug: "codenord",
  },
  {
    slug: "tinybird",
    site: "https://tinybird.co",
  },
  {
    slug: "hashnode",
    site: "https://hashnode.com",
  },
  {
    slug: "cal",
    site: "https://cal.com",
  },
  // {
  //   slug: "perplexity",
  //   site: "https://perplexity.ai",
  // },
  // {
  //   slug: "replicate",
  //   site: "https://replicate.com",
  // },
  // {
  //   slug: "super",
  //   site: "https://super.so",
  // },
  // {
  //   slug: "chronicle",
  //   site: "https://chroniclehq.com",
  // },
  // {
  //   slug: "attio",
  //   site: "https://attio.com",
  // },
  // {
  //   slug: "crowd",
  //   site: "https://crowd.dev",
  // },
  // {
  //   slug: "checkly",
  //   site: "https://checklyhq.com",
  // },
  // {
  //   slug: "rovisys",
  //   site: "https://www.rovisys.com",
  // },
  // {
  //   slug: "chatwoot",
  //   site: "https://chatwoot.com",
  // },
  // {
  //   slug: "lugg",
  //   site: "https://lugg.com",
  // },
  // {
  //   slug: "vueschool",
  //   site: "https://vueschool.io",
  // },
  // {
  //   slug: "refine",
  //   site: "https://refine.dev",
  // },
  // {
  //   slug: "crowdin",
  //   site: "https://crowdin.com",
  // },
  // {
  //   slug: "peerlist",
  //   site: "https://peerlist.io",
  // },
  // {
  //   slug: "anja",
  //   site: "https://www.anjahealth.com/",
  // },
  // {
  //   slug: "inngest",
  //   site: "https://www.inngest.com/",
  // },
  // {
  //   slug: "ashore",
  //   site: "https://ashore.io/",
  // },
  // {
  //   slug: "galactic",
  //   site: "https://galacticrecords.com/",
  // },
  // {
  //   slug: "1komma5grad",
  //   site: "https://1komma5grad.com/",
  // },
];
