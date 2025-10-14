import { type ComponentType } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconGitBranch,
  IconGlobe,
  IconHistory,
  IconLink,
  IconRocket,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";

import { getSiteById } from "@/app/actions/site";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn, timeAgo } from "@/lib/utils";
import { getStatusMeta } from "@/components/projects/status";

type ProjectDetail = Awaited<ReturnType<typeof getSiteById>>;

type ProjectActivityItem = {
  id: string;
  timestamp: Date;
  title: string;
  description?: string;
  icon: ComponentType<{ className?: string }>;
  metadata?: string;
};

const STATUS_FLOW = [
  "DRAFT",
  "REVIEW",
  "READY_FOR_TRANSFER",
  "LIVE",
  "ARCHIVED",
] as const;

type ProjectDetailPageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    notFound();
  }

  const { id } = await Promise.resolve(params);

  const project = await getSiteById(id, workspace.id).catch(() => null);

  if (!project) {
    notFound();
  }

  return <ProjectDetailView project={project} />;
}

function ProjectDetailView({ project }: { project: ProjectDetail }) {
  const statusMeta = getStatusMeta(project.status);
  const activityItems = buildActivityItems(project).slice(0, 20);
  const latestActivity = activityItems[0];
  const primaryDomain = findPrimaryDomain(project);

  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <statusMeta.icon
                className={cn("h-3.5 w-3.5", statusMeta.iconClassName)}
              />
              {statusMeta.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Project ID: {project.id}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-muted-foreground">
              {project.slug} • Last updated {timeAgo(project.updatedAt)}
            </p>
            {primaryDomain ? (
              <p className="text-sm text-muted-foreground">
                Primary domain: {primaryDomain.domain}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`/builder?siteId=${project.id}`}>Open in Builder</Link>
          </Button>
          <Button variant="outline" disabled>
            Dashboard builder (coming soon)
          </Button>
          <Button variant="outline" disabled>
            Share preview (soon)
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>
                Key metadata for this project at a glance.
              </CardDescription>
            </div>
            {latestActivity ? (
              <span className="text-xs text-muted-foreground">
                Latest activity{" "}
                {timeAgo(latestActivity.timestamp, { withAgo: true })}
              </span>
            ) : null}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetadataItem label="Client">
                {project.client ? project.client.name : "Unassigned"}
              </MetadataItem>
              <MetadataItem label="Workspace">
                {project.workspace?.name ?? "Unknown workspace"}
              </MetadataItem>
              <MetadataItem label="Builder Workspace">
                {project.builderWorkspace?.name ?? "Not configured"}
              </MetadataItem>
              <MetadataItem label="Created">
                {formatDateTime(project.createdAt)}
              </MetadataItem>
              <MetadataItem label="Last updated">
                {formatDateTime(project.updatedAt)}
              </MetadataItem>
              <MetadataItem label="Active version">
                {project.activeVersion
                  ? `v${project.activeVersion.number ?? "?"}`
                  : "No active version"}
              </MetadataItem>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Actions</CardTitle>
            <CardDescription>
              Track the workflow state and plan next steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusStepper currentStatus={project.status} />
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href={`/builder?siteId=${project.id}`}>
                  Continue in Builder
                </Link>
              </Button>
              <Button className="w-full" variant="outline" disabled>
                Send to client (coming soon)
              </Button>
              <Button className="w-full" variant="outline" disabled>
                Assign domain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              Recent events across versions, deployments, and domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityItems.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No activity recorded yet. Actions will appear here as this
                project evolves.
              </div>
            ) : (
              <div className="space-y-6">
                {activityItems.map((item, index) => (
                  <ActivityItem
                    key={item.id}
                    item={item}
                    isLast={index === activityItems.length - 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Collaborators</CardTitle>
            <CardDescription>
              Workspaces with access to this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.collaborators.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No additional collaborators have been added yet.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {project.collaborators.map((collaborator) => (
                  <li key={collaborator.id} className="flex items-center gap-2">
                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {collaborator.workspace.name}
                      </div>
                      <div className="text-muted-foreground">
                        Role: {collaborator.role}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Button className="w-full" variant="outline" disabled>
              Invite collaborator
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Domains and deployment history across environments.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {project.environments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No environments configured yet.
            </p>
          ) : (
            project.environments.map((environment) => {
              const latestDeployment = environment.deployments[0];
              return (
                <div key={environment.id} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">
                        {environment.name}
                      </div>
                      <div className="text-xs uppercase text-muted-foreground">
                        {environment.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <IconRocket className="h-4 w-4" />
                      {latestDeployment ? (
                        <>
                          <span>{latestDeployment.status}</span>
                          <span>•</span>
                          <span>{timeAgo(latestDeployment.requestedAt)}</span>
                        </>
                      ) : (
                        <span>No deployments yet</span>
                      )}
                    </div>
                  </div>
                  {environment.domains.length > 0 ? (
                    <div className="space-y-2">
                      {environment.domains.map((domain) => (
                        <div
                          key={domain.id}
                          className="flex flex-wrap items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <IconGlobe className="h-4 w-4 text-muted-foreground" />
                            <span>{domain.domain}</span>
                            {domain.isPrimary ? (
                              <Badge variant="secondary" className="text-xs">
                                Primary
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{domain.status}</span>
                            {domain.updatedAt ? (
                              <>
                                <span>•</span>
                                <span>{timeAgo(domain.updatedAt)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No domains assigned.
                    </p>
                  )}
                  {environment ===
                  project.environments[
                    project.environments.length - 1
                  ] ? null : (
                    <Separator />
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Versions</CardTitle>
          <CardDescription>
            Track the evolution of this project across published versions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No versions created yet. Builder sessions will create versions as
              you save progress.
            </p>
          ) : (
            <div className="space-y-3">
              {project.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex flex-wrap items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      Version {version.number}
                      {version.label ? ` • ${version.label}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {timeAgo(version.createdAt)} —{" "}
                      {formatDateTime(version.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{version.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {version.deployments.length} deployment
                      {version.deployments.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetadataItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-card px-3 py-2 text-sm">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="font-medium">{children}</div>
    </div>
  );
}

function StatusStepper({
  currentStatus,
}: {
  currentStatus: ProjectDetail["status"];
}) {
  const currentIndex = Math.max(
    STATUS_FLOW.findIndex((status) => status === currentStatus),
    0
  );

  return (
    <div className="space-y-3">
      {STATUS_FLOW.map((status, index) => {
        const meta = getStatusMeta(status);
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;
        return (
          <div key={status} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                isCurrent
                  ? "border-primary bg-primary/10 text-primary"
                  : isCompleted
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <div>
              <div
                className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {meta.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {isCurrent
                  ? "Current status"
                  : isCompleted
                  ? "Completed"
                  : "Upcoming"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityItem({
  item,
  isLast,
}: {
  item: ProjectActivityItem;
  isLast: boolean;
}) {
  const Icon = item.icon;
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-card">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        {!isLast ? <div className="mt-1 h-full w-px bg-border" /> : null}
      </div>
      <div className="pt-1">
        <div className="text-sm font-medium">{item.title}</div>
        <div className="text-xs text-muted-foreground">
          {formatDateTime(item.timestamp)}
          {item.metadata ? ` • ${item.metadata}` : ""}
        </div>
        {item.description ? (
          <div className="mt-1 text-sm text-muted-foreground">
            {item.description}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function buildActivityItems(project: ProjectDetail): ProjectActivityItem[] {
  const items: ProjectActivityItem[] = [];

  items.push({
    id: "project-created",
    timestamp: toDate(project.createdAt),
    title: "Project created",
    description: project.createdBy
      ? `Created by ${project.createdBy.name ?? "unknown user"}`
      : undefined,
    icon: IconSparkles,
  });

  project.versions.forEach((version) => {
    items.push({
      id: `version-${version.id}`,
      timestamp: toDate(version.createdAt),
      title: `Version ${version.number} created`,
      description:
        version.label ??
        (version.createdBy
          ? `Created by ${version.createdBy.name ?? "unknown user"}`
          : undefined),
      metadata: version.status,
      icon: IconGitBranch,
    });
  });

  project.environments.forEach((environment) => {
    environment.deployments.forEach((deployment) => {
      items.push({
        id: `deployment-${deployment.id}`,
        timestamp: toDate(deployment.requestedAt),
        title: `Deployment ${deployment.status.toLowerCase()}`,
        description: `${environment.name} • ${deployment.url}`,
        metadata: deployment.completedAt
          ? `Completed ${timeAgo(deployment.completedAt, { withAgo: true })}`
          : undefined,
        icon: IconRocket,
      });
    });

    environment.domains.forEach((domain) => {
      items.push({
        id: `domain-${domain.id}`,
        timestamp: toDate(domain.createdAt),
        title: `Domain ${domain.domain} added`,
        description: `${environment.name} environment`,
        metadata: domain.status,
        icon: IconGlobe,
      });
    });
  });

  project.transfers.forEach((transfer) => {
    items.push({
      id: `transfer-${transfer.id}`,
      timestamp: toDate(transfer.initiatedAt),
      title: "Workspace transfer initiated",
      description: `From ${transfer.fromWorkspace.name} to ${transfer.toWorkspace.name}`,
      metadata: transfer.status,
      icon: IconLink,
    });
    if (transfer.completedAt) {
      items.push({
        id: `transfer-completed-${transfer.id}`,
        timestamp: toDate(transfer.completedAt),
        title: "Workspace transfer completed",
        description: `Accepted by ${transfer.acceptedBy?.name ?? "workspace"}`,
        icon: IconHistory,
      });
    }
  });

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function findPrimaryDomain(project: ProjectDetail) {
  for (const environment of project.environments) {
    const primary = environment.domains.find((domain) => domain.isPrimary);
    if (primary) {
      return primary;
    }
  }
  return null;
}

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatDateTime(value: Date | string): string {
  const date = toDate(value);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}
