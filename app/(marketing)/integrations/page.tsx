import { Integration } from "@/components/blog/integrations";
import MaxWidthWrapper from "@/components/blog/max-width-wrapper";
import { constructMetadata } from "@/lib/constructMetadata";

export const metadata = constructMetadata({
  title: "Integrations – Social Forge",
  description:
    "Connect Social Forge with the rest of your stack to keep every launch in sync.",
});

export default function Integrations() {
  return (
    <MaxWidthWrapper className="mb-8 mt-16 text-center pt-28">
      <div className="mx-auto mb-10 sm:max-w-lg">
        <h1 className="font-display text-4xl font-extrabold text-black sm:text-5xl">
          Power up your{" "}
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            integrations
          </span>
        </h1>
        <p className="mt-5 text-gray-600 sm:text-lg">
          Automate launch handoffs and sync Social Forge with the tools your
          teams already use.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 py-5 sm:grid-cols-2 md:grid-cols-3">
        {integrations.map((integration) => (
          <Integration
            key={integration.slug}
            slug={integration.slug}
            site={integration.site}
            description={integration.description}
          />
        ))}
      </div>
    </MaxWidthWrapper>
  );
}

const integrations = [
  {
    slug: "notion",
    description:
      "Auto-create launch pages in Notion so customer-facing teams can brief stakeholders instantly.",
  },
  {
    slug: "vercel",
    site: "https://vercel.com/integrations",
    description:
      "Sync deployment details from Vercel to make every launch update accessible in Social Forge.",
  },
  {
    slug: "google-sheets",
    site: "https://google.com/sheets",
    description:
      "Sync deployment details from Google Sheets to make every launch update accessible in Social Forge.",
  },
];
