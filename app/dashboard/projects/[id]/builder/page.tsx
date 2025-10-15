import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentWorkspace } from "@/app/actions/workspace";
import { getSiteById } from "@/app/actions/site";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

import { EmbeddedBuilderPreview } from "./embedded-builder-preview";

type PageParams = { id: string };

type EmbeddedBuilderPageProps = {
  params: PageParams | Promise<PageParams>;
};

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatVersionLabel(version: {
  number: number;
  label: string | null;
  status: string;
}) {
  const segments = [`v${version.number}`];
  if (version.label) {
    segments.push(version.label);
  }
  if (version.status && version.status !== "DRAFT") {
    segments.push(formatStatusLabel(version.status));
  }
  return segments.join(" · ");
}

function ensureUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export default async function EmbeddedBuilderPage({
  params,
}: EmbeddedBuilderPageProps) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    notFound();
  }

  const { id } = await Promise.resolve(params);

  const project = await getSiteById(id, workspace.id).catch(() => null);

  if (!project) {
    notFound();
  }

  const builderHref = `/builder?siteId=${project.id}`;
  const statusLabel = formatStatusLabel(project.status);
  const updatedLabel = timeAgo(project.updatedAt, { withAgo: true });

  const productionEnvironment =
    project.environments.find((environment) => environment.type === "PRODUCTION") ??
    project.environments[0];

  const latestDeployment = productionEnvironment?.deployments?.[0];
  const latestDeploymentUrl = ensureUrl(latestDeployment?.url ?? null) ?? undefined;
  const latestDeploymentInstant =
    latestDeployment?.completedAt ?? latestDeployment?.requestedAt ?? null;
  const lastDeploymentLabel = timeAgo(latestDeploymentInstant ?? null, {
    withAgo: true,
  });

  const primaryDomain =
    productionEnvironment?.domains?.find((domain) => domain.isPrimary)?.domain ??
    productionEnvironment?.domains?.[0]?.domain ??
    null;
  const primaryDomainUrl = ensureUrl(primaryDomain);

  const activeVersion = project.activeVersion;
  const activeVersionLabel = activeVersion
    ? formatVersionLabel({
        number: activeVersion.number,
        label: activeVersion.label ?? null,
        status: activeVersion.status,
      })
    : "No active version";

  const previewUrl = latestDeploymentUrl ?? primaryDomainUrl ?? null;

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Embedded Builder
          </h1>
          <p className="text-muted-foreground">
            Collaborate on “{project.name}” without leaving the dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={builderHref}>Open full builder</Link>
          </Button>
          {latestDeploymentUrl ? (
            <Button asChild variant="outline">
              <Link
                href={latestDeploymentUrl}
                rel="noreferrer"
                target="_blank"
              >
                View latest deployment
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div>
        <EmbeddedBuilderPreview
          builderHref={builderHref}
          projectName={project.name}
          statusLabel={statusLabel}
          lastUpdatedLabel={updatedLabel}
          previewUrl={previewUrl}
          latestDeploymentUrl={latestDeploymentUrl}
        />
      </div>
    </div>
  );
}
